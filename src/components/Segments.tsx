import { useContent } from "../lib/content";
import { iconFor } from "../lib/icons";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

type Props = { id?: string; eyebrow?: string; title: string; sub?: string };

/** Exemplos de aplicação por segmento (/admin → Conteúdo → Segmentos). Exemplos, nunca limites de atuação. */
export default function Segments({ id = "segmentos", eyebrow = "Exemplos", title, sub }: Props) {
  const { settings } = useContent();
  if (!settings.segments?.length) return null;
  return (
    <section id={id} className="section">
      <div className="shell">
        <SectionHead eyebrow={eyebrow} title={title} sub={sub} />
        <div className="segments">
          {settings.segments.map((s, i) => {
            const Icon = iconFor(s.icon);
            return (
              <Reveal as="article" className="segment" key={s.name} delay={(i % 3) * 0.05}>
                <div className="segment__top"><span className="icon-tile icon-tile--sm"><Icon size={18} /></span><h3>{s.name}</h3></div>
                <ul className="tags">{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
