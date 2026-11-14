import { useMemo, useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import options from "../shared/leadOptions.json";
import { CATEGORY_LABEL, goToProposal, leadServiceFor, money, useContent, waLink, type Category } from "../lib/content";
import { estimate } from "../lib/estimate";
import { MAINTENANCE_PLANS } from "./Maintenance";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Simulator() {
  const { services, settings } = useContent();
  const sim = settings.simulator;
  const [slug, setSlug] = useState(services[0]?.slug ?? "");
  const [segment, setSegment] = useState("");
  const [complexity, setComplexity] = useState(sim.complexity[0]?.id ?? "simples");
  const [addons, setAddons] = useState<string[]>([]);
  const [maintTier, setMaintTier] = useState("");
  const maintPlan = MAINTENANCE_PLANS.find((p) => p.tier === maintTier);
  const maintenance = !!maintPlan;

  const service = services.find((s) => s.slug === slug) ?? services[0];
  const result = useMemo(
    () => (service ? estimate({ service, complexity, addons, maintenance }, sim, maintPlan?.price_cents ?? 0) : null),
    [service, complexity, addons, maintenance, sim, maintPlan]
  );
  if (!service || !result) return null;

  const toggle = (id: string) => setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const segLabel = options.segments.find((o) => o.value === segment)?.label;
  const cxLabel = sim.complexity.find((c) => c.id === complexity)?.label ?? "";
  const addonLabels = sim.addons.filter((a) => addons.includes(a.id)).map((a) => a.label);
  const valueText = result.needsAnalysis
    ? `A partir de ${money(result.min_cents)} (valor final após análise)`
    : `${money(result.min_cents)} a ${money(result.max_cents!)}`;

  const summary = [
    `Projeto: ${service.name}`,
    segLabel && `Segmento: ${segLabel}`,
    `Complexidade: ${cxLabel}`,
    `Recursos: ${addonLabels.length ? addonLabels.join(", ") : "nenhum adicional"}`,
    `Manutenção mensal: ${maintPlan ? `Plano ${maintPlan.name} (${money(maintPlan.price_cents)}/mês)` : "não"}`,
    `Estimativa: ${valueText}`,
  ].filter(Boolean).join("\n");

  const whatsappText = `Olá! Fiz uma simulação no site da Raster Digital:\n\n${summary}\n\nGostaria de receber um orçamento.`;

  return (
    <section id="simulador" className="section section--alt">
      <div className="shell">
        <SectionHead eyebrow="Simulador" title={<>Simule seu <span className="grad">orçamento</span></>} sub="Uma estimativa inicial em segundos. O valor final vem na proposta." />
        <Reveal className="sim">
          <div className="sim__form">
            <label className="field">
              <span>Tipo de projeto</span>
              <select value={slug} onChange={(e) => setSlug(e.target.value)}>
                {(["presenca", "comercial", "profissional"] as Category[]).map((c) => (
                  <optgroup key={c} label={CATEGORY_LABEL[c]}>
                    {services.filter((s) => s.category === c).map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Segmento do negócio</span>
              <select value={segment} onChange={(e) => setSegment(e.target.value)}>
                <option value="">Selecione (opcional)</option>
                {options.segments.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <fieldset className="field">
              <legend>Complexidade</legend>
              <div className="seg-control">
                {sim.complexity.map((c) => (
                  <label key={c.id} className={complexity === c.id ? "on" : ""}>
                    <input type="radio" name="cx" value={c.id} checked={complexity === c.id} onChange={() => setComplexity(c.id)} />
                    {c.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="field">
              <legend>Funcionalidades e integrações</legend>
              <div className="checks">
                {sim.addons.map((a) => (
                  <label key={a.id} className={`check ${addons.includes(a.id) ? "on" : ""}`}>
                    <input type="checkbox" checked={addons.includes(a.id)} onChange={() => toggle(a.id)} />
                    <span>{a.label}</span>
                    <small>{a.price_cents == null ? "sob análise" : `+ ${money(a.price_cents)}`}</small>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="field">
              <legend>Plano de manutenção mensal (opcional)</legend>
              <div className="seg-control sim__maint">
                {[{ tier: "", name: "Sem manutenção", price_cents: 0 }, ...MAINTENANCE_PLANS].map((p) => (
                  <label key={p.tier || "nenhum"} className={maintTier === p.tier ? "on" : ""}>
                    <input type="radio" name="maint" value={p.tier} checked={maintTier === p.tier} onChange={() => setMaintTier(p.tier)} />
                    {p.name}
                    {p.price_cents > 0 && <small>{money(p.price_cents)}/mês</small>}
                  </label>
                ))}
              </div>
              <a className="sim__maint-link" href="#manutencao">Comparar os planos de manutenção</a>
            </fieldset>
          </div>

          <aside className="sim__result" aria-live="polite">
            <Calculator size={22} />
            <p className="sim__label">Estimativa inicial</p>
            <p className="sim__value">
              {result.needsAnalysis ? <>A partir de <b>{money(result.min_cents)}</b></> : <><b>{money(result.min_cents)}</b> a <b>{money(result.max_cents!)}</b></>}
            </p>
            {result.needsAnalysis && <p className="sim__warn">Inclui itens que precisam de análise ({result.reasons.join(", ")}). O valor final vem na proposta.</p>}
            {maintPlan && <p className="sim__monthly">+ {money(result.monthly_cents)}/mês · Manutenção {maintPlan.name}</p>}
            <p className="sim__hosting">12 meses de hospedagem grátis</p>
            <button
              className="btn btn--primary btn--block"
              onClick={() =>
                goToProposal({
                  plan_slug: service.slug,
                  plan_name: service.name,
                  service: leadServiceFor(service.slug),
                  segment: segment || undefined,
                  wants_maintenance: maintenance,
                  estimate: { min_cents: result.min_cents, max_cents: result.max_cents, summary },
                })
              }
            >
              Receber minha proposta <ArrowRight size={17} />
            </button>
            <a className="btn btn--whatsapp btn--block" href={waLink(settings.contact.whatsapp, whatsappText)} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp size={18} /> Solicitar orçamento pelo WhatsApp
            </a>
            <p className="sim__fine">Estimativa sem compromisso, baseada nos preços iniciais.</p>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
