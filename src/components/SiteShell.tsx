import type { ReactNode } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { ContentContext, waLink, type Content } from "../lib/content";
import Ambient from "./Ambient";
import Footer from "./Footer";
import Navbar from "./Navbar";

/** Estrutura comum a todas as páginas: menu, ambiente, rodapé e botão flutuante do WhatsApp. */
export default function SiteShell({ content, children }: { content: Content; children: ReactNode }) {
  return (
    <ContentContext.Provider value={content}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Ambient />
      <Navbar />
      <main id="conteudo">{children}</main>
      <Footer />
      <a className="wa-float" href={waLink(content.settings.contact.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label="Conversar no WhatsApp">
        <FaWhatsapp size={26} />
      </a>
    </ContentContext.Provider>
  );
}

/** Tela enquanto o conteúdo carrega (só em desenvolvimento ou se o servidor não embutiu os dados). */
export function Boot({ failed }: { failed: boolean }) {
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
