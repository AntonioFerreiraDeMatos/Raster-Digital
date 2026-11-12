// Testa o envio de leads ao ERP contra um ERP falso local (não precisa do servidor do site rodando).
// Uso: node --test server/test/erpSync.test.js   — NÃO rode contra o banco de produção.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";
import { migrate } from "../config/migrate.js";
import { syncLead, syncPending } from "../lib/erpSync.js";

if (env.isProd) throw new Error("Não rode os testes com NODE_ENV=production.");

const TOKEN = "token-teste-erp";
const received = [];
let failNext = false;
let server;

const insertLead = async (email) => {
  const [r] = await pool.query(
    `INSERT INTO leads (name, company, whatsapp, email, segment, service, message, consent_at, privacy_version, utm_source)
     VALUES ('Maria ERP', 'Pizzaria ERP', '85999990000', ?, 'pizzaria', 'site', 'Oi', UTC_TIMESTAMP(), '2026-11', 'instagram')`,
    [email]
  );
  return r.insertId;
};
const row = async (id) => (await pool.query("SELECT * FROM leads WHERE id = ?", [id]))[0][0];

before(async () => {
  await migrate();
  server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      if (req.headers.authorization !== `Bearer ${TOKEN}`) return res.writeHead(401).end();
      if (failNext) { failNext = false; return res.writeHead(500).end(); }
      const data = JSON.parse(body);
      received.push(data);
      res.writeHead(201, { "Content-Type": "application/json" }).end(JSON.stringify({ id: 1000 + data.externalId }));
    });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  env.erp.url = `http://127.0.0.1:${server.address().port}/site-leads`;
  env.erp.token = TOKEN;
  // Não envia leads reais do banco local nos testes de pendentes.
  await pool.query("UPDATE leads SET erp_synced_at = UTC_TIMESTAMP() WHERE erp_synced_at IS NULL AND email NOT LIKE '%@erp.test'");
});

after(async () => {
  await pool.query("DELETE FROM leads WHERE email LIKE '%@erp.test'");
  await pool.end();
  server.close();
});

test("envia o lead e marca como sincronizado", async () => {
  const id = await insertLead("a@erp.test");
  assert.equal(await syncLead(id), true);
  const sent = received.at(-1);
  assert.equal(sent.externalId, id);
  assert.equal(sent.company, "Pizzaria ERP");
  assert.equal(sent.utmSource, "instagram");
  assert.equal(sent.resubmission, false);
  const r = await row(id);
  assert.ok(r.erp_synced_at);
  assert.equal(r.erp_lead_id, 1000 + id);
  // Já sincronizado: não reenvia.
  const before = received.length;
  assert.equal(await syncLead(id), true);
  assert.equal(received.length, before);
  // Reenvio pelo formulário vira atividade no ERP.
  await syncLead(id, { resubmission: true });
  assert.equal(received.at(-1).resubmission, true);
});

test("falha do ERP não quebra e a rotina reenvia depois", async () => {
  const id = await insertLead("b@erp.test");
  failNext = true;
  assert.equal(await syncLead(id), false);
  let r = await row(id);
  assert.equal(r.erp_synced_at, null);
  assert.equal(r.erp_attempts, 1);
  assert.match(r.erp_last_error, /500/);
  assert.ok((await syncPending()) >= 1);
  r = await row(id);
  assert.ok(r.erp_synced_at);
  assert.equal(r.erp_last_error, null);
});

test("token errado fica registrado como erro", async () => {
  const id = await insertLead("c@erp.test");
  env.erp.token = "errado";
  assert.equal(await syncLead(id), false);
  assert.match((await row(id)).erp_last_error, /401/);
  env.erp.token = TOKEN;
});
