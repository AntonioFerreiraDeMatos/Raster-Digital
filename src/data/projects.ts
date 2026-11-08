// ==========================================
// PROJETOS REAIS DA RASTER DIGITAL
// Para adicionar um novo projeto, copie um objeto e preencha os campos.
// Use apenas projetos reais e com autorização do cliente.
// ==========================================

export type Project = {
  slug: string;
  client: string;
  title: string;
  segment: string;
  summary: string;
  url?: string;
  /** Imagens em /public/img */
  desktopImage?: string;
  mobileImage?: string;
  features: string[];
  /** Destaque grande (true) ou card compacto (false) */
  featured?: boolean;
  /**
   * Vídeo de depoimento (YouTube/Vimeo, formato embed).
   * Deixe vazio enquanto o vídeo não estiver gravado — o site mostra um espaço reservado.
   * Ex.: "https://www.youtube-nocookie.com/embed/ID_DO_VIDEO"
   */
  testimonialVideo?: string;
  testimonialPending?: boolean;
};

export const projects: Project[] = [
  {
    slug: "amanda-cosmeticos",
    client: "Amanda Cosméticos",
    title: "Plataforma de comércio digital",
    segment: "Loja de cosméticos",
    summary:
      "Uma loja virtual completa para a Amanda Cosméticos vender pela internet com a mesma atenção do atendimento presencial — do catálogo ao pedido confirmado no WhatsApp.",
    url: "https://www.amandacosmeticos.com.br",
    desktopImage: "/img/amanda-desktop.webp",
    mobileImage: "/img/amanda-mobile.webp",
    features: [
      "Loja virtual",
      "Catálogo de produtos",
      "Carrinho de compras",
      "Cadastro e gestão de pedidos",
      "Painel administrativo",
      "Gestão de clientes",
      "Controle de produtos",
      "Pagamento via Pix",
      "Integração com WhatsApp",
    ],
    featured: true,
    testimonialVideo: "",
    testimonialPending: true,
  },
  {
    slug: "js-retifica",
    client: "JS Retífica",
    title: "Site institucional",
    segment: "Oficina automotiva",
    summary: "Presença digital profissional para apresentar serviços e facilitar o contato de novos clientes.",
    url: "https://www.jsretifica.com.br/",
    desktopImage: "/img/jsretifica.webp",
    features: ["Apresentação dos serviços", "Contato pelo WhatsApp", "Versão para celular"],
  },
];
