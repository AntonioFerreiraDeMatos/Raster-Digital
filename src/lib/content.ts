import { createContext, useContext } from "react";

export type Category = "presenca" | "comercial" | "profissional";

export type Service = {
  id: number;
  slug: string;
  category: Category;
  name: string;
  description: string;
  price_cents: number | null;
  price_from: boolean;
  hosting_cents: number | null;
  scope: string[];
  highlight: boolean;
};

export type Project = {
  id: number;
  slug: string;
  client: string;
  title: string;
  segment: string;
  summary: string;
  url: string | null;
  features: string[];
  theme: "padrao" | "beleza" | "industrial";
  logo_url: string | null;
  cover_url: string | null;
  mobile_url: string | null;
  gallery: string[];
  video_url: string | null;
};

export type Brand = { id: number; name: string; logo_url: string; url: string | null; relation: string };

export type MaintenanceTier = "essencial" | "premium" | "platinum";
export type MaintenancePlan = {
  tier: MaintenanceTier; number: string; name: string; badge: string; tagline: string;
  price_cents: number; requests: string; minutes: string; items: string[];
};

export type Settings = {
  hero: { eyebrow: string; title: string; highlight: string; subtitle: string };
  contact: { whatsapp: string; whatsappDisplay: string; instagram: string; linkedin: string; github: string; city: string };
  solutions: { name: string; text: string; service: string | null; icon: string }[];
  maintenance: { price_cents: number; items: string[]; note: string };
  maintenancePlans: { eyebrow: string; title: string; highlight: string; subtitle: string; note: string; plans: MaintenancePlan[] };
  hosting: { headline: string; included: string[]; notIncluded: string[]; note: string };
  founder: { name: string; role: string; text: string; highlights: string[] };
  segments: { name: string; icon: string; items: string[] }[];
  simulator: {
    complexity: { id: string; label: string; factor: number | null; min_cents?: number | null }[];
    addons: { id: string; label: string; price_cents: number | null }[];
  };
};

export type Content = { services: Service[]; projects: Project[]; brands: Brand[]; settings: Settings };

export const CATEGORY_LABEL: Record<Category, string> = {
  presenca: "Sites e presença digital",
  comercial: "Lojas e sistemas comerciais",
  profissional: "Sistemas profissionais",
};

/** Conteúdo embutido pelo servidor na página (sem requisição extra). */
export function readEmbedded(): Content | null {
  try {
    const el = document.getElementById("app-data");
    return el?.textContent ? (JSON.parse(el.textContent) as Content) : null;
  } catch {
    return null;
  }
}

export const ContentContext = createContext<Content | null>(null);

export function useContent(): Content {
  const c = useContext(ContentContext);
  if (!c) throw new Error("Conteúdo indisponível");
  return c;
}

const brlInt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brlDec = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
/** R$ 249 para valores inteiros; R$ 59,90 quando há centavos. */
export const money = (cents: number) => (cents % 100 === 0 ? brlInt : brlDec).format(cents / 100);

export function priceLabel(s: Pick<Service, "price_cents" | "price_from">) {
  if (s.price_cents == null) return "Sob orçamento";
  return s.price_from ? `A partir de ${money(s.price_cents)}` : money(s.price_cents);
}

/** Converte o serviço do catálogo no "tipo de solução" do formulário. */
export function leadServiceFor(slug: string | null | undefined): string {
  const map: Record<string, string> = {
    "landing-page": "landing",
    "site-institucional": "site",
    "cardapio-digital": "cardapio",
    "catalogo-digital": "cardapio",
    "loja-virtual": "loja_virtual",
    agendamento: "agendamento",
    "gestao-barbearia": "agendamento",
    dashboard: "dashboard",
  };
  if (!slug) return "orientacao";
  return map[slug] ?? "sistema";
}

export function waLink(phone: string, text?: string) {
  const msg = text ?? "Olá! Vim pelo site da Raster Digital e gostaria de um orçamento.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export type Prefill = {
  service?: string;
  segment?: string;
  plan_slug?: string;
  plan_name?: string;
  wants_maintenance?: boolean;
  estimate?: { min_cents: number; max_cents: number | null; summary: string };
};

/** Abre o formulário já preenchido (plano, simulação...) e rola até ele. */
export function goToProposal(prefill?: Prefill) {
  if (prefill) window.dispatchEvent(new CustomEvent<Prefill>("raster:prefill", { detail: prefill }));
  document.getElementById("contato")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
