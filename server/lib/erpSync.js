// Envia leads do site para o CRM do ERP. O site nunca depende do ERP:
// o lead já está salvo aqui; se o ERP falhar, uma rotina reenvia depois.
import { pool } from "../config/db.js";
import { env } from "../config/env.js";

const MAX_ATTEMPTS = 20;
const TIMEOUT_MS = 8000;

export const erpEnabled = () => Boolean(env.erp.url && env.erp.token);

function payload(lead, resubmission) {
  return {
    externalId: lead.id,
    resubmission,
    name: lead.name,
    company: lead.company,
    whatsapp: lead.whatsapp,
    email: lead.email,
    segment: lead.segment,
    service: lead.service,
    message: lead.message,
    investment: lead.investment ?? null,
    wantsMaintenance: lead.wants_maintenance == null ? null : Boolean(lead.wants_maintenance),
    planSlug: lead.plan_slug ?? null,
    estimateMinCents: lead.estimate_min_cents ?? null,
    estimateMaxCents: lead.estimate_max_cents ?? null,
    estimateSummary: lead.estimate_summary ?? null,
    utmSource: lead.utm_source,
    utmMedium: lead.utm_medium,
    utmCampaign: lead.utm_campaign,
    landingPath: lead.landing_path,
    referrer: lead.referrer ? String(lead.referrer).slice(0, 255) : null,
    createdAt: lead.created_at ? new Date(lead.created_at).toISOString() : null,
  };
}

async function post(body) {
  const res = await fetch(env.erp.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.erp.token}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`ERP respondeu ${res.status}`);
  return res.json();
}

/** Envia um lead. Nunca lança erro: falhas ficam registradas para nova tentativa. */
export async function syncLead(id, { resubmission = false } = {}) {
  if (!erpEnabled()) return false;
  try {
    const [[lead]] = await pool.query("SELECT * FROM leads WHERE id = ?", [id]);
    if (!lead) return false;
    if (lead.erp_synced_at && !resubmission) return true;
    const r = await post(payload(lead, Boolean(lead.erp_synced_at) && resubmission));
    await pool.query(
      "UPDATE leads SET erp_lead_id = ?, erp_synced_at = UTC_TIMESTAMP(), erp_last_error = NULL, updated_at = updated_at WHERE id = ?",
      [r.id ?? null, id]
    );
    return true;
  } catch (err) {
    console.error(`[erp] lead ${id} não enviado:`, err.message);
    await pool
      .query("UPDATE leads SET erp_attempts = erp_attempts + 1, erp_last_error = ?, updated_at = updated_at WHERE id = ?", [
        String(err.message).slice(0, 255),
        id,
      ])
      .catch(() => {});
    return false;
  }
}

/** Envia os pendentes (inclusive leads antigos, na primeira execução). */
export async function syncPending(limit = 25) {
  if (!erpEnabled()) return 0;
  const [rows] = await pool.query(
    "SELECT id FROM leads WHERE erp_synced_at IS NULL AND erp_attempts < ? ORDER BY id LIMIT ?",
    [MAX_ATTEMPTS, limit]
  );
  let ok = 0;
  for (const { id } of rows) if (await syncLead(id)) ok++;
  return ok;
}

let timer = null;
export function startErpSync(intervalMs = 5 * 60 * 1000) {
  if (!erpEnabled() || timer) return;
  const run = () => syncPending().catch((e) => console.error("[erp] rotina falhou:", e.message));
  setTimeout(run, 15_000).unref();
  timer = setInterval(run, intervalMs);
  timer.unref();
}
