import { withContentCollections } from "@content-collections/next";

// Configuración principal de Next.js para la app web.

const extraOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera salida standalone para Docker
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Optimizador de imágenes de Next activo: recorta al tamaño real de cada
  // breakpoint y sirve AVIF/WebP según lo que acepte el navegador. Antes
  // estaba en `unoptimized: true` y cada <Image> mandaba el archivo original
  // completo (el hero pesaba 23 MB sin recortar). `sharp` ya es dependencia
  // de apps/web, así que el runtime standalone lo trae consigo.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Permite que las Server Actions acepten solicitudes desde estos orígenes en producción
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "24bytes.pro",
        "www.24bytes.pro",
        ...extraOrigins,
      ],
    },
  },
};

export default withContentCollections(nextConfig);
