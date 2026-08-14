import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const projects = [
  { title: "JS Retífica", category: "Site Institucional", image: "/jsretifica.jpg", link: "https://www.jsretifica.com.br/", badge: "Otimizado" },
  { title: "Barbearia Prime", category: "Agendamento • Sistema", image: null, badge: "Em evolução" },
  { title: "Em breve", category: "Novo projeto • Confidencial", image: null, badge: "Confidencial" },
];

export default function Projects() {
  return (
    <section id="projetos" className="projects section-shell">
      <div className="projects-head"><div><span className="eyebrow"><i /> PROJETOS</span><h2>Ideias que ganharam<br />vida no <em>digital.</em></h2></div><div className="projects-side"><p>Cada projeto é único. Aqui está um pouco do que já construímos.</p><a className="outline" href="#contato">Ver mais projetos <ArrowUpRight size={15} /></a></div></div>
      <div className="project-grid">
        {projects.map((project, i) => <motion.article className="project-card" key={project.title} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08 }}>
          <div className={`project-image ${!project.image ? "project-placeholder" : ""}`}>
            {project.image ? <img src={project.image} alt="Projeto JS Retífica" /> : <div className="placeholder-screen"><div className="placeholder-logo">R</div><span>RASTER DIGITAL</span></div>}
            <div className="project-tags"><span>{project.category}</span><b>{project.badge}</b></div>
            {project.link && <a className="project-arrow" href={project.link} target="_blank" rel="noreferrer"><ArrowUpRight size={18} /></a>}
          </div>
          <h3>{project.title}</h3>
        </motion.article>)}
      </div>
    </section>
  );
}
