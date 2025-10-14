import React from "react";
import { metadata as meta } from "@/app/config";
import Link from "@/components/fancy/link";
import { contact } from "@/components/sections/contact/config";
import { copyright, footer } from "@/components/sections/footer/config";
import { links } from "@/components/sections/header/config";
import { getYearDisplay } from "@/lib/utils";

export default function Content() {
  return (
    <div className="bg-muted/30 flex h-full w-full flex-col justify-between gap-12 px-6 py-10 md:px-8 lg:px-12">
      <Nav />
      <Copyright />
    </div>
  );
}

const Copyright = () => {
  const { startYear } = copyright;
  const yearDisplay = getYearDisplay(startYear);

  return (
    <div
      className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
      style={{ marginTop: "-50px" }}
    >
      <h1
        className="text-foreground/10 mt-2 text-[8vw] leading-[0.95] select-none md:text-[10vw] lg:text-[12vw] xl:text-[14vw] 2xl:text-[13vw]"
        style={{ width: "50%" }}
      >
        Portafolio
      </h1>
      <p className="mt-0 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
        © {yearDisplay} {meta.author.name}
      </p>
    </div>
  );
};

const Nav = () => {
  return (
    <div className="grid w-full grid-cols-2 gap-8 md:grid-cols-3 md:gap-12 lg:gap-16 xl:gap-24">
      <div className="flex flex-col gap-2">
        <h3 className="mb-2 text-zinc-500 uppercase dark:text-zinc-400">
          Sobre mí
        </h3>
        {links.map((link, index) => {
          const { title, href } = link;

          return (
            <a
              className="underline-offset-4 hover:underline"
              href={href}
              key={`ft-l_about_${index}`}
            >
              <p>{title}</p>
            </a>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="mb-2 text-zinc-500 uppercase dark:text-zinc-400">
          Redes
        </h3>
        {contact.socials.map((link, index) => {
          const { name, href } = link;

          return (
            <Link
              className="underline-offset-4 hover:underline"
              href={href}
              target="_blank"
              key={`ft-l_social_${index}`}
              external
            >
              {name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
