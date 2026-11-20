// Gera o /llms.txt (resumo do site para assistentes de IA) com o conteúdo atual do banco.
const SITE = "https://rasterdigital.com.br";
const CATEGORIES = { presenca: "Sites e presença digital", comercial: "Lojas e sistemas comerciais", profissional: "Sistemas profissionais" };

const brl = (cents) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function buildLlmsTxt({ services, projects, settings }) {
  const c = settings.contact || {};
  const lines = [
    "# Raster Digital",
    "",
    "> Empresa de Fortaleza (CE) que desenvolve sites, landing pages, lojas virtuais, cardápios digitais, sistemas de agendamento e sistemas de gestão sob medida para pequenas e médias empresas, com preço fechado e sem mensalidade obrigatória.",
    "",
    `- Site: ${SITE}/`,
    `- Cidade: ${c.city || "Fortaleza — CE"} (atende todo o Brasil, de forma remota)`,
  ];
  if (c.whatsapp) lines.push(`- WhatsApp: ${c.whatsappDisplay || c.whatsapp} — https://wa.me/${c.whatsapp}`);
  if (c.instagram) lines.push(`- Instagram: ${c.instagram}`);
  if (c.linkedin) lines.push(`- LinkedIn: ${c.linkedin}`);
  lines.push("- Orçamento: formulário e simulador de preços em " + SITE + "/#contato", "");

  const n = Number(settings.payment?.installments) || 0;
  const pay = n >= 2 ? `pagamento único, em até ${n}x` : "pagamento único";
  lines.push("## Serviços e preços", "", `Valores de desenvolvimento (${pay}). Hospedagem anual informada quando se aplica; os 12 primeiros meses são grátis.`, "");
  for (const [key, title] of Object.entries(CATEGORIES)) {
    const list = services.filter((s) => s.category === key);
    if (!list.length) continue;
    lines.push(`### ${title}`, "");
    for (const s of list) {
      const price = s.price_cents == null ? "sob orçamento" : `${s.price_from ? "a partir de " : ""}${brl(s.price_cents)}`;
      const hosting = s.hosting_cents ? ` · hospedagem ${brl(s.hosting_cents)}/ano` : "";
      lines.push(`- **${s.name}** (${price}${hosting}): ${s.description}`);
    }
    lines.push("");
  }

  // Planos de manutenção atuais (o antigo "maintenance" não aparece mais no site)
  const plans = (settings.maintenancePlans?.plans || []).filter((p) => p?.name && p.price_cents > 0);
  if (plans.length) {
    lines.push("## Planos de manutenção (opcionais)", "");
    for (const p of plans) lines.push(`- **${p.name}** (${brl(p.price_cents)}/mês)${p.tagline ? `: ${p.tagline}` : ""}`);
    lines.push("", "Desenvolvimento de novas funcionalidades, páginas adicionais e redesign são orçados à parte.", "");
  }

  if (projects.length) {
    lines.push("## Projetos publicados", "");
    for (const p of projects) lines.push(`- [${p.client}](${p.url || SITE}): ${p.title} — ${p.summary}`);
    lines.push("");
  }

  lines.push("## Páginas", "", `- [Início](${SITE}/): serviços, preços, projetos e contato`, `- [Política de privacidade](${SITE}/privacidade)`, `- [Sitemap](${SITE}/sitemap.xml)`, "");
  return lines.join("\n");
}
