// Testes das páginas internas, do SEO técnico e da formatação de preços.
// Pré-requisitos: `npm run build` e `npm start` rodando (BASE_URL=http://localhost:PORTA se não for 3000).
// Só fazem requisições GET: não criam nem apagam dados.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fillText, money, priceLabel, startingPrice } from "../../src/shared/format.js";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SITE = "https://rasterdigital.com.br";
const PAGES = [
  "/criacao-de-sites", "/loja-virtual", "/cardapio-digital", "/sistemas-personalizados", "/painel-administrativo",
  "/criacao-de-sites-fortaleza", "/criacao-de-sites-caucaia", "/precos", "/projetos",
];
const get = (path, opts = {}) => fetch(BASE + path, { redirect: "manual", headers: { Accept: "text/html" }, ...opts });

test("formatação: preços, 'a partir de', marcadores e parcelamento", () => {
  const services = [
    { slug: "lp", price_cents: 34990, price_from: true },
    { slug: "card", price_cents: 44990, price_from: false },
    { slug: "sob", price_cents: null, price_from: false },
  ];
  assert.match(money(15000), /^R\$\s150$/);
  assert.match(money(34990), /^R\$\s349,90$/);
  assert.match(priceLabel(services[0]), /^A partir de R\$\s349,90$/);
  assert.equal(priceLabel(services[2]), "Sob orçamento");
  assert.match(startingPrice(services, ["lp", "card", "sob"]), /^A partir de R\$\s349,90$/);
  assert.equal(startingPrice(services, ["sob"]), null);
  const settings = { payment: { installments: 3 } };
  assert.match(fillText("LP: {{preco:lp}}; C: {{preco:card}}; X: {{preco:nao-existe}}", services, settings), /LP: a partir de R\$\s349,90; C: R\$\s449,90; X: valor sob consulta/);
  assert.equal(fillText("Pago uma vez{{parcelamento}}.", services, settings), "Pago uma vez, em até 3x.");
  assert.equal(fillText("Pago uma vez{{parcelamento}}.", services, { payment: { installments: 0 } }), "Pago uma vez.");
});

test("páginas internas: 200, título, descrição, canonical, um H1 e dados estruturados", async () => {
  for (const path of PAGES) {
    const r = await get(path);
    assert.equal(r.status, 200, path);
    const html = await r.text();
    assert.match(html, /<title>[^<]{10,70}<\/title>/, `${path}: title`);
    assert.match(html, /<meta name="description" content="[^"]{50,160}"/, `${path}: description`);
    assert.ok(html.includes(`<link rel="canonical" href="${SITE}${path}" />`), `${path}: canonical`);
    const ssr = html.slice(html.indexOf('<div id="root">'), html.indexOf('<script id="app-data"'));
    assert.equal((ssr.match(/<h1>/g) || []).length, 1, `${path}: um H1`);
    assert.doesNotMatch(html, /\{\{[a-z]/, `${path}: marcador de preço não trocado`);
    assert.doesNotMatch(html, /\br\$/, `${path}: "r$" em minúscula`);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const types = ld["@graph"].map((n) => n["@type"]);
    assert.ok(types.includes("BreadcrumbList") && types.includes("ProfessionalService"), `${path}: JSON-LD`);
    assert.match(html, /<script id="app-data" type="application\/json">\{/, `${path}: dados embutidos`);
  }
});

test("projetos: página de cada projeto ativo e 404 para inexistente", async () => {
  const { projects } = await (await fetch(BASE + "/api/content")).json();
  for (const p of projects) assert.equal((await get(`/projetos/${p.slug}`)).status, 200, p.slug);
  assert.equal((await get("/projetos/nao-existe")).status, 404);
});

test("endereços únicos: barra final, .html e modelo interno", async () => {
  let r = await get("/criacao-de-sites/?utm_source=x");
  assert.equal(r.status, 301);
  assert.match(r.headers.get("location"), /\/criacao-de-sites\?utm_source=x$/);
  r = await get("/index.html");
  assert.equal(r.status, 301);
  assert.equal((await get("/privacidade.html")).status, 301);
  assert.equal((await get("/404")).status, 404);
  assert.equal((await get("/pagina")).status, 404);
  assert.equal((await get("/pagina.html")).status, 404);
});

test("sitemap: página inicial, páginas internas e projetos", async () => {
  const r = await get("/sitemap.xml");
  assert.match(r.headers.get("content-type"), /xml/);
  const xml = await r.text();
  for (const path of ["/", ...PAGES, "/privacidade"]) assert.ok(xml.includes(`<loc>${SITE}${path}</loc>`), path);
  assert.match(xml, /<loc>https:\/\/rasterdigital\.com\.br\/projetos\/[a-z0-9-]+<\/loc>/);
});

test("página inicial: H1, dados da empresa e links para as páginas internas", async () => {
  const html = await (await get("/")).text();
  const ssr = html.slice(html.indexOf('<div id="root">'), html.indexOf('<script id="app-data"'));
  assert.equal((ssr.match(/<h1>/g) || []).length, 1);
  assert.match(html, /"@type":"ProfessionalService"/);
  for (const path of ["/criacao-de-sites", "/sistemas-personalizados", "/precos", "/projetos"]) assert.ok(ssr.includes(`href="${path}"`), path);
});
