import { useEffect, useState } from "react";
import { useSiteContent, type Content, type PageDef } from "../lib/content";
import SiteShell, { Boot } from "../components/SiteShell";
import Faq from "../components/Faq";
import LeadForm from "../components/LeadForm";
import { PageHero, Related, Section } from "./PageSections";

/**
 * Páginas internas (serviços, cidades, preços e projetos). O servidor embute o conteúdo e a página pronta;
 * em desenvolvimento (Vite), a página é buscada em /api/page?path=… (use /pagina.html?p=/criacao-de-sites).
 */
export default function PageApp() {
  const { content, failed } = useSiteContent("/api/content");
  const [page, setPage] = useState<PageDef | null>(content?.page ?? null);
  const [pageFailed, setPageFailed] = useState(false);

  useEffect(() => {
    if (page || !content) return;
    const path = new URLSearchParams(location.search).get("p") || location.pathname;
    fetch(`/api/page?path=${encodeURIComponent(path)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { page: PageDef }) => setPage(d.page))
      .catch(() => setPageFailed(true));
  }, [page, content]);

  if (!content || !page) return <Boot failed={failed || pageFailed} />;
  return <PageView content={content} page={page} />;
}

function PageView({ content, page }: { content: Content; page: PageDef }) {
  return (
    <SiteShell content={content}>
      <PageHero page={page} />
      {page.sections.map((s, i) => <Section key={`${s.type}-${i}`} s={s} page={page} alt={i % 2 === 1} />)}
      {page.faq && <Faq items={page.faq} />}
      {page.related && <Related items={page.related} />}
      <LeadForm eyebrow="Orçamento sem compromisso" title={page.cta?.title} text={page.cta?.text} />
    </SiteShell>
  );
}
