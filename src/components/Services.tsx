import { motion } from "framer-motion";
import { ArrowRight, Blocks, Globe2, Headphones, Server, ShoppingBag, Wrench } from "lucide-react";

const services = [
  { icon: Globe2, title: "Sites Profissionais", text: "Sites institucionais, landing pages e sob medida." },
  { icon: Blocks, title: "Sistemas Web", text: "Soluções completas para automatizar seu negócio." },
  { icon: ShoppingBag, title: "Lojas Virtuais", text: "E-commerces modernos e personalizados." },
  { icon: Server, title: "Hospedagem", text: "Hospedagem segura e de alta performance." },
  { icon: Wrench, title: "Manutenção", text: "Atualizações e suporte contínuo." },
  { icon: Headphones, title: "Consultoria", text: "Estratégia digital para escalar sua marca." },
];

export default function Services() {
  return (
    <section id="servicos" className="services section-shell">
      <div className="services-head">
        <div><span className="eyebrow"><i /> NOSSOS SERVIÇOS</span><h2>Soluções digitais<br />para o seu <em>crescimento.</em></h2></div>
        <div className="services-side"><p>Do planejamento ao lançamento, entregamos tudo que sua marca precisa para se destacar.</p><a className="outline" href="#contato">Ver todos os serviços <ArrowRight size={15} /></a></div>
      </div>
      <div className="service-grid">
        {services.map(({ icon: Icon, title, text }, i) => (
          <motion.article className="service-card" key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .06 }} whileHover={{ y: -6 }}>
            <div className="service-icon"><Icon size={23} /></div><h3>{title}</h3><p>{text}</p><a href="#contato" aria-label={`Conhecer ${title}`}><ArrowRight size={17} /></a>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
