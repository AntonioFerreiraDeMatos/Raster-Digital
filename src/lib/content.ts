import { createContext, useContext, useEffect, useState } from "react";

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
  /** Selo próprio (ex.: "Comece por aqui"); sem selo, o destaque mostra "Mais procurado". */
  badge?: string | null;
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
  /** eyebrow = H1 da página (palavra-chave local); intro = apresentação do fundador na primeira dobra. */
  hero: { eyebrow: string; title: string; highlight: string; subtitle: string; intro?: string };
  contact: { whatsapp: string; whatsappDisplay: string; instagram: string; linkedin: string; github: string; city: string };
  solutions: { name: string; text: string; service: string | null; icon: string }[];
  maintenance: { price_cents: number; items: string[]; note: string };
  maintenancePlans: { eyebrow: string; title: string; highlight: string; subtitle: string; note: string; plans: MaintenancePlan[] };
  hosting: { headline: string; included: string[]; notIncluded: string[]; note: string };
  /** Parcelamento exibido nos preços (0 ou 1 = não mostrar). */
  payment?: { installments: number };
  /** text aceita parágrafos separados por linha em branco; course/school/graduation formam o selo de formação do topo. */
  founder: { name: string; role: string; course?: string; school?: string; graduation?: string; text: string; highlights: string[] };
  segments: { name: string; icon: string; items: string[] }[];
  simulator: {
    complexity: { id: string; label: string; factor: number | null; min_cents?: number | null }[];
    addons: { id: string; label: string; price_cents: number | null }[];
  };
};

export type Content = { services: Service[]; projects: Project[]; brands: Brand[]; settings: Settings; page?: PageDef };

/* ---------- Páginas internas (conteúdo em src/data/pages/*.json, montado pelo servidor) ---------- */
export type PageCard = { title: string; text: string; icon?: string; bullets?: string[] };
/** Card de oferta: um serviço do catálogo (preço do banco) ou uma modalidade ainda sem preço publicado. */
export type Offer = { service: string } | { name: string; description: string; bullets?: string[] };
type Head = { id?: string; eyebrow?: string; title: string; sub?: string };
export type PageSection =
  | (Head & { type: "text"; paragraphs: string[] })
  | (Head & { type: "cards"; items: PageCard[] })
  | (Head & { type: "checklist"; items: string[] })
  | (Head & { type: "steps"; items: { title: string; text: string }[] })
  | (Head & { type: "offers"; items: Offer[]; note?: string })
  | (Head & { type: "cases"; projects: string[] })
  | (Head & { type: "segments" })
  | { type: "pricing" | "hosting" | "maintenance" | "simulator" | "projects" | "brands" | "case"; id?: string };

/** Case de projeto (src/data/cases.json): só o que está documentado; campos vazios não aparecem. */
export type CaseInfo = {
  location?: string | null;
  need?: string | null;
  solution?: string | null;
  goal?: string | null;
  features?: string[];
  testimonial?: { text: string; author: string; role?: string } | null;
};

export type PageDef = {
  path: string;
  kind: "service" | "local" | "precos" | "projetos" | "case";
  title: string;
  description: string;
  breadcrumb: { name: string; path?: string }[];
  hero: { eyebrow: string; h1: string; lead: string; cta?: string };
  sections: PageSection[];
  faq?: { q: string; a: string }[];
  related?: { path: string; label: string; text?: string }[];
  cta?: { title: string; text: string };
  project?: string;
  case?: CaseInfo;
  cases?: Record<string, CaseInfo>;
};

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

// Preços: mesma formatação no site e no servidor (src/shared/format.js).
export { money, priceLabel, installmentsOf, installmentLabel, startingPrice } from "../shared/format.js";

/**
 * Separa o escopo cadastrado em itens incluídos e observações. Marcadores digitados no painel ("•", "-")
 * são removidos (o card já tem o próprio ícone) e, a partir do primeiro "Não inclui…", tudo vira observação.
 */
export function splitScope(scope: string[]) {
  const clean = scope.map((s) => s.replace(/^[\s•·*–—-]+/, "").trim()).filter(Boolean);
  const i = clean.findIndex((s) => /^não inclui/i.test(s));
  return i < 0 ? { items: clean, notes: [] as string[] } : { items: clean.slice(0, i), notes: clean.slice(i) };
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

/** "amandacosmeticos.com.br" a partir do endereço completo. */
export const hostOf = (url: string | null) => url?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") ?? "";

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

/** Abre o formulário já preenchido (plano, simulação...) e rola até ele. Toda página tem o formulário (#contato). */
export function goToProposal(prefill?: Prefill) {
  if (prefill) window.dispatchEvent(new CustomEvent<Prefill>("raster:prefill", { detail: prefill }));
  const form = document.getElementById("contato");
  if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
  else location.href = "/#contato";
}

/** Conteúdo embutido pelo servidor ou, em desenvolvimento, buscado na API. */
export function useSiteContent(apiUrl: string) {
  const [content, setContent] = useState<Content | null>(readEmbedded);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (content) return;
    let alive = true;
    fetch(apiUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((c: Content) => alive && setContent(c))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [content, apiUrl]);
  return { content, failed };
}
