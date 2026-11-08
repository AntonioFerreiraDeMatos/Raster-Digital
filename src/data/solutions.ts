import type { LucideIcon } from "lucide-react";
import { Pizza, Scissors, Stethoscope, Sandwich, ShoppingBag, Sparkles } from "lucide-react";

export type Solution = {
  id: string;
  icon: LucideIcon;
  title: string;
  problem: string;
  solution: string;
  benefit: string;
  items: string[];
  /** Pré-seleção no formulário */
  segment: string;
  service: string;
  whatsappContext: string;
};

export const solutions: Solution[] = [
  {
    id: "pizzarias",
    icon: Pizza,
    title: "Pizzarias e restaurantes",
    problem: "Pedidos chegando picados no WhatsApp, cardápio desatualizado e cliente esperando resposta.",
    solution: "Cardápio digital com pedido online organizado, que já chega pronto no seu WhatsApp.",
    benefit: "Menos tempo digitando, menos erro no pedido e mais tempo para a cozinha.",
    items: ["Cardápio digital", "Pedidos online", "Fotos dos produtos", "Integração com WhatsApp"],
    segment: "pizzaria",
    service: "site",
    whatsappContext: "um cardápio digital com pedidos online para minha pizzaria/restaurante",
  },
  {
    id: "barbearias",
    icon: Scissors,
    title: "Barbearias",
    problem: "Horários marcados de cabeça ou no caderno, conflitos de agenda e clientes que esquecem.",
    solution: "Agendamento online com serviços, preços e profissionais, e um painel para você controlar tudo.",
    benefit: "Agenda cheia e organizada, sem precisar parar o corte para responder mensagem.",
    items: ["Agendamento online", "Tabela de preços", "Profissionais", "Painel administrativo"],
    segment: "barbearia",
    service: "sistema",
    whatsappContext: "um sistema de agendamento online para minha barbearia",
  },
  {
    id: "clinicas",
    icon: Stethoscope,
    title: "Clínicas e consultórios",
    problem: "Pacientes não encontram informações confiáveis sobre seus serviços e especialidades.",
    solution: "Site profissional com especialidades, equipe e solicitação de agendamento.",
    benefit: "Mais confiança antes da primeira consulta e contatos já qualificados.",
    items: ["Apresentação profissional", "Especialidades", "Formulário de contato", "Pedido de agendamento"],
    segment: "clinica",
    service: "site",
    whatsappContext: "um site profissional para minha clínica",
  },
  {
    id: "lanchonetes",
    icon: Sandwich,
    title: "Lanchonetes",
    problem: "Cliente pergunta preço, horário e taxa de entrega toda vez — e às vezes desiste.",
    solution: "Catálogo digital com preços, pedidos e informações de entrega em um único link.",
    benefit: "Atendimento mais rápido nos horários de pico e um link fácil de divulgar.",
    items: ["Cardápio digital", "Catálogo", "Informações de entrega", "Contato facilitado"],
    segment: "lanchonete",
    service: "site",
    whatsappContext: "um cardápio digital para minha lanchonete",
  },
  {
    id: "lojas",
    icon: ShoppingBag,
    title: "Lojas de roupas e cosméticos",
    problem: "Vender só pelo direct e pelo WhatsApp limita o alcance e bagunça o controle de pedidos.",
    solution: "Catálogo ou loja virtual com carrinho, gestão de produtos, pedidos e clientes.",
    benefit: "Sua loja aberta 24 horas, com o estoque e os pedidos sob controle.",
    items: ["Loja virtual", "Gestão de produtos", "Pedidos", "Relacionamento com clientes"],
    segment: "loja",
    service: "loja_virtual",
    whatsappContext: "uma loja virtual para o meu negócio",
  },
  {
    id: "outros",
    icon: Sparkles,
    title: "Outros negócios",
    problem: "Seu negócio tem uma rotina própria, e soluções prontas não se encaixam nela.",
    solution: "Entendemos seu processo e desenvolvemos a solução sob medida para a sua operação.",
    benefit: "Uma ferramenta feita para o seu jeito de trabalhar, não o contrário.",
    items: ["Oficinas e automotivo", "Prestadores de serviços", "Sistemas sob medida", "Automação de processos"],
    segment: "outro",
    service: "orientacao",
    whatsappContext: "uma solução digital personalizada para o meu negócio",
  },
];
