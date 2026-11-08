import { FaWhatsapp } from "react-icons/fa";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Solutions from "./components/Solutions";
import CtaBand from "./components/CtaBand";
import Projects from "./components/Projects";
import Process from "./components/Process";
import Founder from "./components/Founder";
import Brands from "./components/Brands";
import LeadForm from "./components/LeadForm";
import Footer from "./components/Footer";
import { waLink } from "./config/site";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Navbar />
      <main id="conteudo">
        <Hero />
        <Solutions />
        <CtaBand
          title="Seu concorrente já está facilitando a vida dos clientes. E você?"
          text="Não deixe seus clientes procurando informações sobre sua empresa em vários lugares."
        />
        <Projects />
        <Process />
        <Founder />
        <Brands />
        <CtaBand
          variant="whatsapp"
          title="Seu próximo cliente pode estar procurando exatamente pelo que você oferece."
          text="Uma apresentação profissional pode ser o primeiro passo para conquistar a confiança dele."
        />
        <LeadForm />
      </main>
      <Footer />
      <a className="wa-float" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Conversar com a Raster Digital no WhatsApp">
        <FaWhatsapp size={28} />
      </a>
    </>
  );
}
