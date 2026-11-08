// ==========================================
// CONFIGURAÇÕES GERAIS DA RASTER DIGITAL
// Altere aqui contatos e links — o site inteiro usa estes valores.
// ==========================================

export const SITE = {
  name: "Raster Digital",
  url: "https://rasterdigital.com.br",
  // DDI + DDD + número, somente dígitos
  whatsapp: "5585986275389",
  whatsappDisplay: "(85) 98627-5389",
  email: "contato@rasterdigital.com",
  city: "Fortaleza — CE",
  founder: "Antonio Matos",
  social: {
    linkedin: "https://www.linkedin.com/in/antonio-matos-9671a5207/",
    github: "https://github.com/AntonioFerreiraDeMatos",
    instagram: "", // preencha com o link do Instagram quando existir
  },
};

/** Monta o link do WhatsApp com mensagem pronta conforme o contexto. */
export function waLink(context?: string) {
  const base = "Olá! Vim pelo site da Raster Digital";
  const text = context ? `${base} e tenho interesse em ${context}.` : `${base} e gostaria de conversar sobre o meu negócio.`;
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** Preenche o formulário de proposta com segmento/serviço e rola até ele. */
export function goToProposal(prefill?: { segment?: string; service?: string }) {
  if (prefill) window.dispatchEvent(new CustomEvent("raster:prefill", { detail: prefill }));
  document.getElementById("proposta")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
