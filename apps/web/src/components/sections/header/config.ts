import type { Link } from "@/types/link";

// This is a setting for the compact header
const linkLimit = 4;
//

const links: Link[] = [
  { title: "Inicio", href: "/", thumbnail: "home.jpg" },
  { title: "Sobre mí", href: "/about", thumbnail: "about.jpg" },
  { title: "Proyectos", href: "/projects", thumbnail: "projects.jpg" },
  { title: "Blog", href: "/blog", thumbnail: "blog.jpg" },
];

export { linkLimit, links };
