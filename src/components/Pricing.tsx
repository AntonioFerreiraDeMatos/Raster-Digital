import { useEffect, useState } from "react";
import { Check, ChevronDown, Clock, Server } from "lucide-react";
import { CATEGORY_LABEL, goToProposal, leadServiceFor, money, priceLabel, useContent, type Category, type Service } from "../lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const CATS: Category[] = ["presenca", "comercial", "profissional"];

function PlanCard({ s }: { s: Service }) {
  const [open, setOpen] = useState(false);
  return (
    <article id={`plano-${s.slug}`} className={`plan ${s.highlight ? "plan--hl" : ""}`}>
      {s.highlight && <span className="plan__badge">Mais procurado</span>}
      <h3>{s.name}</h3>
      {s.slug.startsWith("loja") && <p className="plan__247"><Clock size={14} /> Sua loja vendendo 24 horas por dia</p>}
      <p className="plan__desc">{s.description}</p>
      <p className="plan__price">{priceLabel(s)}</p>
      <p className="plan__renew">
        {s.hosting_cents != null ? <>Hospedagem grátis por 12 meses · depois {money(s.hosting_cents)}/ano</> : "Hospedagem sob orçamento"}
      </p>
      <button className="plan__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        O que está incluído <ChevronDown size={15} className={open ? "rot" : ""} />
      </button>
      {open && (
        <ul className="plan__scope">
          {s.scope.map((it) => <li key={it}><Check size={14} /> {it}</li>)}
        </ul>
      )}
      <button
        className={`btn ${s.highlight ? "btn--primary" : "btn--outline"} btn--sm btn--block`}
        onClick={() => goToProposal({ plan_slug: s.slug, plan_name: s.name, service: leadServiceFor(s.slug) })}
      >
        Tenho interesse neste plano
      </button>
    </article>
  );
}

export default function Pricing() {
  const { services, settings } = useContent();
  const [cat, setCat] = useState<Category>("presenca");

  // Link "Conhecer" das soluções (#plano-slug) abre a aba certa
  useEffect(() => {
    const onHash = () => {
      const slug = location.hash.startsWith("#plano-") ? location.hash.slice(7) : "";
      const s = services.find((x) => x.slug === slug);
      if (s) {
        setCat(s.category);
        requestAnimationFrame(() => document.getElementById(`plano-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
      }
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [services]);

  const list = services.filter((s) => s.category === cat);
  const { hosting: h } = settings;

  return (
    <section id="precos" className="section">
      <div className="shell">
        <SectionHead
          eyebrow="Planos e preços"
          title={<>Planos e soluções <span className="grad">para seu negócio</span></>}
          sub="Preço fechado de desenvolvimento. Valores iniciais de lançamento."
        />

        <div className="tabs" role="tablist" aria-label="Categorias de planos">
          {CATS.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} className={`tab ${cat === c ? "tab--on" : ""}`} onClick={() => setCat(c)}>
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <div className="plans" role="tabpanel">
          {list.map((s) => <PlanCard key={s.id} s={s} />)}
        </div>

        <div className="extras extras--single">
          <Reveal as="article" className="extra extra--hosting">
            <span className="icon-tile"><Server size={20} /></span>
            <h3>{h.headline}</h3>
            <ul>
              {h.included.map((i) => <li key={i}><Check size={14} /> {i}</li>)}
            </ul>
            {h.notIncluded.length > 0 && (
              <p className="extra__note">
                Não inclui: {h.notIncluded.map((i) => i.charAt(0).toLowerCase() + i.slice(1)).join("; ")}. {h.note}
              </p>
            )}
            {h.notIncluded.length === 0 && <p className="extra__note">{h.note}</p>}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
