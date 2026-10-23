/**
 * Vistas por página, leídas de la analítica propia (Umami) en el servidor.
 *
 * No añade ningún contador nuevo: los datos ya los recoge Umami desde el
 * 18/09/2026. Una sola llamada trae el recuento de todas las rutas y sirve a
 * todos los artículos a la vez; el resultado se cachea media hora, que es el
 * mismo `revalidate` que tienen las páginas.
 *
 * Si falta cualquier pieza (clave de API, red, Umami caído) devuelve null y
 * no se pinta nada: antes no mostrar número que mostrar uno equivocado.
 */

import { env } from "@/env";

/** Media hora, igual que el `revalidate` de las páginas. */
const VENTANA_MS = 1800 * 1000;

/** Primer día con analítica. Nada anterior existe en Umami. */
const INICIO_MS = Date.UTC(2026, 8, 18);

interface MetricaUmami {
  x?: string | null;
  y?: number | null;
}

function normalizar(ruta: string): string {
  const limpia = ruta.split("?")[0].split("#")[0];
  return limpia.length > 1 ? limpia.replace(/\/+$/, "") : limpia;
}

async function mapaDeVistas(): Promise<Map<string, number>> {
  const base = env.UMAMI_INTERNAL_URL;
  const clave = env.UMAMI_API_KEY;
  // El id va también como variable de servidor: la NEXT_PUBLIC_ se resuelve en
  // el build y no se puede cambiar sin recompilar.
  const sitio = env.UMAMI_WEBSITE_ID ?? env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!base || !clave || !sitio) return new Map();

  // Redondeado a la media hora: si el `endAt` cambiara en cada render, la URL
  // sería distinta siempre y el fetch no se cachearía nunca.
  const fin = Math.floor(Date.now() / VENTANA_MS) * VENTANA_MS;
  const url =
    `${base}/stats/api/websites/${sitio}/metrics` +
    `?type=path&startAt=${INICIO_MS}&endAt=${fin}&limit=500`;

  try {
    const respuesta = await fetch(url, {
      headers: { Authorization: `Bearer ${clave}` },
      next: { revalidate: 1800 },
    });
    if (!respuesta.ok) return new Map();
    const datos = (await respuesta.json()) as MetricaUmami[];
    const mapa = new Map<string, number>();
    for (const fila of datos) {
      if (!fila.x) continue;
      const ruta = normalizar(fila.x);
      mapa.set(ruta, (mapa.get(ruta) ?? 0) + Number(fila.y ?? 0));
    }
    return mapa;
  } catch {
    return new Map();
  }
}

/**
 * Vistas de una ruta, o null si no hay dato o no llega al mínimo configurado
 * (`VISTAS_MINIMO`, por defecto 0: se muestran todas).
 */
async function vistasDe(ruta: string): Promise<number | null> {
  const mapa = await mapaDeVistas();
  const vistas = mapa.get(normalizar(ruta));
  if (vistas === undefined) return null;
  const minimo = env.VISTAS_MINIMO ?? 0;
  return vistas >= minimo ? vistas : null;
}

export { vistasDe };
