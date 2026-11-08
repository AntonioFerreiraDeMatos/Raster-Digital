import { ArrowRight, ArrowUpRight, PlayCircle } from "lucide-react";
import { goToProposal, useContent, type Project } from "../lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

function hostOf(url: string | null) {
  return url?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") ?? "";
}

function ProjectCard({ p, delay }: { p: Project; delay: number }) {
  return (
    <Reveal as="article" className={`proj proj--${p.theme}`} delay={delay}>
      <div className="proj__media">
        {p.cover_url && (
          <div className="device device--laptop">
            <div className="device__bar"><i /><i /><i /><span>{hostOf(p.url)}</span></div>
            <img src={p.cover_url} alt={`Página inicial do site da ${p.client}`} loading="lazy" width="1280" height="800" />
          </div>
        )}
        {p.mobile_url && (
          <div className="device device--phone">
            <img src={p.mobile_url} alt={`Site da ${p.client} no celular`} loading="lazy" width="390" height="844" />
          </div>
        )}
        {!p.mobile_url && p.gallery.length > 0 && (
          <div className="proj__gallery">
            {p.gallery.slice(0, 3).map((g) => (
              <img key={g} src={g} alt={`Imagem do site da ${p.client}`} loading="lazy" width="400" height="260" />
            ))}
          </div>
        )}
      </div>

      <div className="proj__body">
        <div className="proj__top">
          {p.logo_url && <img className="proj__logo" src={p.logo_url} alt={`Logotipo ${p.client}`} loading="lazy" height="56" />}
          <div>
            <p className="proj__seg">{p.segment}</p>
            <h3>{p.client}</h3>
            <p className="proj__title">{p.title}</p>
          </div>
        </div>
        <p className="proj__summary">{p.summary}</p>
        <ul className="tags">
          {p.features.map((f) => <li key={f}>{f}</li>)}
        </ul>
        {p.video_url ? (
          <div className="video"><iframe src={p.video_url} title={`Depoimento — ${p.client}`} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen /></div>
        ) : null}
        {p.url && (
          <a className="btn btn--outline btn--sm" href={p.url} target="_blank" rel="noopener noreferrer">
            Visitar projeto <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    </Reveal>
  );
}

export default function Projects() {
  const { projects } = useContent();
  if (!projects.length) return null;
  const pendingVideo = projects.some((p) => p.slug === "amanda-cosmeticos" && !p.video_url);
  return (
    <section id="projetos" className="section section--alt">
      <div className="shell">
        <SectionHead eyebrow="Projetos de sucesso" title={<>Projetos reais, <span className="grad">no ar</span></>} />
        <div className="projects">
          {projects.map((p, i) => <ProjectCard key={p.id} p={p} delay={i * 0.08} />)}
        </div>
        {pendingVideo && (
          <p className="note-line"><PlayCircle size={15} /> Depoimento em vídeo da Amanda Cosméticos em breve.</p>
        )}
        <Reveal className="center-cta">
          <button className="btn btn--primary" onClick={() => goToProposal()}>
            Quero um projeto assim <ArrowRight size={17} />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
