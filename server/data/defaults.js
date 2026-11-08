// Conteúdo inicial gravado no banco apenas quando as tabelas estão vazias.
// Depois disso, tudo é editado pelo painel administrativo (/admin).
// Escopos e limites são uma PROPOSTA INICIAL — revise no painel antes de divulgar.

const R = (reais) => Math.round(reais * 100);
const common = "1 rodada de ajustes após a entrega · Versão para celular · 12 meses de hospedagem grátis";

export const services = [
  // Sites e presença digital
  { slug: "landing-page", category: "presenca", name: "Landing Page", price: 249, hosting: 99,
    description: "Uma página objetiva para apresentar sua oferta e gerar contatos.",
    scope: ["1 página com até 6 seções", "Botão de WhatsApp e formulário de contato", "Otimização básica para o Google", common] },
  { slug: "cardapio-digital", category: "presenca", name: "Cardápio Digital", price: 299, hosting: 119, highlight: 1,
    description: "Cardápio com fotos e preços, pedido direto no WhatsApp.",
    scope: ["Até 60 itens em até 8 categorias", "Pedido montado e enviado pelo WhatsApp", "QR Code para mesas e balcão", "Você atualiza preços e itens", common] },
  { slug: "site-institucional", category: "presenca", name: "Site Institucional", price: 399, hosting: 149,
    description: "Sua empresa apresentada com credibilidade e fácil de encontrar.",
    scope: ["Até 5 páginas", "Formulário de contato, WhatsApp e mapa", "Otimização básica para o Google", common] },
  { slug: "catalogo-digital", category: "presenca", name: "Catálogo Digital", price: 399, hosting: 149,
    description: "Seus produtos organizados, com pedido pelo WhatsApp.",
    scope: ["Até 100 produtos com categorias", "Pedido enviado pelo WhatsApp", "Sem pagamento online", common] },

  // Lojas e sistemas comerciais
  { slug: "loja-virtual", category: "comercial", name: "Loja Virtual Essencial", price: 499, hosting: 249, highlight: 1,
    description: "Venda pela internet com carrinho, pedidos e Pix.",
    scope: ["Até 100 produtos", "Carrinho e registro de pedidos", "Pagamento por Pix (confirmação manual)", "Painel de pedidos · 1 usuário administrador", common] },
  { slug: "agendamento", category: "comercial", name: "Sistema de Agendamento", price: 599, hosting: 299,
    description: "Clientes marcam horário sozinhos, você acompanha tudo.",
    scope: ["Até 3 profissionais", "Serviços, horários e agenda online", "Painel administrativo · até 2 usuários", common] },
  { slug: "controle-estoque", category: "comercial", name: "Controle de Estoque", price: 799, hosting: 299,
    description: "Entradas, saídas e alerta de estoque baixo.",
    scope: ["Até 1.000 produtos", "Entradas, saídas e estoque mínimo", "Relatório simples de movimentação", "Até 3 usuários", common] },
  { slug: "vendas-clientes", category: "comercial", name: "Sistema de Vendas e Clientes", price: 899, hosting: 299,
    description: "Vendas registradas e histórico de cada cliente.",
    scope: ["Cadastro de clientes e vendas", "Histórico por cliente", "Relatórios básicos", "Até 3 usuários", common] },
  { slug: "dashboard", category: "comercial", name: "Dashboard Administrativo", price: 899, hosting: 299,
    description: "Os números do seu negócio em um só lugar.",
    scope: ["Até 6 indicadores", "Filtros por período", "Dados do sistema ou de planilha", "Até 3 usuários", common] },

  // Sistemas profissionais
  { slug: "rh-basico", category: "profissional", name: "Sistema Básico de RH", price: 999, hosting: 299,
    description: "Funcionários, documentos e férias organizados.",
    scope: ["Até 50 funcionários", "Departamentos, documentos e férias", "Controle de acesso por usuário (LGPD)", "Até 3 usuários", common] },
  { slug: "gestao-barbearia", category: "profissional", name: "Gestão para Barbearias", price: 899, hosting: 299,
    description: "Agenda, clientes, serviços e profissionais.",
    scope: ["Até 5 profissionais", "Agendamento, clientes e histórico", "Serviços e preços", "Até 3 usuários", common] },
  { slug: "gestao-restaurante", category: "profissional", name: "Gestão para Restaurantes", price: 999, hosting: 299,
    description: "Cardápio, pedidos e vendas sob controle.",
    scope: ["Cardápio e pedidos", "QR Code para até 20 mesas", "Relatório de vendas", "Até 3 usuários", common] },
  { slug: "advocacia", category: "profissional", name: "Sistema para Advocacia", price: 1499, hosting: 299,
    description: "Clientes, processos e prazos organizados.",
    scope: ["Clientes e processos (cadastro manual, sem integração com tribunais)", "Agenda de prazos", "Documentos e dashboard", "Controle de acesso (LGPD) · até 3 usuários", common] },
  { slug: "financeiro", category: "profissional", name: "Sistema Financeiro", price: 1299, hosting: 299,
    description: "Contas a pagar e receber e fluxo de caixa.",
    scope: ["Contas a pagar e a receber", "Categorias e fluxo de caixa", "Relatórios mensais", "Até 3 usuários", common] },
  { slug: "administrativo", category: "profissional", name: "Sistema Administrativo Empresarial", price: 1499, hosting: 299,
    description: "Os processos da sua empresa em um sistema.",
    scope: ["Até 4 módulos definidos no planejamento", "Dashboard de indicadores", "Até 5 usuários", common] },
  { slug: "personalizado", category: "profissional", name: "Sistema Personalizado", price: 1500, priceFrom: 1, hosting: null,
    description: "Feito sob medida para a sua operação.",
    scope: ["Escopo definido após análise", "Proposta com prazos e etapas", "Hospedagem conforme a necessidade do projeto"] },
].map((s, i) => ({ ...s, price_cents: s.price == null ? null : R(s.price), hosting_cents: s.hosting == null ? null : R(s.hosting), sort: i }));

export const projects = [
  {
    slug: "amanda-cosmeticos", client: "Amanda Cosméticos", title: "Loja virtual", segment: "Beleza e cosméticos",
    summary: "Loja virtual com catálogo, carrinho, pedidos com Pix e painel administrativo próprio.",
    url: "https://www.amandacosmeticos.com.br", theme: "beleza",
    features: ["Catálogo de produtos", "Carrinho e pedidos", "Pagamento via Pix", "Painel administrativo", "Gestão de clientes", "Integração com WhatsApp"],
    logo_url: "/img/brands/amanda-cosmeticos.webp", cover_url: "/img/amanda-desktop.webp", mobile_url: "/img/amanda-mobile.webp",
    gallery: [], video_url: null,
  },
  {
    slug: "js-retifica", client: "JS Retífica", title: "Site institucional", segment: "Retífica de motores",
    summary: "Presença digital com identidade industrial para apresentar serviços de retífica de motores e cabeçotes.",
    url: "https://www.jsretifica.com.br/", theme: "industrial",
    features: ["Serviços de retífica", "Motores e cabeçotes", "Identidade industrial", "Contato pelo WhatsApp", "Versão para celular"],
    logo_url: "/img/brands/js-retifica.webp", cover_url: "/img/projects/js-desktop.webp", mobile_url: "/img/projects/js-mobile.webp",
    gallery: ["/img/projects/js-motor-solda.webp", "/img/projects/js-cabecotes.webp", "/img/projects/js-bloco.webp"], video_url: null,
  },
].map((p, i) => ({ ...p, sort: i }));

export const brands = [
  { name: "Amanda Cosméticos", logo_url: "/img/brands/amanda-cosmeticos.webp", url: "https://www.amandacosmeticos.com.br", relation: "Cliente · Loja virtual" },
  { name: "JS Retífica", logo_url: "/img/brands/js-retifica.webp", url: "https://www.jsretifica.com.br/", relation: "Cliente · Site institucional" },
].map((b, i) => ({ ...b, sort: i }));

export const settings = {
  hero: {
    eyebrow: "Desenvolvimento de soluções digitais",
    title: "Seu negócio precisa de soluções digitais.",
    highlight: "A Raster Digital desenvolve.",
    subtitle: "Sites, lojas virtuais e sistemas sob medida, com preço fechado e sem mensalidade obrigatória.",
  },
  contact: {
    whatsapp: "5585986275389",
    whatsappDisplay: "(85) 98627-5389",
    instagram: "https://www.instagram.com/raster.digital/",
    linkedin: "https://www.linkedin.com/in/antonio-matos-9671a5207/",
    github: "https://github.com/AntonioFerreiraDeMatos",
    city: "Fortaleza — CE",
  },
  solutions: [
    { name: "Sites institucionais", text: "Credibilidade para sua empresa.", service: "site-institucional", icon: "globe" },
    { name: "Landing pages", text: "Uma página que gera contatos.", service: "landing-page", icon: "target" },
    { name: "Lojas virtuais", text: "Venda pela internet.", service: "loja-virtual", icon: "bag" },
    { name: "Cardápios digitais", text: "Pedidos direto no WhatsApp.", service: "cardapio-digital", icon: "menu" },
    { name: "Sistemas administrativos", text: "Processos organizados.", service: "administrativo", icon: "layout" },
    { name: "Dashboards", text: "Seus números em tempo real.", service: "dashboard", icon: "chart" },
    { name: "Sistemas de gestão", text: "Estoque, vendas e clientes.", service: "vendas-clientes", icon: "boxes" },
    { name: "Agendamento online", text: "Agenda cheia, sem confusão.", service: "agendamento", icon: "calendar" },
    { name: "Automação de processos", text: "Menos tarefa repetitiva.", service: null, icon: "zap" },
  ],
  maintenance: {
    price_cents: 5990,
    items: ["Monitoramento básico", "Correções técnicas", "Atualizações compatíveis", "Backup conforme a infraestrutura contratada", "Pequenos ajustes (até 30 min/mês)", "Suporte técnico básico"],
    note: "Opcional e sem fidelidade. Novas funcionalidades, integrações e grandes alterações são orçadas à parte.",
  },
  hosting: {
    headline: "12 meses de hospedagem grátis!",
    included: ["Site ou sistema no ar com HTTPS", "Banco de dados quando o projeto exigir", "Backup da infraestrutura"],
    notIncluded: ["Domínio (registro e renovação)", "Contas de e-mail profissional", "Serviços de terceiros (pagamentos, mensagens, APIs)", "Recursos ou infraestrutura acima do padrão do projeto"],
    note: "Após 12 meses, a renovação é anual, no valor indicado em cada plano. Hospedagem não inclui manutenção.",
  },
  founder: {
    name: "Antonio Matos",
    role: "Fundador e desenvolvedor",
    text: "Cuido de cada projeto do planejamento à entrega. Você fala direto com quem desenvolve.",
    highlights: [
      "Análise e Desenvolvimento de Sistemas — Universidade de Fortaleza (Unifor), conclusão prevista para 2026",
      "Projetos reais desenvolvidos e no ar",
      "Soluções pensadas para a rotina do seu negócio",
      "Compromisso com qualidade, prazos e organização",
    ],
  },
  segments: [
    { name: "Comércio e lojas", icon: "store", items: ["Estoque", "Produtos", "Vendas", "Clientes", "Relatórios"] },
    { name: "Restaurantes", icon: "utensils", items: ["Cardápio digital", "Pedidos", "QR Code", "Produtos", "Vendas"] },
    { name: "Advocacia", icon: "scale", items: ["Clientes", "Processos", "Prazos", "Documentos", "Dashboard"] },
    { name: "Recursos Humanos", icon: "users", items: ["Funcionários", "Documentos", "Férias", "Departamentos", "Indicadores"] },
    { name: "Barbearias e salões", icon: "scissors", items: ["Agendamento", "Clientes", "Serviços", "Profissionais", "Histórico"] },
    { name: "Empresas", icon: "building", items: ["Dashboards", "Indicadores", "Financeiro", "Operacional", "Relatórios"] },
  ],
  simulator: {
    complexity: [
      { id: "simples", label: "Simples", factor: 1 },
      { id: "intermediario", label: "Intermediário", factor: 1.3 },
      { id: "avancado", label: "Avançado", factor: null },
    ],
    addons: [
      { id: "paginas", label: "Mais páginas ou seções", price_cents: 12000 },
      { id: "painel", label: "Painel administrativo", price_cents: 20000 },
      { id: "login", label: "Área de login para clientes", price_cents: 25000 },
      { id: "pagamento", label: "Pagamento online automático", price_cents: 35000 },
      { id: "relatorios", label: "Relatórios em PDF ou Excel", price_cents: 18000 },
      { id: "usuarios", label: "Mais usuários e permissões", price_cents: 15000 },
      { id: "integracao", label: "Integração com outro sistema", price_cents: null },
    ],
  },
};
