import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const links = [
  ["Início", "#inicio"],
  ["Sobre", "#sobre"],
  ["Serviços", "#servicos"],
  ["Portfólio", "#projetos"],
  ["Depoimentos", "#depoimentos"],
  ["Contato", "#contato"],
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("inicio");

  const goTo = (href: string) => {
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;

    setOpen(false);
    setActive(href.slice(1));
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    target.classList.remove("section-focus");
    window.setTimeout(() => target.classList.add("section-focus"), 180);
    window.setTimeout(() => target.classList.remove("section-focus"), 1250);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const sections = links
      .map(([, href]) => document.querySelector<HTMLElement>(href))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.05, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <a className="brand" href="#inicio" aria-label="Raster Digital início" onClick={(e) => { e.preventDefault(); goTo("#inicio"); }}>
        <img src="/logo.png" alt="Raster Digital" />
      </a>
      <nav className={`menu ${open ? "open" : ""}`}>
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href}
            className={active === href.slice(1) ? "active-link" : ""}
            onClick={(event) => {
              event.preventDefault();
              goTo(href);
            }}
          >
            {label}
          </a>
        ))}
      </nav>
      <a
        className={`nav-cta ${active === "contato" ? "cta-active" : ""}`}
        href="#contato"
        onClick={(event) => { event.preventDefault(); goTo("#contato"); }}
      >
        Falar com especialista <ArrowRight size={15} />
      </a>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Abrir menu">
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  );
}
