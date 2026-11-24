import { useMemo, useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import options from "../shared/leadOptions.json";
import { CATEGORY_LABEL, goToProposal, installmentsOf, leadServiceFor, money, useContent, waLink, type Category } from "../lib/content";
import { estimate } from "../lib/estimate";
import { useMaintenancePlans } from "../lib/maintenance";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/** Estimativa de investimento com os preços do catálogo. Nunca é proposta: o valor final vem depois da conversa. */
export default function Simulator({ id = "simulador" }: { id?: string }) {
  const { services, settings } = useContent();
  const sim = settings.simulator;
  const [slug, setSlug] = useState(services[0]?.slug ?? "");
  const [segment, setSegment] = useState("");
  const [complexity, setComplexity] = useState(sim.complexity[0]?.id ?? "simples");
  const [addons, setAddons] = useState<string[]>([]);
  const maintPlans = useMaintenancePlans();
  const installments = installmentsOf(settings);
  const [maintName, setMaintName] = useState("");
  const maintPlan = maintPlans.find((p) => p.name === maintName);
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
    ? `a partir de ${money(result.min_cents)} (valor final após análise)`
    : `${money(result.min_cents)} a ${money(result.max_cents!)}`;
  const maintText = maintPlan ? `${maintPlan.name} (${money(maintPlan.price_cents)}/mês)` : "Sem manutenção";

  // Resumo gravado no lead (painel /admin e CRM do ERP)
  const summary = [
    `Projeto: ${service.name}`,
    segLabel && `Segmento: ${segLabel}`,
    `Complexidade: ${cxLabel}`,
    `Funcionalidades adicionais: ${addonLabels.length ? addonLabels.join(", ") : "nenhuma"}`,
    `Manutenção mensal: ${maintText}`,
    `Estimativa: ${valueText}`,
  ].filter(Boolean).join("\n");

  // Mensagem do WhatsApp: uma informação por linha, com as escolhas reais (codificada em waLink).
  const whatsappText = [
    "Olá! Gostaria de solicitar um orçamento com a Raster Digital.",
    `Tipo de projeto: ${service.name}`,
    `Segmento: ${segLabel ?? "Não informado"}`,
    `Complexidade: ${cxLabel}`,
    `Funcionalidades adicionais: ${addonLabels.length ? addonLabels.join(", ") : "Nenhuma"}`,
    `Plano de manutenção: ${maintText}`,
    `Investimento estimado: ${valueText}`,
    "Gostaria de conversar para entender melhor as possibilidades do projeto.",
  ].join("\n\n");

  return (
    <section id={id} className="section section--alt">
      <div className="shell">
        <SectionHead
          eyebrow="Simulador"
          title={<>Simule o investimento do <span className="grad">seu projeto</span></>}
          sub="Escolha as opções e veja uma estimativa na hora. É uma referência, não uma proposta: o valor final vem depois da conversa, sem compromisso."
        />
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
              <span>Segmento de atuação <i>(opcional)</i></span>
              <select value={segment} onChange={(e) => setSegment(e.target.value)}>
                <option value="">Selecione</option>
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
              <legend>Funcionalidades adicionais</legend>
              <div className="checks">
                {sim.addons.map((a) => (
                  <label key={a.id} className={`check ${addons.includes(a.id) ? "on" : ""}`}>
                    <input type="checkbox" checked={addons.includes(a.id)} onChange={() => toggle(a.id)} />
                    <span>{a.label}</span>{" "}
                    <small>{a.price_cents == null ? "sob análise" : `+ ${money(a.price_cents)}`}</small>
                  </label>
                ))}
              </div>
            </fieldset>
            {maintPlans.length > 0 && (
              <fieldset className="field">
                <legend>Plano de manutenção mensal <i>(opcional)</i></legend>
                <div className="seg-control sim__maint">
                  {[{ name: "", price_cents: 0 }, ...maintPlans].map((p) => (
                    <label key={p.name || "nenhum"} className={maintName === p.name ? "on" : ""}>
                      <input type="radio" name="maint" value={p.name} checked={maintName === p.name} onChange={() => setMaintName(p.name)} />
                      {p.name || "Sem manutenção"}{" "}
                      {p.price_cents > 0 && <small>{money(p.price_cents)}/mês</small>}
                    </label>
                  ))}
                </div>
                <a className="sim__maint-link" href="#manutencao">Comparar os planos de manutenção</a>
              </fieldset>
            )}
          </div>

          <aside className="sim__result" aria-live="polite" aria-label="Resultado da simulação">
            <Calculator size={22} />
            <p className="sim__label">Investimento estimado</p>
            <p className="sim__value">
              {result.needsAnalysis ? <>A partir de <b>{money(result.min_cents)}</b></> : <><b>{money(result.min_cents)}</b> a <b>{money(result.max_cents!)}</b></>}
            </p>
            {result.needsAnalysis && <p className="sim__warn">Inclui itens que precisam de análise ({result.reasons.join(", ")}). O valor final vem na proposta.</p>}
            <dl className="sim__summary">
              <div><dt>Serviço</dt><dd>{service.name}</dd></div>
              <div><dt>Funcionalidades</dt><dd>{addonLabels.length ? addonLabels.join(", ") : "Nenhuma adicional"}</dd></div>
              <div><dt>Manutenção</dt><dd>{maintPlan ? `${maintPlan.name} · ${money(result.monthly_cents)}/mês` : "Sem manutenção"}</dd></div>
            </dl>
            <ul className="sim__conditions">
              {installments > 0 && <li>Desenvolvimento em até {installments}x</li>}
              {service.hosting_cents != null && <li>12 meses de hospedagem grátis</li>}
              {maintPlan && <li>Manutenção sem fidelidade</li>}
            </ul>
            <a className="btn btn--whatsapp btn--block" href={waLink(settings.contact.whatsapp, whatsappText)} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp size={18} /> Enviar simulação pelo WhatsApp
            </a>
            <button
              className="btn btn--outline btn--block"
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
              Solicitar orçamento pelo formulário <ArrowRight size={17} />
            </button>
            <p className="sim__fine">Estimativa sem compromisso, calculada com os preços iniciais.</p>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
