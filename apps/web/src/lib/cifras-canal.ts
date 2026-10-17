/**
 * Cifras del canal de la fábrica de videos, para el artículo del blog.
 *
 * La API de la fábrica corre en el mismo servidor, en la red `proxy-net`, así
 * que se consulta por nombre de contenedor y sin salir a internet. Por fuera
 * está tras Cloudflare Access: no se usa esa vía. El basic auth del panel hoy
 * está abierto, pero si vuelve a activarse esta llamada empezaría a fallar —
 * por eso cualquier fallo devuelve el respaldo en silencio y la página nunca
 * se queda sin cifras.
 *
 * El dato se recalcula una vez al día (timer `betlab-stats-tabla`, 00:40), y
 * `horasValidas` sale de la pestaña de Monetización de YouTube, que suele ir
 * atrasada. Por eso la leyenda dice la fecha del dato y no «en vivo».
 */
export interface CifrasCanal {
  suscriptores: number;
  horas: number;
  metaHoras: number;
  videos: number;
  /** ISO de la fecha del dato (`horasValidasDe` de la fábrica). */
  actualizado: string;
  /** false = no se pudo consultar la fábrica y van las cifras de respaldo. */
  enVivo: boolean;
  /** La fábrica aún no publica el total de videos; ese sigue a mano. */
  videosEnVivo: boolean;
}

/** Último dato confirmado a mano (15/10/2026). */
export const RESPALDO: CifrasCanal = {
  suscriptores: 1046,
  horas: 1177,
  metaHoras: 4000,
  videos: 1000,
  actualizado: "2026-10-15T14:43:30.000Z",
  enVivo: false,
  videosEnVivo: false,
};

/** Canal principal: el que corre contra la meta de monetización. */
const API = "http://fabrica-videos:3000/api/meta?canal=previasypolemicas";

export async function leerCifrasCanal(): Promise<CifrasCanal> {
  try {
    const r = await fetch(API, {
      // Media hora de caché en el servidor: la fábrica recalcula una vez al día.
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return RESPALDO;
    const d = (await r.json()) as Record<string, unknown>;
    const n = (v: unknown, porDefecto: number) =>
      typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : porDefecto;
    const suscriptores = n(d.suscriptores, RESPALDO.suscriptores);
    const horas = n(d.horasValidas, RESPALDO.horas);
    // Nunca retroceder por debajo de lo ya publicado: si la fábrica devolviera
    // un cero por una carga a medias, la página mostraría menos de lo que ya
    // se contó y el texto del artículo dejaría de cuadrar.
    if (suscriptores < RESPALDO.suscriptores || horas < RESPALDO.horas) return RESPALDO;
    const videos = n(d.videosPublicados, RESPALDO.videos);
    const fechaDato = d.horasValidasDe ?? d.datosDe;
    return {
      suscriptores,
      horas,
      metaHoras: n(d.metaHoras, RESPALDO.metaHoras),
      videos,
      actualizado:
        typeof fechaDato === "string" && !Number.isNaN(Date.parse(fechaDato))
          ? fechaDato
          : new Date().toISOString(),
      enVivo: true,
      videosEnVivo: typeof d.videosPublicados === "number",
    };
  } catch {
    return RESPALDO;
  }
}
