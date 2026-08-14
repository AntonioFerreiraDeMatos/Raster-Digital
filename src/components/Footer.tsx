import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main section-shell">
        <div className="footer-brand"><img src="/logo.png" alt="Raster Digital" /><p>Tecnologia que impulsiona negócios.</p></div>
        <div className="footer-column"><h4>Links Rápidos</h4><a href="#inicio">Início</a><a href="#sobre">Sobre</a><a href="#servicos">Serviços</a><a href="#projetos">Portfólio</a><a href="#depoimentos">Depoimentos</a><a href="#contato">Contato</a></div>
        <div className="footer-column"><h4>Tecnologias</h4><span><b className="tech-dot react-dot">✣</b> React</span><span><b className="tech-dot ts-dot">TS</b> TypeScript</span><span><b className="tech-dot node-dot">◆</b> Node.js</span><span><b className="tech-dot sql-dot">▣</b> MySQL</span></div>
        <div className="footer-column footer-social"><h4>Conecte-se</h4><div><a href="#" aria-label="Instagram"><FaInstagram size={18} /></a><a href="https://www.linkedin.com/in/antonio-matos-9671a5207/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin size={18} /></a><a href="https://github.com/AntonioFerreiraDeMatos" target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub size={18} /></a></div><small>© 2026 Raster Digital. Todos os direitos reservados.</small></div>
      </div>
      <div className="footer-bottom section-shell"><span>Desenvolvido com <b>♥</b> por Raster Digital</span><span>Estratégia • Design • Tecnologia</span></div>
    </footer>
  );
}
