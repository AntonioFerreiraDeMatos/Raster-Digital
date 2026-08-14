import { motion } from "framer-motion";
import { Atom, Cloud, Code2, Database, Palette, Server, Sparkles } from "lucide-react";

const technologies = [
  { icon: Atom, title: "React", label: "Interfaces" },
  { icon: Code2, title: "TypeScript", label: "Arquitetura" },
  { icon: Server, title: "Node.js", label: "Back-end" },
  { icon: Database, title: "MySQL", label: "Dados" },
  { icon: Cloud, title: "Cloud", label: "Escala" },
  { icon: Palette, title: "UI / UX", label: "Experiência" }
];

export default function Technologies() {
  return (
    <section id="tecnologias" className="technologies section-shell">
      <motion.div
        className="technology-intro"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <span className="eyebrow"><span /> NOSSO ECOSSISTEMA</span>
        <h2>Tecnologia atual.<br /><em>Experiência preparada para o amanhã.</em></h2>
        <p>Ferramentas modernas, código organizado e uma arquitetura pensada para entregar uma experiência digital sólida.</p>
      </motion.div>

      <div className="tech-grid">
        {technologies.map((tech, index) => {
          const Icon = tech.icon;
          return (
            <motion.div
              className="tech-card"
              key={tech.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -7 }}
            >
              <div className="tech-icon"><Icon size={23} strokeWidth={1.7} /></div>
              <div><strong>{tech.title}</strong><span>{tech.label}</span></div>
            </motion.div>
          );
        })}
      </div>

      <div className="technology-note"><Sparkles size={17} /><span>Escolhemos tecnologia pela capacidade de gerar resultado — não apenas por tendência.</span></div>
    </section>
  );
}
