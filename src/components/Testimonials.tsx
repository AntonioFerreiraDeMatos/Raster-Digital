import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

export default function Testimonials() {
  return (
    <section id="depoimentos" className="testimonials section-shell">
      <div className="testimonials-title"><span className="eyebrow"><i /> DEPOIMENTOS</span><h2>Quem confia,<br /><em>recomenda.</em></h2><p>A satisfação dos nossos clientes é o que nos impulsiona a ir além todos os dias.</p></div>
      <motion.article className="testimonial-card" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}>
        <Quote size={34} className="quote-icon" />
        <p>“A Raster Digital superou minhas expectativas! O site ficou incrível, moderno e trouxe uma presença muito mais profissional para o meu negócio. Recomendo de olhos fechados!”</p>
        <div className="testimonial-user"><span>J</span><div><b>Cliente JS Retífica</b><small>Projeto institucional</small></div><div className="stars">{[1,2,3,4,5].map(x => <Star key={x} size={14} fill="currentColor" />)}</div></div>
      </motion.article>
    </section>
  );
}
