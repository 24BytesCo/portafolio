"use client";

import { useEffect, useState } from "react";
import type { CifrasCanal } from "@/lib/cifras-canal";

const numero = (n: number) => n.toLocaleString("es-CO");

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * Cifras del canal. El servidor pinta las últimas conocidas (quedan en el HTML,
 * para los buscadores y para quien no ejecute JS) y al montar se piden otra vez,
 * que es lo que las mantiene al día sin volver a publicar el artículo.
 */
export function CifrasCanalVista({ inicial }: { inicial: CifrasCanal }) {
  const [c, setC] = useState(inicial);

  useEffect(() => {
    const control = new AbortController();
    fetch("/api/canal", { signal: control.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: CifrasCanal | null) => {
        if (d && typeof d.suscriptores === "number") setC(d);
      })
      .catch(() => {
        /* se quedan las del servidor */
      });
    return () => control.abort();
  }, []);

  const faltan = Math.max(0, 1000 - c.suscriptores);
  const avance = Math.min(1, c.horas / c.metaHoras);

  return (
    <div className="cifras">
      <ul className="cifras-lista">
        <li>
          <p className="cifras-numero">{numero(c.suscriptores)}</p>
          <p className="cifras-etiqueta">Suscriptores</p>
          <p className="cifras-nota">
            {faltan === 0
              ? "La primera mitad de la meta está cumplida."
              : `Faltan ${numero(faltan)} para la mitad de la meta.`}
          </p>
        </li>
        <li>
          <p className="cifras-numero">
            {numero(c.horas)}
            <span className="cifras-de"> de {numero(c.metaHoras)}</span>
          </p>
          <p className="cifras-etiqueta">Horas válidas</p>
          <div
            className="cifras-barra"
            role="progressbar"
            aria-label="Avance hacia las 4.000 horas"
            aria-valuemin={0}
            aria-valuemax={c.metaHoras}
            aria-valuenow={c.horas}
          >
            <span style={{ transform: `scaleX(${avance.toFixed(3)})` }} />
          </div>
          <p className="cifras-nota">
            El {Math.round(avance * 100)} % de lo que exige la monetización.
          </p>
        </li>
        <li>
          <p className="cifras-numero">
            {c.videosEnVivo ? "" : "~"}
            {numero(c.videos)}
          </p>
          <p className="cifras-etiqueta">Videos publicados</p>
          <p className="cifras-nota">
            Entre largos y shorts, todos por el sistema.
          </p>
        </li>
      </ul>
      <p className="cifras-pie">
        A hoy {fecha(c.actualizado)}{" "}
        <span>
          (
          {c.enVivo
            ? "se actualiza solo: sale del panel de la fábrica"
            : "último dato confirmado"}
          )
        </span>
      </p>
    </div>
  );
}
