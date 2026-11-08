import options from "../shared/leadOptions.json";

export type Status = "novo" | "negociacao" | "proposta_enviada" | "aguardando_retorno" | "convertido" | "perdido";

export type LeadSummary = {
  id: number;
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  segment: string;
  service: string;
  status: Status;
  source: string;
  submissions: number;
  investment: string | null;
  plan_slug: string | null;
  estimate_min_cents: number | null;
  estimate_max_cents: number | null;
  created_at: string;
  updated_at: string;
};

export type Lead = LeadSummary & {
  message: string | null;
  wants_maintenance: 0 | 1 | null;
  estimate_summary: string | null;
  consent_at: string;
  privacy_version: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_path: string | null;
  referrer: string | null;
};

export type LeadEvent = {
  id: number;
  type: "criado" | "reenvio" | "status" | "observacao" | "edicao";
  from_status: string | null;
  to_status: string | null;
  body: string | null;
  created_at: string;
  author: string | null;
};

export type User = { id: number; name: string; role: "admin" | "comercial" };

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Requested-With": "raster-admin", ...init.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Erro inesperado.", res.status, data.fields);
  return data as T;
}

const map = (list: { value: string; label: string }[]) => Object.fromEntries(list.map((o) => [o.value, o.label]));
export const SEGMENT_LABEL = map(options.segments);
export const SERVICE_LABEL = map(options.services);
export const STATUS_LABEL = map(options.statuses) as Record<Status, string>;
export const OPTIONS = options;

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPhone(d: string) {
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

export function whatsappTo(lead: Pick<Lead, "whatsapp" | "name">) {
  const first = lead.name.split(" ")[0];
  const text = `Olá, ${first}! Aqui é da Raster Digital. Recebemos sua solicitação pelo site e gostaria de entender melhor o seu negócio.`;
  return `https://wa.me/55${lead.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const INVESTMENT_LABEL = map(options.investments);

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
export const money = (cents: number) => brl.format(cents / 100);

export function estimateText(l: Pick<LeadSummary, "estimate_min_cents" | "estimate_max_cents">) {
  if (l.estimate_min_cents == null) return null;
  return l.estimate_max_cents ? `${money(l.estimate_min_cents)} a ${money(l.estimate_max_cents)}` : `A partir de ${money(l.estimate_min_cents)}`;
}

/** Reduz e comprime a imagem no navegador (WEBP) antes de enviar ao servidor. */
export async function uploadImage(file: File, maxSide = 1600): Promise<string> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new ApiError("Use uma imagem PNG, JPG ou WEBP.", 422);
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let dataUrl = canvas.toDataURL("image/webp", 0.85);
  if (!dataUrl.startsWith("data:image/webp")) dataUrl = canvas.toDataURL("image/png"); // navegadores sem WEBP
  const r = await api<{ url: string }>("/images", { method: "POST", body: JSON.stringify({ dataUrl }) });
  return r.url;
}
