import { pool } from "../config/db.js";
import * as defaults from "../data/defaults.js";

const parse = (v, fallback) => {
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};

/** Grava o conteúdo inicial somente nas tabelas vazias (nunca sobrescreve edições). */
export async function seedContent() {
  const empty = async (table) => Number((await pool.query(`SELECT COUNT(*) AS n FROM ${table}`))[0][0].n) === 0;

  if (await empty("services")) {
    for (const s of defaults.services) {
      await pool.query(
        `INSERT INTO services (slug, category, name, description, price_cents, price_from, hosting_cents, scope, highlight, sort)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.slug, s.category, s.name, s.description, s.price_cents, s.priceFrom ? 1 : 0, s.hosting_cents, JSON.stringify(s.scope), s.highlight ? 1 : 0, s.sort]
      );
    }
  }
  if (await empty("projects")) {
    for (const p of defaults.projects) {
      await pool.query(
        `INSERT INTO projects (slug, client, title, segment, summary, url, features, theme, logo_url, cover_url, mobile_url, gallery, video_url, sort)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.slug, p.client, p.title, p.segment, p.summary, p.url, JSON.stringify(p.features), p.theme, p.logo_url, p.cover_url, p.mobile_url, JSON.stringify(p.gallery), p.video_url, p.sort]
      );
    }
  }
  if (await empty("brands")) {
    for (const b of defaults.brands) {
      await pool.query("INSERT INTO brands (name, logo_url, url, relation, sort) VALUES (?, ?, ?, ?, ?)", [b.name, b.logo_url, b.url, b.relation, b.sort]);
    }
  }
  for (const [name, value] of Object.entries(defaults.settings)) {
    await pool.query("INSERT IGNORE INTO settings (name, value) VALUES (?, ?)", [name, JSON.stringify(value)]);
  }
  invalidateContent();
}

export const mapService = (r) => ({
  id: r.id, slug: r.slug, category: r.category, name: r.name, description: r.description,
  price_cents: r.price_cents, price_from: !!r.price_from, hosting_cents: r.hosting_cents,
  scope: parse(r.scope, []), highlight: !!r.highlight, sort: r.sort, active: !!r.active,
});
export const mapProject = (r) => ({
  id: r.id, slug: r.slug, client: r.client, title: r.title, segment: r.segment, summary: r.summary, url: r.url,
  features: parse(r.features, []), theme: r.theme, logo_url: r.logo_url, cover_url: r.cover_url, mobile_url: r.mobile_url,
  gallery: parse(r.gallery, []), video_url: r.video_url, sort: r.sort, active: !!r.active,
});
export const mapBrand = (r) => ({ id: r.id, name: r.name, logo_url: r.logo_url, url: r.url, relation: r.relation, sort: r.sort, active: !!r.active });

export async function loadSettings() {
  const [rows] = await pool.query("SELECT name, value FROM settings");
  const out = { ...defaults.settings };
  for (const r of rows) out[r.name] = parse(r.value, out[r.name]);
  return out;
}

let cache = null;
export function invalidateContent() {
  cache = null;
}

/** Conteúdo público do site (somente itens ativos), com cache em memória. */
export async function getPublicContent() {
  if (cache) return cache;
  const [[services], [projects], [brands], settings] = await Promise.all([
    pool.query("SELECT * FROM services WHERE active = 1 ORDER BY sort, id"),
    pool.query("SELECT * FROM projects WHERE active = 1 ORDER BY sort, id"),
    pool.query("SELECT * FROM brands WHERE active = 1 ORDER BY sort, id"),
    loadSettings(),
  ]);
  cache = {
    services: services.map(mapService),
    projects: projects.map(mapProject),
    brands: brands.map(mapBrand),
    settings,
  };
  return cache;
}
