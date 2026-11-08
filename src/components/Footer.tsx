import { FaGithub, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { SITE, waLink } from "../config/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="shell footer__grid">
        <div className="footer__brand">
          <picture>
            <source srcSet="/img/logo.webp" type="image/webp" />
            <img src="/img/logo.png" alt="Raster Digital" width="160" height="51" loading="lazy" />
          </picture>
          <p>Soluções digitais para empresas e empreendedores que querem crescer.</p>
        </div>
        <nav className="footer__col" aria-label="Rodapé">
          <h4>Navegação</h4>
          <a href="#solucoes">Soluções</a>
          <a href="#projetos">Projetos</a>
          <a href="#processo">Como trabalhamos</a>
          <a href="#proposta">Solicitar proposta</a>
        </nav>
        <div className="footer__col">
          <h4>Contato</h4>
          <a href={waLink()} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> {SITE.whatsappDisplay}</a>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <span>{SITE.city}</span>
        </div>
        <div className="footer__col">
          <h4>Redes</h4>
          <div className="footer__social">
            {SITE.social.instagram && (
              <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram size={18} /></a>
            )}
            <a href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin size={18} /></a>
            <a href={SITE.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub size={18} /></a>
          </div>
        </div>
      </div>
      <div className="shell footer__bottom">
        <span>© {year} Raster Digital. Todos os direitos reservados.</span>
        <a href="/privacidade">Política de Privacidade</a>
      </div>
    </footer>
  );
}
