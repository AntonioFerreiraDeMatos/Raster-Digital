import { ArrowUpRight, Check, PlayCircle } from "lucide-react";
import { projects, type Project } from "../data/projects";
import Reveal from "./Reveal";

function Testimonial({ project }: { project: Project }) {
  if (project.testimonialVideo) {
    return (
      <div className="video">
        <iframe
          src={project.testimonialVideo}
          title={`Depoimento — ${project.client}`}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (!project.testimonialPending) return null;
  return (
    <div className="video video--pending">
      <PlayCircle size={40} strokeWidth={1.4} />
      <b>Depoimento em vídeo em breve</b>
      <small>{project.client} vai contar, com as próprias palavras, como foi construir a loja com a Raster.</small>
    </div>
  );
}

function Featured({ project }: { project: Project }) {
  return (
    <Reveal as="article" className="case">
      <div className="case__media">
        {project.desktopImage && (
          <div className="device device--laptop">
            <div className="device__bar">
              <i /> <i /> <i />
              <span>{project.url?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
            </div>
            <img src={project.desktopImage} alt={`Página inicial da ${project.client} no computador`} loading="lazy" width="1280" height="800" />
          </div>
        )}
        {project.mobileImage && (
          <div className="device device--phone">
            <img src={project.mobileImage} alt={`${project.client} no celular`} loading="lazy" width="390" height="844" />
          </div>
        )}
      </div>

      <div className="case__info">
        <p className="case__tag">{project.segment}</p>
        <h3>
          {project.client} <span>— {project.title}</span>
        </h3>
        <p className="case__summary">{project.summary}</p>
        <ul className="case__features">
          {project.features.map((f) => (
            <li key={f}><Check size={15} /> {f}</li>
          ))}
        </ul>
        {project.url && (
          <a className="btn btn--primary" href={project.url} target="_blank" rel="noopener noreferrer">
            Conhecer projeto online <ArrowUpRight size={17} />
          </a>
        )}
        <Testimonial project={project} />
      </div>
    </Reveal>
  );
}

function Compact({ project, delay }: { project: Project; delay: number }) {
  return (
    <Reveal as="article" className="mini-case" delay={delay}>
      {project.desktopImage && (
        <div className="mini-case__img">
          <img src={project.desktopImage} alt={`Site da ${project.client}`} loading="lazy" width="1000" height="625" />
        </div>
      )}
      <div className="mini-case__body">
        <p className="case__tag">{project.segment}</p>
        <h3>{project.client} <span>— {project.title}</span></h3>
        <p>{project.summary}</p>
        {project.url && (
          <a className="link" href={project.url} target="_blank" rel="noopener noreferrer">
            Ver site <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    </Reveal>
  );
}

export default function Projects() {
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);
  return (
    <section id="projetos" className="section section--alt">
      <div className="shell">
        <Reveal className="section__head">
          <p className="eyebrow"><span className="eyebrow__dot" /> Projetos de sucesso</p>
          <h2>Projetos reais. <span className="grad">Negócios que confiaram na Raster.</span></h2>
          <p className="section__sub">Nada de exemplos fictícios: estes são projetos desenvolvidos pela Raster e que estão no ar.</p>
        </Reveal>
        {featured.map((p) => <Featured key={p.slug} project={p} />)}
        {others.length > 0 && (
          <div className="mini-cases">
            {others.map((p, i) => <Compact key={p.slug} project={p} delay={i * 0.08} />)}
          </div>
        )}
      </div>
    </section>
  );
}
