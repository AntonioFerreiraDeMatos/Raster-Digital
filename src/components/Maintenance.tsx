import { Check, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { money, useContent, waLink, type MaintenancePlan } from "../lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/** Planos de manutenção mensal, editáveis no /admin (Conteúdo → Planos de manutenção). */
export function useMaintenancePlans(): MaintenancePlan[] {
  return useContent().settings.maintenancePlans?.plans ?? [];
}

export function maintenanceMessage(p: Pick<MaintenancePlan, "name" | "price_cents">) {
  return `Olá! Vim pelo site da Raster Digital e quero contratar o Plano de Manutenção ${p.name} (${money(p.price_cents)}/mês). Podemos conversar?`;
}

const TIER_ICON = { essencial: ShieldCheck, premium: Sparkles, platinum: Crown } as const;

export default function Maintenance() {
  const { settings } = useContent();
  const cfg = settings.maintenancePlans;
  const plans = cfg?.plans ?? [];
  if (!cfg || plans.length === 0) return null;
  const phone = settings.contact.whatsapp;

  return (
    <section id="manutencao" className="section section--alt">
      <div className="shell">
        <SectionHead
          center
          eyebrow={cfg.eyebrow}
          title={<>{cfg.title} {cfg.highlight && <span className="grad">{cfg.highlight}</span>}</>}
          sub={cfg.subtitle}
        />

        <div className="mplans" style={{ ["--cols" as string]: plans.length }}>
          {plans.map((p, i) => {
            const tier = TIER_ICON[p.tier] ? p.tier : "essencial";
            const Icon = TIER_ICON[tier];
            const hl = tier === "premium";
            return (
              <Reveal as="article" key={`${p.name}-${i}`} delay={i * 0.06} className={`plan mplan mplan--${tier}`}>
                {p.badge && <span className={`plan__badge mplan__badge ${tier === "platinum" ? "mplan__badge--plat" : ""}`}>{p.badge}</span>}
                {p.number && <p className="mplan__num">Plano {p.number}</p>}
                <h3 className="mplan__name"><span className="icon-tile icon-tile--sm"><Icon size={18} /></span>{p.name}</h3>
                {p.tagline && <p className="plan__desc">{p.tagline}</p>}
                <p className="plan__price mplan__price">
                  {money(p.price_cents)}<span>/mês</span>
                </p>
                {(p.requests || p.minutes) && (
                  <p className="mplan__limits">
                    {p.requests && <span>{p.requests}</span>}
                    {p.minutes && <span>{p.minutes}</span>}
                  </p>
                )}
                <ul className="plan__scope mplan__scope">
                  {p.items.map((it) => <li key={it}><Check size={14} /> {it}</li>)}
                </ul>
                <a
                  className={`btn ${hl ? "btn--primary" : "btn--outline"} btn--block mplan__cta`}
                  href={waLink(phone, maintenanceMessage(p))}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-plan={tier}
                >
                  <FaWhatsapp size={17} /> Contratar {p.name}
                </a>
              </Reveal>
            );
          })}
        </div>

        {cfg.note && <p className="mplans__note">{cfg.note}</p>}
      </div>
    </section>
  );
}
