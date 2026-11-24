import { useState } from "react";
import { Check, ChevronDown, Clock, Server } from "lucide-react";
import { CATEGORY_LABEL, goToProposal, installmentLabel, installmentsOf, leadServiceFor, money, priceLabel, splitScope, useContent, type Category, type Service } from "../lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const CATS: Category[] = ["presenca", "comercial", "profissional"];

/** Card de um serviço do catálogo (/admin → Serviços): preço, parcelas, hospedagem e escopo. */
export function PlanCard({ s }: { s: Service }) {
  const { settings } = useContent();
  // Link direto para o card (#plano-slug) já abre o escopo
  const [open, setOpen] = useState(() => location.hash === `#plano-${s.slug}`);
  const badge = s.badge || (s.highlight ? "Mais procurado" : "");
  const inst = installmentLabel(s.price_cents, installmentsOf(settings));
  const scope = splitScope(s.scope);

  return (
    <article id={`plano-${s.slug}`} className={`plan ${s.highlight ? "plan--hl" : ""}`}>
      {badge && <span className="plan__badge">{badge}</span>}
      <h3>{s.name}</h3>
      {s.slug.startsWith("loja") && <p className="plan__247"><Clock size={14} /> Sua loja vendendo 24 horas por dia</p>}
      <p className="plan__desc">{s.description}</p>
      <p className="plan__price">{priceLabel(s)}</p>
      {inst && <p className="plan__inst">{inst}</p>}
      {s.hosting_cents != null && (
        <p className="plan__renew">Hospedagem grátis por 12 meses · depois {money(s.hosting_cents)}/ano</p>
      )}
      <button className="plan__toggle" aria-expanded={open} aria-controls={`escopo-${s.slug}`} onClick={() => setOpen((v) => !v)}>
        O que está incluído <ChevronDown size={15} className={open ? "rot" : ""} />
      </button>
      {open && (
        <div id={`escopo-${s.slug}`}>
          <ul className="plan__scope">
            {scope.items.map((it) => <li key={it}><Check size={14} /> {it}</li>)}
          </ul>
          {scope.notes.map((n) => <p className="plan__note" key={n}>{n}</p>)}
        </div>
      )}
      <button
        className={`btn ${s.highlight ? "btn--primary" : "btn--outline"} btn--sm btn--block`}
        onClick={() => goToProposal({ plan_slug: s.slug, plan_name: s.name, service: leadServiceFor(s.slug) })}
      >
        Quero este plano
      </button>
    </article>
  );
}

/** Hospedagem: o que inclui e o que não inclui (/admin → Conteúdo → Hospedagem). */
export function Hosting() {
  const { hosting: h } = useContent().settings;
  return (
    <section className="section section--tight">
      <div className="shell">
        <Reveal as="article" className="extra extra--hosting">
          <span className="icon-tile"><Server size={20} /></span>
          <h2 className="extra__title">{h.headline}</h2>
          <ul>
            {h.included.map((i) => <li key={i}><Check size={14} /> {i}</li>)}
          </ul>
          <p className="extra__note">
            {h.notIncluded.length > 0 && <>Não inclui: {h.notIncluded.map((i) => i.charAt(0).toLowerCase() + i.slice(1)).join("; ")}. </>}
            {h.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** Todos os serviços do catálogo, agrupados por categoria (página /precos). */
export default function Pricing({ id = "precos" }: { id?: string }) {
  const { services } = useContent();
  return (
    <section id={id} className="section">
      <div className="shell">
        <SectionHead
          eyebrow="Desenvolvimento"
          title="Valores iniciais de cada solução"
          sub="Valores de desenvolvimento, sem mensalidade obrigatória. Abra “O que está incluído” para ver o escopo de cada plano."
        />
        {CATS.map((c) => {
          const list = services.filter((s) => s.category === c);
          if (!list.length) return null;
          return (
            <div className="price-group" key={c}>
              <h3 className="price-group__title">{CATEGORY_LABEL[c]}</h3>
              <div className="plans">
                {list.map((s) => <PlanCard key={s.id} s={s} />)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
