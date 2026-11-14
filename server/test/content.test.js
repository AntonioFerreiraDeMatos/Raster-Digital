// Testes de integração do catálogo, conteúdo, imagens e permissões do painel.
// Pré-requisitos: banco do .env (NÃO produção), `npm run build` e `npm start` rodando.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const RUN = Date.now();
const ADMIN = { email: `c-admin-${RUN}@raster.test`, password: "SenhaTeste#2026" };
const SALES = { email: `c-sales-${RUN}@raster.test`, password: "SenhaTeste#2026" };
if (env.isProd) throw new Error("Não rode os testes com NODE_ENV=production.");

// PNG 1x1 válido
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

async function login(user) {
  const r = await fetch(BASE + "/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(user) });
  assert.equal(r.status, 200);
  return r.headers.get("set-cookie").split(";")[0];
}
const call = (cookie, path, method = "GET", body) =>
  fetch(BASE + "/api/admin" + path, {
    method,
    headers: { "Content-Type": "application/json", "X-Requested-With": "raster-admin", Cookie: cookie },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

let admin, sales;
const created = { services: [], projects: [], brands: [], images: [] };

before(async () => {
  const hash = await bcrypt.hash(ADMIN.password, 10);
  await pool.query("INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin'), (?, ?, ?, 'comercial')", [
    "Admin C", ADMIN.email, hash, "Comercial C", SALES.email, hash,
  ]);
  admin = await login(ADMIN);
  sales = await login(SALES);
});

after(async () => {
  for (const id of created.services) await pool.query("DELETE FROM services WHERE id = ?", [id]);
  for (const id of created.projects) await pool.query("DELETE FROM projects WHERE id = ?", [id]);
  for (const id of created.brands) await pool.query("DELETE FROM brands WHERE id = ?", [id]);
  for (const id of created.images) await pool.query("DELETE FROM images WHERE id = ?", [id]);
  await pool.query("DELETE FROM leads WHERE email LIKE '%@raster.test'");
  await pool.query("DELETE FROM admin_users WHERE email LIKE '%@raster.test'");
  await pool.end();
});

test("conteúdo público: serviços, projetos, marcas e configurações", async () => {
  const c = await (await fetch(BASE + "/api/content")).json();
  assert.ok(c.services.length >= 16);
  const lp = c.services.find((s) => s.slug === "landing-page");
  assert.equal(lp.price_cents, 24900);
  assert.equal(lp.hosting_cents, 9900);
  assert.ok(lp.scope.length > 0);
  assert.equal(c.services.find((s) => s.slug === "personalizado").price_from, true);
  assert.deepEqual(c.projects.map((p) => p.slug).sort(), ["amanda-cosmeticos", "js-retifica"]);
  assert.equal(c.brands.length, 2);
  assert.equal(c.settings.maintenance.price_cents, 5990);
  assert.equal(c.settings.contact.instagram, "https://www.instagram.com/raster.digital/");
});

test("página inicial chega com o conteúdo embutido", async () => {
  const html = await (await fetch(BASE + "/")).text();
  assert.match(html, /<script id="app-data" type="application\/json">\{/);
  assert.doesNotMatch(html, /<!--app-data-->/);
});

test("serviços: admin cria, edita preço (reflete no site) e exclui; comercial não altera", async () => {
  const body = { slug: `teste-${RUN}`, category: "comercial", name: "Serviço Teste", description: "Descrição de teste", price_cents: 12300, price_from: false, hosting_cents: 4500, scope: ["Item A"], highlight: false, sort: 99, active: true };
  assert.equal((await call(sales, "/services", "POST", body)).status, 403);
  const bad = await call(admin, "/services", "POST", { ...body, slug: "Inválido!", price_cents: -5 });
  assert.equal(bad.status, 422);
  const r = await call(admin, "/services", "POST", body);
  assert.equal(r.status, 200);
  const { item } = await r.json();
  created.services.push(item.id);
  assert.equal((await call(admin, "/services", "POST", body)).status, 422); // slug duplicado

  assert.equal((await call(admin, `/services/${item.id}`, "PUT", { ...body, price_cents: 45600 })).status, 200);
  let c = await (await fetch(BASE + "/api/content")).json();
  assert.equal(c.services.find((s) => s.id === item.id).price_cents, 45600);

  assert.equal((await call(admin, `/services/${item.id}`, "PUT", { ...body, active: false })).status, 200);
  c = await (await fetch(BASE + "/api/content")).json();
  assert.equal(c.services.some((s) => s.id === item.id), false); // oculto do site

  assert.equal((await call(admin, `/services/${item.id}`, "DELETE")).status, 200);
  assert.equal((await call(admin, `/services/${item.id}`, "DELETE")).status, 404);
});

test("imagens: aceita PNG real, recusa arquivo falso, serve com cache", async () => {
  assert.equal((await call(sales, "/images", "POST", { dataUrl: PNG })).status, 403);
  const fake = "data:image/png;base64," + Buffer.from("<script>alert(1)</script>").toString("base64");
  assert.equal((await call(admin, "/images", "POST", { dataUrl: fake })).status, 422);
  assert.equal((await call(admin, "/images", "POST", { dataUrl: "data:image/svg+xml;base64,PHN2Zz4=" })).status, 422);
  const r = await call(admin, "/images", "POST", { dataUrl: PNG });
  assert.equal(r.status, 201);
  const { url } = await r.json();
  created.images.push(Number(url.split("/").pop()));
  const img = await fetch(BASE + url);
  assert.equal(img.status, 200);
  assert.equal(img.headers.get("content-type"), "image/png");
  assert.match(img.headers.get("cache-control"), /immutable/);
  assert.equal((await fetch(BASE + "/media/999999999")).status, 404);
});

test("projetos e marcas: CRUD com validação de URLs", async () => {
  const p = { slug: `proj-${RUN}`, client: "Cliente Teste", title: "Site", segment: "Teste", summary: "Resumo do projeto de teste.", url: "javascript:alert(1)", features: ["A"], theme: "padrao", logo_url: null, cover_url: null, mobile_url: null, gallery: [], video_url: null, sort: 99, active: true };
  assert.equal((await call(admin, "/projects", "POST", p)).status, 422);
  const r = await call(admin, "/projects", "POST", { ...p, url: "https://exemplo.com.br", video_url: "https://evil.com/x" });
  assert.equal(r.status, 422);
  const ok = await call(admin, "/projects", "POST", { ...p, url: "https://exemplo.com.br" });
  assert.equal(ok.status, 200);
  created.projects.push((await ok.json()).item.id);

  const b = { name: "Marca Teste", logo_url: "/img/logo.webp", url: null, relation: "Cliente", sort: 99, active: true };
  assert.equal((await call(admin, "/brands", "POST", { ...b, logo_url: "" })).status, 422);
  const br = await call(admin, "/brands", "POST", b);
  assert.equal(br.status, 200);
  created.brands.push((await br.json()).item.id);
  assert.equal((await call(sales, `/brands/${created.brands[0]}`, "DELETE")).status, 403);
});

test("conteúdo: admin altera texto e reflete no site; formato inválido é recusado", async () => {
  const before = await (await call(admin, "/settings")).json();
  const hero = before.settings.hero;
  try {
    const r = await call(admin, "/settings/hero", "PUT", { value: { ...hero, subtitle: "Subtítulo de teste" } });
    assert.equal(r.status, 200);
    const c = await (await fetch(BASE + "/api/content")).json();
    assert.equal(c.settings.hero.subtitle, "Subtítulo de teste");
    assert.equal((await call(admin, "/settings/hero", "PUT", { value: ["lista"] })).status, 422);
    assert.equal((await call(admin, "/settings/inexistente", "PUT", { value: {} })).status, 404);
    assert.equal((await call(admin, "/settings/contact", "PUT", { value: { ...before.settings.contact, whatsapp: "abc" } })).status, 422);
    assert.equal((await call(sales, "/settings/hero", "PUT", { value: hero })).status, 403);
  } finally {
    await call(admin, "/settings/hero", "PUT", { value: hero });
  }
});

test("formulário: grava plano, investimento, manutenção e estimativa do simulador", async () => {
  const r = await fetch(BASE + "/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Lead Simulador Teste", company: "Empresa X", whatsapp: `85 9${String(RUN).slice(-8)}`, email: `sim-${RUN}@raster.test`,
      segment: "restaurante", service: "cardapio", message: "", investment: "500_1000", wants_maintenance: true,
      plan_slug: "cardapio-digital", estimate: { min_cents: 29900, max_cents: 35880, summary: "Projeto: Cardápio Digital" },
      consent: true, website: "", startedAt: Date.now() - 9000,
    }),
  });
  assert.equal(r.status, 201);
  const [[l]] = await pool.query("SELECT * FROM leads WHERE email = ?", [`sim-${RUN}@raster.test`]);
  assert.equal(l.investment, "500_1000");
  assert.equal(l.wants_maintenance, 1);
  assert.equal(l.plan_slug, "cardapio-digital");
  assert.equal(l.estimate_min_cents, 29900);
  assert.match(l.estimate_summary, /Cardápio/);

  const bad = await fetch(BASE + "/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Outro Lead Teste", company: "Empresa Y", whatsapp: "(85) 98888-1234", email: `bad-${RUN}@raster.test`,
      segment: "loja", service: "site", investment: "1 milhão", consent: true, website: "", startedAt: Date.now() - 9000,
    }),
  });
  assert.equal(bad.status, 422);
  assert.ok((await bad.json()).fields.investment);

  const st = await call(admin, `/leads/${l.id}`, "PATCH", { status: "aguardando_retorno" });
  assert.equal((await st.json()).lead.status, "aguardando_retorno");
});

test("minha senha: exige a senha atual e troca de verdade", async () => {
  assert.equal((await call(sales, "/password", "POST", { current: "errada", next: "NovaSenha#2026" })).status, 422);
  assert.equal((await call(sales, "/password", "POST", { current: SALES.password, next: "curta" })).status, 422);
  assert.equal((await call(sales, "/password", "POST", { current: SALES.password, next: "NovaSenha#2026" })).status, 200);
  const r = await fetch(BASE + "/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: SALES.email, password: "NovaSenha#2026" }) });
  assert.equal(r.status, 200);
});

test("planos de manutenção: padrão no site, admin edita preço (reflete no site) e validação", async () => {
  const pub = await (await fetch(BASE + "/api/content")).json();
  const mp = pub.settings.maintenancePlans;
  assert.deepEqual(mp.plans.map((p) => [p.name, p.price_cents, p.tier]), [["Essencial", 4990, "essencial"], ["Premium", 9990, "premium"], ["Platinum", 14990, "platinum"]]);
  assert.equal(mp.plans[1].badge, "Mais recomendado");
  assert.match(mp.note, /não acumulativos/);

  const original = (await (await call(admin, "/settings")).json()).settings.maintenancePlans;
  const withPrice = (cents) => ({ ...original, plans: original.plans.map((p, i) => (i === 0 ? { ...p, price_cents: cents } : p)) });
  try {
    const r = await call(admin, "/settings/maintenancePlans", "PUT", { value: withPrice(5490) });
    assert.equal(r.status, 200);
    const c = await (await fetch(BASE + "/api/content")).json();
    assert.equal(c.settings.maintenancePlans.plans[0].price_cents, 5490);

    assert.equal((await call(admin, "/settings/maintenancePlans", "PUT", { value: withPrice(null) })).status, 422);
    assert.equal((await call(admin, "/settings/maintenancePlans", "PUT", { value: withPrice(0) })).status, 422);
    const badTier = { ...original, plans: original.plans.map((p) => ({ ...p, tier: "ouro" })) };
    assert.equal((await call(admin, "/settings/maintenancePlans", "PUT", { value: badTier })).status, 422);
    assert.equal((await call(admin, "/settings/maintenancePlans", "PUT", { value: { ...original, plans: [] } })).status, 422);
    assert.equal((await call(sales, "/settings/maintenancePlans", "PUT", { value: original })).status, 403);
  } finally {
    await call(admin, "/settings/maintenancePlans", "PUT", { value: original });
  }
});
