import { FaGithub, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { useContent, waLink } from "../lib/content";

export default function Footer() {
  const { settings } = useContent();
  const c = settings.contact;
  return (
    <footer className="footer">
      <div className="shell footer__grid">
        <div className="footer__brand">
          <img src="/img/logo.webp" alt="Raster Digital" width="138" height="44" loading="lazy" />
          <p>Sites, lojas virtuais e sistemas para negócios.</p>
        </div>
        <nav className="footer__col" aria-label="Rodapé">
          <a href="#solucoes">Soluções</a>
          <a href="#projetos">Projetos</a>
          <a href="#precos">Preços</a>
          <a href="#simulador">Simulador</a>
        </nav>
        <div className="footer__col">
          <a href={waLink(c.whatsapp)} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> {c.whatsappDisplay}</a>
          {c.instagram && <a href={c.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram /> @raster.digital</a>}
          <span>{c.city}</span>
        </div>
        <div className="footer__social">
          {c.instagram && <a href={c.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram size={18} /></a>}
          {c.linkedin && <a href={c.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin size={18} /></a>}
          {c.github && <a href={c.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub size={18} /></a>}
        </div>
      </div>
      <div className="shell footer__bottom">
        <span>© {new Date().getFullYear()} Raster Digital</span>
        <span className="footer__links">
          <a href="/privacidade">Privacidade</a>
          <a href="/admin" rel="nofollow">Área restrita</a>
        </span>
      </div>
    </footer>
  );
}
