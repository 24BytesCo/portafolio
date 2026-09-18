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
  // Oculta la cabecera `x-powered-by: Next.js` (no aporta nada y da info gratis a un atacante)
  poweredByHeader: false,
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
  async headers() {
    return [
      {
        // Cabeceras de seguridad para todas las rutas
        source: "/:path*",
        headers: [
          {
            // Fuerza HTTPS por un año. Sin includeSubDomains ni preload:
            // 24bytes.pro tiene otros productos en subdominios que no deben verse forzados desde acá.
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
          {
            // Evita que el navegador reinterprete el tipo de contenido declarado
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Bloquea que el sitio se cargue dentro de un <iframe> ajeno (clickjacking)
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Manda el origen completo solo en same-origin; a terceros, únicamente el origen
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Apaga cámara, micrófono, geolocalización y sensores de movimiento: el sitio no los usa
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), accelerometer=(), gyroscope=(), magnetometer=()",
          },
          {
            // CSP mínima: no restringe scripts/estilos porque Next los inyecta en línea
            // y eso exigiría nonces. Solo cierra framing, base y el destino de formularios.
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        // La página de login se eliminó; cualquier enlace o marcador viejo vuelve al inicio
        source: "/login",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default withContentCollections(nextConfig);
