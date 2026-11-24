import { GraduationCap } from "lucide-react";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { useContent, waLink } from "../lib/content";
import Reveal from "./Reveal";

/**
 * Apresentação única do fundador (foto real, nome, cargo, formação e texto).
 * Textos em /admin → Conteúdo → Fundador.
 */
export default function Founder() {
  const { settings } = useContent();
  const f = settings.founder;
  const c = settings.contact;
  return (
    <section id="fundador" className="section section--alt">
      <div className="shell founder">
        <Reveal className="founder__visual">
          <figure className="fportrait">
            <div className="fportrait__photo">
              <picture>
                <source srcSet="/img/antonio-matos.webp" type="image/webp" />
                <img src="/img/antonio-matos.jpg" alt={`${f.name}, ${f.role.toLowerCase()} da Raster Digital`} width="720" height="959" loading="lazy" />
              </picture>
            </div>
            <figcaption className="fportrait__id">
              <span className="fportrait__name">{f.name}</span>{" "}
              <span className="fportrait__role">{f.role} da Raster Digital</span>
            </figcaption>
          </figure>
        </Reveal>
        <Reveal className="founder__copy" delay={0.08}>
          {/* Nome e cargo já estão na placa da foto: o título apresenta o papel, sem repetir. */}
          <p className="eyebrow">Fundador</p>
          <h2>Quem desenvolve o seu projeto</h2>
          {f.text.split(/\n\s*\n/).map((para) => para.trim()).filter(Boolean).map((para) => (
            <p className="founder__text" key={para}>{para}</p>
          ))}
          {f.course && (
            <div className="founder__edu">
              <span className="icon-tile icon-tile--sm"><GraduationCap size={18} /></span>
              <span>
                <b>{f.course}</b>{" "}
                {f.school && <span>{f.school}</span>}{" "}
                {f.graduation && <small>{f.graduation}</small>}
              </span>
            </div>
          )}
          <div className="founder__cta">
            <a className="btn btn--whatsapp" href={waLink(c.whatsapp, "Olá, Antonio! Vim pelo site da Raster Digital e gostaria de conversar sobre um projeto.")} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp size={18} /> Conversar com o fundador
            </a>
            <div className="founder__social">
              {c.linkedin && <a href={c.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${f.name}`}><FaLinkedin size={18} /></a>}
              {c.github && <a href={c.github} target="_blank" rel="noopener noreferrer" aria-label={`GitHub de ${f.name}`}><FaGithub size={18} /></a>}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
