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
  `respaldo-20260918-2` (primer despliegue del 18/09, aún 15.2.2),
  `respaldo-20260918b`/`c`/`d` (despliegues de la sesión General),
  `respaldo-20260918e` (justo antes de la limpieza de Knip) y
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
- **18/09 noche (sesión Portafolio)**: limpieza de Knip integrada sobre lo de la
  sesión General y desplegada (`2253ebc..9d2de1e`), verificada desde fuera con
  `/stats` y el blog incluidos. Fuera: variantes de plantilla sin usar,
  precargador, testimonios y los paquetes `auth`, `comments` y `db`, con sus
  variables en `env.ts`, `Dockerfile`, CI, `.env.example` y la plantilla del
  compose (el servicio web ya no lleva variables de base de datos ni auth).
  Knip limpio, 0 avisos de lint en la web (5 en `packages/ui`) y
  `pnpm audit --prod` sin críticos (quedan 33 altos, transitivos).
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

- **`POST /api/contacto`** (sesión General, 20/09, commit `6ff4d2b`, desplegado;
  respaldo `web-rescatada:respaldo-20260920`): recibe el formulario de
  `pdf.24bytes.pro` (GitHub Pages, sin backend) y lo manda por Resend. Origen en
  lista cerrada (`ORIGENES`), honeypot, Zod y 5 envíos/hora por IP en memoria.

- **Ficha `images-to-pdf` → «24Bytes PDF»** (sesión General, 20/09, `90e7d0e`,
  desplegado): mismo slug para no romper la URL, 15 enlaces a las herramientas
  de `pdf.24bytes.pro` y dominio nuevo en el bloque de productos de la portada.
  **HECHO el 14/10** (sesión Suite-Herramientas, `2097629`, desplegado):
  `apps/web/public/ads.txt` con `pub-1072758812585458` y el script de AdSense en
  el `<head>` de `layout.tsx`, solo con `NODE_ENV=production` y como `<script>`
  plano (con `next/script` AdSense rechaza el atributo `data-nscript`).
  Verificado: `ads.txt` 200 en https, http y www, y el script en la portada.
  Respaldo de imagen `web-rescatada:respaldo-20261014-1542`. En el panel de
  AdSense el sitio queda «Preparando» con ads.txt «No se encuentra» hasta que
  Google lo rastree: revisar a las 48 h y, si sigue, mirar el WAF de Cloudflare.
  **El producto cambió de nombre y de alcance el 14/10**: «24Bytes PDF» pasa a
  **24Bytes Herramientas**, 49 utilidades en cuatro sitios (`pdf.`, `imagenes.`,
  `audio.` y `video.24bytes.pro`) desde el repo `images-to-PDF`, todas en el
  navegador y sin subir archivos. Ficha y bloque de productos actualizados el
  14/10 por esta sesión. Fuente de verdad: `images-to-PDF/CONTEXTO.md`.
  El formulario de `/api/contacto` solo acepta el origen `pdf.24bytes.pro`;
  para activar los otros tres hay que añadirlos a `ORIGENES` (lo pide la sesión
  Suite-Herramientas antes de tocarlo).

- **«Sobre mí» orientado a proyectos con 24Bytes** (sesión General, 20/09,
  `cf9c0fc`, desplegado): portada y `/about` con el texto del «Acerca de» de
  LinkedIn (9 años, 2 como Tech Lead), botón «Hablemos de tu proyecto» →
  `/#contact`, descripción y palabras clave del sitio. El correo de contacto
  salió a español (`d97cc82`). **Sin revisar**: `public/resume.pdf` puede seguir
  diciendo 6 años.

- **Habilidades** (sesión General, 20/09, `63c368d` + corrección, desplegado):
  de 4 a 8 en `sections/skills/config.ts` (una sola lista para portada y
  `/about`), miniaturas nuevas en `public/images/skills/v2/` generadas con
  HTML → PNG → WebP. Regla al editarlas: solo lo que está en producción de
  verdad (se quitaron «colas» y «proveedor de respaldo» por no constar).

- **Experiencia y segunda entrada del blog** (sesión General, 20/09, `069dcdd`,
  desplegado): `sections/experience/config.ts` rehecho desde el PDF de
  LinkedIn de Alexis (24Bytes desde 2024-02, Inter Rapidísimo desde 2025-11 sin
  descripción ni logo porque LinkedIn no la trae, Double V hasta 2025-08,
  DIGITALWARE en dos etapas, S&P hasta 2022-04, Atik hasta 2021-09, consultor
  privado 2019-2024, Inbox Tienda Virtual, everis). Fuera a propósito los cargos
  no técnicos (Pignick, La Papal, Progresar, Solutec). Entrada
  `content/blog/herramientas-pdf-codigo-abierto.mdx` con imágenes en
  `public/images/blog/herramientas-pdf-codigo-abierto/`.

- **29/09 (sesión Portafolio)**: artículo «Una fábrica de videos para
  monetizar un canal de YouTube casi sin tocarlo» (`5f68d48`), escrito por
  la sesión Videos Betlab y publicado aquí. No nombra el canal a propósito:
  presumir de automatización puede perjudicar su revisión de monetización.
  El CTA de un artículo apunta a `https://24bytes.pro/#contact` (el ancla es
  `contact`, no `contacto`).

- **14/10 (sesión Portafolio)**: desplegado y verificado desde fuera —
  ficha «24Bytes Herramientas» (`a553762`), hoja de vida del 14/10 en
  `public/resume.pdf` con Inter Rapidísimo (logo y la Base de Conocimiento)
  y los dos productos nuevos de 24Bytes (`f558540`), y el artículo
  `herramientas-navegador-imagenes-audio-video` (`53ac641`), continuación del
  de septiembre. Respaldo de imagen `web-rescatada:respaldo-20261014-1748`.
  La hoja de vida manda: si cambia, se actualizan `resume.pdf`,
  `experience/config.ts` y el bloque de productos de `about/config.ts`.
  Segunda tanda del día (`b1fe320`, `f814449`, `1df44aa`, respaldo
  `respaldo-20261014-1800`): el logo de Inter Rapidísimo pasa a 630×303 —la
  tarjeta pinta los logos a 130 px de ancho con alto automático, así que la
  proporción tiene que ser la misma (2,08) o se ven de distinto tamaño—, la
  portada de la ficha muestra los cuatro sitios, un producto puede declarar
  varios dominios (`sitios` en `about/config.ts`) y se pintan en fila, y
  Habilidades suma RAG con grafos de conocimiento y WebAssembly con sus
  miniaturas (estilo de `/images/skills/v2`: fondo oscuro, halo de color,
  sigla y pie; se generan con sharp).

## 2c. Publicidad (AdSense), desde el 15/10

- **Cliente único**: `ca-pub-1072758812585458`. El script vive en el `<head>` de
  `layout.tsx` y solo con `NODE_ENV=production`; `public/ads.txt` en la raíz.
- **Dónde SÍ van anuncios**: los cuatro sitios de herramientas (`pdf.`,
  `imagenes.`, `audio.` y `video.24bytes.pro`), que son tráfico gratuito y sin
  datos de clientes. Al 15/10 todavía NO los tienen: en `images-to-PDF`,
  `tools/sitios.json` trae `adsense_client` vacío y `/ads.txt` da 404.
- **Dónde NO**, decidido por Alexis: `secop.24bytes.pro` y `sanroque.24bytes.pro`
  son productos de pago, `betlab.24bytes.pro` es panel privado de inversores, y
  `goapp.` y `clinica.` son demos comerciales. Ninguno carga el script.
- **El portafolio es frente comercial**: la recomendación es dejarlo sin
  anuncios (exclusión `24bytes.pro` con «esta página y las que empiecen así»).
  Alternativa que Alexis estaba evaluando: dejarlos solo en `/blog` y `/blog/*`,
  excluyendo `/`, `/about` y `/projects*`.
- En `betlab.`, `sanroque.` y `goapp.` el `/ads.txt` responde 200 pero devuelve
  el HTML de la app (Angular sirve cualquier ruta): no es un ads.txt real.

## 3. Cómo se despliega (comandos reales del 18/09)

```bash
ssh user_24bytes@80.190.77.63 hostname        # debe decir vmi3513850
ssh user_24bytes@80.190.77.63 'docker tag web-rescatada:latest web-rescatada:respaldo-$(date +%Y%m%d)'
# Primero con -n (en seco) y revisar las líneas «*deleting»; luego sin -n.
rsync -ai --checksum --delete --exclude-from=scripts/exclusiones-rsync.txt ./ \
  user_24bytes@80.190.77.63:~/Documents/Proyectos/Portafolio/
ssh user_24bytes@80.190.77.63 'cd ~/Documents/Proyectos/Portafolio && \
  bash scripts/construir-imagen-produccion.sh && \
  docker compose -f docker-compose.deploy.yml up -d --force-recreate --no-deps portafolio-web && \
  docker exec proxy-app-1 nginx -s reload'
```

La lista vive en el repo, en `scripts/exclusiones-rsync.txt` (antes había que
copiarla a mano de aquí, y una sesión desplegó con un archivo temporal). Es: `.git node_modules .next .turbo .cache .gstack
.content-collections dist .env .env.* docker-compose.deploy.yml
docker-compose.deploy.yml.* .gbrain-source docs/ CONTEXTO.md NO-LEVANTAR-AQUI.md
.claude`. Sin ellas el `--delete` se llevaría el `.env` y el compose del
servidor; `.claude` es donde los subagentes abren sus copias de trabajo.

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
- El navegador de gstack (`browse`) necesita `bun`, y el shell no interactivo no
  carga `.bashrc`: `export PATH="$HOME/.bun/bin:$PATH"` antes de usarlo, o falla
  con «Executable not found in $PATH: bun».
- En cada revisión, mirar la versión de `next` contra los avisos
  (`corepack pnpm audit --prod`): el RCE de diciembre estuvo nueve meses
  abierto sin que nadie lo viera.
- **Dos sesiones desplegaron el portafolio a la vez el 18/09** (General y
  Portafolio). Antes de desplegar, confirmar que ninguna otra sesión está a
  mitad de un build: `ListAgents`, o preguntarle.
- Un rebase puede mezclar SIN conflicto cambios incompatibles: la limpieza
  quitaba `portafolio-pg` de la plantilla del compose mientras Umami pasaba a
  depender de él, y git lo dejó roto sin avisar. Tras integrar, revisar a mano
  las plantillas de despliegue y validar con `docker compose config`.
- `rsync --delete` puede dejar en el servidor la carpeta vacía de un paquete
  borrado: `rmdir` a mano (pasó con `packages/auth`, `comments` y `db`).

## 5. Pendientes

1. Push de `develop` cuando Alexis lo pida.
2. **Prueba social**: ninguna ficha tiene testimonio ni resultado del lado del
   cliente. Hace falta una frase de San Roque (Legado Público) y un número que
   le sirva a quien contrata, no volumen propio como «600.000 procesos». Es el
   único bloqueador de la auditoría del 17/10 que sigue abierto, y depende de
   que Alexis consiga la cita.
3. ~~Correo `Alexis.Dorado@24bytes.pro`~~ **CERRADO el 18/10**: entrega bien.
   Hay **catch-all** en Email Routing, así que no hacía falta crear ninguna
   regla; el correo de prueba llegó a la bandeja y no hubo rebote. La sonda SMTP
   contra `route1.mx.cloudflare.net` no sirve para distinguirlo: acepta con
   `250 Ok` tanto esa dirección como un buzón inventado. El formulario de
   contacto sigue sin depender de ella (usa `EMAIL_TO`).
4. Reenviar el sitemap en Search Console. Opcional: ya estaba enviado el
   17/09. Por API no se puede, porque el acceso es `webmasters.readonly`.
   Desde el navegador:
   https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3A24bytes.pro
5. Ficha de la demo de clínica (`clinica.24bytes.pro`) y del canal de vídeos:
   sin escribir por falta de datos fiables.
6. Blog: cinco entradas publicadas (SECOP Monitor, herramientas PDF,
   herramientas de imagen/audio/video, la fábrica de videos y su
   actualización del 15/10 con video embebido). Cada guía técnica que enlace
   a un producto suma.
   Un artículo nuevo necesita SIEMPRE `public/images/blog/<slug>/cover.jpg`
   a 1200×630: es lo que usan el índice y el `og:image`, y sin él salen rotos.
7. CSP con nonces (scripts y estilos) si algún día se quiere cerrar más: hoy
   solo cubre frame-ancestors, base-uri, object-src y form-action.
8. Variables que ya nadie lee en el `.env` del servidor (`DATABASE_URL`,
   `BETTER_AUTH_*`, `GOOGLE_*`, `GITHUB_*`) y en `docker-compose.deploy.yml`
   (las del servicio web y su `depends_on` de `portafolio-pg`): no estorban;
   quitarlas cuando se toque ese archivo. `portafolio-pg` SE QUEDA (§2b).

### Auditoría con ojos de cliente y qué se arregló (17/10)

Se revisó el sitio como lo vería alguien que entra a contratar (`/design-review`
de gstack, modo solo diagnóstico; informe completo en
`~/.gstack/projects/Proyectos/designs/design-audit-20261015/`). Diagnóstico:
sitio que gana al reclutador y pierde al cliente, porque no había oferta, el
correo era un Gmail personal y `/projects` enterraba los productos reales bajo
veinte pruebas técnicas de 2021.

Arreglado el 17/10:

- **`/servicios`**: tres paquetes por alcance (producto a medida, automatización
  con IA, operación), sin precio por decisión de Alexis: la cifra se habla en la
  primera llamada. Textos en `src/components/sections/servicios/config.ts`.
- **`/projects`** separa los que llevan la etiqueta `Producto en producción` del
  resto, que queda en un `<details>` plegado. **Para que un proyecto suba a
  destacados basta con añadirle esa etiqueta en su `.mdx`.**
- **Navegación visible en escritorio** (`header/cozy/header.tsx`): antes el único
  enlace del encabezado era el logo y no se veía qué secciones existían. La
  hamburguesa se queda para el menú de pantalla completa. Ojo con el SCSS: el
  selector del logo es `> a` a propósito, porque un `a` suelto posicionaba en
  absoluto también los enlaces de la nav nueva.
- **Audiencias separadas**: la portada le habla al cliente; «Ver CV» y la
  apertura a roles senior se quedan solo en `/about`. Alexis sigue mandando
  hojas de vida, así que esa parte NO se quita.
- **Zonas táctiles de 44 px**: enlaces de producto, botón de menú y el `size`
  por defecto de `@repo/ui/button` (`h-11 md:h-9`), que afecta a todo el sitio.
- **Ficha de la fábrica de videos** y su tarjeta en el bloque de productos de la
  portada, enlazando los dos canales.

Desplegado el 18/10 con el procedimiento de §3 (respaldo de imagen
`web-rescatada:respaldo-20261018`, cero borrados en el `rsync -n`) y verificado
desde fuera: `/`, `/servicios`, `/projects`, `/projects/fabrica-de-videos` y
`/about` en 200, sitemap con 41 URLs e incluyendo `/servicios`.

Lo que NO se tocó, a propósito: el titular de la portada («Un desarrollador full
stack que ❤️ crear software») y la foto del héroe, que la auditoría señala como
el punto más débil para un cliente. Son decisión de Alexis.

### Indexación y marca personal (22/10)

Diagnóstico con la API de Search Console, no impresiones: `/blog`, las dos
entradas de la fábrica y la ficha `/projects/fabrica-de-videos` salían como
**«Google no reconoce esta URL»** — ni rastreadas. No era culpa del sitemap
(41 URLs, descargado el 21/10, cero errores) ni de `robots`: las páginas están
en el sitemap, son `index, follow` y la portada las enlaza. Es rastreo escaso
sobre un dominio sin autoridad. Buscar «Alexis Dorado Muñoz» no devolvía nada
del sitio, y en los últimos 28 días no hubo una sola impresión por su nombre.

Lo que se hizo:

- **Una sola entidad** (`src/lib/entidad.ts`): `Person` y `Organization` con
  `@id` estable, y un `@graph` por página. Antes cada página declaraba su
  propio `Person` suelto, sin identificador: tres copias que un buscador no
  puede casar. `/about` pasa a `ProfilePage` y es la página canónica de la
  persona; entradas y fichas enlazan al mismo `@id` como autor.
- **Sección «Del blog» en la portada** con las tres últimas entradas. Antes
  ningún enlace del cuerpo apuntaba a una entrada, solo el menú.
- **IndexNow** (`scripts/avisar-indexnow.sh` y la clave en `apps/web/public/`):
  avisa a Bing de todas las URLs del sitemap. Google no participa, pero Bing
  alimenta a Copilot y a ChatGPT. Primer envío el 22/10: 41 URLs, respuesta 202.

Lo que **no** puede hacer esta sesión: pedir indexación de una URL. El acceso a
Search Console es `webmasters.readonly`, y la Indexing API de Google solo
admite `JobPosting` y `BroadcastEvent` — para un artículo hay que usar la
inspección de URL a mano. Y ninguna señal interna sustituye a los enlaces
externos: mientras LinkedIn, GitHub y los canales de YouTube no apunten al
dominio, el nombre propio no tiene de dónde ganar posición.

### Cifras en vivo desde la fábrica de videos (15/10)

El artículo `fabrica-de-videos-dos-canales` no lleva las cifras escritas: las
sirve la API de la fábrica. Cadena, toda dentro del servidor:

`portafolio-web` → `http://fabrica-videos:3000/api/meta?canal=previasypolemicas`
(los dos contenedores están en `proxy-net`; por fuera es `fabrica.24bytes.pro`
tras Cloudflare Access y **no se usa** esa vía).

- `src/lib/cifras-canal.ts` lee y mapea (`suscriptores`, `horasValidas`,
  `metaHoras`, `horasValidasDe`). Caché de 30 min.
- `src/app/api/canal/route.ts` la expone al navegador; `<CifrasCanal />`
  (servidor) pinta el HTML y `cifras-canal-vista.tsx` (cliente) la refresca al
  cargar.
- `[slug]/page.tsx` pasó a **ISR de 30 min** (`export const revalidate = 1800`)
  para que el HTML servido no quede congelado en el momento del build. En el
  build no hay red hacia la fábrica, así que la primera versión sale con el
  respaldo y se refresca al servirse.
- **Respaldo obligatorio**: el panel de la fábrica usa basic auth
  (`DASHBOARD_USER`/`DASHBOARD_PASSWORD`), hoy abierto por `DASHBOARD_LIBRE=1`.
  Si se vuelve a cerrar, la llamada falla y salen las cifras de respaldo
  escritas en `RESPALDO`; la página no se rompe, solo deja de refrescar.
- **No se aceptan cifras menores que el respaldo**: una carga a medias de la
  fábrica haría que un artículo publicado mostrara menos de lo ya contado.
- El dato se recalcula una vez al día (timer `betlab-stats-tabla`, 00:40) y
  `horasValidas` viene de la pestaña de Monetización, que va atrasada: por eso
  la leyenda dice la fecha del dato y no «en tiempo real».
- **Pendiente en la fábrica**: el total de videos. `/api/meta` no lo devuelve,
  así que va `~1.000` del respaldo. El lector ya recoge `videosPublicados` si
  algún día aparece.
- El título y el aviso del artículo anterior perdieron las cifras que llevaban
  escritas: un titular con «1.044 suscriptores» envejece al día siguiente.

### Video de YouTube en una entrada (15/10)

`apps/web/src/components/blog/video-youtube.tsx`, registrado en
`src/app/blog/[slug]/page.tsx` junto a `Figura` y `Nota`. Carga diferida: hasta
que no se pulsa, la página solo trae una imagen local; el `<iframe>` de
`youtube-nocookie` se monta al hacer clic. Se usa así:

```mdx
<VideoYouTube id="Syi2LZ-BUEU" titulo="…" miniatura="/images/blog/<slug>/reproductor.jpg" pie="…" />
```

La CSP del sitio no declara `frame-src`, así que el iframe entra sin tocarla.
En `Permissions-Policy` están apagados `accelerometer` y `gyroscope`: el
`allow` del iframe no los pide para no reclamar lo que la cabecera niega.

## 6. Decisiones (18/09)

- Precargador eliminado del todo (no «una vez por sesión»).
- Comentarios y login fuera de la interfaz y de las rutas; `/login` redirige a
  `/`. Los paquetes `auth`, `db` y `comments` salieron con la limpieza de Knip
  el mismo 18/09. `portafolio-pg` se queda: aloja la base de Umami (§2b).
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
