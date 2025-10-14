import type { FooterItem } from "@/types/footer";

const footer: FooterItem[] = [
  { title: "Inicio", href: "/" },
  { title: "Proyectos", href: "/projects" },
  { title: "Sobre mí", href: "/about" },
  { title: "Blog", href: "/blog" },
];

export const copyright = {
  // Hardcoded to 2024 as this represents the project's inception year
  startYear: 2024,
};

export { footer };
