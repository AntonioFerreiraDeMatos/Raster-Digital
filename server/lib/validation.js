import options from "../../src/shared/leadOptions.json" with { type: "json" };

export const SEGMENTS = new Set(options.segments.map((o) => o.value));
export const SERVICES = new Set(options.services.map((o) => o.value));
export const STATUSES = new Set(options.statuses.map((o) => o.value));

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
  return { data, errors };
}

export const clip = clean;
