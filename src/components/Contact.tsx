import { ArrowRight, Mail, MessageCircle } from "lucide-react";

export default function Contact() {
  return (
    <section id="contato" className="contact section-shell">
      <div className="contact-box">
        <div className="contact-light" />
        <div><span className="eyebrow"><i /> VAMOS CONVERSAR?</span><h2>Vamos transformar<br />sua ideia em <em>realidade?</em></h2><p>Fale com um especialista e receba uma proposta personalizada.</p></div>
        <div className="contact-actions"><a className="whatsapp-button" href="https://wa.me/5585992908430" target="_blank" rel="noreferrer"><MessageCircle size={19} /> Falar com especialista <ArrowRight size={16} /></a><a className="outline" href="mailto:contato@rasterdigital.com"><Mail size={18} /> Enviar e-mail <ArrowRight size={16} /></a></div>
      </div>
    </section>
  );
}
