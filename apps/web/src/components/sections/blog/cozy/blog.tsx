import React from "react";
import Link from "next/link";
import PostCard from "@/app/blog/_components/post-card";
import { blog } from "@/app/source";
import TextReveal from "@/components/fancy/text-reveal";
import MotionWrap from "@/components/motion-wrap";

import { Button } from "@repo/ui/button";

/**
 * Últimas entradas en la portada.
 *
 * El 2026-10-22 Search Console reportaba `/blog` y sus entradas más nuevas
 * como «Google no reconoce esta URL»: estaban en el sitemap y enlazadas desde
 * el menú, pero ningún enlace del cuerpo de la portada apuntaba a ellas. Esto
 * les da el camino corto desde la página que Google sí rastrea.
 */
function Blog(): React.ReactElement | null {
  const entradas = [...blog.getPages()]
    .sort((a, b) => {
      // El schema declara Date, pero al serializarse el contenido llega string.
      const tA = new Date(a.data.date as unknown as string | Date).getTime();
      const tB = new Date(b.data.date as unknown as string | Date).getTime();
      return (Number.isNaN(tB) ? 0 : tB) - (Number.isNaN(tA) ? 0 : tA);
    })
    .slice(0, 3);

  if (entradas.length === 0) return null;

  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="blog">
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24">
        <div className="grid gap-10">
          <div className="flex w-full flex-col items-center justify-center text-center lg:flex-row lg:justify-between lg:text-left">
            <TextReveal
              as="h2"
              className="flex flex-col -space-y-4 text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
            >
              Del blog
            </TextReveal>
            <p className="mt-4 hidden text-gray-500 lg:mt-0 lg:block lg:w-[35%] dark:text-gray-400">
              Cómo están hechos por dentro los sistemas que tengo corriendo, con
              sus cifras y lo que salió mal.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entradas.map((entrada) => (
              <PostCard
                key={entrada.url}
                title={entrada.data.title}
                href={entrada.url}
                description={entrada.data.description}
                date={entrada.data.date}
                thumbnail={`/images/blog/${entrada.slugs[0]}/cover.jpg`}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <Button asChild variant="secondary">
              <Link href="/blog">Ver todas las entradas</Link>
            </Button>
          </div>
        </div>
      </div>
    </MotionWrap>
  );
}

export default Blog;
