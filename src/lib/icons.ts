import type { LucideIcon } from "lucide-react";
import {
  BarChart3, Boxes, Building2, CalendarCheck, Globe, LayoutDashboard, Scale, Scissors, ShoppingBag,
  Store, Target, Users, UtensilsCrossed, Zap, BookOpen, Sparkles,
} from "lucide-react";

// Ícones selecionáveis no painel (nome -> componente)
export const ICONS: Record<string, LucideIcon> = {
  globe: Globe, target: Target, bag: ShoppingBag, menu: BookOpen, layout: LayoutDashboard, chart: BarChart3,
  boxes: Boxes, calendar: CalendarCheck, zap: Zap, store: Store, utensils: UtensilsCrossed, scale: Scale,
  users: Users, scissors: Scissors, building: Building2,
};

export const iconFor = (name: string): LucideIcon => ICONS[name] ?? Sparkles;
