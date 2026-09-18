import type { TOCItemType } from "fumadocs-core/server";
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { metadata as meta } from "@/app/config";
import { blog } from "@/app/source";
import { Figura } from "@/components/blog/figura";
import { Indice } from "@/components/blog/indice";
import { MedidorLectura } from "@/components/blog/medidor-lectura";
import { Nota } from "@/components/blog/nota";
import { MDXLink } from "@/lib/mdx/default-components";
import { createMetadata } from "@/lib/metadata";
import { formatearFecha } from "@/lib/utils";
import { MDXContent } from "@content-collections/mdx/react";
import defaultMdxComponents from "fumadocs-ui/mdx";

// Serif de lectura solo para el cuerpo de los artículos: un texto de mil
// palabras se lee mejor así que en la grotesca del resto del sitio, que se
// queda para títulos, índice y pies.
const lectura = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lectura",
  display: "swap",
});

// 404 real: sin esto, una ruta que no está en generateStaticParams sigue
// resolviendo dinámicamente y notFound() llega tarde (loading.tsx ya empezó
// a transmitir la respuesta con 200). Con generateStaticParams en [] (sin
// entradas de blog) esto hace que todo /blog/* responda 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return blog
    .getPages()
    .map((p) => p.slugs[0])
    .filter(Boolean)
    .map((slug) => ({ slug }));
}

function fechaIso(valor: unknown): string | undefined {
  const d = valor instanceof Date ? valor : new Date(String(valor));
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const page = blog.getPage([slug]);
  if (!page) notFound();

  return createMetadata({
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      type: "article",
      url: `/blog/${slug}`,
      authors: meta.author.name,
      modifiedTime: fechaIso(page.data.date),
      images: [
        {
          url: `/images/blog/${slug}/cover.jpg`,
          width: 1200,
          height: 630,
          alt: page.data.title,
        },
      ],
    },
  }) satisfies Metadata;
}

export default async function BlogPage(props0: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props0.params;
  const { slug } = params;
  const page = blog.getPage([slug]);
  if (!page) notFound();

  const {
    data: { toc, body, portada, cta },
  } = page;

  const rawDate = page.data.date as unknown as string | Date;
  const palabras = page.data.content.split(/\s+/).filter(Boolean).length;
  const minutos = Math.max(1, Math.round(palabras / 200));

  const imagen = portada ?? {
    src: `/images/blog/${slug}/cover.jpg`,
    alt: page.data.title,
    ancho: 1200,
    alto: 630,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: page.data.title,
    description: page.data.description,
    datePublished: fechaIso(rawDate),
    dateModified: fechaIso(rawDate),
    image: `${meta.site.url}/images/blog/${slug}/cover.jpg`,
    mainEntityOfPage: `${meta.site.url}/blog/${slug}`,
    author: {
      "@type": "Person",
      name: meta.author.name,
      url: `${meta.site.url}/about`,
    },
    publisher: { "@type": "Organization", name: "24Bytes", url: meta.site.url },
  };

  return (
    <main className={`${lectura.variable} entrada my-24 flex-1`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MedidorLectura slug={slug} />

      <header className="entrada-cabecera container">
        <Link href="/blog" className="entrada-volver">
          Volver al blog
        </Link>
        <h1 className="entrada-titulo">{page.data.title}</h1>
        <p className="entrada-bajada">{page.data.description}</p>

        <div className="entrada-firma">
          <Image
            src="/images/autor-alexis.jpg"
            alt=""
            width={48}
            height={48}
            className="entrada-avatar"
          />
          <div>
            <p className="entrada-autor">{page.data.author}</p>
            <p className="entrada-dato">Fundador de 24Bytes</p>
          </div>
          <div className="entrada-fecha">
            <p className="entrada-autor">{formatearFecha(rawDate)}</p>
            <p className="entrada-dato">{minutos} min de lectura</p>
          </div>
        </div>
      </header>

      <div className="entrada-portada container">
        <Image
          src={imagen.src}
          alt={imagen.alt}
          width={imagen.ancho ?? 1600}
          height={imagen.alto ?? 900}
          sizes="(min-width: 1280px) 1200px, 100vw"
          priority
        />
      </div>

      <div className="entrada-cuerpo container">
        <aside className="entrada-lateral">
          <Indice items={toc as TOCItemType[]} />
        </aside>
        <article className="articulo prose">
          <MDXContent
            code={body}
            components={{
              ...defaultMdxComponents,
              a: MDXLink,
              Figura,
              Nota,
            }}
          />
        </article>
      </div>

      {cta ? (
        <section className="entrada-cierre container" aria-label={cta.titulo}>
          <div className="entrada-cierre-caja">
            <div>
              <h2>{cta.titulo}</h2>
              <p>{cta.texto}</p>
            </div>
            <a href={cta.href} target="_blank" rel="noopener">
              {cta.etiqueta}
            </a>
          </div>
        </section>
      ) : null}
    </main>
  );
}
