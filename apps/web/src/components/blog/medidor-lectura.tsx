"use client";

import { useEffect } from "react";

interface Umami {
  track: (evento: string, datos?: Record<string, unknown>) => void;
}

const HITOS = [25, 50, 75, 100] as const;
// Sin actividad durante este tiempo se deja de contar: una pestaña abierta
// de fondo no es alguien leyendo.
const INACTIVIDAD_MS = 30_000;

function enviar(evento: string, datos: Record<string, unknown>) {
  const umami = (window as unknown as { umami?: Umami }).umami;
  umami?.track(evento, datos);
}

/** Tramo de tiempo legible en el panel, en vez de un número suelto por visita. */
function tramo(segundos: number): string {
  if (segundos < 15) return "0-15 s";
  if (segundos < 60) return "15-60 s";
  if (segundos < 180) return "1-3 min";
  if (segundos < 360) return "3-6 min";
  return "más de 6 min";
}

/**
 * Mide si un artículo se lee de verdad: hasta dónde baja el lector (hitos del
 * 25, 50, 75 y 100% del cuerpo del artículo, no de la página) y cuánto tiempo
 * ACTIVO pasa en él. Manda eventos a Umami; si Umami no está cargado (local,
 * bloqueador), no hace nada.
 */
export function MedidorLectura({
  slug,
  selector = ".articulo",
}: {
  slug: string;
  selector?: string;
}) {
  useEffect(() => {
    const articulo = document.querySelector<HTMLElement>(selector);
    if (!articulo) return;

    const enviados = new Set<number>();
    let maximo = 0;
    let activoMs = 0;
    let ultimaActividad = Date.now();
    let ultimoTic = Date.now();
    let despedido = false;

    const medir = () => {
      const caja = articulo.getBoundingClientRect();
      const recorrido = window.innerHeight - caja.top;
      const pct = Math.max(0, Math.min(100, (recorrido / caja.height) * 100));
      if (pct > maximo) maximo = pct;
      for (const hito of HITOS) {
        if (maximo >= hito && !enviados.has(hito)) {
          enviados.add(hito);
          enviar("lectura", { articulo: slug, hito: `${hito}%` });
        }
      }
    };

    const actividad = () => {
      ultimaActividad = Date.now();
    };
    const alDesplazar = () => {
      actividad();
      medir();
    };

    const reloj = window.setInterval(() => {
      const ahora = Date.now();
      const visible = document.visibilityState === "visible";
      if (visible && ahora - ultimaActividad < INACTIVIDAD_MS) {
        activoMs += ahora - ultimoTic;
      }
      ultimoTic = ahora;
    }, 1000);

    const despedir = () => {
      if (despedido) return;
      const segundos = Math.round(activoMs / 1000);
      if (segundos < 3) return;
      despedido = true;
      enviar("lectura-fin", {
        articulo: slug,
        tiempo: tramo(segundos),
        segundos,
        llego: `${Math.floor(maximo / 25) * 25}%`,
      });
    };
    const alOcultar = () => {
      if (document.visibilityState === "hidden") despedir();
    };

    medir();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    window.addEventListener("pointermove", actividad, { passive: true });
    window.addEventListener("keydown", actividad);
    window.addEventListener("touchstart", actividad, { passive: true });
    document.addEventListener("visibilitychange", alOcultar);
    window.addEventListener("pagehide", despedir);

    return () => {
      despedir();
      window.clearInterval(reloj);
      window.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("pointermove", actividad);
      window.removeEventListener("keydown", actividad);
      window.removeEventListener("touchstart", actividad);
      document.removeEventListener("visibilitychange", alOcultar);
      window.removeEventListener("pagehide", despedir);
    };
  }, [slug, selector]);

  return null;
}
