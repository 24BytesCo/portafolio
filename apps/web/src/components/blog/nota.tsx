import type { ReactNode } from "react";

/** Bloque destacado dentro del artículo: una idea que merece salir del flujo. */
export function Nota({
  titulo,
  children,
}: {
  titulo?: string;
  children: ReactNode;
}) {
  return (
    <aside className="nota">
      {titulo ? <p className="nota-titulo">{titulo}</p> : null}
      {children}
    </aside>
  );
}
