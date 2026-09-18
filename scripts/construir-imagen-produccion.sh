#!/usr/bin/env bash
# Construye la imagen de producción del portafolio EN EL SERVIDOR (Contabo).
# Existe para que los argumentos de build de la analítica no dependan de que
# alguien los recuerde: sin ellos la web compila igual pero sin Umami y sin el
# reenvío /stats (los rewrites y NEXT_PUBLIC_* se resuelven en el build).
set -Eeuo pipefail
cd "$(dirname "$0")/.."

DOCKER_BUILDKIT=1 docker build \
  --build-arg NEXT_PUBLIC_ANALYTICS_PROVIDER=umami \
  --build-arg NEXT_PUBLIC_UMAMI_SRC=/stats/script.js \
  --build-arg NEXT_PUBLIC_UMAMI_WEBSITE_ID=edf47ff5-b6fd-4cde-a85a-4323e3968bfe \
  --build-arg UMAMI_INTERNAL_URL=http://portafolio-umami:3000 \
  -t web-rescatada:latest .
