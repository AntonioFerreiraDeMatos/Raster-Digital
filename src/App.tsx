import { useSiteContent } from "./lib/content";
import SiteShell, { Boot } from "./components/SiteShell";
import Hero from "./components/Hero";
import Pillars from "./components/Pillars";
import Differentials from "./components/Differentials";
import Steps from "./components/Steps";
import BrandMarquee from "./components/BrandMarquee";
import Projects from "./components/Projects";
import Founder from "./components/Founder";
import LeadForm from "./components/LeadForm";
import home from "./data/home.json";

/**
 * Página inicial: apresentação comercial resumida da Raster Digital.
 * Preços, simulador e detalhes de cada serviço ficam nas páginas internas (src/data/pages).
 */
export default function App() {
  const { content, failed } = useSiteContent("/api/content");
  if (!content) return <Boot failed={failed} />;

  return (
    <SiteShell content={content}>
      <Hero />
      <Pillars />
      <Differentials />
      <Steps id="como-funciona" {...home.steps} />
      {/* Faixa contínua com as logos dos clientes (correndo), antes dos cards de projeto */}
      <BrandMarquee />
      <Projects />
      <Founder />
      <LeadForm
        eyebrow="Orçamento sem compromisso"
        title="Tem um projeto em mente?"
        text="Conte o que sua empresa precisa. Vamos entender sua necessidade e desenvolver uma solução adequada ao seu negócio."
      />
    </SiteShell>
  );
}
