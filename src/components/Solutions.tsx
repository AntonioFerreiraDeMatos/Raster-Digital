import { ArrowRight } from "lucide-react";
import { goToProposal, priceLabel, useContent } from "../lib/content";
import { iconFor } from "../lib/icons";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Solutions() {
  const { settings, services } = useContent();
  const bySlug = new Map(services.map((s) => [s.slug, s]));

  return (
    <section id="solucoes" className="section">
      <div className="shell">
        <SectionHead eyebrow="Soluções" title={<>O que desenvolvemos <span className="grad">para o seu negócio</span></>} />
        <div className="solutions">
          {settings.solutions.map((item, i) => {
            const Icon = iconFor(item.icon);
            const svc = item.service ? bySlug.get(item.service) : undefined;
            return (
              <Reveal as="article" className="sol" key={item.name} delay={(i % 3) * 0.05}>
                <span className="icon-tile"><Icon size={20} /></span>
                <h3>{item.name}</h3>
                <p>{item.text}</p>
                <div className="sol__foot">
                  <span className="sol__price">{svc ? (svc.price_from || svc.price_cents == null ? priceLabel(svc) : `A partir de ${priceLabel(svc)}`) : "Sob orçamento"}</span>
                  <a className="link" href={svc ? `#plano-${svc.slug}` : "#simulador"}>
                    Conhecer <ArrowRight size={14} />
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="center-cta">
          <button className="btn btn--primary" onClick={() => goToProposal()}>
            Quero desenvolver meu projeto <ArrowRight size={17} />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
