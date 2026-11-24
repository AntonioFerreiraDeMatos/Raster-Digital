import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

type Props = { id?: string; eyebrow?: string; title: string; sub?: string; items: { title: string; text: string }[]; alt?: boolean };

/** Etapas numeradas (Como funciona). Usado na página inicial e nas páginas de serviço. */
export default function Steps({ id, eyebrow, title, sub, items, alt }: Props) {
  return (
    <section id={id} className={`section${alt ? " section--alt" : ""}`}>
      <div className="shell">
        <SectionHead center eyebrow={eyebrow ?? "Como funciona"} title={title} sub={sub} />
        <ol className="steps" style={{ ["--n" as string]: items.length }}>
          {items.map((s, i) => (
            <Reveal as="li" className="step" key={s.title} delay={i * 0.06}>
              <span className="step__num" aria-hidden="true">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
