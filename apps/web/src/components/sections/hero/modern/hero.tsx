"use client";

/**
 * Componente de cabecera (Hero) de la página principal.
 *
 * Renderiza un título principal acompañado de una imagen con efecto parallax.
 * Se ejecuta del lado del cliente para poder usar referencias del DOM.
 */

import { useRef } from "react";
import ParallaxImage from "@/components/fancy/parallax-image";

function Hero() {
  const container = useRef<HTMLDivElement>(null);

  return (
    <section
      className="bg-background/[0.96] relative w-full overflow-hidden"
      ref={container}
    >
      <div className="relative z-10 h-[42.5dvh] md:h-[51.2dvh] md:min-h-[50dvh] xl:h-[61.2dvh]">
        <div className="relative flex h-full flex-col items-center justify-center">
          <div className="flex w-full items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24">
            <h1 className="mx-auto max-w-7xl text-3xl leading-[1.2] font-light tracking-tight text-pretty sm:text-5xl sm:leading-[1.15] md:text-6xl md:leading-[1.1] lg:text-7xl lg:leading-[1.05] xl:text-7xl 2xl:text-8xl">
              <span>Un </span>
              <span>desarrollador full stack</span>
              <br />
              <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:gap-x-4">
                <span>que</span>
                <span
                  className={`relative mx-2 my-auto inline-block aspect-[1.5/1] h-[2.5rem] overflow-hidden rounded-full bg-linear-to-br from-pink-200 from-40% to-pink-400 md:mx-4 md:h-[4.5rem]`}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-3xl select-none md:text-5xl">
                    ❤️
                  </span>
                </span>
                <span>crear</span>
                <span>software</span>
              </span>
            </h1>
          </div>
        </div>
      </div>

      <ParallaxImage
        src="/images/hero/cover.webp"
        containerRef={container}
        alt="Hero image"
        containerClassName="aspect-4/2 w-screen lg:mt-28"
        priority
        parallaxOptions={{
          yStart: "-10%",
          yEnd: "10%",
          scaleStart: 1,
          scaleEnd: 1.5,
        }}
      />
    </section>
  );
}

export default Hero;
