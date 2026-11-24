// Formatação de preços compartilhada entre o site (React) e o servidor (HTML para buscadores e llms.txt).
// Os valores vêm SEMPRE do banco (painel /admin); os textos das páginas usam marcadores que são trocados aqui.

const brlInt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brlDec = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

/** R$ 150 para valores inteiros; R$ 349,90 quando há centavos. */
export const money = (cents) => (cents % 100 === 0 ? brlInt : brlDec).format(cents / 100);

/** "R$ 449,90", "A partir de R$ 349,90" ou "Sob orçamento". */
export function priceLabel(s) {
  if (s.price_cents == null) return "Sob orçamento";
  return s.price_from ? `A partir de ${money(s.price_cents)}` : money(s.price_cents);
}

/** O mesmo preço para usar no meio de uma frase: "a partir de R$ 349,90", "R$ 449,90" ou "sob orçamento". */
export function priceText(s) {
  return priceLabel(s).replace(/^A partir de/, "a partir de").replace(/^Sob orçamento/, "sob orçamento");
}

/** Texto do parcelamento no site. O número de parcelas não aparece: o /admin só liga ou desliga (0). */
export const INSTALLMENTS_TEXT = "parcelamento facilitado";

/** Número de parcelas configurado no /admin (0 = parcelamento desligado). */
export function installmentsOf(settings) {
  const n = Math.trunc(Number(settings?.payment?.installments) || 0);
  return n >= 2 && n <= 12 ? n : 0;
}

/** "Parcelamento facilitado" nos cards; vazio quando não há preço ou o parcelamento está desligado. */
export function installmentLabel(cents, n) {
  if (cents == null || cents <= 0 || n < 2) return "";
  return "Parcelamento facilitado";
}

/** Menor preço entre os serviços ativos da lista: "A partir de R$ 349,90"; null se nenhum tiver preço. */
export function startingPrice(services, slugs) {
  const list = services.filter((s) => slugs.includes(s.slug) && s.price_cents != null);
  if (!list.length) return null;
  return `A partir de ${money(Math.min(...list.map((s) => s.price_cents)))}`;
}

/**
 * Troca os marcadores dos textos pelos dados atuais:
 * {{preco:slug}} → "a partir de R$ 349,90" / "R$ 449,90" / "sob orçamento" / "valor sob consulta" (serviço inativo)
 * {{parcelamento}} → ", com parcelamento facilitado" (ou vazio, se o parcelamento estiver desligado)
 */
export function fillText(text, services, settings) {
  if (typeof text !== "string" || !text.includes("{{")) return text;
  return text
    .replace(/\{\{preco:([a-z0-9-]+)\}\}/g, (_, slug) => {
      const s = services.find((x) => x.slug === slug);
      return s ? priceText(s) : "valor sob consulta";
    })
    .replace(/\{\{parcelamento\}\}/g, () => {
      return installmentsOf(settings) ? `, com ${INSTALLMENTS_TEXT}` : "";
    });
}

/** Aplica fillText em todos os textos de um objeto (páginas e seções). */
export function fillDeep(value, services, settings) {
  if (typeof value === "string") return fillText(value, services, settings);
  if (Array.isArray(value)) return value.map((v) => fillDeep(v, services, settings));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillDeep(v, services, settings)]));
  }
  return value;
}
