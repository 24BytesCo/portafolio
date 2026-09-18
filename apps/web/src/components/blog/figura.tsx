import Image from "next/image";

/**
 * Imagen de artículo con pie. Se sale de la columna de lectura hacia la
 * derecha (ver `.figura` en globals.css): las capturas de producto necesitan
 * más ancho que un párrafo para que el texto de la interfaz se pueda leer.
 */
export function Figura({
  src,
  alt,
  pie,
  ancho = 1600,
  alto = 1000,
  marco = true,
}: {
  src: string;
  alt: string;
  pie?: string;
  ancho?: number;
  alto?: number;
  marco?: boolean;
}) {
  return (
    <figure className="figura">
      <div className={marco ? "figura-marco" : undefined}>
        <Image
          src={src}
          alt={alt}
          width={ancho}
          height={alto}
          sizes="(min-width: 1024px) 880px, 100vw"
          unoptimized={src.endsWith(".svg")}
        />
      </div>
      {pie ? <figcaption>{pie}</figcaption> : null}
    </figure>
  );
}
