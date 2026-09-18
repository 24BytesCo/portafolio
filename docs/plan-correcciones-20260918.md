# Plan de correcciones — 24bytes.pro — 2026-09-18

Origen: `/qa-only` (81/100, 16 hallazgos) y `/health` (5,4/10) del 18/09.
Informe: `.gstack/qa-reports/qa-report-24bytes-pro-2026-09-18.md`.
Rama: `develop`. Sin push hasta que Alexis lo pida.

## Hecho previo que cambia el despliegue

Comparado el árbol de Contabo contra el repo (rsync en seco + diff por tokens):
difieren ~70 archivos, pero **todas las diferencias son el commit `1ab3b2c`
(«CI en verde»: formato, orden de imports, arreglos de lint) que nunca se
desplegó**. No hay código en el servidor que falte en el repo; `layout.tsx` solo
cambia en orden de imports y `env.NODE_ENV`. Solo existen allá
`docker-compose.deploy.yml` (+ dos `.bak`) y `.env`.

Consecuencia: este despliegue **iguala el servidor al repo** y la trampa de «no
rsyncar el árbol entero» de `CONTEXTO.md` §2 deja de existir.

## Decisiones con valor por defecto (cambiar antes de arrancar si no cuadran)

| # | Tema | Por defecto | Alternativa |
|---|---|---|---|
| D1 | Precargador 0→100 (~3,7 s) | **Quitarlo** del layout raíz; queda `RouteProgress` | Una vez por sesión y ≤0,8 s |
| D2 | Comentarios del blog + login Google/GitHub | **Quitarlos de la interfaz** (la base está vacía por diseño; hoy dan 500/401 y son superficie de ataque sin uso) | Crear el esquema en `portafolio-pg` y configurar OAuth |
| D3 | Entrada «Hello World» de la plantilla | **Borrarla**; `/blog` queda con estado vacío y sale del sitemap hasta la primera entrada real | Traducirla |

## Fase 0 — preparación (orquestador, 5 min)

1. Arreglar el error de lint que rompería el CI al hacer push:
   `apps/web/src/app/sitemap.ts:15` (`no-base-to-string`) — aceptar solo
   `string | number | Date` en `fecha()`.
2. Entorno local ya listo: dependencias instaladas; usar `corepack pnpm` (no hay
   `pnpm` global) y `CI=1` para el build (`src/env.ts:63` solo se salta la
   validación con `CI` o durante `lint`).

## Fase 1 — cuatro subagentes en paralelo (Sonnet, esfuerzo medio)

Conjuntos de archivos **disjuntos** para que no se pisen.

### A · Rutas, metadatos y SEO
Archivos: `src/app/layout.tsx`, `src/app/loader.tsx`, `src/lib/metadata.ts`,
`src/app/projects/[slug]/page.tsx`, `src/app/blog/[slug]/page.tsx` (+
`page.client.tsx`), `src/app/login/**`, `src/app/page.tsx`.

- `lang="en"` → `lang="es"` (ISSUE-002).
- D1: retirar `<Loader />` del layout y borrar `loader.tsx` (ISSUE-001).
- `og:url` por página: `createMetadata` hoy fija `url: baseUrl`
  (`metadata.ts:28`); las fichas y entradas deben pasar su URL (ISSUE-003).
- Ficha de proyecto: el título pasa a ser el `<h1>` de la página (ISSUE-003).
- `export const dynamicParams = false` en `projects/[slug]` y `blog/[slug]` →
  404 real en slugs inexistentes (ISSUE-005).
- D2: quitar `<PostComments>` de la entrada del blog (ISSUE-004).
- `/login`: `robots: noindex` y título propio; si D2 = quitar, la ruta redirige
  a `/` (ISSUE-011).
- JSON-LD `Person` + `WebSite` en `/` y `CreativeWork`/`SoftwareApplication`
  en las fichas, siguiendo el patrón que ya usan `/about` y `/projects`.

### B · Accesibilidad de componentes
Archivos: `src/components/sections/header/**`, `footer/modern/content.tsx`,
`projects/modern/project-card.tsx` (y variantes), `skills/**`,
`src/components/fancy/**` (texto animado), `src/components/auth/user-button.tsx`.

- Disparador del menú: `<p>` → `<button aria-expanded aria-controls>` con foco
  visible (ISSUE-006).
- Menú abierto: margen lateral igual al de la cabecera y separación real en
  «SOBRE MÍ» (ISSUE-010).
- Pie: «Portafolio» decorativo de `<h1>` a `<p aria-hidden>` (ISSUE-003).
- Tarjetas de proyecto: título `<h1>` → `<h3>`; `aria-label` en los dos `<Link>`
  sin texto (`project-card.tsx:85` y `:105`), o fusionarlos en uno (ISSUE-007).
- Botones de habilidades: `aria-label="Ver detalle de {habilidad}"` en vez de
  «Open dialog «id»» (ISSUE-008).
- Texto animado letra a letra: `aria-label` en el contenedor y `aria-hidden` en
  las letras (ISSUE-012).
- D2: retirar el botón de usuario del menú; si se queda, `aria-label`
  (ISSUE-011).

### C · Contenido
Archivos: `src/components/sections/experience/config.ts`, `src/app/config.ts`,
`src/components/sections/about/**`, `src/components/sections/hero/modern/**`,
`content/blog/hello-world.mdx`.

- Errata «MSetodologías» (`experience/config.ts:34`) (ISSUE-013).
- D3: borrar `hello-world.mdx` (ISSUE-009).
- Portada: título y descripción del sitio mencionan 24Bytes y los productos en
  producción; «Sobre mí» suma el rol de fundador (ISSUE-014).
- Enlace visible a SECOP Monitor desde la portada (pendiente 2 de
  `CONTEXTO.md`): bloque «Productos en producción» con las cuatro fichas antes
  del carrusel, o las cuatro primeras tarjetas marcadas como tales.
- Revisar la mitad derecha vacía de «Sobre mí» a ≥1280 px (ISSUE-016): ahí
  encaja el bloque de productos.

### D · Configuración e infraestructura de la app
Archivos: `next.config.mjs`, `next.config.ts`, `src/app/sitemap.ts`,
`src/app/robots.ts`, `knip.config.ts`.

- Hay **dos** configuraciones de Next (`.mjs` y `.ts`): dejar una sola, la que
  el build usa de verdad, con el contenido fusionado.
- `poweredByHeader: false` y `headers()` con `Strict-Transport-Security`,
  `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`. CSP en modo `Report-Only` primero: Next y la analítica
  usan scripts en línea y una CSP dura a ciegas rompe el sitio (ISSUE-015).
- Sitemap: excluir `/blog` mientras no tenga entradas (D3).
- Quitar de `knip.config.ts` las 5 entradas de `ignoreDependencies` que Knip
  marca como sobrantes.

## Fase 2 — integración y verificación (orquestador + 1 subagente QA, Sonnet)

1. `corepack pnpm format:fix`, luego `lint`, `typecheck`, `check:knip`, y
   `CI=1 pnpm build`. Los 32 avisos de lint restantes se
   arreglan aquí, con todo fusionado, para no chocar con B.
2. `next start` local (no es contenedor ni tiene crons; `NO-LEVANTAR-AQUI.md`
   no aplica) y repetir la batería de `/qa-only` contra `localhost:3000` en modo
   regresión contra `.gstack/qa-reports/baseline.json`.
3. Criterios de salida, comprobados con el navegador y `curl`:
   - contenido visible < 1 s tras la carga, sin contador;
   - `lang="es"`; un solo `<h1>` por página y propio en cada ficha;
   - `/projects/no-existe` → 404; `/blog/*` sin peticiones 4xx/5xx;
   - 0 enlaces sin nombre; menú operable con Tab + Enter;
   - cabeceras de seguridad presentes; sin `x-powered-by`;
   - lint, typecheck y format en verde.
4. Commits en `develop`, uno por bloque (A, B, C, D, lint), formato de la casa.

## Fase 3 — despliegue (orquestador, con confirmación de Alexis)

1. `ssh … hostname` → debe decir `vmi3513850`.
2. Respaldo: `docker tag web-rescatada:latest web-rescatada:respaldo-20260918`
   y `tar` del árbol actual del servidor (sin `node_modules`).
3. `rsync -a --delete` de `apps/`, `packages/`, `tooling/`, `turbo/` y archivos
   raíz, **excluyendo** `.env*`, `docker-compose.deploy.yml*`, `node_modules`,
   `.next`, `.git`. Primero en seco y revisar la lista de borrados.
4. `docker build` → `up -d --force-recreate --no-deps portafolio-web` →
   `docker exec proxy-app-1 nginx -s reload`.
5. Verificar **desde fuera** los criterios de la fase 2 contra
   `https://24bytes.pro`. Si algo falla: volver a etiquetar el respaldo como
   `latest` y recrear.
6. Search Console: reenviar el sitemap.

## Fase 4 — cierre

- `/design-review` y `/cso` sobre el resultado (no antes: revisarían lo que se
  va a cambiar).
- Knip: 32 archivos y 28 dependencias sin usar, herencia de la plantilla
  (variantes `cozy`/`compact`/`minimal` que el sitio no usa). Limpieza en rama
  aparte, con build de control; no bloquea nada de lo anterior.
- Actualizar `CONTEXTO.md`: estado, retirar la trampa de `layout.tsx`, añadir la
  de `corepack pnpm` + build previo al typecheck.
- Pendiente aparte: limpiar `porta-nuevo.24bytes.pro` y `nuevo.24bytes.pro` del
  túnel si siguen vivos.

## Fuera de alcance

Entradas nuevas del blog, fichas de la clínica y del canal de vídeos
(pendientes 1 y 3 de `CONTEXTO.md`): son contenido, no correcciones.
