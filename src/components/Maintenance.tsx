import { Check, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { money, useContent, waLink } from "../lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

type Tier = "essencial" | "premium" | "platinum";

type MaintenancePlan = {
  tier: Tier;
  number: string;
  name: string;
  tagline: string;
  price_cents: number;
  minutes: number;
  requests: string;
  items: string[];
};

/** Planos de manutenção mensal. Limites de tempo e solicitações são mensais e não acumulativos. */
export const MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    tier: "essencial",
    number: "01",
    name: "Essencial",
    tagline: "O cuidado básico para seu site seguir no ar sem surpresas.",
    price_cents: 4990,
    minutes: 15,
    requests: "1 alteração simples",
    items: [
      "Monitoramento básico do site",
      "Verificação do funcionamento das páginas",
      "Verificação de links e botões principais",
      "Correção de pequenos erros técnicos",
      "1 solicitação de alteração simples por mês",
      "Suporte via WhatsApp em horário comercial",
      "Até 15 minutos de ajustes mensais",
    ],
  },
  {
    tier: "premium",
    number: "02",
    name: "Premium",
    tagline: "Acompanhamento ativo para quem atualiza o site com frequência.",
    price_cents: 9990,
    minutes: 45,
    requests: "Até 2 alterações",
    items: [
      "Todos os benefícios do Essencial",
      "Até 2 solicitações de alterações por mês",
      "Atualização de textos, imagens e informações",
      "Teste de formulários e botões de WhatsApp",
      "Verificação de desempenho e carregamento",
      "Verificação de segurança e atualizações técnicas aplicáveis",
      "Relatório mensal simplificado",
      "Atendimento prioritário",
      "Até 45 minutos de ajustes mensais",
    ],
  },
  {
    tier: "platinum",
    number: "03",
    name: "Platinum",
    tagline: "Gestão completa e atenção exclusiva para sua presença digital.",
    price_cents: 14990,
    minutes: 90,
    requests: "Até 4 alterações",
    items: [
      "Todos os benefícios do Premium",
      "Até 4 solicitações de alterações por mês",
      "Atualização de banners, imagens e conteúdos",
      "Monitoramento mais frequente do site",
      "Verificação de SEO técnico básico",
      "Análise básica de acessos, quando disponível",
      "Verificação de formulários, integrações e funcionalidades",
      "Backup e orientação de recuperação, quando tecnicamente disponíveis",
      "Atendimento prioritário especial",
      "Relatório mensal de acompanhamento",
      "Até 90 minutos de ajustes mensais",
    ],
  },
];

export function maintenanceMessage(p: Pick<MaintenancePlan, "name" | "price_cents">) {
  return `Olá! Vim pelo site da Raster Digital e quero contratar o Plano de Manutenção ${p.name} (${money(p.price_cents)}/mês). Podemos conversar?`;
}

const TIER_ICON = { essencial: ShieldCheck, premium: Sparkles, platinum: Crown } as const;

export default function Maintenance() {
  const { settings } = useContent();
  const phone = settings.contact.whatsapp;

  return (
    <section id="manutencao" className="section section--alt">
      <div className="shell">
        <SectionHead
          center
          eyebrow="Planos de manutenção"
          title={<>Seu site não precisa apenas estar no ar. <span className="grad">Ele precisa continuar evoluindo.</span></>}
          sub="Com os planos de manutenção da Raster Digital, seu negócio conta com acompanhamento técnico, atualizações e suporte para manter sua presença digital funcionando."
        />

        <div className="mplans">
          {MAINTENANCE_PLANS.map((p, i) => {
            const Icon = TIER_ICON[p.tier];
            const hl = p.tier === "premium";
            return (
              <Reveal as="article" key={p.tier} delay={i * 0.06} className={`plan mplan mplan--${p.tier}`}>
                {hl && <span className="plan__badge mplan__badge">Mais recomendado</span>}
                {p.tier === "platinum" && <span className="plan__badge mplan__badge mplan__badge--plat">Exclusivo</span>}
                <p className="mplan__num">Plano {p.number}</p>
                <h3 className="mplan__name"><span className="icon-tile icon-tile--sm"><Icon size={18} /></span>{p.name}</h3>
                <p className="plan__desc">{p.tagline}</p>
                <p className="plan__price mplan__price">
                  {money(p.price_cents)}<span>/mês</span>
                </p>
                <p className="mplan__limits">
                  <span>{p.requests}</span>
                  <span>{p.minutes} min de ajustes</span>
                </p>
                <ul className="plan__scope mplan__scope">
                  {p.items.map((it) => <li key={it}><Check size={14} /> {it}</li>)}
                </ul>
                <a
                  className={`btn ${hl ? "btn--primary" : "btn--outline"} btn--block mplan__cta`}
                  href={waLink(phone, maintenanceMessage(p))}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-plan={p.tier}
                >
                  <FaWhatsapp size={17} /> Contratar {p.name}
                </a>
              </Reveal>
            );
          })}
        </div>

        <p className="mplans__note">
          Limites de tempo e de solicitações são mensais e não acumulativos: o que não for usado no mês não passa para o mês seguinte.
          Os planos contemplam manutenção e ajustes dentro dos limites contratados. Desenvolvimento de novas funcionalidades, sistemas,
          páginas adicionais, redesign completo e serviços extraordinários são orçados separadamente. Hospedagem e domínio não estão
          inclusos, salvo contratação específica.
        </p>
      </div>
    </section>
  );
}
