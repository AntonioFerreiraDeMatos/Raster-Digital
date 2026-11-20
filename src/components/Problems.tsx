import { ArrowRight, CalendarX, Hourglass, MessageSquareWarning, PackageSearch, SearchX, Smartphone, type LucideIcon } from "lucide-react";
import problems from "../data/problems.json";
import { goToProposal } from "../lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const ICONS: Record<string, LucideIcon> = {
  search: SearchX, phone: Smartphone, chat: MessageSquareWarning, calendar: CalendarX, stock: PackageSearch, time: Hourglass,
};

/** Dores do empresário antes das soluções (os mesmos textos vão no HTML para buscadores, via server/lib/seo.js). */
export default function Problems() {
  return (
    <section id="desafios" className="section section--alt">
      <div className="shell">
        <SectionHead
          eyebrow="Diagnóstico rápido"
          title={<>Quantas oportunidades seu negócio <span className="grad">pode estar perdendo?</span></>}
          sub="Seu próximo cliente pode estar procurando sua empresa agora. Veja se algum destes cenários faz parte da sua rotina."
        />
        <div className="solutions problems">
          {problems.map((p, i) => {
            const Icon = ICONS[p.icon] ?? SearchX;
            return (
              <Reveal as="article" className="sol" key={p.title} delay={(i % 3) * 0.05}>
                <span className="icon-tile"><Icon size={20} /></span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="center-cta cta-close">
          <p>
            Seu negócio não precisa continuar enfrentando esses desafios sozinho. A Raster Digital desenvolve soluções
            tecnológicas para transformar esses obstáculos em oportunidades.
          </p>
          <button className="btn btn--primary" onClick={() => goToProposal()}>
            Quero resolver esses problemas <ArrowRight size={17} />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
