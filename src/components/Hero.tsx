import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { PointerEvent } from "react";
import { ArrowRight, BarChart3, Play, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function Hero() {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 80, damping: 20 });
  const smoothY = useSpring(pointerY, { stiffness: 80, damping: 20 });
  const deviceX = useTransform(smoothX, [-1, 1], [-18, 18]);
  const deviceY = useTransform(smoothY, [-1, 1], [-12, 12]);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width * 2 - 1);
    pointerY.set((event.clientY - rect.top) / rect.height * 2 - 1);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section id="inicio" className="hero" onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
      <div className="hero-noise" />
      <div className="hero-orbit orbit-one" />
      <div className="hero-orbit orbit-two" />
      <div className="hero-grid section-shell">
        <motion.div className="hero-scanline" animate={{ x: ["-120%", "120%"], opacity: [0, .45, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }} />
        <motion.div className="hero-copy" initial={{ opacity: 0, x: -45 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .9, ease: "easeOut" }}>
          <motion.div className="hero-pill" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15, duration: .55 }}><Sparkles size={14} /> TECNOLOGIA <span>•</span> DESIGN <span>•</span> RESULTADOS</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28, duration: .7 }}>CONECTANDO<br /><span>IDEIAS</span><br />E RESULTADOS</motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .42, duration: .65 }}>Transformamos ideias em experiências digitais que geram valor, presença e crescimento real para o seu negócio.</motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .55, duration: .6 }}>
            <a className="primary" href="#contato">Falar com especialista <ArrowRight size={16} /></a>
            <a className="play-link" href="#sobre"><span><Play size={15} fill="currentColor" /></span> Ver como<br />trabalhamos</a>
          </motion.div>
          <motion.div className="hero-stats" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .68, duration: .6 }}>
            <div><strong>+20</strong><small>Projetos entregues</small></div>
            <div><strong>100%</strong><small>Foco em resultados</small></div>
            <div><strong>24/7</strong><small>Suporte especializado</small></div>
          </motion.div>
        </motion.div>

        <motion.div
          className="device-stage"
          style={{ x: deviceX, y: deviceY }}
          initial={{ opacity: 0, scale: 0.94, x: 25 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.05, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="reference-device-glow"
            animate={{ opacity: [0.45, 0.8, 0.45], scale: [0.98, 1.03, 0.98] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            className="reference-device-image"
            src="/hero-reference-devices.jpg"
            alt="Ecossistema digital Raster Digital em notebook, tablet e smartphone"
            animate={{ y: [-5, 5, -5], rotateZ: [-0.25, 0.25, -0.25] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
