import type { Service, Settings } from "./content";

export type EstimateInput = {
  service: Service;
  complexity: string;
  addons: string[];
  maintenance: boolean;
};

export type Estimate = {
  min_cents: number;
  /** null quando o projeto precisa de análise (mostra "a partir de") */
  max_cents: number | null;
  needsAnalysis: boolean;
  reasons: string[];
  monthly_cents: number;
  lines: { label: string; cents: number | null }[];
};

const ceil10 = (cents: number) => Math.ceil(cents / 1000) * 1000; // arredonda para cima, em R$ 10

/** Estimativa inicial a partir dos preços cadastrados. Nunca é um valor definitivo. */
export function estimate(input: EstimateInput, sim: Settings["simulator"], maintenanceCents: number): Estimate {
  const reasons: string[] = [];
  const lines: Estimate["lines"] = [];
  const { service } = input;

  if (service.price_cents == null) reasons.push("serviço sob orçamento");
  if (service.price_from) reasons.push("projeto personalizado");
  const base = service.price_cents ?? 0;
  lines.push({ label: service.name, cents: service.price_cents });

  const cx = sim.complexity.find((c) => c.id === input.complexity) ?? sim.complexity[0];
  let total = base;
  if (cx.factor == null) reasons.push(`complexidade ${cx.label.toLowerCase()}`);
  else if (cx.factor !== 1) {
    const extra = Math.round(base * (cx.factor - 1));
    lines.push({ label: `Complexidade ${cx.label.toLowerCase()}`, cents: extra });
    total += extra;
  }

  for (const id of input.addons) {
    const a = sim.addons.find((x) => x.id === id);
    if (!a) continue;
    lines.push({ label: a.label, cents: a.price_cents });
    if (a.price_cents == null) reasons.push(a.label.toLowerCase());
    else total += a.price_cents;
  }

  const needsAnalysis = reasons.length > 0;
  // O mínimo é exatamente a soma dos preços cadastrados (nunca acima do preço anunciado)
  return {
    min_cents: total,
    max_cents: needsAnalysis ? null : ceil10(total * 1.2),
    needsAnalysis,
    reasons,
    monthly_cents: input.maintenance ? maintenanceCents : 0,
    lines,
  };
}
