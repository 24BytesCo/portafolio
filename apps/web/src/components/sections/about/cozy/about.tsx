import React from "react";
import Link from "next/link";
import TextReveal from "@/components/fancy/text-reveal";
import MotionWrap from "@/components/motion-wrap";

import { Button } from "@repo/ui/button";
import { Icons } from "@repo/ui/icons";

function About() {
  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="about">
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <TextReveal
              as="h2"
              className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
            >
              Sobre mí
            </TextReveal>
            <div className="space-y-4">
              <TextReveal
                as="p"
                className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
              >
                Tech Lead y Desarrollador Full Stack con 6 años de experiencia
                (2 como Líder Técnico). Trabajo con .NET/C#, TypeScript/Angular
                y Node.js; SQL Server y MongoDB; Git/GitHub y Azure DevOps.
                Aplico DDD, N‑capas y microservicios, Entity Framework, Clean
                Code y Scrum. Me tomo en serio los plazos y la calidad, comunico
                impedimentos a tiempo y disfruto ayudar a crecer a perfiles
                junior.
              </TextReveal>
              <div className="flex gap-2">
                <Button asChild variant={"outline"}>
                  <a href="resume.pdf" target="_blank">
                    Ver CV <Icons.arrowUpRight className="ml-2 size-5" />
                  </a>
                </Button>
                <Button asChild>
                  <Link href="/about">Ver más</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionWrap>
  );
}

export default About;
