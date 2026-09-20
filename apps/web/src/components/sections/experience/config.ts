import type { Experience } from "@/types/experience";

// Fuente: el perfil de LinkedIn de Alexis (exportado el 2026-09-20). Las
// descripciones se parten en viñetas por ";" en la tarjeta.
const experiences: Experience[] = [
  {
    name: "Fundador y Full-Stack Developer",
    duration: "2024-02 - Presente",
    company: "24Bytes — Bogotá",
    logo: "/images/logos-experiencia/24bytes.png",
    description:
      "Estudio de software donde diseño, desarrollo y opero productos propios de punta a punta: arquitectura, infraestructura, despliegue, cobro y SEO; SECOP Monitor: SaaS de alertas de contratación pública con Angular SSR, NestJS, Prisma y PostgreSQL, pagos y WhatsApp Cloud API, con más de 600.000 procesos indexados; Legado Público: rendición de cuentas sobre mapa a nivel de vereda, en producción para una alcaldía de Antioquia, con migración completa de Firebase a Supabase autoalojado; BetLab Model: analítica deportiva con varios LLM (Gemini, OpenAI, Claude) donde las reglas críticas viven en código, y contenido multimedia generado automáticamente; Infraestructura propia: Docker, Linux, Cloudflare (Tunnel y WAF), CI/CD con runners propios, respaldos cifrados y monitoreo.",
  },
  {
    name: "Ingeniero Master",
    duration: "2025-11 - Presente",
    company: "Inter Rapidísimo — Bogotá",
  },
  {
    name: "Desarrollador Full Stack",
    duration: "2024-01 - 2025-08",
    company: "Double V Partners — Bogotá",
    logo: "/images/logos-experiencia/doublev-partners.png",
    description:
      "Reconocimiento Top Performance en los primeros 6 meses (4.57/5) y Good Performance en el segundo semestre (4.32/5); Desarrollo con .NET, Angular y SQL Server; Carga masiva de datos con Python/SQL; Clean Code y control de versiones con Git/Azure Repos.",
  },
  {
    name: "Ingeniero Experto (Líder Técnico)",
    duration: "2022-10 - 2023-08",
    company: "DIGITALWARE — Bogotá",
    logo: "/images/logos-experiencia/digitalware.png",
    description:
      "Ascendido a Líder Técnico después de 10 meses como Desarrollador Sr; Angular con micro-aplicaciones y DevExpress; C#, arquitectura orientada al dominio, N-capas y microservicios; SQL Server con Entity Framework; Clean Code y Scrum.",
  },
  {
    name: "Ingeniero Sénior",
    duration: "2021-12 - 2022-10",
    company: "DIGITALWARE — Bogotá",
    logo: "/images/logos-experiencia/digitalware.png",
    description:
      "Angular con micro-aplicaciones y DevExpress; C#, arquitectura orientada al dominio, N-capas y microservicios; SQL Server con Entity Framework; Clean Code y Scrum.",
  },
  {
    name: "Desarrollador de Software Sr C#",
    duration: "2021-09 - 2022-04",
    company: "S&P Solutions — Popayán",
    logo: "/images/logos-experiencia/sp-solutions.png",
    description:
      "Arquitectura orientada al dominio, patrón repositorio, N-capas y microservicios; .NET Core, Entity Framework y SQL Server; Despliegue continuo con Azure DevOps; Clean Code, SOLID y pruebas unitarias; Scrum.",
  },
  {
    name: "Líder Técnico y Desarrollador Sr Node.js",
    duration: "2021-01 - 2021-09",
    company: "Atik Soluciones — Perú",
    logo: "/images/logos-experiencia/atik-soluciones.png",
    description:
      "Ascendido a Líder Técnico después de 3 meses como Desarrollador Sr; APIs con Node.js y Express, JWT y sesiones, chat con Socket.IO; MongoDB y SQL Server; Despliegues en Linux y Windows Server; Facturación electrónica para Centroamérica con distintos certificadores.",
  },
  {
    name: "Consultor privado",
    duration: "2019-01 - 2024-02",
    company: "24Bytes — Popayán",
    logo: "/images/logos-experiencia/24bytes.png",
    description:
      "Desarrollo a medida para clientes como consultor independiente; Node.js, Angular, MongoDB, MySQL y PHP; Trabajo ágil con Git/GitHub y Scrum.",
  },
  {
    name: "Administración y desarrollo de la tienda virtual",
    duration: "2017-12 - 2019-02",
    company: "Inbox Tienda Virtual — Cauca",
    description:
      "Diseño, desarrollo y administración de la tienda virtual; Diseño y administración de la base de datos; Administración de la empresa y de un equipo de 10 personas: ventas, presupuesto, nómina e inventario.",
  },
  {
    name: "Desarrollador de software",
    duration: "2017-06 - 2017-11",
    company: "everis (hoy NTT DATA) — Popayán",
    logo: "/images/logos-experiencia/nnt-data.png",
    description:
      "Apoyo en artefactos de análisis y documentación técnica; Add-ins de SharePoint Online (C#, jQuery), ASP.NET MVC 5.0 y Office 365 con CSOM/PowerShell; Desarrollo ágil (Scrum) y manejo de TFS.",
  },
];

export { experiences };
