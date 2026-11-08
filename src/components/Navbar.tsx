import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { goToProposal, useContent } from "../lib/content";

const links = [
  ["Soluções", "solucoes"],
  ["Projetos", "projetos"],
  ["Preços", "precos"],
  ["Simulador", "simulador"],
  ["Contato", "contato"],
] as const;

export default function Navbar() {
  const { settings } = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`nav ${scrolled || open ? "nav--solid" : ""} ${open ? "nav--open" : ""}`}>
      <div className="nav__inner shell">
        <a className="nav__brand" href="#inicio" aria-label="Raster Digital — início" onClick={close}>
          <img src="/img/logo.webp" alt="Raster Digital" width="138" height="44" />
        </a>

        <nav id="menu" className="nav__menu" aria-label="Principal">
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={close}>{label}</a>
          ))}
          <div className="nav__mobile-extra">
            <button className="btn btn--primary" onClick={() => { close(); goToProposal(); }}>
              Solicitar orçamento <ArrowRight size={16} />
            </button>
            {settings.contact.instagram && (
              <a className="nav__ig-text" href={settings.contact.instagram} target="_blank" rel="noopener noreferrer">
                <FaInstagram size={18} /> @raster.digital
              </a>
            )}
          </div>
        </nav>

        <div className="nav__actions">
          {settings.contact.instagram && (
            <a className="icon-btn" href={settings.contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram da Raster Digital">
              <FaInstagram size={18} />
            </a>
          )}
          <button className="btn btn--primary btn--sm nav__cta" onClick={() => goToProposal()}>
            Solicitar orçamento
          </button>
          <button className="icon-btn nav__toggle" aria-expanded={open} aria-controls="menu" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
