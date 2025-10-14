# Portafolio 24Bytes (Monorepo)

Proyecto de portafolio basado en Next.js 15 (App Router) y shadcn/ui, organizado como monorepo (pnpm + Turbo). Incluye carruseles con Embla, contenido estático con content-collections, formulario de contacto protegido con Cloudflare Turnstile y envío de correos con Resend. Despliegue pensado para Google Cloud Run con scripts de apoyo.

## Tabla de contenido
- Resumen
- Características
- Requisitos
- Desarrollo local
- Variables de entorno
- Carrusel de proyectos (autoplay + visibilidad)
- Formulario de contacto (Turnstile + Resend)
- Configuración de dominios (Server Actions)
- Despliegue a Cloud Run
- Scripts incluidos
- Solución de problemas
- Estructura del repositorio

## Resumen
- Framework: Next.js 15 (App Router), TypeScript.
- UI: shadcn/ui, TailwindCSS.
- Carrusel: Embla (wrappers en `packages/ui`).
- Contenido: `@content-collections` para proyectos y blog.
- Emails: Resend + plantillas en `packages/emails`.
- Captcha: Cloudflare Turnstile.
- Despliegue: Docker + Cloud Run.

## Características
- Carrusel de proyectos con autoplay cada 2s y pausa al interactuar.
- Autoplay inicia solo cuando es visible en pantalla (IntersectionObserver).
- Formulario de contacto con captcha Turnstile y envío por Resend.
- Server Actions protegidas por lista de orígenes permitidos (dominios configurables por entorno).
- Scripts para desplegar y sincronizar variables en Cloud Run.

## Requisitos
- Node 22.x (ver `package.json: engines.node`).
- pnpm 9.x.
- gcloud CLI (para despliegue) con permisos sobre el proyecto GCP.

## Desarrollo local
1) Instalar dependencias en el monorepo
   - `pnpm install`
2) Crear `.env` en la raíz (ver sección de variables)
3) Ejecutar en la raíz
   - `pnpm dev`
   - Alternativa solo web: `cd apps/web && pnpm dev`
4) Abrir `http://localhost:3000`

Nota: el comando `dev` usa Turbo para ver cambios en paquetes locales.

## Variables de entorno
Variables principales (raíces/anidadas según paquete):
- `DATABASE_URL`: conexión a Postgres (usado para features de comentarios/autenticación si están activas).
- `ALLOWED_ORIGINS`: lista separada por comas con hostnames autorizados para Server Actions. Ej.: `24bytes.pro,www.24bytes.pro,portfolio-web-...run.app`.
  - Importante: es leída en build (Next). Cambiarla requiere reconstruir y redeployar.
- `NEXT_PUBLIC_CONTACT_FORM_ENABLED`: `true|false`. Si es `false`, el formulario usa `mailto:` como fallback.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`: claves de Cloudflare Turnstile.
- `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`: credenciales y remitentes para Resend.
- (Opcionales) `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET` si activas autenticación.

Ejemplo `.env` (fragmento):
```
ALLOWED_ORIGINS=24bytes.pro,www.24bytes.pro,portfolio-web-2q3n3gsuaq-uc.a.run.app,portfolio-web-1040591179623.us-central1.run.app
NEXT_PUBLIC_CONTACT_FORM_ENABLED=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
RESEND_API_KEY=re_...
EMAIL_FROM=Portfolio <onboarding@resend.dev>
EMAIL_TO=tu-correo@dominio.com
DATABASE_URL=postgresql://...
```

## Carrusel de proyectos (autoplay + visibilidad)
- Archivos clave:
  - `apps/web/src/components/sections/projects/modern/projects.tsx`: obtiene proyectos y resuelve portada.
  - `apps/web/src/components/sections/projects/modern/projects-carousel.tsx`: carrusel cliente con autoplay.
- Comportamiento:
  - Autoplay cada 2000 ms cuando el componente es visible.
  - Pausa en `hover`, `touch` y cuando la pestaña está inactiva; reanuda al volver.
  - Mantiene flechas y drag manual (Embla).
- Ajustes rápidos:
  - Intervalo: cambia `2000` en `projects-carousel.tsx` (búsqueda por `setInterval`).
  - Sensibilidad de visibilidad: `threshold` del `IntersectionObserver` (por defecto `0.1`).

## Formulario de contacto (Turnstile + Resend)
- Archivos clave:
  - Acción: `apps/web/src/app/actions.ts` (`contactSubmit`).
  - Formulario: `apps/web/src/components/sections/contact/cozy/contact-form.tsx`.
  - Modal Turnstile: `apps/web/src/components/sections/contact/_components/turnstile-modal.tsx`.
  - Validación Turnstile: `apps/web/src/lib/turnstile.ts`.
- Requisitos:
  - Cloudflare Turnstile: añade tus dominios en “Allowed domains” del sitio Turnstile.
  - Entorno: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_CONTACT_FORM_ENABLED=true`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`.
- Notas:
  - La validación del lado servidor depende de `TURNSTILE_SECRET_KEY` (si falta, se rechaza la verificación por seguridad).
  - Si el envío falla en Resend, el mensaje de error se propaga al cliente para facilitar diagnóstico.
  - Si necesitas desactivar temporalmente el formulario, pon `NEXT_PUBLIC_CONTACT_FORM_ENABLED=false` (usa `mailto:`).

## Configuración de dominios (Server Actions)
- Archivos: `apps/web/next.config.mjs` (activo) y `apps/web/next.config.ts`.
- Qué hace: configura `experimental.serverActions.allowedOrigins` combinando una lista por defecto con `ALLOWED_ORIGINS` (si está definida).
- Dominios de ejemplo incluidos por defecto: `localhost:3000`, `24bytes.pro`, `www.24bytes.pro` y los dos `run.app` de Cloud Run.
- Importante: cambiar orígenes requiere reconstruir Next (es configuración de build).

## Despliegue a Cloud Run
- Requisitos previos:
  - `gcloud auth login`
  - `gcloud config set project <ID_DEL_PROYECTO>` (por defecto se usa `portafolio-475017` en los scripts)
  - `gcloud config set run/region us-central1`
- Pasos con scripts incluidos:
  1) Desplegar imagen y servicio
     - `./scripts/deploy.sh`
     - Construye con Cloud Build y despliega el servicio `portfolio-web` en Cloud Run.
  2) Sincronizar variables de entorno
     - `./scripts/sync-envs.sh`
     - Sube al servicio las variables de `.env` (incluye Turnstile y Resend). Forza `NEXT_PUBLIC_CONTACT_FORM_ENABLED=true`.
- Dockerfile:
  - Multi-stage. En la etapa de build, si no existe `.env`, genera uno mínimo con valores por defecto (incluye `ALLOWED_ORIGINS`).
  - Salida `standalone` de Next.js, copia de estáticos y contenido generado.

## Scripts incluidos
- `scripts/deploy.sh`:
  - Construye la imagen con Cloud Build y despliega en Cloud Run (`portfolio-web`).
- `scripts/sync-envs.sh`:
  - Actualiza las variables del servicio Cloud Run desde `.env` (ver claves listadas dentro del script).
- Notas de ejecución en Windows:
  - Asegúrate de usar finales de línea `LF` para scripts `.sh`. El repo incluye `.gitattributes` con `*.sh text eol=lf`.
  - Si ves `#!/usr/bin/env: No such file or directory`, normaliza los EOL: `dos2unix scripts/*.sh` o `git add --renormalize .`.

## Solución de problemas
- 403/CSRF en Server Actions:
  - Verifica que el dominio esté en `allowedOrigins` (por defecto + `ALLOWED_ORIGINS`). Reconstruye y redeploya.
- Turnstile “Validación fallida” en producción:
  - Confirma Allowed domains en Cloudflare Turnstile y que las claves estén bien en el entorno.
- Resend rechaza el envío:
  - Valida `RESEND_API_KEY` y que `EMAIL_FROM` use un dominio verificado (o usa `onboarding@resend.dev` temporalmente).
- Scripts .sh no arrancan en Windows (Git Bash):
  - Normaliza EOL a LF (ver sección de Scripts).

## Estructura del repositorio (resumen)
- `apps/web` — App Next.js (página pública del portafolio)
  - `src/components/sections/...` — Secciones (Hero, Projects, Contact, etc.)
  - `src/app/actions.ts` — Server Actions (contacto)
  - `next.config.mjs` — Configuración activa de Next
- `packages/ui` — Componentes compartidos (incluye wrappers de Embla)
- `packages/emails` — Plantillas y tipado para emails
- `tooling` — Scripts para generar contenido de proyectos/covers
- `scripts` — Despliegue y sync de variables a Cloud Run

---
Cualquier mejora o ajuste adicional (por ejemplo, localizar más textos de UI, ampliar tests o CI) se puede abordar en tareas posteriores.

