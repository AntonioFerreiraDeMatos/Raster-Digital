import { useContent } from "../lib/content";
import { iconFor } from "../lib/icons";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Segments() {
  const { settings } = useContent();
  return (
    <section id="segmentos" className="section">
      <div className="shell">
        <SectionHead
          eyebrow="Por segmento"
          title={<>Soluções para <span className="grad">cada tipo de negócio</span></>}
          sub="Possibilidades que desenvolvemos sob medida, com controle de acesso e cuidado com os dados (LGPD)."
        />
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
