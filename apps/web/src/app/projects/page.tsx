import fs from "node:fs";
import path from "node:path";
import type { CollectionPage, WithContext } from "schema-dts";
import React from "react";
import { metadata as meta } from "@/app/config";
import ProjectCard from "@/app/projects/_components/project-card";
import { project } from "@/app/source";
import Line from "@/components/fancy/line";
import TextReveal from "@/components/fancy/text-reveal";
import { createMetadata } from "@/lib/metadata";

import { Icons } from "@repo/ui/icons";

const title = "Proyectos";
const description = "Algunos proyectos en los que he trabajado.";

export const metadata = createMetadata({
  title,
  description,
  openGraph: {
    url: "/projects",
    title,
    description,
  },
  twitter: {
    title,
    description,
  },
});

const jsonLd: WithContext<CollectionPage> = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: title,
  description,
  url: `${meta.site.url}/projects`,
  isPartOf: {
    "@type": "WebSite",
    name: meta.site.title,
    url: meta.site.url,
  },
  hasPart: [...project.getPages()].map((project) => ({
    "@type": "SoftwareApplication",
    name: project.data.title,
    description: project.data.description,
    url: project.url,
    applicationCategory: "WebApplication",
  })),
};

export default function ProjectsPage(): React.ReactElement {
  const projects = [...project.getPages()].sort((a, b) => {
    // El schema declara Date, pero al serializarse el contenido llega string.
    const tA = new Date(a.data.date as unknown as string | Date).getTime();
    const tB = new Date(b.data.date as unknown as string | Date).getTime();
    return (Number.isNaN(tB) ? 0 : tB) - (Number.isNaN(tA) ? 0 : tA);
  });

  // Los productos que están corriendo van arriba; los ejercicios y pruebas
  // técnicas quedan en un archivo plegado para no enterrarlos.
  const esProducto = (p: (typeof projects)[number]): boolean =>
    (p.data.tags ?? []).some((t) => t.label === "Producto en producción");
  const destacados = projects.filter(esProducto);
  const archivo = projects.filter((p) => !esProducto(p));

  // Resolución robusta de portada en carpeta del proyecto
  function coverPath(slug: string): string | undefined {
    const publicDir = path.join(process.cwd(), "public");
    const clean = slug.replace(/^[-_]+|[-_]+$/g, "");
    const hyphen = clean.replace(/_/g, "-").replace(/-{2,}/g, "-");
    const underscore = clean.replace(/-/g, "_").replace(/_{2,}/g, "_");
    const candidates = Array.from(
      new Set([slug, clean, hyphen, underscore]),
    ).flatMap((s) => [
      `/images/projects/${s}/cover.jpg`,
      `/images/projects/${s}/cover.png`,
      `/images/projects/${s}/cover.jpeg`,
      `/images/projects/${s}/cover.webp`,
    ]);
    for (const rel of candidates) {
      if (fs.existsSync(path.join(publicDir, rel))) return rel;
    }
    return undefined;
  }

  return (
    <main className="my-14 flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section
        className="relative flex min-h-[28dvh] items-center justify-center"
        id="hero"
      >
        <div className="flex flex-col items-center px-4 text-center md:max-w-7xl">
          {/* todo: re-add delay of 0.2seconds */}
          <TextReveal
            as="h1"
            className="leading-wide tracking-relaxed text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl"
          >
            Mis Proyectos
          </TextReveal>
          <p className="mt-6 max-w-2xl text-base text-gray-500 md:text-lg dark:text-gray-400">
            Cinco productos corriendo en producción, con su dominio, su cobro y
            su despliegue. Debajo, el archivo con ejercicios y pruebas técnicas
            de años anteriores.
          </p>
          <Line className={"mt-10"} />
        </div>
      </section>
      <section className="grid w-full grid-cols-1 gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
        {destacados.map((project, index) => (
          <ProjectCard
            title={project.data.title}
            href={project.url}
            description={project.data.description}
            key={`destacado_${index}`}
            tags={project.data.tags}
            thumbnail={coverPath(project.slugs[0] ?? "")}
          />
        ))}
      </section>
      {archivo.length > 0 ? (
        <section className="w-full p-4">
          <details className="group rounded-xl border border-zinc-950/10 dark:border-zinc-50/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-medium">
              <span>
                Archivo: ejercicios y pruebas técnicas ({archivo.length})
              </span>
              <Icons.chevronDown className="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid grid-cols-1 gap-4 p-4 pt-0 md:grid-cols-2 2xl:grid-cols-3">
              {archivo.map((project, index) => (
                <ProjectCard
                  title={project.data.title}
                  href={project.url}
                  description={project.data.description}
                  key={`archivo_${index}`}
                  tags={project.data.tags}
                  thumbnail={coverPath(project.slugs[0] ?? "")}
                />
              ))}
            </div>
          </details>
        </section>
      ) : null}
    </main>
  );
}
