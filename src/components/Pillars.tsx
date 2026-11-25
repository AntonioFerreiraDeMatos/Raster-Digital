import { ArrowRight, Check } from "lucide-react";
import home from "../data/home.json";
import { pageIcon } from "../lib/pageIcons";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/**
 * As três frentes da Raster Digital: presença digital, gestão empresarial e tecnologia sob medida.
 * Sem preços aqui: o investimento depende do projeto e fica em /precos (tabela e simulador).
 * Textos em src/data/home.json; "itemLinks" liga um item da lista à página interna dele.
 */
export default function Pillars() {
  const p = home.pillars;
  return (
    <section id="solucoes" className="section">
      <div className="shell">
        <SectionHead center eyebrow={p.eyebrow} title={p.title} sub={p.sub} />
        <div className="pillars">
          {p.items.map((item, i) => {
            const Icon = pageIcon(item.icon);
            const links = item.itemLinks as Record<string, string | undefined>;
            return (
              <Reveal as="article" className="sol pillar" key={item.id} delay={i * 0.06}>
                <div className="pillar__head">
                  <span className="icon-tile"><Icon size={20} /></span>
                  <span className="pillar__label">{item.label}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ul className="pillar__list">
                  {item.items.map((x) => (
                    <li key={x}>
                      <Check size={14} aria-hidden="true" />
                      {links[x] ? <a href={links[x]}>{x}</a> : <span>{x}</span>}
                    </li>
                  ))}
                </ul>
                <div className="pillar__foot">
                  <a className="btn btn--ghost btn--block pillar__cta" href={item.link.path}>
                    {item.link.label} <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="center-cta cta-close pillars__close">
          <p>{p.note}</p>
          <a className="link" href="/precos">Ver todos os preços e simular um orçamento <ArrowRight size={14} /></a>
        </div>
      </div>
    </section>
  );
}
