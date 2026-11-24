// Páginas internas do site (serviços, cidades, preços e projetos).
// O texto fica em src/data/pages/*.json; preços e projetos vêm do banco a cada requisição (com cache).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fillDeep } from "../../src/shared/format.js";
import cases from "../../src/data/cases.json" with { type: "json" };

export const SITE = "https://rasterdigital.com.br";
/** Data da última revisão do conteúdo das páginas (sitemap). Atualize ao mudar textos. */
export const CONTENT_UPDATED = "2026-11-24";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "data", "pages");
const defs = new Map(
  fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .map((d) => [d.path, d])
);

/** Caminhos fixos (sem os projetos), na ordem do sitemap. */
export const STATIC_PATHS = [...defs.keys()];

const list = (names) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} e ${names.at(-1)}` : names[0] || "");

function casePage(project, projects) {
  const info = cases[project.slug] || {};
  const others = projects.filter((p) => p.slug !== project.slug);
  const place = info.location ? ` · ${info.location}` : "";
  return {
    path: `/projetos/${project.slug}`,
    kind: "case",
    title: `${project.client}: ${project.title} | Projetos Raster Digital`,
    description: project.summary.length > 155 ? `${project.summary.slice(0, 152).trimEnd()}…` : project.summary,
    breadcrumb: [{ name: "Início", path: "/" }, { name: "Projetos", path: "/projetos" }, { name: project.client }],
    hero: { eyebrow: `${project.segment}${place}`, h1: project.client, lead: `${project.title}. ${project.summary}`, cta: "Quero um projeto assim" },
    sections: [{ type: "case" }, ...(others.length ? [{ type: "cases", id: "outros", eyebrow: "Mais projetos", title: "Outros projetos", projects: others.map((p) => p.slug) }] : [])],
    project: project.slug,
    case: info,
    cta: { title: "Vamos conversar sobre seu projeto?", text: "Conte o que sua empresa precisa. Vamos entender a sua necessidade e desenvolver uma solução adequada ao seu negócio." },
  };
}

/** Página pronta para exibir (textos com os preços atuais) ou null se o caminho não existe. */
export function resolvePage(pathname, content) {
  const { services, projects, settings } = content;
  let page = defs.get(pathname);
  if (page) {
    if (page.kind === "projetos") {
      // Lista os projetos do banco; com muitos projetos, usa um texto geral para não passar de ~160 caracteres.
      const named = page.description.replace("{{projetos}}", list(projects.map((p) => `${p.client} (${p.title.toLowerCase()})`)));
      const description = named.length <= 158 ? named : "Projetos reais da Raster Digital: sites, lojas virtuais e sistemas publicados para empresas de diferentes segmentos.";
      page = { ...page, description };
    }
  } else {
    const m = /^\/projetos\/([a-z0-9-]+)$/.exec(pathname);
    const project = m && projects.find((p) => p.slug === m[1]);
    if (!project) return null;
    page = casePage(project, projects);
  }
  // Seções com cards de projetos levam junto os cases documentados.
  const slugs = new Set(page.sections.flatMap((s) => s.projects || []));
  if (page.kind === "projetos") projects.forEach((p) => slugs.add(p.slug));
  const pageCases = Object.fromEntries([...slugs].filter((s) => cases[s]).map((s) => [s, cases[s]]));
  return fillDeep({ ...page, cases: pageCases }, services, settings);
}

/** Endereços do sitemap: início, páginas fixas, projetos e privacidade. */
export function sitemapEntries(content) {
  const priority = { service: "0.8", local: "0.8", precos: "0.8", projetos: "0.6" };
  return [
    { loc: `${SITE}/`, priority: "1.0" },
    ...[...defs.values()].map((d) => ({ loc: SITE + d.path, priority: priority[d.kind] || "0.5" })),
    ...(content?.projects || []).map((p) => ({ loc: `${SITE}/projetos/${p.slug}`, priority: "0.5" })),
    { loc: `${SITE}/privacidade`, priority: "0.3" },
  ];
}

export function buildSitemap(content) {
  const urls = sitemapEntries(content)
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${CONTENT_UPDATED}</lastmod><priority>${u.priority}</priority></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
