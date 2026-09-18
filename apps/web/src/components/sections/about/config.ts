export interface Product {
  name: string;
  description: string;
  slug: string;
  website?: string;
}

// Fichas completas en content/projects/<slug>.mdx; esto es solo el resumen
// para el bloque "Productos en producción" de la portada.
const products: Product[] = [
  {
    name: "SECOP Monitor",
    description: "SaaS de alertas de contratación pública colombiana.",
    slug: "secop-monitor",
    website: "https://secop.24bytes.pro",
  },
  {
    name: "Legado Público",
    description:
      "Rendición de cuentas territorial sobre mapa, en producción para San Roque.",
    slug: "legado-publico",
    website: "https://goapp.24bytes.pro",
  },
  {
    name: "BetLab",
    description:
      "Análisis deportivo con IA y contenido automático para YouTube.",
    slug: "betlab-model",
    website: "https://www.youtube.com/@BetLabModel",
  },
  {
    name: "Imágenes a PDF",
    description: "Herramienta web gratuita para convertir imágenes a PDF.",
    slug: "images-to-pdf",
    website: "https://24bytesco.github.io/images-to-PDF/",
  },
];

export { products };
