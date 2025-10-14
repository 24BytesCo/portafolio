import type { Skill } from "@/types/skill";

const skills: Skill[] = [
  {
    name: ".NET / C#",
    thumbnail: "/images/skills/net-c-sharp.png",
    description: `APIs y servicios con .NET y C#: arquitectura en N-capas, DDD, Entity Framework, prácticas de Clean Code y pruebas unitarias.`,
  },
  {
    name: "Angular / TypeScript",
    thumbnail: "/images/skills/angular.png",
    description: `Front-end modular con Angular y micro‑aplicaciones: UI escalable, buenas prácticas, rendimiento y accesibilidad.`,
  },
  {
    name: "Node.js / Express",
    thumbnail: "/images/skills/node.png",
    description: `Servicios REST, JWT/sesiones, Socket.IO, integración con SQL Server y MongoDB, despliegues en Linux/Windows.`,
  },
  {
    name: "Bases de Datos (SQL Server / MongoDB)",
    thumbnail: "/images/skills/bd.png",
    description: `Modelado, rendimiento y migraciones. Cargas masivas y optimización de consultas para alto volumen de datos.`,
  },
];

export { skills };
