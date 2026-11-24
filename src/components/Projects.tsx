import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { hostOf, useContent, type Project } from "../lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/**
 * Aparelhos em perspectiva: o notebook "deita" para trás ao entrar e se endireita no meio da tela;
 * o celular sobe mais rápido (parallax), dando profundidade.
 */
export function ProjectMedia({ p }: { p: Project }) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: mediaRef, offset: ["start end", "end start"] });
  const laptopTilt = useTransform(scrollYProgress, [0, 0.5, 1], [18, 0, -6]);
  const laptopY = useTransform(scrollYProgress, [0, 0.5, 1], [24, 0, -8]);
  const phoneY = useTransform(scrollYProgress, [0, 0.5, 1], [70, 0, -18]);

  return (
    <div className="proj__media" ref={mediaRef}>
      {p.cover_url && (
        <motion.div
          className="device device--laptop"
          style={reduce ? undefined : { rotateX: laptopTilt, y: laptopY, transformPerspective: 1100, transformOrigin: "50% 100%" }}
        >
          <div className="device__bar"><i /><i /><i /><span>{hostOf(p.url)}</span></div>
          <img src={p.cover_url} alt={`${p.title} ${p.client}, projeto da Raster Digital, na versão para computador`} loading="lazy" width="1280" height="800" />
        </motion.div>
      )}
      {p.mobile_url && (
        <motion.div className="device device--phone" style={reduce ? undefined : { y: phoneY }}>
          <img src={p.mobile_url} alt={`${p.title} ${p.client}, projeto da Raster Digital, na versão para celular`} loading="lazy" width="390" height="844" />
        </motion.div>
      )}
      {!p.mobile_url && p.gallery.length > 0 && (
        <div className="proj__gallery">
          {p.gallery.slice(0, 3).map((g) => (
            <img key={g} src={g} alt={`Imagem do site da ${p.client}`} loading="lazy" width="400" height="260" />
          ))}
        </div>
      )}
    </div>
  );
}

/** Vitrine completa de um projeto (página /projetos). */
export function ProjectCard({ p, delay = 0 }: { p: Project; delay?: number }) {
  return (
    <Reveal as="article" className={`proj proj--${p.theme}`} delay={delay}>
      <ProjectMedia p={p} />
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
        <div className="proj__actions">
          <a className="btn btn--primary btn--sm" href={`/projetos/${p.slug}`}>Ver o case <ArrowRight size={15} /></a>
          {p.url && (
            <a className="btn btn--outline btn--sm" href={p.url} target="_blank" rel="noopener noreferrer">
              Visitar o site <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/** Card compacto de projeto: página inicial e seções "projetos reais" das páginas internas. */
export function CaseCard({ p, delay = 0 }: { p: Project; delay?: number }) {
  return (
    <Reveal as="article" className={`case-card proj--${p.theme}`} delay={delay}>
      <a className="case-card__media" href={`/projetos/${p.slug}`} tabIndex={-1} aria-hidden="true">
        {p.cover_url && <img src={p.cover_url} alt="" loading="lazy" width="1280" height="800" />}
      </a>
      <div className="case-card__body">
        <div className="proj__top">
          {p.logo_url && <img className="proj__logo" src={p.logo_url} alt={`Logotipo ${p.client}`} loading="lazy" height="48" />}
          <div>
            <p className="proj__seg">{p.segment}</p>
            <h3><a href={`/projetos/${p.slug}`}>{p.client}</a></h3>
            <p className="proj__title">{p.title}</p>
          </div>
        </div>
        <p className="proj__summary">{p.summary}</p>
        <div className="case-card__actions">
          <a className="link" href={`/projetos/${p.slug}`}>Ver o case <ArrowRight size={14} /></a>
          {p.url && (
            <a className="link link--muted" href={p.url} target="_blank" rel="noopener noreferrer">
              {hostOf(p.url)} <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export function CaseGrid({ projects }: { projects: Project[] }) {
  return (
    <div className={`cases cases--${Math.min(projects.length, 3)}`}>
      {projects.map((p, i) => <CaseCard key={p.id} p={p} delay={i * 0.06} />)}
    </div>
  );
}

/** Seção de projetos da página inicial. */
export default function Projects() {
  const { projects } = useContent();
  if (!projects.length) return null;
  return (
    <section id="projetos" className="section">
      <div className="shell">
        <SectionHead
          center
          eyebrow="Projetos realizados"
          title={<>Não vendemos apenas ideias. <span className="grad">Desenvolvemos soluções reais.</span></>}
          sub="Lojas virtuais, sites institucionais e sites para turismo publicados para empresas de diferentes segmentos."
        />
        <CaseGrid projects={projects} />
        <p className="center-cta"><a className="btn btn--outline" href="/projetos">Ver todos os projetos <ArrowRight size={16} /></a></p>
      </div>
    </section>
  );
}
