import options from "../shared/leadOptions.json";

export type Status = "novo" | "primeiro_contato" | "negociacao" | "proposta_enviada" | "convertido" | "perdido";

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
  created_at: string;
  updated_at: string;
};

export type Lead = LeadSummary & {
  message: string | null;
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
