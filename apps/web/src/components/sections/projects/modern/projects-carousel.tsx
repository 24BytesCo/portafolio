"use client";

/**
 * Carrusel de proyectos con autoplay y control manual.
 *
 * - Avanza automáticamente cada 2 segundos cuando es visible en el viewport.
 * - Pausa al hacer hover/drag/touch y reanuda al salir.
 * - Mantiene flechas y arrastre manual (Embla) sin pelear con el temporizador.
 * - En producción, usa `loop: true` para recorrer de forma circular.
 *
 * Props
 * - `items`: Lista de proyectos a renderizar.
 */

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@repo/ui/carousel";

import ProjectCard from "./project-card";

type ProjectItem = {
  title: string;
  href: string;
  description?: string;
  tags?: string[];
  thumbnail?: string;
};

interface ProjectsCarouselProps {
  items: ProjectItem[];
}

export default function ProjectsCarousel({ items }: ProjectsCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const [paused, setPaused] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const clear = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = React.useCallback(() => {
    clear();
    if (!api || paused || !inView || document.hidden) return;
    intervalRef.current = setInterval(() => {
      api?.scrollNext();
    }, 2000);
  }, [api, paused, inView, clear]);

  React.useEffect(() => {
    start();
    return clear;
  }, [start, clear]);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => start(); // reiniciar temporizador tras navegación/selección manual
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, start]);

  React.useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        clear();
      } else {
        start();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [start, clear]);

  // Start autoplay only when the carousel is visible in viewport
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // React to visibility changes from the observer
  React.useEffect(() => {
    if (inView) {
      start();
    } else {
      clear();
    }
  }, [inView, start, clear]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      onMouseEnter={() => {
        setPaused(true);
        clear();
      }}
      onMouseLeave={() => {
        setPaused(false);
        start();
      }}
      onTouchStart={() => {
        setPaused(true);
        clear();
      }}
      onTouchEnd={() => {
        setPaused(false);
        start();
      }}
    >
      <Carousel opts={{ align: "start", loop: true }} setApi={setApi} className="w-full">
        <CarouselContent>
          {items.map((project, index) => (
            <CarouselItem
              key={`project_${index}`}
              className="md:basis-1/2 xl:basis-1/3 2xl:basis-1/4"
            >
              <div className="h-full">
                <ProjectCard
                  title={project.title}
                  href={project.href}
                  description={project.description}
                  tags={project.tags}
                  thumbnail={project.thumbnail}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
