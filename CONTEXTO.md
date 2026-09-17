# Portafolio (24bytes.pro) — contexto para una sesión nueva

> Escrito 2026-09-17. Leer entero antes de tocar nada. Reglas comunes en
> `../SESIONES.md` y `../CLAUDE.md`.

## 1. Qué es

Sitio personal y comercial de Alexis Dorado Muñoz / 24Bytes: https://24bytes.pro.
Next.js 15 (App Router) en monorepo pnpm + Turbo (`apps/web`), contenido en MDX
con content-collections + fumadocs (`apps/web/content/projects`, `content/blog`).
Es la única web que enlaza a los productos: **su papel SEO es dar autoridad a
secop.24bytes.pro** y a los demás subdominios.

## 2. Estado al 2026-09-17

- **En producción en Contabo** (`80.190.77.63`), contenedor `portafolio-web`
  (imagen `web-rescatada:latest`, respaldo `web-rescatada:respaldo-20260816`)
  detrás de Cloudflare Tunnel → NPM. Sirve `24bytes.pro` y `www.24bytes.pro`.
- **El servidor NO es un checkout de git**: es un árbol de archivos en
  `~/Documents/Proyectos/Portafolio` que se actualiza por `rsync` y se
  reconstruye con `docker build`. Su `apps/web/src/app/layout.tsx` difiere del
  repo local (versión rescatada): **no rsyncar el árbol entero**, solo los
  archivos que se cambian.
- Hecho el 16/09: `site.url` pasó de `www.example.com` a `https://24bytes.pro`
  (antes `og:url` y `metadataBase` apuntaban al dominio de relleno); `sitemap.ts`
  y `robots.ts` nuevos; canonical relativo en `createMetadata`; cuatro fichas
  de producto (`secop-monitor`, `legado-publico`, `betlab-model`,
  `images-to-pdf`) con portada capturada. Sitemap enviado en Search Console
  (propiedad `sc-domain:24bytes.pro`, re-añadida el 16/09).
- Rama local: `develop` (commits `e59331e`, y los de las fichas). Sin push.

## 3. Cómo se despliega (comandos reales del 16/09)

```bash
rsync -a apps/web/src/app/config.ts user_24bytes@80.190.77.63:~/Documents/Proyectos/Portafolio/apps/web/src/app/
ssh user_24bytes@80.190.77.63 'cd ~/Documents/Proyectos/Portafolio && \
  docker tag web-rescatada:latest web-rescatada:respaldo-$(date +%Y%m%d) && \
  DOCKER_BUILDKIT=1 docker build -t web-rescatada:latest . && \
  docker compose -f docker-compose.deploy.yml up -d --force-recreate --no-deps portafolio-web && \
  docker exec proxy-app-1 nginx -s reload'
```

El build tarda 3-5 min. El `nginx -s reload` del NPM es obligatorio (la IP del
contenedor cambia y NPM cachea la vieja → 502). `scripts/deploy.sh` es de la
época de Cloud Run y **no se usa**.

## 4. Trampas

- Frontmatter MDX: una `description` con `: ` dentro sin comillas hace que
  content-collections descarte la ficha en silencio (pasó con Legado Público).
- Portadas: `public/images/projects/<slug>/cover.jpg` (1200×630 o 1280×720).
- `/projects/[slug]` con slug inexistente devuelve 200 con la maqueta vacía (no
  404): comprobar `<title>` al verificar un despliegue.

## 5. Pendientes

1. Ficha de la demo de clínica (`clinica.24bytes.pro`) y del canal de vídeos:
   sin escribir por falta de datos fiables.
2. Enlace visible a SECOP Monitor desde la portada o el menú (hoy solo desde la
   ficha de proyecto).
3. Blog: no hay entradas nuevas; cada guía técnica que enlace a SECOP suma.
4. Commit/push de `develop` cuando Alexis lo pida.
