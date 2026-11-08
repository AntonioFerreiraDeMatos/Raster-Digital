import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarCheck, MessageCircle, ShoppingBag } from "lucide-react";
import { goToProposal } from "../config/site";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease } };

  return (
    <section id="inicio" className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__grid shell">
        <div className="hero__copy">
          <motion.p className="eyebrow" {...fade(0.05)}>
            <span className="eyebrow__dot" /> Soluções digitais para empresas e empreendedores
          </motion.p>
          <motion.h1 {...fade(0.12)}>
            Seu negócio está pronto para conquistar o <span className="grad">próximo nível?</span>
          </motion.h1>
          <motion.p className="hero__lead" {...fade(0.2)}>
            Criamos experiências digitais que aproximam empresas de seus clientes, facilitam vendas e transformam
            ideias em soluções reais.
          </motion.p>
          <motion.div className="hero__actions" {...fade(0.28)}>
            <button className="btn btn--primary btn--lg" onClick={() => goToProposal()}>
              Quero transformar meu negócio <ArrowRight size={18} />
            </button>
            <a className="btn btn--ghost btn--lg" href="#projetos">
              Conhecer nossos projetos
            </a>
          </motion.div>
          <motion.ul className="hero__assurances" {...fade(0.36)}>
            <li>Atendimento direto com quem desenvolve</li>
            <li>Projetos reais no ar</li>
            <li>Proposta sem compromisso</li>
          </motion.ul>
        </div>

        <motion.div
          className="hero__visual"
          aria-hidden="true"
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
        >
          <div className="device device--laptop">
            <div className="device__bar">
              <i /> <i /> <i />
              <span>amandacosmeticos.com.br</span>
            </div>
            <img src="/img/amanda-desktop.webp" alt="" width="1280" height="800" fetchPriority="high" />
          </div>
          <div className="device device--phone">
            <img src="/img/amanda-mobile.webp" alt="" width="390" height="844" />
          </div>

          {/* Exemplos ilustrativos do que as soluções fazem pelo negócio */}
          <div className="float-card float-card--a">
            <span className="float-card__icon"><ShoppingBag size={16} /></span>
            <div><b>Pedido recebido</b><small>Pronto para separar</small></div>
          </div>
          <div className="float-card float-card--b">
            <span className="float-card__icon float-card__icon--green"><MessageCircle size={16} /></span>
            <div><b>Cliente no WhatsApp</b><small>Com o pedido completo</small></div>
          </div>
          <div className="float-card float-card--c">
            <span className="float-card__icon"><CalendarCheck size={16} /></span>
            <div><b>Horário confirmado</b><small>Agenda organizada</small></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
