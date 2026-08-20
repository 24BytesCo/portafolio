import React from "react";
import Image from "next/image";
import Link from "next/link";
import MotionWrap from "@/components/motion-wrap";

import { Button } from "@repo/ui/button";
import { Icons } from "@repo/ui/icons";

function About() {
  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="about">
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Sobre mí
            </h2>
            <div className="space-y-4">
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Tech Lead y Desarrollador Full Stack con 6 años de experiencia
                (2 como Líder Técnico). Trabajo con .NET/C#, TypeScript/Angular
                y Node.js; SQL Server y MongoDB; Git/GitHub y Azure DevOps.
                Aplico DDD, N‑capas y microservicios, Entity Framework, Clean
                Code y Scrum. Me tomo en serio los plazos y la calidad, comunico
                impedimentos a tiempo y disfruto ayudar a crecer a perfiles
                junior.
              </p>
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
          <div className="grid gap-4 sm:gap-6">
            <Image
              alt="Image"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
              height="310"
              src="/images/hero.jpg"
              sizes="100vw"
              width="550"
            />
          </div>
        </div>
      </div>
    </MotionWrap>
  );
}

export default About;
