import type { CollectionPage, WithContext } from "schema-dts";
import React from "react";
import { metadata as meta } from "@/app/config";
import ProjectCard from "@/app/projects/_components/project-card";
import fs from "node:fs";
import path from "node:path";
import { project } from "@/app/source";
import Line from "@/components/fancy/line";
import TextReveal from "@/components/fancy/text-reveal";
import { createMetadata } from "@/lib/metadata";

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
    const dateA = new Date((a as any).data.date as unknown as string | Date);
    const dateB = new Date((b as any).data.date as unknown as string | Date);
    return dateB.getTime() - dateA.getTime();
  });

  // Resolución robusta de portada en carpeta del proyecto
  function coverPath(slug: string): string | undefined {
    const publicDir = path.join(process.cwd(), "public");
    const clean = slug.replace(/^[-_]+|[-_]+$/g, "");
    const hyphen = clean.replace(/_/g, "-").replace(/-{2,}/g, "-");
    const underscore = clean.replace(/-/g, "_").replace(/_{2,}/g, "_");
    const candidates = Array.from(new Set([slug, clean, hyphen, underscore])).flatMap((s) => [
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
        className="relative flex min-h-[calc(50dvh)] items-center justify-center"
        id="hero"
      >
        <div className="flex flex-col items-center md:max-w-7xl">
          {/* todo: re-add delay of 0.2seconds */}
          <TextReveal as="h1" className="leading-wide tracking-relaxed text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl">
            Mis Proyectos
          </TextReveal>

          <Line className={"mt-16"} />
        </div>
      </section>
      <section className="grid w-full grid-cols-1 gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
        {projects.map((project, index) => (
          <ProjectCard
            title={project.data.title}
            href={project.url}
            description={project.data.description}
            key={`project_${index}`}
            tags={project.data.tags}
            thumbnail={coverPath(project.slugs[0]!)}
          />
        ))}
      </section>
    </main>
  );
}
