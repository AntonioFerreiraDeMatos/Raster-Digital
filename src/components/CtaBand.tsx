import { ArrowRight, MessageCircle } from "lucide-react";
import { goToProposal, waLink } from "../config/site";
import Reveal from "./Reveal";

export default function CtaBand({ title, text, variant = "proposal" }: { title: string; text: string; variant?: "proposal" | "whatsapp" }) {
  return (
    <section className="cta-band">
      <Reveal className="cta-band__box shell">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        {variant === "whatsapp" ? (
          <a className="btn btn--whatsapp btn--lg" href={waLink()} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> Conversar no WhatsApp
          </a>
        ) : (
          <button className="btn btn--primary btn--lg" onClick={() => goToProposal()}>
            Quero uma proposta <ArrowRight size={18} />
          </button>
        )}
      </Reveal>
    </section>
  );
}
