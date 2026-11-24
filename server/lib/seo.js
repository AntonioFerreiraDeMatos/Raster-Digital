// SEO entregue já no HTML: texto legível por buscadores e IAs que não executam JavaScript,
// metadados de cada página e dados estruturados (Schema.org). O React substitui o texto ao carregar.
// Tudo é montado com os dados reais (banco + src/data); nada de avaliações, endereços ou números inventados.
import home from "../../src/data/home.json" with { type: "json" };
import { money, priceText, startingPrice } from "../../src/shared/format.js";
import { SITE } from "./pages.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const OG_IMAGE = { url: `${SITE}/img/og-raster.jpg`, width: 1200, height: 630, alt: "Logo da Raster Digital: Seu negócio precisa de soluções digitais. A Raster Digital desenvolve." };
const CATEGORY = { presenca: "Sites e presença digital", comercial: "Lojas e sistemas comerciais", profissional: "Sistemas profissionais" };

/** Links principais, repetidos no HTML para buscadores (o menu visual é montado pelo React). */
const MAIN_LINKS = [
  ["/criacao-de-sites", "Criação de sites"],
  ["/loja-virtual", "Loja virtual"],
  ["/cardapio-digital", "Cardápio digital"],
  ["/sistemas-personalizados", "Sistemas personalizados"],
  ["/painel-administrativo", "Painel administrativo"],
  ["/criacao-de-sites-fortaleza", "Criação de sites em Fortaleza"],
  ["/criacao-de-sites-caucaia", "Criação de sites em Caucaia"],
  ["/projetos", "Projetos"],
  ["/precos", "Preços"],
  ["/privacidade", "Política de privacidade"],
];
const AREA = [
  { "@type": "City", name: "Fortaleza" },
  { "@type": "City", name: "Caucaia" },
  { "@type": "AdministrativeArea", name: "Região Metropolitana de Fortaleza" },
  { "@type": "State", name: "Ceará" },
  { "@type": "Country", name: "Brasil" },
];

const jsonLd = (graph) =>
  `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
const paragraphs = (text) => String(text || "").split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
const navHtml = () => `<nav aria-label="Páginas"><ul>${MAIN_LINKS.map(([p, l]) => `<li><a href="${p}">${esc(l)}</a></li>`).join("")}</ul></nav>`;
const contactHtml = (c) => `<p>WhatsApp: <a href="https://wa.me/${esc(c.whatsapp)}">${esc(c.whatsappDisplay)}</a> · ${esc(c.city)}</p>`;

/* ---------------- Dados estruturados ---------------- */

/** A empresa (mesmo @id em todas as páginas). */
function orgNode({ services, settings }) {
  const c = settings.contact || {};
  const f = settings.founder || {};
  const priced = services.filter((s) => s.price_cents != null).map((s) => s.price_cents);
  const open = services.some((s) => s.price_from || s.price_cents == null);
  const w = String(c.whatsapp || "");
  return {
    "@type": "ProfessionalService",
    "@id": `${SITE}/#empresa`,
    name: "Raster Digital",
    url: `${SITE}/`,
    logo: `${SITE}/img/logo-square.png`,
    image: [`${SITE}/img/og-raster-1x1.jpg`, `${SITE}/img/og-raster-4x3.jpg`, `${SITE}/img/og-raster.jpg`],
    description:
      "Desenvolvimento de sites, sistemas e soluções digitais personalizadas para empresas de Fortaleza, Caucaia e Região Metropolitana, e de todo o Brasil: presença digital, gestão inteligente e soluções sob medida.",
    slogan: "Tecnologia que se adapta ao seu negócio.",
    ...(priced.length ? { priceRange: `${money(Math.min(...priced))} - ${money(Math.max(...priced))}${open ? "+" : ""}` } : {}),
    knowsAbout: ["Criação de sites", "Landing page", "Loja virtual", "E-commerce", "Cardápio digital", "Painel administrativo", "Sistemas de gestão", "ERP", "CRM", "Automação de processos", "Integrações", "Desenvolvimento de software sob medida", "SEO"],
    ...(w.length >= 12 ? { telephone: `+${w.slice(0, 2)}-${w.slice(2, 4)}-${w.slice(4, -4)}-${w.slice(-4)}` } : {}),
    areaServed: AREA,
    address: { "@type": "PostalAddress", addressLocality: "Fortaleza", addressRegion: "CE", addressCountry: "BR" },
    ...(f.name ? { founder: { "@type": "Person", name: f.name, jobTitle: f.role || "Fundador" } } : {}),
    sameAs: [c.instagram, c.linkedin, c.github].filter(Boolean),
  };
}
const websiteNode = { "@type": "WebSite", "@id": `${SITE}/#site`, url: `${SITE}/`, name: "Raster Digital", inLanguage: "pt-BR", publisher: { "@id": `${SITE}/#empresa` } };

export function buildHomeJsonLd(content) {
  return jsonLd([orgNode(content), websiteNode]);
}

function pageGraph(page, content) {
  const url = SITE + page.path;
  const last = page.breadcrumb.length - 1;
  const graph = [
    orgNode(content),
    websiteNode,
    {
      "@type": page.kind === "projetos" ? "CollectionPage" : "WebPage",
      "@id": `${url}#pagina`,
      url,
      name: page.title,
      description: page.description,
      inLanguage: "pt-BR",
      isPartOf: { "@id": `${SITE}/#site` },
      about: { "@id": `${SITE}/#empresa` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: page.breadcrumb.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: SITE + (b.path ?? (i === last ? page.path : "/")),
      })),
    },
  ];
  const svc = page.schema?.service;
  if (svc) {
    graph.push({
      "@type": "Service",
      "@id": `${url}#servico`,
      name: svc.name,
      serviceType: svc.serviceType,
      description: page.description,
      url,
      provider: { "@id": `${SITE}/#empresa` },
      areaServed: page.schema.city ? [{ "@type": "City", name: page.schema.city }] : AREA,
    });
  }
  if (page.kind === "precos") {
    graph.push({
      "@type": "OfferCatalog",
      "@id": `${url}#servicos`,
      name: "Serviços da Raster Digital",
      itemListElement: content.services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.name, description: s.description, provider: { "@id": `${SITE}/#empresa` } },
        ...(s.price_cents == null || s.price_from ? {} : { price: (s.price_cents / 100).toFixed(2), priceCurrency: "BRL" }),
      })),
    });
  }
  if (page.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#duvidas`,
      mainEntity: page.faq.map((q) => ({ "@type": "Question", name: q.q, acceptedAnswer: { "@type": "Answer", text: q.a } })),
    });
  }
  return graph;
}

/** <title>, descrição, canonical, Open Graph e dados estruturados de uma página interna. */
export function buildPageHead(page, content) {
  const url = SITE + page.path;
  return `<title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="Raster Digital" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(page.title)}" />
    <meta property="og:description" content="${esc(page.description)}" />
    <meta property="og:image" content="${OG_IMAGE.url}" />
    <meta property="og:image:width" content="${OG_IMAGE.width}" />
    <meta property="og:image:height" content="${OG_IMAGE.height}" />
    <meta property="og:image:alt" content="${esc(OG_IMAGE.alt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    ${jsonLd(pageGraph(page, content))}`;
}

/* ---------------- Texto para buscadores ---------------- */

const projectsList = (projects) =>
  `<ul>${projects.map((p) => `<li><a href="/projetos/${esc(p.slug)}">${esc(p.client)}</a>: ${esc(p.title)}. ${esc(p.summary)}</li>`).join("")}</ul>`;

export function buildHomeSsr({ services, projects, settings }) {
  const h = settings.hero || {};
  const f = settings.founder || {};
  const c = settings.contact || {};
  const { pillars, differentials, steps } = home;
  return `<div class="ssr">
<h1>${esc(h.eyebrow || h.title)}</h1>
<p><strong>${esc(h.title)} ${esc(h.highlight)}</strong></p>
<p>${esc(h.subtitle)}</p>
<h2>${esc(pillars.title)}</h2>
<p>${esc(pillars.sub)}</p>
${pillars.items.map((p) => `<h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
<p>${esc(startingPrice(services, p.priceFrom) || "Sob orçamento")} · <a href="${p.link.path}">${esc(p.link.label)}</a></p>`).join("\n")}
<h2>${esc(differentials.title)}</h2>
<ul>${differentials.items.map((d) => `<li><strong>${esc(d.title)}</strong>: ${esc(d.text)}</li>`).join("")}</ul>
<h2>${esc(steps.title)}</h2>
<ol>${steps.items.map((s) => `<li><strong>${esc(s.title)}</strong>: ${esc(s.text)}</li>`).join("")}</ol>
<h2>Projetos realizados</h2>
${projectsList(projects)}
${f.name ? `<h2>Quem desenvolve o seu projeto</h2><p>${esc(f.name)}, ${esc(String(f.role || "").toLowerCase())} da Raster Digital.${f.course ? ` ${esc(f.course)}${f.school ? ` — ${esc(f.school)}` : ""}${f.graduation ? ` (${esc(f.graduation)})` : ""}.` : ""}</p>
${paragraphs(f.text).map((x) => `<p>${esc(x)}</p>`).join("")}` : ""}
<h2>Tem um projeto em mente?</h2>
<p>Conte o que sua empresa precisa. Vamos entender sua necessidade e desenvolver uma solução adequada ao seu negócio.</p>
${contactHtml(c)}
${navHtml()}
</div>`;
}

function sectionHtml(s, content, page) {
  const { services, projects, settings } = content;
  const head = s.title ? `<h2>${esc(s.title)}</h2>${s.sub ? `<p>${esc(s.sub)}</p>` : ""}` : "";
  switch (s.type) {
    case "text":
      return head + s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
    case "cards":
      return head + s.items.map((i) => `<h3>${esc(i.title)}</h3><p>${esc(i.text)}</p>`).join("");
    case "checklist":
      return `${head}<ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
    case "steps":
      return `${head}<ol>${s.items.map((i) => `<li><strong>${esc(i.title)}</strong>: ${esc(i.text)}</li>`).join("")}</ol>`;
    case "offers": {
      const items = s.items
        .map((o) => {
          if (!o.service) return `<li><strong>${esc(o.name)}</strong> (sob orçamento): ${esc(o.description)}</li>`;
          const svc = services.find((x) => x.slug === o.service);
          return svc ? `<li><strong>${esc(svc.name)}</strong> (${esc(priceText(svc))}): ${esc(svc.description)}</li>` : "";
        })
        .join("");
      return `${head}<ul>${items}</ul>${s.note ? `<p>${esc(s.note)}</p>` : ""}`;
    }
    case "cases":
      return head + projectsList(s.projects.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean));
    case "segments":
      return `${head}<ul>${(settings.segments || []).map((g) => `<li>${esc(g.name)}: ${esc(g.items.join(", "))}</li>`).join("")}</ul>`;
    case "pricing":
      return `<h2>Serviços e preços</h2>${Object.entries(CATEGORY)
        .map(([key, label]) => {
          const list = services.filter((x) => x.category === key);
          return list.length ? `<h3>${esc(label)}</h3><ul>${list.map((x) => `<li><strong>${esc(x.name)}</strong> (${esc(priceText(x))}): ${esc(x.description)}</li>`).join("")}</ul>` : "";
        })
        .join("")}`;
    case "hosting": {
      const hs = settings.hosting || {};
      return `<h2>${esc(hs.headline)}</h2><ul>${(hs.included || []).map((i) => `<li>${esc(i)}</li>`).join("")}</ul><p>${esc(hs.note)}</p>`;
    }
    case "maintenance": {
      const m = settings.maintenancePlans || {};
      return `<h2>${esc(m.title)} ${esc(m.highlight)}</h2><p>${esc(m.subtitle)}</p><ul>${(m.plans || [])
        .map((p) => `<li><strong>${esc(p.name)}</strong> (${esc(money(p.price_cents))}/mês): ${esc(p.tagline)}</li>`)
        .join("")}</ul><p>${esc(m.note)}</p>`;
    }
    case "simulator":
      return "<h2>Simulador de orçamento</h2><p>Escolha o tipo de projeto, a complexidade, as funcionalidades adicionais e o plano de manutenção para ver uma estimativa. O valor final vem na proposta.</p>";
    case "projects":
      return `<h2>Projetos</h2>${projectsList(projects)}`;
    case "case": {
      const p = projects.find((x) => x.slug === page.project);
      const info = page.case || {};
      if (!p) return "";
      return [
        info.need && `<h2>Necessidade do cliente</h2><p>${esc(info.need)}</p>`,
        info.solution && `<h2>Solução desenvolvida</h2><p>${esc(info.solution)}</p>`,
        `<h2>O que foi desenvolvido</h2><ul>${(info.features?.length ? info.features : p.features).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`,
        info.goal && `<h2>Objetivo</h2><p>${esc(info.goal)}</p>`,
        p.url && `<p><a href="${esc(p.url)}" rel="noopener">Conhecer o projeto ${esc(p.client)}</a></p>`,
      ].filter(Boolean).join("");
    }
    default:
      return "";
  }
}

export function buildPageSsr(page, content) {
  const c = content.settings.contact || {};
  const crumbs = page.breadcrumb.map((b) => (b.path ? `<li><a href="${b.path}">${esc(b.name)}</a></li>` : `<li>${esc(b.name)}</li>`)).join("");
  return `<div class="ssr">
<nav aria-label="Navegação estrutural"><ol>${crumbs}</ol></nav>
<p>${esc(page.hero.eyebrow)}</p>
<h1>${esc(page.hero.h1)}</h1>
<p>${esc(page.hero.lead)}</p>
${page.sections.map((s) => sectionHtml(s, content, page)).join("\n")}
${page.faq?.length ? `<h2>Dúvidas frequentes</h2>${page.faq.map((q) => `<h3>${esc(q.q)}</h3><p>${esc(q.a)}</p>`).join("")}` : ""}
${page.related?.length ? `<h2>Veja também</h2><ul>${page.related.map((r) => `<li><a href="${r.path}">${esc(r.label)}</a>${r.text ? `: ${esc(r.text)}` : ""}</li>`).join("")}</ul>` : ""}
${page.cta ? `<h2>${esc(page.cta.title)}</h2><p>${esc(page.cta.text)}</p>` : ""}
${contactHtml(c)}
${navHtml()}
</div>`;
}
