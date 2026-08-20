import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod";

import { env as authEnv } from "@repo/auth/env";
import { env as emailsEnv } from "@repo/emails/env";

export const env = createEnv({
  extends: [emailsEnv, authEnv, vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
    CONTACT_CAPTCHA_PROVIDER: z.enum(["turnstile", "none"]).optional(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_CONTACT_FORM_ENABLED: z.string().min(1).optional(),
    // `.min(1)` reventaba el build: el Dockerfile siempre escribe esta clave
    // en el .env de build (vacía si no hay Turnstile configurado), y dotenv
    // la deja como "" en vez de "undefined" — "" no pasa `.min(1)` pero sí
    // hace felíz a `.optional()` a secas.
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    NEXT_PUBLIC_ANALYTICS_PROVIDER: z.string().optional(),
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_CF_ANALYTICS_TOKEN: z.string().optional(),
    NEXT_PUBLIC_UMAMI_SRC: z.string().optional(),
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
    NEXT_PUBLIC_CONTACT_CAPTCHA_PROVIDER: z
      .enum(["turnstile", "none"])
      .optional(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CONTACT_FORM_ENABLED:
      process.env.NEXT_PUBLIC_CONTACT_FORM_ENABLED,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_ANALYTICS_PROVIDER: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    NEXT_PUBLIC_CF_ANALYTICS_TOKEN: process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN,
    NEXT_PUBLIC_UMAMI_SRC: process.env.NEXT_PUBLIC_UMAMI_SRC,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    NEXT_PUBLIC_CONTACT_CAPTCHA_PROVIDER:
      process.env.NEXT_PUBLIC_CONTACT_CAPTCHA_PROVIDER,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
