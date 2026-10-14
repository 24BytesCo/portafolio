interface Product {
  name: string;
  description: string;
  slug: string;
  website?: string;
  // Para los productos repartidos en varios dominios: se pintan en fila en vez
  // de un único «Visitar sitio».
  sitios?: { etiqueta: string; href: string }[];
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
    name: "24Bytes Herramientas",
    description:
      "49 utilidades de PDF, imágenes, audio y video que corren en el navegador, sin subir archivos.",
    slug: "images-to-pdf",
    sitios: [
      { etiqueta: "PDF", href: "https://pdf.24bytes.pro" },
      { etiqueta: "Imágenes", href: "https://imagenes.24bytes.pro" },
      { etiqueta: "Audio", href: "https://audio.24bytes.pro" },
      { etiqueta: "Video", href: "https://video.24bytes.pro" },
    ],
  },
];

export { products };
