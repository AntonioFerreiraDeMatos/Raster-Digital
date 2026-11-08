import { ClipboardList, Code2, Headset, MessagesSquare } from "lucide-react";
import Reveal from "./Reveal";

const steps = [
  { icon: MessagesSquare, title: "Conversa", text: "Entendemos seu negócio, seus clientes e o que está travando o seu crescimento." },
  { icon: ClipboardList, title: "Planejamento", text: "Você recebe uma proposta clara: o que será feito, prazos e investimento." },
  { icon: Code2, title: "Desenvolvimento", text: "Construímos a solução e mostramos o andamento para você acompanhar cada etapa." },
  { icon: Headset, title: "Acompanhamento", text: "Depois de publicar, seguimos por perto para ajustes, suporte e evolução." },
];

export default function Process() {
  return (
    <section id="processo" className="section">
      <div className="shell">
        <Reveal className="section__head">
          <p className="eyebrow"><span className="eyebrow__dot" /> Como trabalhamos</p>
          <h2>Simples para você. <span className="grad">Organizado do início ao fim.</span></h2>
          <p className="section__sub">Você não precisa entender de tecnologia. Precisa apenas nos contar onde quer chegar.</p>
        </Reveal>
        <ol className="steps">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="li" className="step" key={title} delay={i * 0.07}>
              <span className="step__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="icon-tile"><Icon size={20} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
