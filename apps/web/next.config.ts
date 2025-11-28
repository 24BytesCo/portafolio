import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";
import createJiti from "jiti";

createJiti(fileURLToPath(import.meta.url))("./src/env");

// pendiente: configurar ESLint en CI
const extraOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  /** Activa hot reloading para paquetes locales sin build previo */
  transpilePackages: [
    "@repo/api",
    "@repo/auth",
    "@repo/emails",
    "@repo/comments",
    "@repo/db",
    "@repo/ui",
    "@repo/validators",
  ],
  /** El lint y el typecheck ya corren como tareas separadas en CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    viewTransition: true,
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "24bytes.pro",
        "www.24bytes.pro",
        ...extraOrigins,
      ],
    },
    reactCompiler: true,
  },
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default withContentCollections(nextConfig);
