import { ArrowRight } from "lucide-react";
import { projects } from "../data/projects";
import { goToProposal } from "../config/site";
import Reveal from "./Reveal";

// As marcas vêm dos projetos reais cadastrados em src/data/projects.ts.
// A natureza da relação é sempre "Cliente", com o tipo de projeto entregue.
export default function Brands() {
  return (
    <section className="section brands-section" aria-labelledby="brands-title">
      <div className="shell">
        <Reveal className="section__head section__head--center">
          <p className="eyebrow"><span className="eyebrow__dot" /> Marcas que confiam na Raster</p>
          <h2 id="brands-title">Construindo o futuro digital de <span className="grad">negócios reais.</span></h2>
        </Reveal>
        <div className="brands">
          {projects.map((p, i) => (
            <Reveal as="article" className="brand" key={p.slug} delay={i * 0.06}>
              <span className="brand__mark" aria-hidden="true">{p.client.charAt(0)}</span>
              <div>
                <b>{p.client}</b>
                <small>Cliente · {p.title}</small>
              </div>
            </Reveal>
          ))}
          <Reveal as="article" className="brand brand--next" delay={projects.length * 0.06}>
            <button onClick={() => goToProposal()}>
              <span className="brand__mark" aria-hidden="true">+</span>
              <div>
                <b>Sua empresa aqui</b>
                <small>Vamos construir juntos <ArrowRight size={12} /></small>
              </div>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
