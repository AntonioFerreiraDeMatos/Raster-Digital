import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Compass, GraduationCap, Handshake, Puzzle, Rocket, ShieldCheck, type LucideIcon } from "lucide-react";
import { goToProposal, useContent } from "../lib/content";
import type { HeroScene } from "../three/heroScene";

const ease = [0.22, 1, 0.36, 1] as const;

/** Compromissos exibidos na faixa de credibilidade da primeira dobra (sem números ou promessas inventadas). */
const TRUST: [LucideIcon, string][] = [
  [Handshake, "Atendimento diretamente com o fundador"],
  [Compass, "Participação no planejamento e no desenvolvimento"],
  [Rocket, "Projetos reais desenvolvidos e publicados"],
  [Puzzle, "Soluções personalizadas para empresas"],
  [ShieldCheck, "Compromisso com qualidade e transparência"],
];

/** 3D só quando o aparelho aguenta e a pessoa não pediu menos movimento. */
function can3D() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Destaca o nome do fundador dentro do texto de apresentação. */
function withName(text: string, name: string): ReactNode {
  if (!name || !text.includes(name)) return text;
  return text.split(name).map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <b>{name}</b>}
      {part}
    </Fragment>
  ));
}

export default function Hero() {
  const { settings } = useContent();
  const h = settings.hero;
  const f = settings.founder;
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroScene | null>(null);
  const [ready3D, setReady3D] = useState(false);

  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease } };
  const reveal = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, x: 18 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.7, delay, ease } };

  // Cena 3D: carregada depois que a página abriu, em arquivo separado.
  // O "R" é desenhado no canvas na posição e no tamanho da caixa .hero__art (a âncora).
  useEffect(() => {
    if (reduce || !can3D()) return;
    let disposed = false;
    const start = () =>
      import("../three/heroScene")
        .then(({ createHeroScene }) => {
          const canvas = canvasRef.current;
          const host = heroRef.current;
          const anchor = artRef.current;
          if (disposed || !canvas || !host || !anchor) return;
          const lite = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches || (navigator.hardwareConcurrency || 8) <= 4;
          sceneRef.current = createHeroScene({ canvas, host, anchor, lite, onReady: () => !disposed && setReady3D(true) });
        })
        .catch(() => {
          /* sem 3D: a arte em CSS continua */
        });
    const idle = window.requestIdleCallback?.(start, { timeout: 1500 });
    const timer = idle === undefined ? window.setTimeout(start, 700) : undefined;
    return () => {
      disposed = true;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      sceneRef.current?.dispose();
      sceneRef.current = null;
      setReady3D(false);
    };
  }, [reduce]);

  // Foto e selos acompanham o mouse em profundidades diferentes (só com mouse e sem "reduzir movimento").
  useEffect(() => {
    const visual = visualRef.current;
    if (reduce || !visual || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        visual.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        visual.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <section id="inicio" ref={heroRef} className={`hero${ready3D ? " hero--3d" : ""}`}>
      <div className="hero__grid-bg" aria-hidden="true" />
      <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
      <div className="hero__scrim" aria-hidden="true" />
      <div className="hero__inner shell">
        <div className="hero__copy">
          {/* H1 = palavra-chave local (visual de "chamada"); o título grande é a mensagem principal. */}
          <motion.h1 className="eyebrow" {...fade(0)}>{h.eyebrow}</motion.h1>
          <motion.p className="hero__title" {...fade(0.08)}>
            {h.title} <span className="grad grad--shine">{h.highlight}</span>
          </motion.p>
          <motion.p className="hero__lead" {...fade(0.16)}>{h.subtitle}</motion.p>
          {h.intro && <motion.p className="hero__note" {...fade(0.2)}>{withName(h.intro, f.name)}</motion.p>}
          <motion.div className="hero__actions" {...fade(0.24)}>
            <button className="btn btn--primary btn--lg" onClick={() => goToProposal()}>
              Quero uma solução para meu negócio <ArrowRight size={18} />
            </button>
            <a className="btn btn--ghost btn--lg" href="#projetos">Conhecer projetos reais</a>
          </motion.div>
          <motion.ul className="hero__facts" {...fade(0.32)}>
            <li><Check size={15} /> Preço fechado</li>
            <li><Check size={15} /> 12 meses de hospedagem grátis</li>
            <li><Check size={15} /> Sem fidelidade</li>
            <li><Check size={15} /> Análise sem compromisso</li>
          </motion.ul>
        </div>

        {/* Composição: o fundador (confiança) + a marca em 3D (identidade). */}
        <div className="hero__visual" ref={visualRef}>
          {/* Âncora da logo 3D. Sem 3D, mostra a versão em CSS; com 3D, o "R" animado é desenhado no canvas aqui. */}
          <motion.div
            ref={artRef}
            className="hero__art"
            aria-hidden="true"
            onClick={() => sceneRef.current?.spin()}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
          >
            <div className="orbit orbit--1" />
            <div className="orbit orbit--2" />
            <div className="orbit orbit--3" />
            <div className="hero__core">
              <img src="/img/r-mark.webp" alt="" width="720" height="595" />
            </div>
          </motion.div>

          <motion.figure
            className="hero__portrait"
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.97, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            transition={{ duration: 1, delay: 0.2, ease }}
          >
            <div className="hero__photo">
              <picture>
                <source srcSet="/img/antonio-matos.webp" type="image/webp" />
                <img
                  src="/img/antonio-matos.jpg"
                  alt={`${f.name}, ${f.role.toLowerCase()} da Raster Digital`}
                  width="720"
                  height="959"
                  fetchPriority="high"
                />
              </picture>
            </div>
            <figcaption className="hero__id">
              <motion.span className="hero__id-name" {...reveal(0.75)}>{f.name}</motion.span>
              <motion.span className="hero__id-role" {...reveal(0.88)}>{f.role} da Raster Digital</motion.span>
            </figcaption>
          </motion.figure>

          {f.course && (
            <motion.div className="hero__edu" {...fade(1.0)}>
              <span className="icon-tile icon-tile--sm"><GraduationCap size={18} /></span>
              <span className="hero__edu-text">
                <b>{f.course}</b>
                {f.school && <span>{f.school}</span>}
                {f.graduation && <small>{f.graduation}</small>}
              </span>
            </motion.div>
          )}
        </div>

        <motion.ul className="hero__trust" aria-label="Como trabalhamos" {...fade(0.4)}>
          {TRUST.map(([Icon, label]) => (
            <li key={label}>
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
