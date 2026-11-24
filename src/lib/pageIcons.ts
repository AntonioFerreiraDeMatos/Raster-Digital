import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck, CalendarX, FileCheck2, Handshake, Hourglass, Images, Languages, MapPin, MessageCircle,
  MessageSquareWarning, PackageSearch, Plug, Puzzle, SearchX, Server, ShieldCheck, Smartphone, Unlock, Wallet,
} from "lucide-react";
import { ICONS } from "./icons";

/**
 * Ícones usados nos textos das páginas (src/data). Ficam separados de ICONS (lib/icons.ts),
 * que é a lista oferecida no painel /admin, para não mudar as opções do painel.
 */
const PAGE_ICONS: Record<string, LucideIcon> = {
  ...ICONS,
  search: SearchX, phone: Smartphone, chat: MessageSquareWarning, "calendar-x": CalendarX, stock: PackageSearch,
  time: Hourglass, handshake: Handshake, puzzle: Puzzle, server: Server, filecheck: FileCheck2, unlock: Unlock,
  message: MessageCircle, wallet: Wallet, plug: Plug, "calendar-check": CalendarCheck, shield: ShieldCheck,
  map: MapPin, languages: Languages, image: Images,
};

export const pageIcon = (name?: string): LucideIcon => (name && PAGE_ICONS[name]) || ICONS.zap;
