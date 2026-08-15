import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    EMAIL_FROM: z.string().min(1).optional(),
    EMAIL_TO: z.string().min(1).optional(),
    // Brevo (antes Sendinblue) por SMTP: misma cuenta/dominio verificado
    // (SPF+DKIM) que ya usa SECOP-Monitor. Reemplaza a Resend, que nunca
    // llegó a tener RESEND_API_KEY configurada en este despliegue.
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),
    NODE_ENV: z.enum(["development", "production"]).optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
