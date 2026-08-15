import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Projects from "./components/Projects";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { MessageCircle } from "lucide-react";

export default function App() {
  useEffect(() => {
    const glow = document.querySelector<HTMLElement>(".cursor-glow");
    if (!glow) return;

    const move = (event: PointerEvent) => {
      glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div className="app">
      <div className="cursor-glow" aria-hidden="true" />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Projects />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <a
        className="whatsapp-float"
        href="https://wa.me/5585986275389"
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com a Raster Digital no WhatsApp"
      >
        <MessageCircle size={24} strokeWidth={2.2} />
      </a>
    </div>
  );
}
