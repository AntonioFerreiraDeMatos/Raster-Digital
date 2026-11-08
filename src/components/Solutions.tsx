import { ArrowRight, Check } from "lucide-react";
import { solutions } from "../data/solutions";
import { goToProposal } from "../config/site";
import Reveal from "./Reveal";

export default function Solutions() {
  return (
    <section id="solucoes" className="section">
      <div className="shell">
        <Reveal className="section__head">
          <p className="eyebrow"><span className="eyebrow__dot" /> Soluções para empresas</p>
          <h2>Cada negócio tem um desafio. <span className="grad">A gente resolve o seu.</span></h2>
          <p className="section__sub">
            Ferramentas que facilitam o atendimento, organizam seus pedidos e ajudam seus clientes a encontrar e
            contratar seus serviços.
          </p>
        </Reveal>

        <div className="solutions">
          {solutions.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal as="article" className="solution" key={s.id} delay={(i % 3) * 0.06}>
                <div className="solution__top">
                  <span className="icon-tile"><Icon size={22} /></span>
                  <h3>{s.title}</h3>
                </div>
                <dl className="solution__body">
                  <div>
                    <dt>O desafio</dt>
                    <dd>{s.problem}</dd>
                  </div>
                  <div>
                    <dt>A solução</dt>
                    <dd>{s.solution}</dd>
                  </div>
                  <div className="solution__benefit">
                    <dt>Na prática</dt>
                    <dd>{s.benefit}</dd>
                  </div>
                </dl>
                <ul className="chips">
                  {s.items.map((it) => (
                    <li key={it}><Check size={13} /> {it}</li>
                  ))}
                </ul>
                <button
                  className="btn btn--outline solution__cta"
                  onClick={() => goToProposal({ segment: s.segment, service: s.service })}
                >
                  Solicitar orçamento <ArrowRight size={16} />
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
