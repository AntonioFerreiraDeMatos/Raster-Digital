import { ArrowRight, Check } from "lucide-react";
import home from "../data/home.json";
import { startingPrice, useContent } from "../lib/content";
import { pageIcon } from "../lib/pageIcons";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/** Os três pilares da Raster Digital. O "a partir de" é o menor preço ativo no catálogo (/admin → Serviços). */
export default function Pillars() {
  const { services } = useContent();
  const p = home.pillars;
  return (
    <section id="solucoes" className="section">
      <div className="shell">
        <SectionHead center eyebrow={p.eyebrow} title={p.title} sub={p.sub} />
        <div className="pillars">
          {p.items.map((item, i) => {
            const Icon = pageIcon(item.icon);
            return (
              <Reveal as="article" className="sol pillar" key={item.id} delay={i * 0.06}>
                <span className="icon-tile"><Icon size={20} /></span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ul className="pillar__list">
                  {item.items.map((x) => <li key={x}><Check size={14} aria-hidden="true" /> {x}</li>)}
                </ul>
                <div className="pillar__foot">
                  <span className="sol__price">{startingPrice(services, item.priceFrom) ?? "Sob orçamento"}</span>
                  <a className="btn btn--outline btn--sm" href={item.link.path}>
                    {item.link.label} <ArrowRight size={15} />
                  </a>
                  {item.more.length > 0 && (
                    <p className="pillar__more">
                      {item.more.map((m, j) => (
                        <span key={m.path}>{j > 0 && " · "}<a href={m.path}>{m.label}</a></span>
                      ))}
                    </p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
        <p className="center-cta"><a className="link" href="/precos">Ver todos os preços e simular um orçamento <ArrowRight size={14} /></a></p>
      </div>
    </section>
  );
}
