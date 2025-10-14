import React from "react";
import { project } from "@/app/source";
import TextReveal from "@/components/fancy/text-reveal";
import MotionWrap from "@/components/motion-wrap";

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
      <div className="space-y-4 px-4 sm:px-8 md:space-y-6 md:px-12 lg:space-y-10 lg:px-16 2xl:px-24">
        <div className="flex w-full flex-col items-center justify-center text-center lg:flex-row lg:justify-between lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <TextReveal as="h2" className="flex flex-col -space-y-4 text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight">
              Mis Proyectos
            </TextReveal>
          </div>
          <p className="mt-4 hidden text-gray-500 lg:mt-0 lg:block lg:w-[35%] dark:text-gray-400">
            Algunos de mis proyectos donde convierto ideas en soluciones funcionales.
          </p>
        </div>
        {/* todo: limit amount of projects shown here and all view all projects to all sections */}
        <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {projects.map((project, index) => (
            <ProjectCard
              title={project.data.title}
              href={project.url}
              description={project.data.description}
              key={`project_${index}`}
              tags={project.data.tags}
              thumbnail={
                (project.data as any).thumbnail ||
                `/images/projects/${project.slugs[0]}/cover.jpg`
              }
            />
          ))}
        </div>
      </div>
    </MotionWrap>
  );
}

export default Projects;
