// Gera o /llms.txt (resumo do site para assistentes de IA) com o conteúdo atual do banco.
import { money, installmentsOf } from "../../src/shared/format.js";
import { SITE } from "./pages.js";

const CATEGORIES = { presenca: "Sites e presença digital", comercial: "Lojas e sistemas comerciais", profissional: "Sistemas profissionais" };
const PAGES = [
  ["/", "Início", "apresentação, soluções, diferenciais, como funciona, projetos e contato"],
  ["/criacao-de-sites", "Criação de sites", "landing pages, sites institucionais e sites profissionais"],
  ["/loja-virtual", "Loja virtual", "do catálogo digital ao e-commerce avançado"],
  ["/cardapio-digital", "Cardápio digital", "pedidos enviados pelo WhatsApp, QR Code"],
  ["/sistemas-personalizados", "Sistemas personalizados", "ERP, CRM, financeiro, agendamento, automações e integrações"],
  ["/painel-administrativo", "Painel administrativo", "controle de pedidos, clientes, produtos, agenda e indicadores"],
  ["/criacao-de-sites-fortaleza", "Criação de sites em Fortaleza", "atendimento para empresas de Fortaleza"],
  ["/criacao-de-sites-caucaia", "Criação de sites em Caucaia", "comércio, serviços e turismo em Caucaia"],
  ["/precos", "Preços", "valores, hospedagem, planos de manutenção e simulador de orçamento"],
  ["/projetos", "Projetos", "portfólio com os cases publicados"],
  ["/privacidade", "Política de privacidade", "tratamento de dados (LGPD)"],
];

export function buildLlmsTxt({ services, projects, settings }) {
  const c = settings.contact || {};
  const lines = [
    "# Raster Digital",
    "",
    "> Empresa de tecnologia de Fortaleza (CE) que desenvolve sites, sistemas e soluções digitais personalizadas para empresas de diferentes segmentos: presença digital (sites, lojas virtuais, cardápios digitais), gestão inteligente (painéis administrativos, controle financeiro, agendamento, gestão de clientes) e soluções sob medida (ERP, CRM, automações e integrações). Atende Fortaleza, Caucaia, a Região Metropolitana e outras cidades do Brasil, de forma remota.",
    "",
    "Tecnologia que se adapta ao seu negócio.",
    "",
    `- Site: ${SITE}/`,
    `- Cidade: ${c.city || "Fortaleza — CE"} (atende Caucaia, Fortaleza e Região Metropolitana; demais cidades do Brasil de forma remota)`,
  ];
  const f = settings.founder || {};
  if (f.name) lines.push(`- Fundador: ${f.name} (atendimento direto com o fundador, do primeiro contato à entrega)`);
  if (c.whatsapp) lines.push(`- WhatsApp: ${c.whatsappDisplay || c.whatsapp} — https://wa.me/${c.whatsapp}`);
  if (c.instagram) lines.push(`- Instagram: ${c.instagram}`);
  if (c.linkedin) lines.push(`- LinkedIn: ${c.linkedin}`);
  lines.push(`- Orçamento: simulador em ${SITE}/precos#simulador e formulário em todas as páginas`, "");

  const n = installmentsOf(settings);
  const pay = n ? `pagamento único, em até ${n}x` : "pagamento único";
  lines.push("## Serviços e preços", "", `Valores iniciais de desenvolvimento (${pay}). O valor final é definido na proposta. Hospedagem anual informada quando se aplica; os 12 primeiros meses são grátis.`, "");
  for (const [key, title] of Object.entries(CATEGORIES)) {
    const list = services.filter((s) => s.category === key);
    if (!list.length) continue;
    lines.push(`### ${title}`, "");
    for (const s of list) {
      const price = s.price_cents == null ? "sob orçamento" : `${s.price_from ? "a partir de " : ""}${money(s.price_cents)}`;
      const hosting = s.hosting_cents ? ` · hospedagem ${money(s.hosting_cents)}/ano` : "";
      lines.push(`- **${s.name}** (${price}${hosting}): ${s.description}`);
    }
    lines.push("");
  }
  lines.push("Também desenvolvemos, sob orçamento: site profissional, e-commerce completo e avançado, painel administrativo, ERP, CRM, automações e integrações.", "");

  // Planos de manutenção atuais (o antigo "maintenance" não aparece mais no site)
  const plans = (settings.maintenancePlans?.plans || []).filter((p) => p?.name && p.price_cents > 0);
  if (plans.length) {
    lines.push("## Planos de manutenção (opcionais e sem fidelidade)", "");
    for (const p of plans) lines.push(`- **${p.name}** (${money(p.price_cents)}/mês)${p.tagline ? `: ${p.tagline}` : ""}`);
    lines.push("", "Manutenção é diferente de hospedagem. Novas funcionalidades, páginas adicionais e redesign são orçados à parte.", "");
  }

  if (projects.length) {
    lines.push("## Projetos publicados", "");
    for (const p of projects) lines.push(`- [${p.client}](${SITE}/projetos/${p.slug}): ${p.title} — ${p.summary}${p.url ? ` Site: ${p.url}` : ""}`);
    lines.push("");
  }

  lines.push("## Páginas", "", ...PAGES.map(([p, t, d]) => `- [${t}](${SITE}${p}): ${d}`), `- [Sitemap](${SITE}/sitemap.xml)`, "");
  return lines.join("\n");
}
