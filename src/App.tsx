import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { ContentContext, readEmbedded, waLink, type Content } from "./lib/content";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Solutions from "./components/Solutions";
import BrandMarquee from "./components/BrandMarquee";
import Projects from "./components/Projects";
import Pricing from "./components/Pricing";
import Simulator from "./components/Simulator";
import Segments from "./components/Segments";
import Founder from "./components/Founder";
import LeadForm from "./components/LeadForm";
import Footer from "./components/Footer";

export default function App() {
  const [content, setContent] = useState<Content | null>(readEmbedded);
  const [failed, setFailed] = useState(false);

  // Sem conteúdo embutido (ex.: ambiente de desenvolvimento), busca na API
  useEffect(() => {
    if (content) return;
    let alive = true;
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((c: Content) => alive && setContent(c))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [content]);

  if (!content) {
    return (
      <div className="boot">
        <img src="/img/logo.webp" alt="Raster Digital" width="160" height="51" />
        {failed && (
          <p>
            Não foi possível carregar agora. <a href="https://wa.me/5585986275389">Fale conosco pelo WhatsApp</a>.
          </p>
        )}
      </div>
    );
  }

  return (
    <ContentContext.Provider value={content}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Navbar />
      <main id="conteudo">
        <Hero />
        <Solutions />
        <BrandMarquee />
        <Projects />
        <Pricing />
        <Simulator />
        <Segments />
        <Founder />
        <LeadForm />
      </main>
      <Footer />
      <a className="wa-float" href={waLink(content.settings.contact.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label="Conversar no WhatsApp">
        <FaWhatsapp size={26} />
      </a>
    </ContentContext.Provider>
  );
}
