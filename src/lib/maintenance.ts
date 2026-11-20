import { money, useContent, type MaintenancePlan } from "./content";

/** Planos de manutenção mensal, editáveis no /admin (Conteúdo → Planos de manutenção). */
export function useMaintenancePlans(): MaintenancePlan[] {
  return useContent().settings.maintenancePlans?.plans ?? [];
}

export function maintenanceMessage(p: Pick<MaintenancePlan, "name" | "price_cents">) {
  return `Olá! Vim pelo site da Raster Digital e quero contratar o Plano de Manutenção ${p.name} (${money(p.price_cents)}/mês). Podemos conversar?`;
}
