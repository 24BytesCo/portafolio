"use client";

import React from "react";

/**
 * Contador de lecturas de la página.
 *
 * Se pide al arrancar la página y no durante el renderizado en servidor: el
 * HTML de los artículos se genera en el despliegue, dentro de un contenedor de
 * build que no alcanza a Umami, así que un número calculado ahí se quedaría
 * vacío hasta la siguiente regeneración. Mientras no haya dato no se pinta
 * nada, de modo que la página nunca muestra un cero falso ni da saltos.
 */
function Vistas({
  ruta,
  className,
}: {
  ruta: string;
  className?: string;
}): React.ReactElement | null {
  const [vistas, setVistas] = React.useState<number | null>(null);

  React.useEffect(() => {
    const control = new AbortController();
    fetch(`/api/vistas?ruta=${encodeURIComponent(ruta)}`, {
      signal: control.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { vistas?: number | null } | null) => {
        if (typeof d?.vistas === "number") setVistas(d.vistas);
      })
      .catch(() => {
        // Sin analítica disponible no se muestra contador, y ya está.
      });
    return () => control.abort();
  }, [ruta]);

  if (vistas === null) return null;

  return (
    <p className={className}>
      {vistas.toLocaleString("es-CO")} {vistas === 1 ? "lectura" : "lecturas"}
    </p>
  );
}

export { Vistas };
