import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { goToProposal, useContent } from "../lib/content";
import type { HeroScene } from "../three/heroScene";

const ease = [0.22, 1, 0.36, 1] as const;

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

/**
 * Primeira dobra: a marca (o "R" em 3D) e a mensagem principal.
 * Textos editáveis em /admin → Conteúdo → Primeira dobra. A apresentação do fundador fica na seção própria (Founder.tsx).
 */
export default function Hero() {
  const { settings } = useContent();
  const h = settings.hero;
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HeroScene | null>(null);
  const [ready3D, setReady3D] = useState(false);

  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease } };

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

  return (
    <section id="inicio" ref={heroRef} className={`hero${ready3D ? " hero--3d" : ""}`}>
      <div className="hero__grid-bg" aria-hidden="true" />
      <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
      <div className="hero__scrim" aria-hidden="true" />
      <div className="hero__inner shell">
        <div className="hero__copy">
          {/* H1 = atuação + região (visual de "chamada"); o título grande é a mensagem principal. */}
          <motion.h1 className="eyebrow" {...fade(0)}>{h.eyebrow}</motion.h1>
          <motion.p className="hero__title" {...fade(0.08)}>
            {h.title} <span className="grad grad--shine">{h.highlight}</span>
          </motion.p>
          <motion.p className="hero__lead" {...fade(0.16)}>{h.subtitle}</motion.p>
          <motion.div className="hero__actions" {...fade(0.24)}>
            <button className="btn btn--primary btn--lg" onClick={() => goToProposal()}>
              Quero uma solução para meu negócio <ArrowRight size={18} />
            </button>
            <a className="btn btn--ghost btn--lg" href="#projetos">Conhecer projetos reais</a>
          </motion.div>
        </div>

        {/* Marca (decorativa). Sem 3D, fica a versão em CSS; com 3D, o "R" animado é desenhado no canvas aqui. Clique gira o "R". */}
        <motion.div
          ref={artRef}
          className="hero__art"
          aria-hidden="true"
          onClick={() => sceneRef.current?.spin()}
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
        >
          <div className="orbit orbit--1" />
          <div className="orbit orbit--2" />
          <div className="orbit orbit--3" />
          <div className="hero__core">
            <img src="/img/r-mark.webp" alt="" width="720" height="595" fetchPriority="high" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
