import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, ChevronRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { goToProposal, hostOf, useContent, waLink, type Offer, type PageDef, type PageSection, type Project } from "../lib/content";
import { pageIcon } from "../lib/pageIcons";
import BrandMarquee from "../components/BrandMarquee";
import Maintenance from "../components/Maintenance";
import Pricing, { Hosting, PlanCard } from "../components/Pricing";
import { CaseGrid, ProjectCard, ProjectMedia } from "../components/Projects";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import Segments from "../components/Segments";
import Simulator from "../components/Simulator";
import Steps from "../components/Steps";

const ease = [0.22, 1, 0.36, 1] as const;

/** Topo das páginas internas: navegação estrutural, H1, texto de apoio e chamadas. */
export function PageHero({ page }: { page: PageDef }) {
  const { settings } = useContent();
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay, ease } };
  return (
    <section className="page-hero">
      <div className="hero__grid-bg" aria-hidden="true" />
      <div className="shell page-hero__inner">
        <nav aria-label="Navegação estrutural">
          <ol className="crumbs">
            {page.breadcrumb.map((b, i) => (
              <li key={b.name}>
                {i > 0 && <ChevronRight size={13} aria-hidden="true" />}
                {b.path ? <a href={b.path}>{b.name}</a> : <span aria-current="page">{b.name}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <motion.p className="eyebrow" {...fade(0)}>{page.hero.eyebrow}</motion.p>
        <motion.h1 {...fade(0.05)}>{page.hero.h1}</motion.h1>
        <motion.p className="page-hero__lead" {...fade(0.1)}>{page.hero.lead}</motion.p>
        <motion.div className="hero__actions" {...fade(0.15)}>
          <button className="btn btn--primary btn--lg" onClick={() => goToProposal()}>
            {page.hero.cta || "Solicitar orçamento"} <ArrowRight size={18} />
          </button>
          <a className="btn btn--ghost btn--lg" href={waLink(settings.contact.whatsapp)} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp size={18} /> Conversar com um especialista
          </a>
        </motion.div>
      </div>
    </section>
  );
}

type Head = { id?: string; eyebrow?: string; title: string; sub?: string };
const Shell = ({ head, alt, children }: { head: Head; alt?: boolean; children: ReactNode }) => (
  <section id={head.id} className={`section${alt ? " section--alt" : ""}`}>
    <div className="shell">
      <SectionHead eyebrow={head.eyebrow} title={head.title} sub={head.sub} />
      {children}
    </div>
  </section>
);

/** Modalidade ainda sem preço publicado (ex.: Site profissional): mesmo visual do card de plano. */
function StaticOffer({ o }: { o: Extract<Offer, { name: string }> }) {
  return (
    <article className="plan">
      <h3>{o.name}</h3>
      <p className="plan__desc">{o.description}</p>
      <p className="plan__price plan__price--quote">Sob orçamento</p>
      {o.bullets && (
        <ul className="plan__scope">
          {o.bullets.map((b) => <li key={b}><Check size={14} /> {b}</li>)}
        </ul>
      )}
      <button className="btn btn--outline btn--sm btn--block" onClick={() => goToProposal({ service: "orientacao" })}>
        Solicitar orçamento
      </button>
    </article>
  );
}

function CaseDetail({ page }: { page: PageDef }) {
  const { projects } = useContent();
  const p = projects.find((x) => x.slug === page.project);
  if (!p) return null;
  const info = page.case ?? {};
  const features = info.features?.length ? info.features : p.features;
  const blocks = [
    ["Necessidade do cliente", info.need],
    ["Solução desenvolvida", info.solution],
    ["Objetivo", info.goal],
  ].filter((b): b is [string, string] => Boolean(b[1]));
  return (
    <section className="section">
      <div className="shell case-detail">
        <div className={`case-detail__media proj proj--${p.theme}`}>
          <ProjectMedia p={p} />
        </div>
        <div className="case-detail__body">
          {p.logo_url && <img className="proj__logo" src={p.logo_url} alt={`Logotipo ${p.client}`} height="56" />}
          {blocks.map(([t, text]) => (
            <div className="case-block" key={t}>
              <h2>{t}</h2>
              <p>{text}</p>
            </div>
          ))}
          <div className="case-block">
            <h2>O que foi desenvolvido</h2>
            <ul className="checklist checklist--single">
              {features.map((f) => <li key={f}><Check size={16} aria-hidden="true" /> {f}</li>)}
            </ul>
          </div>
          {info.testimonial && (
            <blockquote className="testimonial">
              <p>“{info.testimonial.text}”</p>
              <footer>{info.testimonial.author}{info.testimonial.role ? ` · ${info.testimonial.role}` : ""}</footer>
            </blockquote>
          )}
          {p.url && (
            <a className="btn btn--primary" href={p.url} target="_blank" rel="noopener noreferrer">
              Conhecer o projeto: {hostOf(p.url)} <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/** Depoimentos reais cadastrados em src/data/cases.json (a seção só aparece quando existe algum). */
function Testimonials({ page, projects }: { page: PageDef; projects: Project[] }) {
  const items = projects.flatMap((p) => {
    const t = page.cases?.[p.slug]?.testimonial;
    return t ? [{ ...t, client: p.client }] : [];
  });
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="shell">
        <SectionHead center eyebrow="Depoimentos" title="O que dizem os clientes" />
        <div className="testimonials">
          {items.map((t) => (
            <blockquote className="testimonial" key={t.client}>
              <p>“{t.text}”</p>
              <footer>{t.author} · {t.role ?? t.client}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Section({ s, page, alt }: { s: PageSection; page: PageDef; alt: boolean }) {
  const { services, projects } = useContent();
  switch (s.type) {
    case "text":
      return (
        <Shell head={s} alt={alt}>
          <Reveal className="prose">{s.paragraphs.map((p) => <p key={p}>{p}</p>)}</Reveal>
        </Shell>
      );
    case "cards":
      return (
        <Shell head={s} alt={alt}>
          <div className={`cards cards--${Math.min(s.items.length, 4) === 4 ? 4 : 3}`}>
            {s.items.map((c, i) => {
              const Icon = pageIcon(c.icon);
              return (
                <Reveal as="article" className="sol" key={c.title} delay={(i % 3) * 0.05}>
                  <span className="icon-tile"><Icon size={20} /></span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </Reveal>
              );
            })}
          </div>
        </Shell>
      );
    case "checklist":
      return (
        <Shell head={s} alt={alt}>
          <ul className="checklist">
            {s.items.map((t) => <li key={t}><Check size={16} aria-hidden="true" /> {t}</li>)}
          </ul>
        </Shell>
      );
    case "steps":
      return <Steps id={s.id} eyebrow={s.eyebrow} title={s.title} sub={s.sub} items={s.items} alt={alt} />;
    case "offers": {
      // Serviços inativos no catálogo somem da página (sem card quebrado).
      const cards = s.items
        .map((o) => ("service" in o ? services.find((x) => x.slug === o.service) ?? null : o))
        .filter((o): o is NonNullable<typeof o> => o !== null);
      if (!cards.length) return null;
      return (
        <Shell head={s} alt={alt}>
          <div className="plans">
            {cards.map((o) => ("slug" in o ? <PlanCard key={o.slug} s={o} /> : <StaticOffer key={o.name} o={o} />))}
          </div>
          {s.note && <p className="note-line">{s.note}</p>}
        </Shell>
      );
    }
    case "cases": {
      const list = s.projects.map((slug) => projects.find((p) => p.slug === slug)).filter((p): p is Project => Boolean(p));
      if (!list.length) return null;
      return (
        <Shell head={s} alt={alt}>
          <CaseGrid projects={list} />
        </Shell>
      );
    }
    case "segments":
      return <Segments id={s.id} eyebrow={s.eyebrow} title={s.title} sub={s.sub} />;
    case "pricing":
      return <Pricing id={s.id} />;
    case "hosting":
      return <Hosting />;
    case "maintenance":
      return <Maintenance />;
    case "simulator":
      return <Simulator id={s.id} />;
    case "projects":
      return (
        <section className="section">
          <div className="shell projects">
            {projects.map((p, i) => <ProjectCard key={p.id} p={p} delay={(i % 2) * 0.08} />)}
          </div>
          <Testimonials page={page} projects={projects} />
        </section>
      );
    case "brands":
      return <BrandMarquee />;
    case "case":
      return <CaseDetail page={page} />;
    default:
      return null;
  }
}

/** Links internos para páginas relacionadas (silo). */
export function Related({ items }: { items: NonNullable<PageDef["related"]> }) {
  return (
    <section className="section section--tight">
      <div className="shell">
        <h2 className="related__title">Veja também</h2>
        <ul className="related">
          {items.map((r) => (
            <li key={r.path}>
              <a href={r.path}>
                <b>{r.label} <ArrowRight size={14} aria-hidden="true" /></b>
                {r.text && <span>{r.text}</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
