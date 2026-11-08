// Testes de integração ponta a ponta (servidor + MySQL).
// Pré-requisitos: banco configurado no .env, `npm run build` e `npm start` rodando.
// Uso: npm test   (ou BASE_URL=http://localhost:3000 npm test)
// ATENÇÃO: cria e remove dados de teste — NÃO rode contra o banco de produção.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const RUN = Date.now();
const ADMIN = { email: `teste-admin-${RUN}@raster.test`, password: "SenhaTeste#2026" };
const SALES = { email: `teste-comercial-${RUN}@raster.test`, password: "SenhaTeste#2026" };
const LEAD_EMAIL = `lead-${RUN}@raster.test`;
const PHONE = `8598${String(RUN).slice(-7)}`;

if (env.isProd) throw new Error("Não rode os testes com NODE_ENV=production.");

const post = (path, body, headers = {}) =>
  fetch(BASE + path, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });

const validLead = (extra = {}) => ({
  name: "Maria Teste Silva",
  company: "Pizzaria Teste",
  whatsapp: `(${PHONE.slice(0, 2)}) ${PHONE.slice(2, 7)}-${PHONE.slice(7)}`,
  email: LEAD_EMAIL,
  segment: "pizzaria",
  service: "site",
  message: "Quero cardápio digital",
  consent: true,
  website: "",
  startedAt: Date.now() - 10_000,
  utm_source: "instagram",
  utm_campaign: "teste",
  landingPath: "/?utm_source=instagram",
  ...extra,
});

async function login(user) {
  const r = await post("/api/admin/login", user);
  const cookie = r.headers.get("set-cookie")?.split(";")[0];
  return { r, cookie };
}
const adminFetch = (cookie, path, init = {}) =>
  fetch(BASE + "/api/admin" + path, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Requested-With": "raster-admin", Cookie: cookie, ...init.headers },
  });

before(async () => {
  const hash = await bcrypt.hash(ADMIN.password, 10);
  await pool.query("INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin'), (?, ?, ?, 'comercial')", [
    "Admin Teste", ADMIN.email, hash, "Comercial Teste", SALES.email, hash,
  ]);
});

after(async () => {
  await pool.query("DELETE FROM leads WHERE email LIKE '%@raster.test'");
  await pool.query("DELETE FROM admin_users WHERE email LIKE '%@raster.test'");
  await pool.end();
});

test("páginas e arquivos de SEO respondem", async () => {
  for (const [path, type] of [["/", "text/html"], ["/privacidade", "text/html"], ["/admin", "text/html"], ["/robots.txt", "text/plain"], ["/sitemap.xml", "xml"]]) {
    const r = await fetch(BASE + path);
    assert.equal(r.status, 200, path);
    assert.match(r.headers.get("content-type"), new RegExp(type), path);
  }
  const nf = await fetch(BASE + "/nao-existe", { headers: { Accept: "text/html" } });
  assert.equal(nf.status, 404);
  const h = await (await fetch(BASE + "/api/health")).json();
  assert.deepEqual(h, { ok: true, db: true });
});

test("cabeçalhos de segurança presentes", async () => {
  const r = await fetch(BASE + "/");
  assert.ok(r.headers.get("content-security-policy"));
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("x-powered-by"), null);
});

test("formulário: validação devolve campos com erro", async () => {
  const r = await post("/api/leads", validLead({ name: "Ma", email: "invalido", whatsapp: "123", segment: "x", consent: false }));
  assert.equal(r.status, 422);
  const b = await r.json();
  for (const f of ["name", "email", "whatsapp", "segment", "consent"]) assert.ok(b.fields[f], f);
});

test("formulário: honeypot e envio rápido demais são descartados sem gravar", async () => {
  const before = await countLeads();
  assert.equal((await post("/api/leads", validLead({ website: "http://spam" }))).status, 201);
  assert.equal((await post("/api/leads", validLead({ startedAt: Date.now() }))).status, 201);
  assert.equal(await countLeads(), before);
});

test("formulário: cadastro válido grava no MySQL com origem e data; duplicado vira reenvio", async () => {
  const r = await post("/api/leads", validLead());
  assert.equal(r.status, 201);
  const [[lead]] = await pool.query("SELECT * FROM leads WHERE email = ?", [LEAD_EMAIL]);
  assert.equal(lead.whatsapp, PHONE);
  assert.equal(lead.status, "novo");
  assert.equal(lead.source, "instagram");
  assert.equal(lead.utm_campaign, "teste");
  assert.ok(lead.created_at instanceof Date);
  assert.ok(lead.consent_at instanceof Date);

  const dup = await post("/api/leads", validLead({ service: "loja_virtual" }));
  assert.equal(dup.status, 200);
  assert.equal((await dup.json()).duplicate, true);
  const [[again]] = await pool.query("SELECT COUNT(*) AS n, MAX(submissions) AS s FROM leads WHERE email = ?", [LEAD_EMAIL]);
  assert.equal(Number(again.n), 1);
  assert.equal(Number(again.s), 2);
});

test("painel: exige login e cabeçalho anti-CSRF", async () => {
  assert.equal((await fetch(BASE + "/api/admin/stats", { headers: { "X-Requested-With": "raster-admin" } })).status, 401);
  const { cookie } = await login(ADMIN);
  assert.equal((await fetch(BASE + "/api/admin/stats", { headers: { Cookie: cookie } })).status, 403);
  assert.equal((await login({ email: ADMIN.email, password: "errada" })).r.status, 401);
});

test("painel: indicadores, filtros, detalhes, status, observações, edição e histórico", async () => {
  const { r, cookie } = await login(ADMIN);
  assert.equal(r.status, 200);
  assert.match(r.headers.get("set-cookie"), /HttpOnly/i);

  const stats = await (await adminFetch(cookie, "/stats")).json();
  assert.ok(stats.total >= 1 && stats.byStatus.novo >= 1);

  const list = await (await adminFetch(cookie, `/leads?segment=pizzaria&status=novo&q=${encodeURIComponent(LEAD_EMAIL)}`)).json();
  assert.equal(list.items.length, 1);
  const id = list.items[0].id;
  const byPhone = await (await adminFetch(cookie, `/leads?q=${PHONE.slice(-6)}`)).json();
  assert.ok(byPhone.items.some((l) => l.id === id));

  const st = await adminFetch(cookie, `/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status: "negociacao" }) });
  assert.equal(st.status, 200);
  assert.equal((await st.json()).lead.status, "negociacao");

  assert.equal((await adminFetch(cookie, `/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status: "xyz" }) })).status, 422);
  assert.equal((await adminFetch(cookie, `/leads/${id}`, { method: "PATCH", body: JSON.stringify({ email: "ruim" }) })).status, 422);

  const ed = await adminFetch(cookie, `/leads/${id}`, { method: "PATCH", body: JSON.stringify({ company: "Pizzaria Teste Editada" }) });
  assert.equal((await ed.json()).lead.company, "Pizzaria Teste Editada");

  assert.equal((await adminFetch(cookie, `/leads/${id}/notes`, { method: "POST", body: JSON.stringify({ body: "Ligar sexta" }) })).status, 201);

  const det = await (await adminFetch(cookie, `/leads/${id}`)).json();
  const types = det.events.map((e) => e.type);
  for (const t of ["criado", "reenvio", "status", "edicao", "observacao"]) assert.ok(types.includes(t), t);
  assert.equal(det.events.find((e) => e.type === "observacao").author, "Admin Teste");
});

test("painel: perfil comercial não exclui; administrador exclui", async () => {
  const [[{ id }]] = await pool.query("SELECT id FROM leads WHERE email = ?", [LEAD_EMAIL]);
  const sales = await login(SALES);
  assert.equal((await adminFetch(sales.cookie, `/leads/${id}`, { method: "DELETE" })).status, 403);
  const admin = await login(ADMIN);
  assert.equal((await adminFetch(admin.cookie, `/leads/${id}`, { method: "DELETE" })).status, 200);
  assert.equal((await adminFetch(admin.cookie, `/leads/${id}`)).status, 404);
  const [[ev]] = await pool.query("SELECT COUNT(*) AS n FROM lead_events WHERE lead_id = ?", [id]);
  assert.equal(Number(ev.n), 0); // histórico removido em cascata
});

test("logout invalida o cookie no navegador", async () => {
  const { cookie } = await login(ADMIN);
  const r = await adminFetch(cookie, "/logout", { method: "POST" });
  assert.match(r.headers.get("set-cookie"), /raster_admin=;/);
});

async function countLeads() {
  const [[{ n }]] = await pool.query("SELECT COUNT(*) AS n FROM leads");
  return Number(n);
}
