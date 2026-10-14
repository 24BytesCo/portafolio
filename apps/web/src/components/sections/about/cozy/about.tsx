import React from "react";
import Link from "next/link";
import TextReveal from "@/components/fancy/text-reveal";
import MotionWrap from "@/components/motion-wrap";
import { products } from "@/components/sections/about/config";

import { Button } from "@repo/ui/button";
import { Icons } from "@repo/ui/icons";

function About() {
  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="about">
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
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
                Construyo productos de software completos y los pongo en
                producción: de la idea al dominio, el cobro, el despliegue y el
                SEO. Soy Full-Stack Developer con 9 años de experiencia, 2 como
                Tech Lead, y fundador de 24Bytes, el estudio desde el que
                desarrollo proyectos para empresas y entidades públicas. Lo que
                ofrezco se puede ver funcionando: SECOP Monitor, Legado Público,
                BetLab y 24Bytes PDF. Si tienes un producto por construir,
                hablemos.
              </TextReveal>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/#contact">Hablemos de tu proyecto</Link>
                </Button>
                <Button asChild variant={"outline"}>
                  <Link href="/about">Ver más</Link>
                </Button>
                <Button asChild variant={"outline"}>
                  <a href="resume.pdf" target="_blank">
                    Ver CV <Icons.arrowUpRight className="ml-2 size-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl dark:text-zinc-50">
              Productos en producción
            </h3>
            <ul className="space-y-3">
              {products.map((product) => (
                <li
                  key={product.slug}
                  className="rounded-xl border border-zinc-950/10 bg-white p-4 dark:border-zinc-50/10 dark:bg-zinc-900"
                >
                  <p className="font-bold text-zinc-950 dark:text-zinc-50">
                    {product.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {product.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <Link
                      href={`/projects/${product.slug}`}
                      aria-label={`Ver ficha de ${product.name}`}
                      className="font-medium underline underline-offset-4 hover:text-zinc-950 dark:hover:text-zinc-50"
                    >
                      Ver ficha
                    </Link>
                    {product.website ? (
                      <a
                        href={product.website}
                        target="_blank"
                        rel="noopener"
                        aria-label={`Visitar sitio de ${product.name} (se abre en una pestaña nueva)`}
                        className="inline-flex items-center gap-1 font-medium underline underline-offset-4 hover:text-zinc-950 dark:hover:text-zinc-50"
                      >
                        Visitar sitio
                        <Icons.arrowUpRight className="size-3.5" />
                      </a>
                    ) : null}
                    {product.sitios?.map((sitio) => (
                      <a
                        key={sitio.href}
                        href={sitio.href}
                        target="_blank"
                        rel="noopener"
                        aria-label={`Abrir ${sitio.etiqueta} de ${product.name} (se abre en una pestaña nueva)`}
                        className="inline-flex items-center gap-1 font-medium underline underline-offset-4 hover:text-zinc-950 dark:hover:text-zinc-50"
                      >
                        {sitio.etiqueta}
                        <Icons.arrowUpRight className="size-3.5" />
                      </a>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </MotionWrap>
  );
}

export default About;
