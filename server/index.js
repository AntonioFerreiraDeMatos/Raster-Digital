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
import { buildSsrHtml, buildJsonLd } from "./lib/seo.js";

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

// Página inicial com o conteúdo do banco embutido (sem esperar outra requisição).
let indexTemplate = null;
app.get("/", async (_req, res, next) => {
  try {
    if (!env.isProd || !indexTemplate) indexTemplate = fs.readFileSync(path.join(dist, "index.html"), "utf8");
    const content = await getPublicContent();
    const data = JSON.stringify(content).replace(/</g, "\\u003c");
    res.set("Cache-Control", "no-cache");
    res.type("html").send(
      indexTemplate
        .replace("</head>", `${buildJsonLd(content)}</head>`)
        .replace('<div id="root"></div>', `<div id="root">${buildSsrHtml(content)}</div>`)
        .replace("<!--app-data-->", `<script id="app-data" type="application/json">${data}</script>`)
    );
  } catch (err) {
    console.error("[index] conteúdo indisponível:", err.message);
    next(); // cai no arquivo estático; o site busca /api/content
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
