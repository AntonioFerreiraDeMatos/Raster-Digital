import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
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

  // Etiquetas em profundidades diferentes acompanham o mouse.
  useEffect(() => {
    const art = artRef.current;
    if (reduce || !art || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        art.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        art.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
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
          <motion.p className="eyebrow" {...fade(0)}>{h.eyebrow}</motion.p>
          <motion.h1 {...fade(0.08)}>
            {h.title} <span className="grad grad--shine">{h.highlight}</span>
          </motion.h1>
          <motion.p className="hero__lead" {...fade(0.16)}>{h.subtitle}</motion.p>
          <motion.div className="hero__actions" {...fade(0.24)}>
            <button className="btn btn--primary btn--lg" onClick={() => goToProposal()}>
              Solicitar orçamento <ArrowRight size={18} />
            </button>
            <a className="btn btn--ghost btn--lg" href="#projetos">Conhecer projetos</a>
          </motion.div>
          <motion.ul className="hero__facts" {...fade(0.32)}>
            <li><Check size={15} /> Preço fechado</li>
            <li><Check size={15} /> 12 meses de hospedagem grátis</li>
            <li><Check size={15} /> Sem fidelidade</li>
          </motion.ul>
        </div>

        {/* Composição da marca (decorativa). Sem 3D, fica a versão em CSS; com 3D, o "R" é desenhado no canvas aqui. */}
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
            <img src="/img/r-mark.webp" alt="" width="720" height="595" />
          </div>
          <span className="chip chip--1">Sites</span>
          <span className="chip chip--2">Lojas virtuais</span>
          <span className="chip chip--3">Sistemas</span>
          <span className="chip chip--4">Dashboards</span>
        </motion.div>
      </div>
    </section>
  );
}
