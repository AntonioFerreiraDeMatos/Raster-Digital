import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { goToProposal } from "../config/site";

const links = [
  ["Soluções", "solucoes"],
  ["Projetos", "projetos"],
  ["Como trabalhamos", "processo"],
  ["Quem faz", "fundador"],
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""} ${open ? "nav--open" : ""}`}>
      <div className="nav__inner shell">
        <a className="nav__brand" href="#inicio" aria-label="Raster Digital — início" onClick={() => setOpen(false)}>
          <picture>
            <source srcSet="/img/logo.webp" type="image/webp" />
            <img src="/img/logo.png" alt="Raster Digital" width="160" height="51" />
          </picture>
        </a>

        <nav id="menu" className="nav__menu" aria-label="Principal">
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <button
            className="btn btn--primary nav__cta-mobile"
            onClick={() => {
              setOpen(false);
              goToProposal();
            }}
          >
            Solicitar proposta <ArrowRight size={16} />
          </button>
        </nav>

        <button className="btn btn--primary btn--sm nav__cta" onClick={() => goToProposal()}>
          Solicitar proposta <ArrowRight size={15} />
        </button>

        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
