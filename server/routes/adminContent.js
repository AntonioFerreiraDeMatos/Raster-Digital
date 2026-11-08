// Gestão de conteúdo pelo painel: serviços e preços, projetos, marcas, textos e imagens.
// Montado depois de requireAdmin; alterações exigem o perfil "admin".
import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { requireRole } from "../middleware/auth.js";
import { clip } from "../lib/validation.js";
import { invalidateContent, loadSettings, mapBrand, mapProject, mapService } from "../lib/content.js";
import * as defaults from "../data/defaults.js";

const router = Router();
const adminOnly = requireRole("admin");

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Aceita caminhos do próprio site (/img/..., /media/...) ou URLs https
const isUrl = (v) => typeof v === "string" && (/^\/(img|media)\/[\w./-]+$/.test(v) || /^https:\/\/[^\s<>"']+$/.test(v));
const optUrl = (v) => (v == null || v === "" ? null : isUrl(String(v).trim()) ? String(v).trim().slice(0, 300) : undefined);
const strList = (v, maxItems, maxLen) =>
  Array.isArray(v) ? v.map((s) => clip(String(s), maxLen)).filter(Boolean).slice(0, maxItems) : undefined;
const cents = (v) => {
  if (v === null || v === "") return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 && n <= 100_000_000 ? n : undefined;
};
const int = (v, d = 0) => (Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : d);
const bool = (v) => (v ? 1 : 0);

function fail(res, fields) {
  return res.status(422).json({ error: "Revise os campos destacados.", fields });
}
function done(res, payload) {
  invalidateContent();
  res.json(payload);
}

/* ---------------- Serviços e preços ---------------- */
function validateService(b) {
  const f = {};
  const d = {
    slug: clip(b.slug, 60).toLowerCase(),
    category: b.category,
    name: clip(b.name, 120),
    description: clip(b.description, 300),
    price_cents: cents(b.price_cents),
    price_from: bool(b.price_from),
    hosting_cents: cents(b.hosting_cents),
    scope: strList(b.scope, 15, 200),
    highlight: bool(b.highlight),
    sort: int(b.sort),
    active: bool(b.active ?? true),
  };
  if (!SLUG_RE.test(d.slug)) f.slug = "Use letras minúsculas, números e hífens.";
  if (!["presenca", "comercial", "profissional"].includes(d.category)) f.category = "Categoria inválida.";
  if (d.name.length < 2) f.name = "Informe o nome.";
  if (d.description.length < 5) f.description = "Informe uma descrição curta.";
  if (d.price_cents === undefined) f.price_cents = "Preço inválido.";
  if (d.hosting_cents === undefined) f.hosting_cents = "Valor inválido.";
  if (!d.scope) f.scope = "Informe o escopo.";
  return { d, f };
}

router.get("/services", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM services ORDER BY sort, id");
    res.json({ items: rows.map(mapService) });
  } catch (e) { next(e); }
});

async function saveService(req, res, next, id) {
  try {
    const { d, f } = validateService(req.body ?? {});
    if (Object.keys(f).length) return fail(res, f);
    const vals = [d.slug, d.category, d.name, d.description, d.price_cents, d.price_from, d.hosting_cents, JSON.stringify(d.scope), d.highlight, d.sort, d.active];
    if (id) {
      const [r] = await pool.query(
        `UPDATE services SET slug=?, category=?, name=?, description=?, price_cents=?, price_from=?, hosting_cents=?, scope=?, highlight=?, sort=?, active=? WHERE id=?`,
        [...vals, id]
      );
      if (!r.affectedRows) return res.status(404).json({ error: "Serviço não encontrado." });
    } else {
      const [r] = await pool.query(
        `INSERT INTO services (slug, category, name, description, price_cents, price_from, hosting_cents, scope, highlight, sort, active) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        vals
      );
      id = r.insertId;
    }
    const [[row]] = await pool.query("SELECT * FROM services WHERE id = ?", [id]);
    done(res, { item: mapService(row) });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return fail(res, { slug: "Já existe um serviço com este identificador." });
    next(e);
  }
}
router.post("/services", adminOnly, (req, res, next) => saveService(req, res, next, null));
router.put("/services/:id", adminOnly, (req, res, next) => saveService(req, res, next, int(req.params.id)));
router.delete("/services/:id", adminOnly, async (req, res, next) => {
  try {
    const [r] = await pool.query("DELETE FROM services WHERE id = ?", [int(req.params.id)]);
    if (!r.affectedRows) return res.status(404).json({ error: "Serviço não encontrado." });
    done(res, { ok: true });
  } catch (e) { next(e); }
});

/* ---------------- Projetos ---------------- */
function validateProject(b) {
  const f = {};
  const d = {
    slug: clip(b.slug, 60).toLowerCase(),
    client: clip(b.client, 120),
    title: clip(b.title, 160),
    segment: clip(b.segment, 120),
    summary: clip(b.summary, 400),
    url: optUrl(b.url),
    features: strList(b.features, 12, 80),
    theme: b.theme,
    logo_url: optUrl(b.logo_url),
    cover_url: optUrl(b.cover_url),
    mobile_url: optUrl(b.mobile_url),
    gallery: Array.isArray(b.gallery) ? b.gallery.map(optUrl) : [],
    video_url: optUrl(b.video_url),
    sort: int(b.sort),
    active: bool(b.active ?? true),
  };
  if (!SLUG_RE.test(d.slug)) f.slug = "Use letras minúsculas, números e hífens.";
  if (d.client.length < 2) f.client = "Informe o cliente.";
  if (d.title.length < 2) f.title = "Informe o título.";
  if (d.segment.length < 2) f.segment = "Informe o segmento.";
  if (d.summary.length < 10) f.summary = "Informe um resumo.";
  if (!["padrao", "beleza", "industrial"].includes(d.theme)) f.theme = "Tema inválido.";
  if (!d.features) f.features = "Informe os destaques.";
  for (const k of ["url", "logo_url", "cover_url", "mobile_url", "video_url"]) if (d[k] === undefined) f[k] = "Endereço inválido (use https://).";
  if (d.gallery.some((g) => !g)) f.gallery = "Há imagem inválida na galeria.";
  d.gallery = d.gallery.slice(0, 8);
  if (d.video_url && !/^https:\/\/(www\.youtube-nocookie\.com|www\.youtube\.com|player\.vimeo\.com)\//.test(d.video_url)) {
    f.video_url = "Use o link de incorporação do YouTube ou Vimeo.";
  }
  return { d, f };
}

router.get("/projects", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projects ORDER BY sort, id");
    res.json({ items: rows.map(mapProject) });
  } catch (e) { next(e); }
});

async function saveProject(req, res, next, id) {
  try {
    const { d, f } = validateProject(req.body ?? {});
    if (Object.keys(f).length) return fail(res, f);
    const vals = [d.slug, d.client, d.title, d.segment, d.summary, d.url, JSON.stringify(d.features), d.theme, d.logo_url, d.cover_url, d.mobile_url, JSON.stringify(d.gallery), d.video_url, d.sort, d.active];
    if (id) {
      const [r] = await pool.query(
        `UPDATE projects SET slug=?, client=?, title=?, segment=?, summary=?, url=?, features=?, theme=?, logo_url=?, cover_url=?, mobile_url=?, gallery=?, video_url=?, sort=?, active=? WHERE id=?`,
        [...vals, id]
      );
      if (!r.affectedRows) return res.status(404).json({ error: "Projeto não encontrado." });
    } else {
      const [r] = await pool.query(
        `INSERT INTO projects (slug, client, title, segment, summary, url, features, theme, logo_url, cover_url, mobile_url, gallery, video_url, sort, active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        vals
      );
      id = r.insertId;
    }
    const [[row]] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);
    done(res, { item: mapProject(row) });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return fail(res, { slug: "Já existe um projeto com este identificador." });
    next(e);
  }
}
router.post("/projects", adminOnly, (req, res, next) => saveProject(req, res, next, null));
router.put("/projects/:id", adminOnly, (req, res, next) => saveProject(req, res, next, int(req.params.id)));
router.delete("/projects/:id", adminOnly, async (req, res, next) => {
  try {
    const [r] = await pool.query("DELETE FROM projects WHERE id = ?", [int(req.params.id)]);
    if (!r.affectedRows) return res.status(404).json({ error: "Projeto não encontrado." });
    done(res, { ok: true });
  } catch (e) { next(e); }
});

/* ---------------- Marcas ---------------- */
function validateBrand(b) {
  const f = {};
  const d = {
    name: clip(b.name, 120),
    logo_url: optUrl(b.logo_url),
    url: optUrl(b.url),
    relation: clip(b.relation, 120) || "Cliente",
    sort: int(b.sort),
    active: bool(b.active ?? true),
  };
  if (d.name.length < 2) f.name = "Informe o nome da marca.";
  if (!d.logo_url) f.logo_url = "Envie o logotipo original.";
  if (d.url === undefined) f.url = "Endereço inválido (use https://).";
  return { d, f };
}
router.get("/brands", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM brands ORDER BY sort, id");
    res.json({ items: rows.map(mapBrand) });
  } catch (e) { next(e); }
});
async function saveBrand(req, res, next, id) {
  try {
    const { d, f } = validateBrand(req.body ?? {});
    if (Object.keys(f).length) return fail(res, f);
    const vals = [d.name, d.logo_url, d.url, d.relation, d.sort, d.active];
    if (id) {
      const [r] = await pool.query("UPDATE brands SET name=?, logo_url=?, url=?, relation=?, sort=?, active=? WHERE id=?", [...vals, id]);
      if (!r.affectedRows) return res.status(404).json({ error: "Marca não encontrada." });
    } else {
      id = (await pool.query("INSERT INTO brands (name, logo_url, url, relation, sort, active) VALUES (?,?,?,?,?,?)", vals))[0].insertId;
    }
    const [[row]] = await pool.query("SELECT * FROM brands WHERE id = ?", [id]);
    done(res, { item: mapBrand(row) });
  } catch (e) { next(e); }
}
router.post("/brands", adminOnly, (req, res, next) => saveBrand(req, res, next, null));
router.put("/brands/:id", adminOnly, (req, res, next) => saveBrand(req, res, next, int(req.params.id)));
router.delete("/brands/:id", adminOnly, async (req, res, next) => {
  try {
    const [r] = await pool.query("DELETE FROM brands WHERE id = ?", [int(req.params.id)]);
    if (!r.affectedRows) return res.status(404).json({ error: "Marca não encontrada." });
    done(res, { ok: true });
  } catch (e) { next(e); }
});

/* ---------------- Conteúdo (textos e configurações) ---------------- */
const SETTING_KEYS = Object.keys(defaults.settings);

router.get("/settings", async (_req, res, next) => {
  try {
    res.json({ settings: await loadSettings() });
  } catch (e) { next(e); }
});

/** Sanitiza recursivamente: só strings, números, booleanos, null, listas e objetos; strings limitadas. */
function sanitize(value, depth = 0) {
  if (depth > 5) return undefined;
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") return value.trim().slice(0, 600);
  if (Array.isArray(value)) return value.slice(0, 40).map((v) => sanitize(v, depth + 1)).filter((v) => v !== undefined);
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value).slice(0, 40)) {
      if (!/^[a-zA-Z_][\w]{0,40}$/.test(k)) continue;
      const s = sanitize(v, depth + 1);
      if (s !== undefined) out[k] = s;
    }
    return out;
  }
  return undefined;
}

router.put("/settings/:name", adminOnly, async (req, res, next) => {
  try {
    const name = req.params.name;
    if (!SETTING_KEYS.includes(name)) return res.status(404).json({ error: "Configuração inexistente." });
    const value = sanitize(req.body?.value);
    if (value === undefined || typeof value !== typeof defaults.settings[name] || Array.isArray(value) !== Array.isArray(defaults.settings[name])) {
      return res.status(422).json({ error: "Formato inválido." });
    }
    if (name === "contact") {
      if (!/^\d{12,13}$/.test(String(value.whatsapp ?? ""))) return fail(res, { whatsapp: "Use DDI + DDD + número, só dígitos." });
      for (const k of ["instagram", "linkedin", "github"]) {
        if (value[k] && !/^https:\/\/[^\s<>"']+$/.test(value[k])) return fail(res, { [k]: "Use um link https://." });
      }
    }
    await pool.query("INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)", [name, JSON.stringify(value)]);
    done(res, { value });
  } catch (e) { next(e); }
});

/* ---------------- Imagens ---------------- */
const MAX_IMAGE_BYTES = 1_500_000;
const SIGNATURES = {
  "image/png": (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/webp": (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP",
};

router.post("/images", adminOnly, async (req, res, next) => {
  try {
    const m = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(req.body?.dataUrl ?? "");
    if (!m) return res.status(422).json({ error: "Envie uma imagem PNG, JPG ou WEBP." });
    const buf = Buffer.from(m[2], "base64");
    if (buf.length > MAX_IMAGE_BYTES) return res.status(422).json({ error: "Imagem muito grande (máximo 1,5 MB após a compressão)." });
    if (!SIGNATURES[m[1]](buf)) return res.status(422).json({ error: "O arquivo não é uma imagem válida." });
    const [r] = await pool.query("INSERT INTO images (mime, data, bytes) VALUES (?, ?, ?)", [m[1], buf, buf.length]);
    res.status(201).json({ url: `/media/${r.insertId}` });
  } catch (e) { next(e); }
});

/* ---------------- Minha senha ---------------- */
router.post("/password", async (req, res, next) => {
  try {
    const current = typeof req.body?.current === "string" ? req.body.current : "";
    const nextPw = typeof req.body?.next === "string" ? req.body.next : "";
    if (nextPw.length < 10 || nextPw.length > 200) return fail(res, { next: "A nova senha precisa ter pelo menos 10 caracteres." });
    const [[u]] = await pool.query("SELECT password_hash FROM admin_users WHERE id = ?", [req.admin.id]);
    if (!u || !(await bcrypt.compare(current, u.password_hash))) return fail(res, { current: "Senha atual incorreta." });
    await pool.query("UPDATE admin_users SET password_hash = ? WHERE id = ?", [await bcrypt.hash(nextPw, 12), req.admin.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
