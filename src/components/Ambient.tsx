import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/** Cards que ganham borda iluminada pelo cursor. */
const GLOW = ".sol, .plan, .mplan, .extra, .segment, .proj, .case-card, .diff, .lead__card, .sim__form, .sim__result";
/** Destes, os menores também inclinam em 3D. */
const TILT = ".sol, .plan, .mplan, .extra, .segment, .diff";
const MAX_TILT = 6; // graus

/**
 * Ambiente do site inteiro: manchas de luz com parallax na rolagem, pixels que acendem perto
 * do cursor, barra de progresso e brilho/inclinação dos cards. Tudo decorativo.
 */
export default function Ambient() {
  const reduce = useReducedMotion();
  const spotRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  // Camada fixa: as manchas sobem devagar e balançam de lado enquanto a página rola (profundidade).
  const y1 = useTransform(scrollY, (v) => -v * 0.05);
  const y2 = useTransform(scrollY, (v) => -v * 0.09);
  const y3 = useTransform(scrollY, (v) => -v * 0.03);
  const x1 = useTransform(scrollY, (v) => Math.sin(v / 900) * 90);
  const x2 = useTransform(scrollY, (v) => Math.cos(v / 1100) * 120);
  const x3 = useTransform(scrollY, (v) => Math.sin(v / 700 + 1) * 70);

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const spot = spotRef.current;
    let raf = 0;
    let x = -999;
    let y = -999;
    let card: HTMLElement | null = null;
    let cardX = 0;
    let cardY = 0;

    const reset = (el: HTMLElement) => {
      el.style.removeProperty("--go");
      el.style.removeProperty("--tilt");
    };

    const paint = () => {
      raf = 0;
      spot?.style.setProperty("--mx", `${x}px`);
      spot?.style.setProperty("--my", `${y}px`);
      if (!card) return;
      const r = card.getBoundingClientRect();
      const lx = cardX - r.left;
      const ly = cardY - r.top;
      card.style.setProperty("--gx", `${lx}px`);
      card.style.setProperty("--gy", `${ly}px`);
      card.style.setProperty("--go", "1");
      if (card.matches(TILT)) {
        const dx = lx / r.width - 0.5;
        const dy = ly / r.height - 0.5;
        const angle = Math.min(Math.hypot(dx, dy) * 2, 1) * MAX_TILT;
        card.style.setProperty("--tilt", `${(-dy).toFixed(3)} ${dx.toFixed(3)} 0 ${angle.toFixed(2)}deg`);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      const next = (e.target as Element | null)?.closest?.<HTMLElement>(GLOW) ?? null;
      if (card && card !== next) reset(card);
      card = next;
      cardX = x;
      cardY = y;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      x = y = -999;
      if (card) reset(card);
      card = null;
      if (!raf) raf = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      if (card) reset(card);
    };
  }, [reduce]);

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <div className="ambient" aria-hidden="true">
        <motion.div className="aurora aurora--1" style={reduce ? undefined : { x: x1, y: y1 }} />
        <motion.div className="aurora aurora--2" style={reduce ? undefined : { x: x2, y: y2 }} />
        <motion.div className="aurora aurora--3" style={reduce ? undefined : { x: x3, y: y3 }} />
      </div>
      <div className="spotlight" ref={spotRef} aria-hidden="true" />
    </>
  );
}
