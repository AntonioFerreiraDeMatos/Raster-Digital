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

// ==========================================
// WHATSAPP DA RASTER DIGITAL
// Coloque o número com DDI + DDD, somente números.
// Exemplo: 5585999999999
// ==========================================
const WHATSAPP_NUMBER = "5585992908430";

const whatsappMessage =
  "Olá! Vim pelo site da Raster Digital e gostaria de falar com um especialista.";

const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  whatsappMessage
)}`;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("inicio");

  const goTo = (href: string) => {
    const target = document.querySelector<HTMLElement>(href);

    if (!target) return;

    setOpen(false);
    setActive(href.slice(1));

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    target.classList.remove("section-focus");

    window.setTimeout(() => {
      target.classList.add("section-focus");
    }, 180);

    window.setTimeout(() => {
      target.classList.remove("section-focus");
    }, 1250);
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    onScroll();

    const sections = links
      .map(([, href]) =>
        document.querySelector<HTMLElement>(href)
      )
      .filter(
        (section): section is HTMLElement =>
          Boolean(section)
      );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          )[0];

        if (visible) {
          setActive(visible.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.05, 0.2, 0.5],
      }
    );

    sections.forEach((section) =>
      observer.observe(section)
    );

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header
      className={`navbar ${
        scrolled ? "scrolled" : ""
      }`}
    >
      {/* LOGO */}
      <a
        className="brand"
        href="#inicio"
        aria-label="Raster Digital início"
        onClick={(event) => {
          event.preventDefault();
          goTo("#inicio");
        }}
      >
        <img
          src="/logo.png"
          alt="Raster Digital"
        />
      </a>

      {/* MENU */}
      <nav
        className={`menu ${
          open ? "open" : ""
        }`}
      >
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href}
            className={
              active === href.slice(1)
                ? "active-link"
                : ""
            }
            onClick={(event) => {
              event.preventDefault();
              goTo(href);
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* WHATSAPP */}
      <a
        className={`nav-cta ${
          active === "contato"
            ? "cta-active"
            : ""
        }`}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com especialista pelo WhatsApp"
      >
        Falar com especialista
        <ArrowRight size={15} />
      </a>

      {/* MENU MOBILE */}
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label={
          open
            ? "Fechar menu"
            : "Abrir menu"
        }
      >
        {open ? (
          <X size={24} />
        ) : (
          <Menu size={24} />
        )}
      </button>
    </header>
  );
}