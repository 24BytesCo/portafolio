import React from "react";
import { vistasDe } from "@/lib/vistas";

/**
 * Contador de lecturas de la página. Se resuelve en el servidor con el dato de
 * la analítica propia, así que no manda ninguna petición desde el navegador ni
 * depende de que el visitante tenga la analítica activa.
 */
async function Vistas({
  ruta,
  className,
}: {
  ruta: string;
  className?: string;
}): Promise<React.ReactElement | null> {
  const vistas = await vistasDe(ruta);
  if (vistas === null) return null;

  return (
    <p className={className}>
      {vistas.toLocaleString("es-CO")} {vistas === 1 ? "lectura" : "lecturas"}
    </p>
  );
}

export { Vistas };
