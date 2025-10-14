import React from "react";
import { project } from "@/app/source";
import MotionWrap from "@/components/motion-wrap";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/carousel";

import ProjectCard from "./project-card";

function Projects() {
  const projects = [...project.getPages()].sort((a, b) => {
    const dateA = new Date((a as any).data.date as unknown as string | Date);
    const dateB = new Date((b as any).data.date as unknown as string | Date);
    const tA = dateA.getTime();
    const tB = dateB.getTime();
    return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
  });

  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="projects">
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">Mis Proyectos</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Algunos de mis proyectos donde convierto ideas en soluciones funcionales.
            </p>
          </div>
          <div className="flex items-center justify-center overflow-hidden lg:px-12">
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {projects.map((project, index) => (
                  <CarouselItem
                    key={`project_${index}`}
                    className="md:basis-1/2 lg:basis-full xl:basis-1/2"
                  >
                    <div className="h-full">
                      <ProjectCard
                        title={project.data.title}
                        href={project.url}
                        description={project.data.description}
                        tags={project.data.tags}
                        thumbnail={
                          (project.data as any).thumbnail ||
                          `/images/projects/${project.slugs[0]}/cover.jpg`
                        }
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </div>
    </MotionWrap>
  );
}

export default Projects;
