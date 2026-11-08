import options from "../../src/shared/leadOptions.json" with { type: "json" };

export const SEGMENTS = new Set(options.segments.map((o) => o.value));
export const SERVICES = new Set(options.services.map((o) => o.value));
export const STATUSES = new Set(options.statuses.map((o) => o.value));
export const INVESTMENTS = new Set(options.investments.map((o) => o.value));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const cleanText = (v, max) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "");

/** Normaliza para DDD + número (10 ou 11 dígitos), sem o 55. */
export function normalizePhone(v) {
  let d = String(v ?? "").replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  return d;
}

export function isValidPhone(d) {
  if (!/^\d{10,11}$/.test(d)) return false;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  if (d.length === 11 && d[2] !== "9") return false; // celular começa com 9
  return !/^(\d)\1+$/.test(d);
}

/** Valida campos editáveis do lead. Retorna { data, errors }. */
export function validateLead(body, { partial = false } = {}) {
  const errors = {};
  const data = {};
  const has = (k) => body[k] !== undefined;

  if (!partial || has("name")) {
    data.name = clean(body.name, 120);
    if (data.name.length < 3 || !/\s/.test(data.name)) errors.name = "Informe seu nome completo.";
  }
  if (!partial || has("company")) {
    data.company = clean(body.company, 120);
    if (data.company.length < 2) errors.company = "Informe o nome da empresa.";
  }
  if (!partial || has("whatsapp")) {
    data.whatsapp = normalizePhone(body.whatsapp);
    if (!isValidPhone(data.whatsapp)) errors.whatsapp = "Informe um WhatsApp válido com DDD.";
  }
  if (!partial || has("email")) {
    data.email = clean(body.email, 190).toLowerCase();
    if (!EMAIL_RE.test(data.email)) errors.email = "Informe um e-mail válido.";
  }
  if (!partial || has("segment")) {
    data.segment = clean(body.segment, 40);
    if (!SEGMENTS.has(data.segment)) errors.segment = "Selecione o segmento.";
  }
  if (!partial || has("service")) {
    data.service = clean(body.service, 40);
    if (!SERVICES.has(data.service)) errors.service = "Selecione o que você precisa.";
  }
  if (!partial || has("message")) {
    data.message = cleanText(body.message, 2000);
  }
  // Campos comerciais opcionais
  if (has("investment") && body.investment !== "" && body.investment != null) {
    data.investment = clean(body.investment, 40);
    if (!INVESTMENTS.has(data.investment)) errors.investment = "Faixa de investimento inválida.";
  } else if (!partial) data.investment = null;
  if (has("wants_maintenance")) {
    data.wants_maintenance = body.wants_maintenance === true ? 1 : body.wants_maintenance === false ? 0 : null;
  } else if (!partial) data.wants_maintenance = null;
  if (has("plan_slug")) {
    data.plan_slug = /^[a-z0-9-]{1,60}$/.test(String(body.plan_slug)) ? body.plan_slug : null;
  } else if (!partial) data.plan_slug = null;
  return { data, errors };
}

/** Estimativa vinda do simulador (somente informativa; o valor final é definido na proposta). */
export function validateEstimate(e) {
  if (!e || typeof e !== "object") return null;
  const n = (v) => (Number.isInteger(v) && v >= 0 && v <= 100_000_000 ? v : null);
  const summary = cleanText(e.summary, 1500);
  const min = n(e.min_cents);
  if (!summary || min == null) return null;
  return { min_cents: min, max_cents: n(e.max_cents), summary };
}

export const clip = clean;
