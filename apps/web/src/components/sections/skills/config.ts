import type { Skill } from "@/types/skill";

// Las miniaturas viven en /images/skills/v2: son cuadradas, del mismo estilo y
// legibles a 48 px, que es como se ven en la tarjeta.
const skills: Skill[] = [
  {
    name: ".NET / C# y arquitectura",
    thumbnail: "/images/skills/v2/dotnet.webp",
    description: `La base de mi carrera: APIs y servicios con .NET y C#, Entity Framework, DDD, N-capas y microservicios, con Clean Code y pruebas. Dos años liderando equipos como Tech Lead.`,
  },
  {
    name: "NestJS / Node.js",
    thumbnail: "/images/skills/v2/nestjs.webp",
    description: `Backends en NestJS con Prisma: APIs REST, colas y tareas programadas, webhooks de pago, autenticación con Firebase y validación estricta de entrada. Es el motor de SECOP Monitor y BetLab.`,
  },
  {
    name: "Angular / TypeScript / Next.js",
    thumbnail: "/images/skills/v2/frontend.webp",
    description: `Angular con SSR, signals y componentes standalone, además de micro-aplicaciones en entornos corporativos. Next.js para sitios de contenido como este portafolio. Cuido accesibilidad, rendimiento y diseño adaptable.`,
  },
  {
    name: "IA aplicada con LLM",
    thumbnail: "/images/skills/v2/ia.webp",
    description: `Pipelines con OpenAI, Gemini y Claude donde las reglas críticas viven en código y no en el prompt: validación y auditoría de cada respuesta, proveedor de respaldo, control de costos y embeddings locales para búsqueda semántica.`,
  },
  {
    name: "Python y automatización",
    thumbnail: "/images/skills/v2/python.webp",
    description: `Scripts y workers con asyncio y httpx, automatización de navegador con Playwright, ingesta de datos abiertos y generación automática de audio y video con ffmpeg.`,
  },
  {
    name: "Bases de datos",
    thumbnail: "/images/skills/v2/datos.webp",
    description: `PostgreSQL, SQL Server y MongoDB. Modelado, migraciones revisadas a mano, cargas masivas y optimización de consultas sobre cientos de miles de registros.`,
  },
  {
    name: "Infraestructura y DevOps",
    thumbnail: "/images/skills/v2/infra.webp",
    description: `Docker Compose en Linux, Cloudflare (DNS, WAF y túneles, sin puertos expuestos a internet), Nginx, CI/CD con runners propios, respaldos cifrados, monitoreo y alertas. Opero en producción lo que construyo.`,
  },
  {
    name: "Producto: SEO, pagos y mensajería",
    thumbnail: "/images/skills/v2/producto.webp",
    description: `Lo que convierte un desarrollo en un producto: SEO técnico con SSR, datos estructurados y Search Console; cobro con pasarelas colombianas; notificaciones por correo y WhatsApp Business; y analítica propia sin cookies.`,
  },
];

export { skills };
