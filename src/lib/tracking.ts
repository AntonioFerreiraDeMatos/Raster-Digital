// Guarda a origem da visita (UTM, página de entrada e site de referência)
// para identificar de onde veio cada lead.

const KEY = "raster_origin";

export type Origin = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landingPath?: string;
  referrer?: string;
};

export function captureOrigin() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const p = new URLSearchParams(location.search);
    const ref = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : "";
    const origin: Origin = {
      utm_source: p.get("utm_source") ?? undefined,
      utm_medium: p.get("utm_medium") ?? undefined,
      utm_campaign: p.get("utm_campaign") ?? undefined,
      landingPath: location.pathname + location.search,
      referrer: ref || undefined,
    };
    sessionStorage.setItem(KEY, JSON.stringify(origin));
  } catch {
    /* navegação privada: segue sem origem */
  }
}

export function getOrigin(): Origin {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
