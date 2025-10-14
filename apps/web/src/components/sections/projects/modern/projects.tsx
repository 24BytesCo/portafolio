import React from "react";
import fs from "node:fs";
import path from "node:path";
import { project } from "@/app/source";
import TextReveal from "@/components/fancy/text-reveal";
import MotionWrap from "@/components/motion-wrap";

import ProjectsCarousel from "./projects-carousel";

/**
 * Sección "Mis Proyectos" con carrusel automático.
 *
 * - Carga metadatos de proyectos desde content-collections y ordena por fecha.
 * - Resuelve la ruta de la imagen de portada de forma robusta (jpg/png/jpeg/webp).
 * - Renderiza el carrusel cliente `ProjectsCarousel` para incorporar autoplay.
 */
function Projects() {
  const projects = [...project.getPages()].sort((a, b) => {
    const dateA = new Date((a as any).data.date as unknown as string | Date);
    const dateB = new Date((b as any).data.date as unknown as string | Date);
    const tA = dateA.getTime();
    const tB = dateB.getTime();
    return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
  });

  function coverPath(slug: string): string {
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
    // devolver cadena vacía para mantener la prop como opcional y satisfacer a TS
    return "";
  }
  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="projects">
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24">
        <div className="grid gap-10">
          <div className="flex w-full flex-col items-center justify-center text-center lg:flex-row lg:justify-between lg:text-left">
            <div className="flex flex-col items-center lg:items-start">
              <TextReveal
                as="h2"
                className="flex flex-col -space-y-4 text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
              >
                Mis Proyectos
              </TextReveal>
            </div>
            <p className="mt-4 hidden text-gray-500 lg:mt-0 lg:block lg:w-[35%] dark:text-gray-400">
              Algunos de mis proyectos donde convierto ideas en soluciones funcionales.
            </p>
          </div>

          <div className="flex items-center justify-center overflow-hidden lg:px-12">
            <ProjectsCarousel
              items={projects.map((p) => ({
                title: p.data.title,
                href: p.url,
                description: p.data.description,
                tags: p.data.tags,
                thumbnail: coverPath(p.slugs?.[0] ?? ""),
              }))}
            />
          </div>
        </div>
      </div>
    </MotionWrap>
  );
}

export default Projects;
