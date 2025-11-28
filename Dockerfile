# Dockerfile multi-stage para monorepo (pnpm + Turbo + Next.js)

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# --- Etapa de compilación (builder) ---
FROM base AS builder
COPY . .
# Instala dependencias respetando el lockfile
RUN pnpm install --frozen-lockfile
# Compila solo la app web (usa filtro de workspace)
# Define valores por defecto para que el build de Next no falle si .env no se copia
ARG DATABASE_URL
ARG RESEND_API_KEY
ARG EMAIL_FROM
ARG EMAIL_TO
ARG ALLOWED_ORIGINS
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG AUTH_REDIRECT_PROXY_URL

ENV DATABASE_URL=${DATABASE_URL:-postgresql://user:pass@localhost:5432/db}
ENV RESEND_API_KEY=${RESEND_API_KEY:-re_dummy_key}
ENV EMAIL_FROM=${EMAIL_FROM:-onboarding@resend.dev}
ENV EMAIL_TO=${EMAIL_TO:-dev@example.com}
ENV ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-dummy}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-dummy}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID:-dummy}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET:-dummy}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET:-dummysecret}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL:-http://localhost:3000/api/auth}
ENV AUTH_REDIRECT_PROXY_URL=${AUTH_REDIRECT_PROXY_URL:-}

# Crea un .env para el paso de build usado por "pnpm with-env".
# Preferir "build.env" si está presente en el contexto; si no, generar uno mínimo.
RUN if [ -f build.env ]; then \
      echo "[builder] Detectado build.env; usando variables provistas"; \
      cp build.env .env; \
    elif [ -f .env ]; then \
      echo "[builder] Usando .env existente"; \
    else \
      printf "DATABASE_URL=%s\nRESEND_API_KEY=%s\nEMAIL_FROM=%s\nEMAIL_TO=%s\nALLOWED_ORIGINS=%s\nNEXT_PUBLIC_CONTACT_FORM_ENABLED=false\nNEXT_PUBLIC_TURNSTILE_SITE_KEY=%s\nNEXT_PUBLIC_CONTACT_CAPTCHA_PROVIDER=%s\nGOOGLE_CLIENT_ID=%s\nGOOGLE_CLIENT_SECRET=%s\nGITHUB_CLIENT_ID=%s\nGITHUB_CLIENT_SECRET=%s\nBETTER_AUTH_SECRET=%s\nBETTER_AUTH_URL=%s\nAUTH_REDIRECT_PROXY_URL=%s\nNEXT_PUBLIC_ANALYTICS_PROVIDER=%s\nNEXT_PUBLIC_CF_ANALYTICS_TOKEN=%s\nNEXT_PUBLIC_PLAUSIBLE_DOMAIN=%s\n" \
        "$DATABASE_URL" "$RESEND_API_KEY" "$EMAIL_FROM" "$EMAIL_TO" "$ALLOWED_ORIGINS" \
        "$NEXT_PUBLIC_TURNSTILE_SITE_KEY" "$NEXT_PUBLIC_CONTACT_CAPTCHA_PROVIDER" \
        "$GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_SECRET" "$GITHUB_CLIENT_ID" "$GITHUB_CLIENT_SECRET" \
        "$BETTER_AUTH_SECRET" "$BETTER_AUTH_URL" "$AUTH_REDIRECT_PROXY_URL" \
        "$NEXT_PUBLIC_ANALYTICS_PROVIDER" "$NEXT_PUBLIC_CF_ANALYTICS_TOKEN" "$NEXT_PUBLIC_PLAUSIBLE_DOMAIN" > .env; \
    fi
RUN pnpm -F @repo/web build

# --- Etapa de ejecución (runner) ---
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Coloca la salida standalone en /app para que rutas como apps/web/.next/static resuelvan correctamente
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
# Recursos públicos: copiar en varias ubicaciones para las expectativas de Next standalone
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/public ./apps/public
COPY --from=builder /app/apps/web/public ./public

# Asegura que las fuentes generadas por content-collections estén disponibles en runtime.
# Aunque Next standalone suele incluirlas, algunos entornos resuelven el módulo virtual
# en la ruta original. Se copian para evitar 500 en páginas de proyecto/blog.
COPY --from=builder /app/apps/web/.content-collections/generated ./apps/web/.content-collections/generated

# Inicia el servidor de Next (standalone incluye todos los archivos del servidor)
CMD ["node", "apps/web/server.js"]
