"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import NextLink from "next/link";
import SkillCard from "@/app/about/_components/skill-card";
import Link from "@/components/fancy/link";
import ImageTrail from "@/components/fancy/motion-trail";
import TextReveal from "@/components/fancy/text-reveal";
import { contact } from "@/components/sections/contact/config";
import ContactForm from "@/components/sections/contact/cozy/contact-form";
import { experiences } from "@/components/sections/experience/config";
import ExperienceCard from "@/components/sections/experience/modern/experience-card";
import { skills } from "@/components/sections/skills/config";
import { technologies } from "@/components/sections/technologies/config";
import TechnologyCard from "@/components/sections/technologies/modern/technology-card";
import { exampleImages } from "@/lib/example-images";
import { motion, useScroll, useTransform } from "motion/react";

import { cn } from "@repo/ui";
import { Button, buttonVariants } from "@repo/ui/button";
import { Icons } from "@repo/ui/icons";
import { Separator } from "@repo/ui/separator";

export default function About() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const [logoImages, setLogoImages] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/logos")
      .then((r) => r.json() as Promise<{ images?: unknown }>)
      .then((data) => {
        if (!active) return;
        const arr = Array.isArray(data.images)
          ? data.images.filter((x): x is string => typeof x === "string")
          : [];
        if (arr.length) setLogoImages(arr);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const trailImages = useMemo(() => {
    return (logoImages.length ? logoImages : exampleImages).slice(0, 32);
  }, [logoImages]);

  return (
    <main className="flex-1 px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24">
      <section className="relative -mx-4 flex h-[calc(100svh-(--spacing(14)))] items-center justify-center overflow-hidden pb-12 sm:-mx-8 md:-mx-12 lg:-mx-16 2xl:-mx-24">
        <div className="absolute top-0 left-0 z-0" ref={heroRef}>
          <ImageTrail containerRef={heroRef} interval={240} rotationRange={10}>
            {trailImages.map((image, index) => (
              <div
                key={index}
                className="relative flex h-40 w-40 items-center justify-center overflow-visible p-0"
              >
                {/* Decorativa: logos pequeños animados por ImageTrail (uno es SVG) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 object-contain"
                />
              </div>
            ))}
          </ImageTrail>
        </div>
        <div className="relative container mx-auto flex flex-col items-center px-4">
          <h1 className="sr-only">Sobre mí</h1>
          <TextReveal
            as="h2"
            className="z-20 mx-auto max-w-7xl text-center text-4xl leading-[1.15] tracking-tight text-pretty sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl 2xl:text-8xl"
          >
            Líder Técnico
          </TextReveal>
          <TextReveal
            as="h3"
            className="z-20 mx-auto max-w-7xl text-center text-4xl leading-[1.1] tracking-tight text-pretty sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl 2xl:text-8xl"
          >
            Desarrollador Full Stack
          </TextReveal>
          <motion.div
            className="mt-8"
            style={{ opacity }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Icons.chevronDown className="h-8 w-8" />
          </motion.div>
        </div>
      </section>

      <Separator />
      <section className="py-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1 md:gap-8">
          <div className="col-span-1 md:col-span-3">
            <h2 className="text-xl font-semibold sm:text-4xl">Sobre mí</h2>
          </div>
          <div className="col-span-1 md:col-span-3">
            <div className="space-y-8">
              <TextReveal
                as="h3"
                wordGap="0.2em"
                className="font-serif text-4xl leading-[1.15] text-pretty sm:text-5xl md:text-5xl lg:text-5xl xl:text-5xl"
              >
                Construyo productos de software completos y los pongo en
                producción.
              </TextReveal>
              <TextReveal
                as="p"
                className="text-muted-foreground text-base leading-relaxed sm:text-lg md:text-lg lg:text-xl xl:text-2xl"
              >
                Full-Stack Developer con 9 años de experiencia, 2 como Tech
                Lead, y fundador de 24Bytes. Mi trabajo se mide en lo que está
                corriendo ahora mismo: un SaaS con más de 600.000 procesos de
                contratación pública indexados que notifica por correo y
                WhatsApp, una plataforma de rendición de cuentas en producción
                para una alcaldía, y un pipeline multi-LLM donde las reglas
                críticas viven en código y no en el prompt.
              </TextReveal>
              <TextReveal
                as="p"
                className="text-muted-foreground text-base leading-relaxed sm:text-lg md:text-lg lg:text-xl xl:text-2xl"
              >
                A través de 24Bytes tomo proyectos de punta a punta: backend y
                arquitectura en .NET, NestJS y Python; frontend en Angular y
                Next.js; IA aplicada con validación y auditoría de sus
                respuestas; e infraestructura con Docker, Cloudflare, CI/CD,
                respaldos cifrados y monitoreo. Entrego el producto funcionando,
                con su dominio, su despliegue y su documentación, no solo el
                código. Cumplo plazos, aviso los impedimentos a tiempo y
                documento las decisiones. También estoy abierto a roles senior o
                de liderazgo técnico.
              </TextReveal>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full px-6">
                  <NextLink href="/#contact">Hablemos de tu proyecto</NextLink>
                </Button>
                <Button
                  asChild
                  variant={"outline"}
                  className="rounded-full px-6"
                >
                  <a href="resume.pdf" target="_blank">
                    Ver CV <Icons.arrowUpRight className="ml-2 size-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />
      <section className="py-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold sm:text-4xl">Habilidades</h2>
          </div>
          <div className="col-span-1 md:col-span-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 md:gap-6 xl:grid-cols-2">
              {skills.map((skill, index) => (
                <SkillCard
                  key={`skill_${index}`}
                  index={index + 1}
                  name={skill.name}
                  description={skill.description}
                  thumbnail={skill.thumbnail}
                  className="flex rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />
      <section className="py-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold sm:text-4xl">Tecnologías</h2>
          </div>
          <div className="col-span-1 md:col-span-3">
            <div
              className="relative h-full w-full cursor-pointer items-center justify-center overflow-hidden"
              ref={testimonialsRef}
            >
              <div className="flex h-full w-full flex-wrap items-center justify-start gap-4">
                {technologies.map((technology, index) => (
                  <>
                    <TechnologyCard
                      key={`technology_${index}`}
                      name={technology.name}
                      containerRef={testimonialsRef}
                    />

                    {index < technologies.length - 1 && (
                      <TechnologyCard
                        key={`technology_sep_${index}`}
                        name={","}
                        containerRef={testimonialsRef}
                      />
                    )}
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />
      <section className="py-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold sm:text-4xl">Experiencia</h2>
          </div>
          <div className="col-span-1 md:col-span-3">
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
      </section>

      <Separator />
      <section className="py-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold sm:text-4xl">Contacto</h2>
            <div className="mt-2 flex flex-col gap-1">
              <Link
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "h-min w-min p-0 text-sm font-normal sm:text-base md:text-lg",
                )}
                href={`mailto:${contact.email}`}
              >
                <Icons.mail className="h-4 w-4" />
                {contact.email}
              </Link>
              {contact.socials.map(({ Icon, name, href }, index) => (
                <Link
                  target="_blank"
                  href={href}
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "h-min w-min gap-1 p-0 text-sm sm:text-base md:text-lg",
                  )}
                  key={`contact-social_${index}`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {name}
                </Link>
              ))}
            </div>
          </div>
          <div className="col-span-1 md:col-span-3">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
