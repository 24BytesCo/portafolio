import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    EMAIL_FROM: z.string().min(1).optional(),
    EMAIL_TO: z.string().min(1).optional(),
    // Resend, vía su API HTTP (no SMTP). Antes SMTP de Brevo, con la misma
    // cuenta/dominio que usa SECOP-Monitor: Brevo exige IP autorizada y este
    // servidor tiene IP dinámica, así que un reinicio de router cortaba el
    // correo en silencio. Migrado el 2026-08-15.
    RESEND_API_KEY: z.string().min(1).startsWith('re_').optional(),
    NODE_ENV: z.enum(["development", "production"]).optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
