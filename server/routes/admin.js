import { Router } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";
import { COOKIE, requireAdmin, requireRole, signSession } from "../middleware/auth.js";
import { validateLead, STATUSES, SEGMENTS, clip } from "../lib/validation.js";
import adminContent from "./adminContent.js";

const router = Router();

const cookieOpts = {
  httpOnly: true,
  sameSite: "strict",
  secure: env.isProd,
  path: "/api/admin",
  maxAge: 8 * 3600 * 1000,
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true, // conta só tentativas com erro
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login. Aguarde 15 minutos." },
});

// Hash usado quando o e-mail não existe, para o tempo de resposta não revelar quais contas existem.
let dummyHash;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash("raster-dummy-password", 12));

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const email = clip(req.body?.email, 190).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password.slice(0, 200) : "";
    const [rows] = await pool.query(
      "SELECT id, name, role, password_hash, active FROM admin_users WHERE email = ?",
      [email]
    );
    const user = rows[0];
    const ok = await bcrypt.compare(password, user?.password_hash ?? (await getDummyHash()));
    if (!user || !ok || !user.active) return res.status(401).json({ error: "E-mail ou senha incorretos." });
    await pool.query("UPDATE admin_users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?", [user.id]);
    res.cookie(COOKIE, signSession(user), cookieOpts);
    res.json({ user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (_req, res) => {
  const { maxAge: _ignored, ...opts } = cookieOpts;
  res.clearCookie(COOKIE, opts);
  res.json({ ok: true });
});

router.use(requireAdmin);
router.use(adminContent);

router.get("/me", (req, res) => res.json({ user: req.admin }));

router.get("/stats", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT status, COUNT(*) AS total FROM leads GROUP BY status");
    const byStatus = Object.fromEntries(rows.map((r) => [r.status, Number(r.total)]));
    const total = rows.reduce((s, r) => s + Number(r.total), 0);
    const [[week]] = await pool.query(
      "SELECT COUNT(*) AS n FROM leads WHERE created_at >= UTC_TIMESTAMP() - INTERVAL 7 DAY"
    );
    res.json({ total, last7days: Number(week.n), byStatus });
  } catch (err) {
    next(err);
  }
});

router.get("/leads", async (req, res, next) => {
  try {
    const where = [];
    const params = [];
    const status = clip(req.query.status, 30);
    const segment = clip(req.query.segment, 40);
    const q = clip(req.query.q, 100);
    if (status && STATUSES.has(status)) {
      where.push("status = ?");
      params.push(status);
    }
    if (segment && SEGMENTS.has(segment)) {
      where.push("segment = ?");
      params.push(segment);
    }
    if (q) {
      const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
      const digits = q.replace(/\D/g, "");
      where.push(`(name LIKE ? OR company LIKE ? OR email LIKE ?${digits ? " OR whatsapp LIKE ?" : ""})`);
      params.push(like, like, like);
      if (digits) params.push(`%${digits}%`);
    }
    const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
    const pageSize = 25;
    const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const [[{ n }]] = await pool.query(`SELECT COUNT(*) AS n FROM leads ${sqlWhere}`, params);
    const [items] = await pool.query(
      `SELECT id, name, company, whatsapp, email, segment, service, status, source, submissions, investment,
         plan_slug, estimate_min_cents, estimate_max_cents, created_at, updated_at
       FROM leads ${sqlWhere} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize]
    );
    res.json({ items, total: Number(n), page, pageSize });
  } catch (err) {
    next(err);
  }
});

async function loadLead(id) {
  if (!Number.isInteger(id) || id <= 0) return undefined;
  const [rows] = await pool.query("SELECT * FROM leads WHERE id = ?", [id]);
  return rows[0];
}

router.get("/leads/:id", async (req, res, next) => {
  try {
    const lead = await loadLead(Number(req.params.id));
    if (!lead) return res.status(404).json({ error: "Lead não encontrado." });
    const [events] = await pool.query(
      `SELECT e.id, e.type, e.from_status, e.to_status, e.body, e.created_at, u.name AS author
       FROM lead_events e LEFT JOIN admin_users u ON u.id = e.admin_user_id
       WHERE e.lead_id = ? ORDER BY e.created_at DESC, e.id DESC`,
      [lead.id]
    );
    res.json({ lead, events });
  } catch (err) {
    next(err);
  }
});

const EDITABLE = ["name", "company", "whatsapp", "email", "segment", "service", "message", "investment", "wants_maintenance"];

router.patch("/leads/:id", async (req, res, next) => {
  let conn;
  try {
    const id = Number(req.params.id);
    const lead = await loadLead(id);
    if (!lead) return res.status(404).json({ error: "Lead não encontrado." });

    const body = req.body ?? {};
    const { data, errors } = validateLead(body, { partial: true });
    let newStatus = null;
    if (body.status !== undefined) {
      newStatus = clip(body.status, 30);
      if (!STATUSES.has(newStatus)) errors.status = "Situação inválida.";
    }
    if (Object.keys(errors).length) {
      return res.status(422).json({ error: "Revise os campos destacados.", fields: errors });
    }

    const norm = (v) => (v === "" || v === undefined ? null : v);
    const changed = EDITABLE.filter((k) => k in data && norm(data[k]) !== norm(lead[k]));
    conn = await pool.getConnection();
    await conn.beginTransaction();
    if (changed.length) {
      await conn.query(
        `UPDATE leads SET ${changed.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`,
        [...changed.map((k) => norm(data[k])), id]
      );
      await conn.query(
        "INSERT INTO lead_events (lead_id, admin_user_id, type, body) VALUES (?, ?, 'edicao', ?)",
        [id, req.admin.id, `Campos alterados: ${changed.join(", ")}`]
      );
    }
    if (newStatus && newStatus !== lead.status) {
      await conn.query("UPDATE leads SET status = ? WHERE id = ?", [newStatus, id]);
      await conn.query(
        "INSERT INTO lead_events (lead_id, admin_user_id, type, from_status, to_status) VALUES (?, ?, 'status', ?, ?)",
        [id, req.admin.id, lead.status, newStatus]
      );
    }
    await conn.commit();
    res.json({ lead: await loadLead(id) });
  } catch (err) {
    if (conn) await conn.rollback().catch(() => {});
    next(err);
  } finally {
    conn?.release();
  }
});

router.post("/leads/:id/notes", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = typeof req.body?.body === "string" ? req.body.body.trim().slice(0, 4000) : "";
    if (!body) return res.status(422).json({ error: "Escreva a observação." });
    if (!(await loadLead(id))) return res.status(404).json({ error: "Lead não encontrado." });
    await pool.query(
      "INSERT INTO lead_events (lead_id, admin_user_id, type, body) VALUES (?, ?, 'observacao', ?)",
      [id, req.admin.id, body]
    );
    await pool.query("UPDATE leads SET updated_at = UTC_TIMESTAMP() WHERE id = ?", [id]);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Exclusão permitida apenas para o perfil "admin" (perfil "comercial" não exclui).
router.delete("/leads/:id", requireRole("admin"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(404).json({ error: "Lead não encontrado." });
    const [r] = await pool.query("DELETE FROM leads WHERE id = ?", [id]);
    if (!r.affectedRows) return res.status(404).json({ error: "Lead não encontrado." });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
