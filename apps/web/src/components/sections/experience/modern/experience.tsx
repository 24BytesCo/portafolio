import React from "react";
import TextReveal from "@/components/fancy/text-reveal";
import MotionWrap from "@/components/motion-wrap";
import { experiences } from "@/components/sections/experience/config";

import ExperienceCard from "./experience-card";

function Experiences() {
  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="experiences">
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24">
        <div className="flex flex-col gap-10">
          <div className="space-y-4">
            <TextReveal as="h2" className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl/none">
              Experiencia
            </TextReveal>
            <TextReveal as="p" className="text-gray-500 dark:text-gray-400">
              Algunas etapas clave de mi trayectoria profesional y logros.
            </TextReveal>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2">
            {experiences.map((experience, index) => (
              <ExperienceCard
                key={`experience_${index}`}
                name={experience.name}
                description={experience.description}
                company={experience.company}
                duration={experience.duration}
                logo={experience.logo}
              />
            ))}
          </div>
        </div>
      </div>
    </MotionWrap>
  );
}

export default Experiences;
