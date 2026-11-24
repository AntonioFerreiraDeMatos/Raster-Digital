import home from "../data/home.json";
import { pageIcon } from "../lib/pageIcons";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/** Diferenciais (um lugar só para atendimento, hospedagem, preço, fidelidade e análise inicial). */
export default function Differentials() {
  const d = home.differentials;
  return (
    <section id="diferenciais" className="section section--alt">
      <div className="shell">
        <SectionHead center eyebrow={d.eyebrow} title={d.title} />
        <ul className="diffs">
          {d.items.map((item, i) => {
            const Icon = pageIcon(item.icon);
            return (
              <Reveal as="li" className="diff" key={item.title} delay={(i % 3) * 0.05}>
                <span className="icon-tile icon-tile--sm"><Icon size={18} /></span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
