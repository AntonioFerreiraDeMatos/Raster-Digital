import { Check } from "lucide-react";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useContent } from "../lib/content";
import Reveal from "./Reveal";

export default function Founder() {
  const { settings } = useContent();
  const f = settings.founder;
  const c = settings.contact;
  return (
    <section id="fundador" className="section section--alt">
      <div className="shell founder">
        <Reveal className="founder__photo">
          <picture>
            <source srcSet="/img/antonio-matos.webp" type="image/webp" />
            <img src="/img/antonio-matos.jpg" alt={`${f.name}, ${f.role.toLowerCase()} da Raster Digital`} width="720" height="959" loading="lazy" />
          </picture>
        </Reveal>
        <Reveal className="founder__copy" delay={0.08}>
          <p className="eyebrow">Quem desenvolve</p>
          <h2>{f.name}</h2>
          <p className="founder__role">{f.role} · Raster Digital</p>
          <p className="founder__text">{f.text}</p>
          <ul className="founder__list">
            {f.highlights.map((h) => <li key={h}><Check size={15} /> {h}</li>)}
          </ul>
          <div className="founder__social">
            {c.instagram && <a href={c.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram size={18} /></a>}
            {c.linkedin && <a href={c.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin size={18} /></a>}
            {c.github && <a href={c.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub size={18} /></a>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
