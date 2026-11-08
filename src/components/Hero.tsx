import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { goToProposal, useContent } from "../lib/content";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const { settings } = useContent();
  const h = settings.hero;
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease } };

  return (
    <section id="inicio" className="hero">
      <div className="hero__grid-bg" aria-hidden="true" />
      <div className="hero__inner shell">
        <div className="hero__copy">
          <motion.p className="eyebrow" {...fade(0)}>{h.eyebrow}</motion.p>
          <motion.h1 {...fade(0.08)}>
            {h.title} <span className="grad">{h.highlight}</span>
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

        {/* Composição gráfica da marca (decorativa) */}
        <motion.div
          className="hero__art"
          aria-hidden="true"
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
        >
          <div className="orbit orbit--1" />
          <div className="orbit orbit--2" />
          <div className="orbit orbit--3" />
          <div className="hero__core">
            <img src="/img/logo.webp" alt="" width="220" height="70" />
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
