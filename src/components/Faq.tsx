import faq from "../data/faq.json";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Faq() {
  return (
    <section id="duvidas" className="section">
      <div className="shell">
        <SectionHead eyebrow="Dúvidas frequentes" title={<>Criação de sites em <span className="grad">Caucaia, Fortaleza e região</span></>} />
        <Reveal className="faq">
          {faq.map((f) => (
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
