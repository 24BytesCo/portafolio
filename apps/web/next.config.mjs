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
  images: { unoptimized: true },
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
