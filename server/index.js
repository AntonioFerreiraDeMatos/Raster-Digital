import express from "express";
import helmet from "helmet";
import compression from "compression";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { env, assertEnv } from "./config/env.js";
import { migrate } from "./config/migrate.js";
import { bootstrapAdmin } from "./config/bootstrapAdmin.js";
import { pool } from "./config/db.js";
import leadsRouter from "./routes/leads.js";
import { startErpSync } from "./lib/erpSync.js";
import adminRouter from "./routes/admin.js";
import { apiPublic, media } from "./routes/public.js";
import { getPublicContent, seedContent } from "./lib/content.js";
import { buildLlmsTxt } from "./lib/llms.js";
import { buildHomeSsr, buildHomeJsonLd, buildPageHead, buildPageSsr } from "./lib/seo.js";
import { buildSitemap, resolvePage, STATIC_PATHS } from "./lib/pages.js";

assertEnv();

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", /^\d+$/.test(env.trustProxy) ? Number(env.trustProxy) : env.trustProxy);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https:"],
        "frame-src": ["https://www.youtube-nocookie.com", "https://www.youtube.com", "https://player.vimeo.com"],
        "connect-src": ["'self'"],
        "form-action": ["'self'"],
        "upgrade-insecure-requests": env.isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
// Endereço único para o Google: www.rasterdigital.com.br redireciona para rasterdigital.com.br.
app.use((req, res, next) => {
  const host = req.headers.host || "";
  if (env.isProd && host.startsWith("www.")) return res.redirect(301, `https://${host.slice(4)}${req.originalUrl}`);
  next();
});
app.use(compression());
// Painel aceita imagens (base64) de até ~1,5 MB; o restante da API, payloads pequenos.
app.use("/api/admin/images", express.json({ limit: "2.2mb" }));
app.use("/api", express.json({ limit: "64kb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: true });
  } catch {
    res.status(503).json({ ok: false, db: false });
  }
});
app.use("/api/leads", leadsRouter);
// Página interna pronta (usada pelo React em desenvolvimento, quando o servidor não embute os dados).
app.get("/api/page", async (req, res, next) => {
  try {
    const page = resolvePage(String(req.query.path || ""), await getPublicContent());
    if (!page) return res.status(404).json({ error: "Página não encontrada." });
    res.set("Cache-Control", "public, max-age=60");
    res.json({ page });
  } catch (err) {
    next(err);
  }
});
app.use("/api", apiPublic);
app.use("/media", media);
app.use(
  "/api/admin",
  (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  },
  adminRouter
);
app.use("/api", (_req, res) => res.status(404).json({ error: "Rota não encontrada." }));

// Site estático gerado pelo Vite. Arquivos com hash em /assets recebem cache longo.
app.use("/assets", express.static(path.join(dist, "assets"), { immutable: true, maxAge: "1y" }));

// Resumo do site para assistentes de IA, sempre com os dados atuais do banco.
app.get("/llms.txt", async (_req, res, next) => {
  try {
    res.set("Cache-Control", "public, max-age=3600");
    res.type("text/plain; charset=utf-8").send(buildLlmsTxt(await getPublicContent()));
  } catch (err) {
    console.error("[llms] conteúdo indisponível:", err.message);
    next();
  }
});

// Endereço único para cada página: as versões ".html" redirecionam (301) para o endereço limpo,
// mantendo a query string (ex.: UTMs).
const query = (req) => req.originalUrl.slice(req.path.length);
app.get(["/index", "/index.html"], (req, res) => res.redirect(301, "/" + query(req)));
app.get(["/privacidade.html", "/admin.html"], (req, res) => res.redirect(301, req.path.replace(/\.html$/, "") + query(req)));

function notFound(req, res) {
  const file = path.join(dist, "404.html");
  res.status(404);
  if (req.accepts("html") && fs.existsSync(file)) return res.sendFile(file);
  res.type("txt").send("Página não encontrada");
}
// A página de erro só é servida com status 404 (nunca como página válida).
app.get(["/404", "/404.html"], notFound);

// Sitemap gerado a partir das páginas e dos projetos ativos (sem o banco, lista só as páginas fixas).
app.get("/sitemap.xml", async (_req, res) => {
  let content = null;
  try {
    content = await getPublicContent();
  } catch (err) {
    console.error("[sitemap] sem projetos:", err.message);
  }
  res.set("Cache-Control", "public, max-age=3600");
  res.type("application/xml").send(buildSitemap(content));
});

// Modelos HTML gerados pelo Vite (relidos a cada requisição fora de produção).
const templates = {};
const template = (name) => {
  if (!env.isProd || !templates[name]) templates[name] = fs.readFileSync(path.join(dist, name), "utf8");
  return templates[name];
};
const embed = (data) => `<script id="app-data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

// Página inicial com o conteúdo do banco embutido (sem esperar outra requisição).
app.get("/", async (_req, res, next) => {
  try {
    const content = await getPublicContent();
    res.set("Cache-Control", "no-cache");
    res.type("html").send(
      template("index.html")
        .replace("</head>", `${buildHomeJsonLd(content)}</head>`)
        .replace('<div id="root"></div>', `<div id="root">${buildHomeSsr(content)}</div>`)
        .replace("<!--app-data-->", embed(content))
    );
  } catch (err) {
    console.error("[index] conteúdo indisponível:", err.message);
    next(); // cai no arquivo estático; o site busca /api/content
  }
});

// O modelo das páginas internas não é uma página: nunca é servido diretamente.
app.get(["/pagina", "/pagina.html"], notFound);

// Páginas internas (serviços, cidades, preços e projetos), com título, descrição, dados estruturados e texto no HTML.
const PAGE_PATH = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)?\/?$/;
const isPagePath = (p) => STATIC_PATHS.includes(p) || /^\/projetos\/[a-z0-9-]+$/.test(p);
app.get(PAGE_PATH, async (req, res, next) => {
  const clean = req.path.length > 1 && req.path.endsWith("/") ? req.path.slice(0, -1) : req.path;
  if (!isPagePath(clean)) return next(); // /privacidade, /admin e arquivos seguem para o estático
  try {
    const content = await getPublicContent();
    const page = resolvePage(clean, content);
    if (!page) return next();
    if (clean !== req.path) return res.redirect(301, clean + query(req)); // sem barra no fim
    res.set("Cache-Control", "no-cache");
    res.type("html").send(
      template("pagina.html")
        .replace("<!--head-->", buildPageHead(page, content))
        .replace('<div id="root"></div>', `<div id="root">${buildPageSsr(page, content)}</div>`)
        .replace("<!--app-data-->", embed({ ...content, page }))
    );
  } catch (err) {
    // 503 (e não 404): o Google tenta de novo depois em vez de remover a página do índice.
    console.error("[pagina] indisponível:", err.message);
    res.status(503).set("Retry-After", "120").type("txt").send("Página temporariamente indisponível. Tente novamente em instantes ou fale conosco pelo WhatsApp: (85) 98627-5389.");
  }
});
app.use(express.static(dist, { extensions: ["html"], maxAge: "1h" }));
app.use(notFound);

app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed" || err.type === "entity.too.large") {
    return res.status(400).json({ error: "Dados inválidos." });
  }
  console.error("[erro]", err.code || "", err.message);
  res.status(500).json({ error: "Não foi possível concluir agora. Tente novamente ou fale conosco pelo WhatsApp." });
});

migrate()
  .then(bootstrapAdmin)
  .then(seedContent)
  .catch((e) => console.error("[migrate] falhou:", e.message))
  .finally(() => {
    app.listen(env.port, () => console.log(`Raster Digital rodando na porta ${env.port}`));
    startErpSync();
  });
