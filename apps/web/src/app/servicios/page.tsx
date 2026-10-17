import React from "react";
import Link from "next/link";
import TextReveal from "@/components/fancy/text-reveal";
import { contact } from "@/components/sections/contact/config";
import { servicios } from "@/components/sections/servicios/config";

import { Button } from "@repo/ui/button";
import { Icons } from "@repo/ui/icons";

const pasos = [
  {
    titulo: "Una llamada de veinte minutos",
    texto:
      "Me cuentas qué quieres resolver. Si no soy la persona indicada, te lo digo ahí mismo y te ahorro el proceso.",
  },
  {
    titulo: "Propuesta con alcance cerrado",
    texto:
      "Por escrito: qué entra, qué no entra, en cuántos hitos y con qué precio. Sin letra pequeña y sin horas abiertas.",
  },
  {
    titulo: "Entregas por hitos",
    texto:
      "Cada hito se ve funcionando, no en un documento. Si un impedimento mueve una fecha, te enteras cuando aparece, no el día de la entrega.",
  },
  {
    titulo: "Traspaso",
    texto:
      "El código, la infraestructura y las decisiones quedan documentadas y a tu nombre. Puedes seguir conmigo o con quien quieras.",
  },
];

export default function ServiciosPage(): React.ReactElement {
  return (
    <main className="flex-1 px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24">
      <section className="flex min-h-[32dvh] flex-col justify-center py-16">
        <h1 className="sr-only">Servicios</h1>
        <TextReveal
          as="h2"
          className="max-w-4xl text-4xl leading-tight tracking-tight text-pretty sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Qué puedo hacer por ti
        </TextReveal>
        <p className="mt-6 max-w-2xl text-gray-500 md:text-lg dark:text-gray-400">
          Trabajo solo y tomo pocos proyectos a la vez, así que lo que entrego
          lo construyo y lo opero yo. Estos son los tres tipos de encargo que
          acepto. El precio depende del alcance y lo hablamos en la primera
          llamada, cuando ya sabemos qué hay que construir.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 pb-16 lg:grid-cols-3">
        {servicios.map((servicio) => (
          <article
            key={servicio.titulo}
            className="flex flex-col rounded-xl border border-zinc-950/10 bg-white p-6 dark:border-zinc-50/10 dark:bg-zinc-900"
          >
            <h3 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              {servicio.titulo}
            </h3>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {servicio.resumen}
            </p>
            <p className="mt-3 text-sm font-medium text-zinc-950 dark:text-zinc-50">
              {servicio.paraQuien}
            </p>
            <h4 className="mt-6 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Qué recibes
            </h4>
            <ul className="mt-2 space-y-2 text-sm">
              {servicio.entregables.map((entregable) => (
                <li key={entregable} className="flex gap-2">
                  <Icons.check
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{entregable}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-zinc-950 dark:text-zinc-50">
                Plazo:
              </span>{" "}
              {servicio.plazo}
            </p>
            <div className="mt-auto pt-6">
              <p className="text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Hecho antes
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4">
                {servicio.pruebas.map((prueba) => (
                  <Link
                    key={prueba.href}
                    href={prueba.href}
                    className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4"
                  >
                    {prueba.texto}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="border-t border-zinc-950/10 py-16 dark:border-zinc-50/10">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Cómo trabajo
        </h2>
        <ol className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pasos.map((paso, indice) => (
            <li key={paso.titulo}>
              <p className="font-mono text-sm text-gray-500 dark:text-gray-400">
                {String(indice + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-bold text-zinc-950 dark:text-zinc-50">
                {paso.titulo}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {paso.texto}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-zinc-950/10 py-16 dark:border-zinc-50/10">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Lo que no hago
        </h2>
        <p className="mt-4 max-w-2xl text-gray-500 dark:text-gray-400">
          Decirlo por adelantado nos ahorra tiempo a los dos: no tomo encargos
          de diseño gráfico ni de marca sin desarrollo, no trabajo sin una
          persona responsable del lado del cliente que pueda decidir, y no
          acepto proyectos cuyo éxito dependa de datos a los que nadie me va a
          dar acceso.
        </p>
      </section>

      <section className="border-t border-zinc-950/10 py-16 dark:border-zinc-50/10">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ¿Hablamos?
        </h2>
        <p className="mt-4 max-w-2xl text-gray-500 dark:text-gray-400">
          Cuéntame qué quieres construir y te digo en la primera respuesta si
          puedo ayudarte, con qué alcance y en cuánto tiempo.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button asChild>
            <Link href="/#contact">Escríbeme por el formulario</Link>
          </Button>
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex min-h-11 items-center font-medium underline underline-offset-4"
          >
            {contact.email}
          </a>
        </div>
      </section>
    </main>
  );
}
