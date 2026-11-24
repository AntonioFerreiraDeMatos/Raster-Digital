import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/** Dúvidas frequentes de cada página (o mesmo conteúdo vai para o FAQPage dos dados estruturados). */
export default function Faq({ items, title = "Dúvidas frequentes" }: { items: { q: string; a: string }[]; title?: string }) {
  if (!items.length) return null;
  return (
    <section id="duvidas" className="section">
      <div className="shell">
        <SectionHead center eyebrow="Dúvidas" title={title} />
        <Reveal className="faq">
          {items.map((f) => (
            <details key={f.q} className="faq__item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
