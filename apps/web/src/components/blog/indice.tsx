import type { TOCItemType } from "fumadocs-core/server";

/**
 * Índice del artículo. En escritorio queda fijo a la derecha; en móvil es un
 * desplegable al inicio. Sustituye al InlineTOC de fumadocs, que salía en
 * inglés («Table of Contents») y metido dentro de la columna de lectura.
 */
export function Indice({ items }: { items: TOCItemType[] }) {
  const visibles = items.filter((i) => i.depth <= 3);
  if (visibles.length < 3) return null;

  const lista = (
    <ol className="indice-lista">
      {visibles.map((i) => (
        <li key={i.url} data-nivel={i.depth}>
          <a href={i.url}>{i.title}</a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <details className="indice indice-movil">
        <summary>En este artículo</summary>
        {lista}
      </details>
      <nav className="indice indice-fijo" aria-label="En este artículo">
        <p className="indice-titulo">En este artículo</p>
        {lista}
      </nav>
    </>
  );
}
