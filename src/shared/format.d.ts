type Priced = { slug?: string; price_cents: number | null; price_from: boolean };
type WithPayment = { payment?: { installments: number } };

export function money(cents: number): string;
export function priceLabel(s: Pick<Priced, "price_cents" | "price_from">): string;
export function priceText(s: Pick<Priced, "price_cents" | "price_from">): string;
export function installmentsOf(settings: WithPayment): number;
export function installmentLabel(cents: number | null, n: number): string;
export function startingPrice(services: Priced[], slugs: string[]): string | null;
export function fillText(text: string, services: Priced[], settings: WithPayment): string;
export function fillDeep<T>(value: T, services: Priced[], settings: WithPayment): T;
