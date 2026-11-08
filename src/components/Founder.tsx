import { Check } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { SITE } from "../config/site";
import Reveal from "./Reveal";

const highlights = [
  "Estudante de Análise e Desenvolvimento de Sistemas na Universidade de Fortaleza (Unifor)",
  "Desenvolvimento de soluções digitais",
  "Construção de sistemas e aplicações web",
  "Desenvolvimento Full Stack — do visual ao funcionamento",
  "Experiência prática com projetos reais no ar",
  "Compromisso com qualidade e organização",
  "Atendimento próximo e personalizado",
];

export default function Founder() {
  return (
    <section id="fundador" className="section section--alt">
      <div className="shell founder">
        <Reveal className="founder__photo">
          <picture>
            <source srcSet="/img/antonio-matos.webp" type="image/webp" />
            <img
              src="/img/antonio-matos.jpg"
              alt={`${SITE.founder}, fundador da Raster Digital`}
              width="720"
              height="959"
              loading="lazy"
            />
          </picture>
          <div className="founder__badge">
            <b>{SITE.founder}</b>
            <small>Fundador · Raster Digital</small>
          </div>
        </Reveal>

        <Reveal className="founder__copy" delay={0.1}>
          <p className="eyebrow"><span className="eyebrow__dot" /> Quem está por trás</p>
          <h2>
            Por trás de cada projeto existe uma pessoa <span className="grad">comprometida com o seu negócio.</span>
          </h2>
          <p>
            Sou {SITE.founder}, fundador da Raster Digital e estudante de Análise e Desenvolvimento de Sistemas na
            Universidade de Fortaleza (Unifor). Cuido pessoalmente do planejamento, do desenvolvimento e do
            acompanhamento de cada projeto. Isso significa que você conversa diretamente com quem constrói a sua
            solução, sem intermediários e sem respostas genéricas.
          </p>
          <p>
            Meu trabalho é entender como o seu negócio funciona de verdade e transformar isso em uma ferramenta que
            facilite o seu dia a dia e a vida dos seus clientes.
          </p>
          <ul className="founder__list">
            {highlights.map((h) => (
              <li key={h}><Check size={16} /> {h}</li>
            ))}
          </ul>
          <div className="founder__social">
            <a href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin size={18} /> LinkedIn</a>
            <a href={SITE.social.github} target="_blank" rel="noopener noreferrer"><FaGithub size={18} /> GitHub</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
