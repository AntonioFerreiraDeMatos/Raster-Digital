import { motion } from "framer-motion";
import { ArrowRight, Gauge, Palette, ShieldCheck, Target } from "lucide-react";

const cards = [
  { icon: Gauge, title: "Alta Performance", text: "Sites rápidos, otimizados e preparados para crescer." },
  { icon: Palette, title: "Design Exclusivo", text: "Interfaces modernas que encantam e convertem." },
  { icon: ShieldCheck, title: "Segurança Total", text: "Tecnologia atualizada e dados sempre protegidos." },
  { icon: Target, title: "Foco em Resultados", text: "Estratégias que geram clientes e oportunidades." },
];

export default function About() {
  return (
    <section id="sobre" className="about section-shell">
      <motion.div className="about-copy" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}>
        <span className="eyebrow"><i /> SOBRE NÓS</span>
        <div className="section-kicker">Por que escolher a Raster Digital?</div>
        <h2>Não criamos apenas sites.<br />Criamos <em>presença.</em></h2>
        <p>Somos uma empresa de tecnologia focada em desenvolver soluções digitais modernas, rápidas e estratégicas. Nosso objetivo é simples: fazer sua marca se destacar no mundo digital.</p>
        <a className="primary compact" href="#servicos">Conheça a Raster <ArrowRight size={15} /></a>
      </motion.div>
      <div className="about-cards">
        {cards.map((item, i) => { const Icon = item.icon; return (
          <motion.article key={item.title} className="about-card" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5, delay: i * .08 }} whileHover={{ y: -5 }}>
            <div className="icon-box"><Icon size={22} /></div><div><h3>{item.title}</h3><p>{item.text}</p></div>
          </motion.article>
        ); })}
      </div>
      <div className="about-metrics"><span><b>+20</b> Projetos entregues</span><span><b>100%</b> Foco em qualidade</span><span><b>+10</b> Clientes satisfeitos</span><span><b>∞</b> Novas possibilidades</span></div>
    </section>
  );
}
