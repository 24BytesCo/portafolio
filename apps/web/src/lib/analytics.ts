"use client";

import { env } from "@/env";

declare global {
  interface Window {
    plausible?: (
      event: string,
      opts?: { props?: Record<string, unknown> },
    ) => void;
    gtag?: (...args: unknown[]) => void;
    umami?:
      | { track: (event: string, data?: Record<string, unknown>) => void }
      | ((event: string) => void);
  }
}

/**
 * Envía un evento de analítica según el proveedor configurado.
 * Soporta: Plausible, Umami (si se añade en el futuro), GA4.
 * Para Cloudflare Web Analytics no se envían eventos personalizados (solo pageviews).
 */
export function trackEvent(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const provider = env.NEXT_PUBLIC_ANALYTICS_PROVIDER;

  try {
    if (provider === "plausible" && typeof window.plausible === "function") {
      window.plausible(event, props ? { props } : undefined);
      return;
    }
    // Umami (dos posibles firmas según versión)
    if (provider === "umami" && window.umami) {
      const u = window.umami as
        | ((eventName: string) => void)
        | {
            track?: (eventName: string, data?: Record<string, unknown>) => void;
          };
      if (typeof u === "function") u(event);
      else if (typeof u.track === "function") u.track(event, props);
      return;
    }
    // Google Analytics 4 (gtag)
    if (provider === "ga4" && typeof window.gtag === "function") {
      window.gtag("event", event, props ?? {});
      return;
    }
    // Cloudflare Web Analytics no expone API de eventos personalizados.
  } catch {
    // Silenciar errores de analítica para no afectar UX
  }
}
