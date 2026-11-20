// Conteúdo da página inicial entregue já no HTML: texto legível por buscadores e IAs que
// não executam JavaScript, e dados estruturados (Schema.org). O React substitui o texto ao carregar.
import faq from "../../src/data/faq.json" with { type: "json" };
import problems from "../../src/data/problems.json" with { type: "json" };

const SITE = "https://rasterdigital.com.br";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const brl = (cents) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const price = (s) => (s.price_cents == null ? "sob orçamento" : `${s.price_from ? "a partir de " : ""}${brl(s.price_cents)}`);

export function buildSsrHtml({ services, projects, settings }) {
  const h = settings.hero || {};
  const c = settings.contact || {};
  const f = settings.founder || {};
  // Mesma hierarquia da página: H1 = palavra-chave local (hero.eyebrow); o título grande vem em seguida.
  return `<div class="ssr">
<h1>${esc(h.eyebrow || h.title)}</h1>
<p><strong>${esc(h.title)} ${esc(h.highlight)}</strong></p>
<p>${esc(h.subtitle)} Criação de sites profissionais, landing pages, lojas virtuais, cardápios digitais, sistemas e dashboards em Caucaia, Fortaleza e Região Metropolitana, para empresas de todo o Brasil.</p>
${h.intro ? `<p>${esc(h.intro)}</p>` : ""}
${f.course ? `<p>${esc(f.name)}: ${esc(f.course)}${f.school ? ` — ${esc(f.school)}` : ""}${f.graduation ? ` (${esc(f.graduation)})` : ""}.</p>` : ""}
<h2>Quantas oportunidades seu negócio pode estar perdendo?</h2>
<ul>${problems.map((p) => `<li><strong>${esc(p.title)}</strong>: ${esc(p.text)}</li>`).join("")}</ul>
<h2>Serviços e preços</h2>
<ul>${services.map((s) => `<li><strong>${esc(s.name)}</strong> (${esc(price(s))}): ${esc(s.description)}</li>`).join("")}</ul>
<h2>Projetos publicados</h2>
<ul>${projects.map((p) => `<li><a href="${esc(p.url || SITE)}">${esc(p.client)}</a>: ${esc(p.title)}. ${esc(p.summary)}</li>`).join("")}</ul>
${f.name ? `<h2>Quem desenvolve: ${esc(f.name)}</h2>
${String(f.text || "").split(/\n\s*\n/).filter((x) => x.trim()).map((x) => `<p>${esc(x.trim())}</p>`).join("")}
<ul>${(f.highlights || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
<h2>Dúvidas frequentes</h2>
${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}
<p>WhatsApp: <a href="https://wa.me/${esc(c.whatsapp)}">${esc(c.whatsappDisplay)}</a> · ${esc(c.city)}</p>
</div>`;
}

export function buildJsonLd({ services }) {
  const graph = [
    {
      "@type": "OfferCatalog",
      "@id": `${SITE}/#servicos`,
      name: "Serviços da Raster Digital",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.name, description: s.description, areaServed: "BR", provider: { "@id": `${SITE}/#empresa` } },
        ...(s.price_cents == null ? {} : { price: (s.price_cents / 100).toFixed(2), priceCurrency: "BRL" }),
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#duvidas`,
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}
