# Portafolio (24bytes.pro) — contexto para una sesión nueva

> Escrito 2026-09-17, al día el 2026-09-18. Leer entero antes de tocar nada.
> Reglas comunes en `../SESIONES.md` y `../CLAUDE.md`.

## 1. Qué es

Sitio personal y comercial de Alexis Dorado Muñoz / 24Bytes: https://24bytes.pro.
Next.js 15 (App Router) en monorepo pnpm + Turbo (`apps/web`), contenido en MDX
con content-collections + fumadocs (`apps/web/content/projects`, `content/blog`).
Es la única web que enlaza a los productos: **su papel SEO es dar autoridad a
secop.24bytes.pro** y a los demás subdominios.

## 2. Estado al 2026-09-18

- **En producción en Contabo** (`80.190.77.63`), contenedor `portafolio-web`
  (imagen `web-rescatada:latest`, **Next 15.5.25, usuario `node`**) detrás de
  Cloudflare Tunnel → NPM. Sirve `24bytes.pro` y `www.24bytes.pro`. Respaldos:
  `web-rescatada:respaldo-20260918` (la de antes del 18/09, Next 15.2.2),
  `respaldo-20260918-2` (primer despliegue del 18/09, aún 15.2.2) y
  `respaldo-20260816`; árbol previo en
  `~/respaldos-portafolio/Portafolio-20260918-antes-correcciones.tgz`.
- **Seguridad, 18/09 (`/cso`)**: el sitio corría Next 15.2.2, vulnerable a
  CVE-2025-55182 (ejecución de código sin autenticación en Server Components,
  pública desde el 03/12/2025). Los logs de NPM (proxy host 3) muestran sondas
  de LeakIX y Assetnote con `POST /` → 500 de ~110 bytes (firma de vulnerable)
  que el WAF de Cloudflare no frenó. Sin rastros de compromiso en el
  contenedor ni en el anfitrión (los contenedores anteriores ya no existían
  para revisarlos). Corregido y desplegado en `166c3a3`: Next 15.5.25,
  React 19.0.8, contenedor sin root, acciones de CI fijadas por SHA. Informe
  en `.gstack/security-reports/` (no versionado).
- **El servidor NO es un checkout de git**, pero desde el 18/09 su árbol es
  igual al repo salvo `.env`, `docker-compose.deploy.yml` y `node_modules`: se
  despliega con `rsync --delete` del árbol entero (§3). La diferencia de
  `layout.tsx` que obligaba a subir archivo por archivo era solo formato del
  commit «CI en verde» (`1ab3b2c`), que nunca se había desplegado.
- **18/09**: `/qa-only` de gstack (81/100, 16 hallazgos) y `/health` (5,4/10).
  Plan en `docs/plan-correcciones-20260918.md`, todo corregido, desplegado y
  verificado desde fuera (commits `19b2b61`..`3494a9b`): sin precargador,
  `lang="es"`, un `<h1>` por página, 404 reales en slugs inexistentes, og:url y
  JSON-LD por página, sin comentarios ni login, menú operable con teclado y
  nombres accesibles, bloque «Productos en producción» en la portada (enlaza a
  SECOP), cabeceras de seguridad, textos y fechas en español, blog vacío con
  noindex. El informe de QA y sus capturas están en `.gstack/qa-reports/` (no
  versionado).
- **18/09 tarde (sesión General)**: primera entrada del blog,
  `secop-monitor-alertas-de-contratacion-publica` (commit `bd59842`), desplegada
  con el procedimiento de §3 y verificada desde fuera: 200, canonical propio,
  tres enlaces a secop.24bytes.pro, `/blog` vuelve a index y al sitemap.
  Respaldo de imagen `web-rescatada:respaldo-20260918b`.
- **18/09 noche (sesión General)**: plantilla editorial del blog (commit
  `4342748`), desplegada y verificada. Una entrada nueva es un `.mdx` en
  `content/blog/` con `portada:` (src, alt, ancho, alto) y `cta:` (titulo,
  texto, href, etiqueta) opcionales en el frontmatter, imágenes en
  `public/images/blog/<slug>/` (`cover.jpg` 1200×630 para índice y og:image) y
  los componentes `<Figura src alt pie ancho alto marco />` y
  `<Nota titulo>…</Nota>` dentro del texto. Estilos en `globals.css` bajo
  «Entrada del blog». Respaldo de imagen `web-rescatada:respaldo-20260918c`.
- **16/09**: `site.url` real, `sitemap.ts`, `robots.ts`, canonical relativo y
  las cuatro fichas de producto. Sitemap enviado en Search Console
  (`sc-domain:24bytes.pro`).
- Rama local `develop`: commits del 16 al 18/09 **sin push**.

## 2b. Analítica propia (desde el 18/09)

- **Umami 3.4.0 autoalojado**, servido bajo `https://24bytes.pro/stats` (panel
  y script). Contenedor `portafolio-umami`, imagen `umami-24bytes:3.4.0`
  compilada EN EL SERVIDOR desde `~/Documents/Proyectos/umami-src` con
  `--build-arg BASE_PATH=/stats` (la imagen oficial no admite ruta base). Sin
  puertos ni `proxy-net`: solo lo alcanza `portafolio-web` por `portafolio-net`,
  con los rewrites de `next.config.mjs` (`UMAMI_INTERNAL_URL`).
- Base `umami` (usuario `umami`) dentro de `portafolio-pg`. Credenciales en el
  `.env` del servidor (`UMAMI_DB_PASSWORD`, `UMAMI_APP_SECRET`); clave del
  usuario `admin` del panel en `~/.umami-admin-pass` del servidor (600). La de
  fábrica (`umami`) ya no vale. Id del sitio: `edf47ff5-b6fd-4cde-a85a-4323e3968bfe`.
- **Todo lo de analítica se resuelve en el BUILD** (NEXT_PUBLIC_* y rewrites), y
  `.env` está en `.dockerignore`: la imagen se construye SIEMPRE con
  `scripts/construir-imagen-produccion.sh`, que pasa los `--build-arg`. Un
  `docker build` a secas deja la web sin medición y sin `/stats`.
- **Medidor de lectura** (`components/blog/medidor-lectura.tsx`, en cada
  artículo): eventos `lectura` (hito 25/50/75/100% del cuerpo), `lectura-tiempo`
  (30 s, 1, 2, 3, 5 min de tiempo ACTIVO) y `lectura-fin` (por `sendBeacon`:
  segundos, tramo y hasta dónde llegó). Verificado en producción el 18/09. Se
  ven en el panel → Eventos, filtrando por la propiedad `articulo`.
- Umami descarta agentes de bot: para probar con Playwright hay que poner un
  User-Agent de navegador normal o el envío responde 200 y no guarda nada.

## 3. Cómo se despliega (comandos reales del 18/09)

```bash
ssh user_24bytes@80.190.77.63 hostname        # debe decir vmi3513850
ssh user_24bytes@80.190.77.63 'docker tag web-rescatada:latest web-rescatada:respaldo-$(date +%Y%m%d)'
# Primero con -n (en seco) y revisar las líneas «*deleting»; luego sin -n.
rsync -ai --checksum --delete --exclude-from=exclusiones.txt ./ \
  user_24bytes@80.190.77.63:~/Documents/Proyectos/Portafolio/
ssh user_24bytes@80.190.77.63 'cd ~/Documents/Proyectos/Portafolio && \
  bash scripts/construir-imagen-produccion.sh && \
  docker compose -f docker-compose.deploy.yml up -d --force-recreate --no-deps portafolio-web && \
  docker exec proxy-app-1 nginx -s reload'
```

`exclusiones.txt` (una por línea): `.git node_modules .next .turbo .cache .gstack
.content-collections dist .env .env.* docker-compose.deploy.yml
docker-compose.deploy.yml.* .gbrain-source docs/ CONTEXTO.md NO-LEVANTAR-AQUI.md`.
Sin ellas el `--delete` se llevaría el `.env` y el compose del servidor.

El build tarda ~4 min. El `nginx -s reload` del NPM es obligatorio (la IP del
contenedor cambia y NPM cachea la vieja → 502). Vuelta atrás:
`docker tag web-rescatada:respaldo-AAAAMMDD web-rescatada:latest` y el mismo
`up -d --force-recreate`. `scripts/deploy.sh` es de la época de Cloud Run y
**no se usa**.

Antes de desplegar, en el portátil: `corepack pnpm lint`, `CI=1 corepack pnpm
build`, `corepack pnpm typecheck`, `corepack pnpm format`, y mirarlo en el
navegador con `CI=1 corepack pnpm exec next start -p 3100` desde `apps/web`.

## 4. Trampas

- **pnpm no está instalado global en el portátil (WSL)**: `corepack pnpm`.
  Turbo y el `postinstall` llaman a `pnpm` a secas, así que para `build`,
  `lint` y `typecheck` hace falta un shim en el PATH que ejecute
  `corepack pnpm "$@"`.
- **El build local sin `CI=1` falla** por la validación de variables de
  `src/env.ts`, que solo se salta con `CI` o durante `lint`.
- **`typecheck` da ~39 errores falsos** si no existe
  `apps/web/.content-collections/generated`, y errores de rutas borradas si
  quedan `.next/types` viejos: `rm -rf apps/web/.next` y `CI=1 pnpm build`
  antes.
- Next 15.2 carga `next.config.js` → `.mjs` → `.ts`, en ese orden. El `.ts`
  nunca se aplicaba y se borró el 18/09: la configuración es `next.config.mjs`.
- ESLint lleva el plugin del React Compiler: **desactivar una regla de hooks con
  `eslint-disable` es error de lint**. Hay que arreglar las dependencias.
- `createMetadata` (`src/lib/metadata.ts`) fuerza robots index/follow: para un
  noindex hay que pisar `robots` después, como en `blog/page.tsx`.
- El preflight de Tailwind pone `text-transform: none` en `<button>`: el botón
  del menú hereda la minúscula de la cabecera con `text-transform: inherit`.
- En git, las rutas con `[slug]` o `(grupo)` son patrones: usar
  `GIT_LITERAL_PATHSPECS=1`.
- Frontmatter MDX: una `description` con `: ` dentro sin comillas hace que
  content-collections descarte la ficha en silencio (pasó con Legado Público).
- Portadas: `public/images/projects/<slug>/cover.jpg` (1200×630 o 1280×720).
- Las fechas del frontmatter van sin hora: formatearlas en UTC
  (`formatearFecha` en `src/lib/utils.ts`) o salen con un día menos en UTC-5.
- Next 15.5 registra `Error: Internal: NoFallbackError` en cada 404 de las
  rutas con `dynamicParams = false`: es ruido, la respuesta es un 404 correcto.
- Hay Docker en el portátil (WSL): antes de desplegar un cambio del
  `Dockerfile`, construir y arrancar la imagen aquí
  (`docker run -p 127.0.0.1:3200:3000 -e PORT=3000 -e CI=1 …`).
- En cada revisión, mirar la versión de `next` contra los avisos
  (`corepack pnpm audit --prod`): el RCE de diciembre estuvo nueve meses
  abierto sin que nadie lo viera.

## 5. Pendientes

1. Push de `develop` cuando Alexis lo pida.
2. Limpieza de Knip en rama aparte: 37 archivos y 29 dependencias sin usar
   (variantes compact/minimal, testimonios, precargador, auth, comentarios, db).
   Los 21 avisos de lint que quedan están todos en ese código muerto, y quitar
   `better-auth` elimina los 2 avisos críticos que quedan en `pnpm audit
   --prod` (sin rutas que lo usen desde el 18/09). Con build y QA de control.
   Si sale `packages/db`, el contenedor `portafolio-pg` (vacío) sobra.
3. `/design-review` sobre el sitio ya corregido (fase 4 del plan).
4. Reenviar el sitemap en Search Console. Opcional: ya estaba enviado el
   17/09. Por API no se puede, porque el acceso es `webmasters.readonly`.
   Desde el navegador:
   https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3A24bytes.pro
5. Ficha de la demo de clínica (`clinica.24bytes.pro`) y del canal de vídeos:
   sin escribir por falta de datos fiables.
6. Blog sin entradas. La primera devuelve `/blog` al sitemap y quita el
   noindex sola; cada guía técnica que enlace a SECOP suma.
7. CSP con nonces (scripts y estilos) si algún día se quiere cerrar más: hoy
   solo cubre frame-ancestors, base-uri, object-src y form-action.

## 6. Decisiones (18/09)

- Precargador eliminado del todo (no «una vez por sesión»).
- Comentarios y login fuera de la interfaz y de las rutas: la base
  `portafolio-pg` está vacía por diseño. Los paquetes `auth`, `db` y
  `comments` siguen hasta la limpieza de Knip; `/login` redirige a `/`.
- «Hello World» de la plantilla borrado; `/blog` queda vacío con noindex.
- JSON-LD de las fichas como `CreativeWork`, no `SoftwareApplication`: Google
  exige offers y valoraciones y Search Console lo marcaría inválido.
- HSTS sin `includeSubDomains` ni `preload`, porque afectaría a los demás
  productos en subdominios.
- Enlaces a productos propios con `rel="noopener"`, sin `noreferrer`, para que
  su analítica atribuya la visita a 24bytes.pro.
- «ASP.NET MVC 5.0» en la experiencia de NTT Data, confirmado por Alexis
  (antes decía «Airones MVC 5.0»).
- Tras el `/cso`, Alexis eligió arreglarlo todo de inmediato: Next 15.5.25 y
  React 19.0.8 (misma rama 19.0), imagen con el usuario `node` y acciones de
  CI fijadas por SHA. `react-email` pasa a `devDependencies`.
