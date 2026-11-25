import { FaGithub, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { useContent, waLink } from "../lib/content";

const COLUMNS: [string, [string, string][]][] = [
  ["Presença digital", [["/criacao-de-sites", "Criação de sites"], ["/loja-virtual", "Loja virtual"], ["/cardapio-digital", "Cardápio digital"]]],
  ["Gestão e sistemas", [["/sistemas-personalizados", "Sistemas personalizados"], ["/painel-administrativo", "Painel administrativo"]]],
  ["Empresa", [["/projetos", "Projetos"], ["/precos", "Preços"], ["/criacao-de-sites-fortaleza", "Sites em Fortaleza"], ["/criacao-de-sites-caucaia", "Sites em Caucaia"]]],
];

export default function Footer() {
  const { settings } = useContent();
  const c = settings.contact;
  return (
    <footer className="footer">
      <div className="shell footer__grid">
        <div className="footer__brand">
          <img src="/img/logo.webp" alt="Raster Digital" width="138" height="44" loading="lazy" />
          <p>Sites, sistemas e soluções digitais para empresas de Fortaleza, Caucaia e região.</p>
          <div className="footer__contact">
            <a href={waLink(c.whatsapp)} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> {c.whatsappDisplay}</a>
            <span>{c.city}</span>
          </div>
        </div>
        {COLUMNS.map(([title, items]) => (
          <nav className="footer__col" aria-label={title} key={title}>
            <p className="footer__title">{title}</p>
            {items.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </nav>
        ))}
      </div>
      <div className="shell footer__bottom">
        <span>© {new Date().getFullYear()} Raster Digital</span>
        <div className="footer__social">
          {c.instagram && <a href={c.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram da Raster Digital"><FaInstagram size={18} /></a>}
          {c.linkedin && <a href={c.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin size={18} /></a>}
          {c.github && <a href={c.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub size={18} /></a>}
        </div>
        <span className="footer__links">
          <a href="/privacidade">Privacidade</a>
        </span>
      </div>
    </footer>
  );
}
