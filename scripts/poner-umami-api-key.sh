#!/usr/bin/env bash
# Guarda la clave de API de Umami en el .env del servidor y recrea la web para
# que el contador de lecturas empiece a mostrar números.
#
# La clave se pide por teclado y no se imprime, no queda en el historial del
# shell ni pasa por este repositorio. Se crea en:
#   https://24bytes.pro/stats  →  Settings  →  API keys  →  Create API key
#
# Uso:  bash scripts/poner-umami-api-key.sh
set -Eeuo pipefail

SERVIDOR="user_24bytes@80.190.77.63"
RUTA="~/Documents/Proyectos/Portafolio"

# Con terminal se pide por teclado; sin ella (la consola de Claude no es
# interactiva) se lee de la entrada estándar.
CLAVE=""
if [[ -t 0 ]]; then
  read -rsp "Pega la clave de API de Umami (no se verá al escribir): " CLAVE || true
  echo
else
  IFS= read -r CLAVE || true
fi

if [[ -z "${CLAVE// }" ]]; then
  cat >&2 <<'AYUDA'
No llegó ninguna clave, así que no se cambió nada.

La clave se crea en https://24bytes.pro/stats → Settings → API keys.
Dos formas de dársela a este script:

  1. En una terminal normal (no la consola de Claude, que no es interactiva):
       bash scripts/poner-umami-api-key.sh

  2. Sin terminal, por la entrada estándar, borrando el archivo después:
       printf '%s' 'LA_CLAVE' > /tmp/clave && bash scripts/poner-umami-api-key.sh < /tmp/clave; shred -u /tmp/clave
AYUDA
  exit 1
fi

# La clave viaja por la entrada estándar de ssh, no como argumento: así no
# aparece en la lista de procesos del servidor.
printf '%s' "$CLAVE" | ssh "$SERVIDOR" "cd $RUTA && \
  cp .env .env.respaldo-\$(date +%Y%m%d-%H%M) && \
  CLAVE=\$(cat) && \
  grep -v '^UMAMI_API_KEY=' .env > .env.nuevo && \
  printf 'UMAMI_API_KEY=%s\n' \"\$CLAVE\" >> .env.nuevo && \
  mv .env.nuevo .env && chmod 600 .env && \
  docker compose -f docker-compose.deploy.yml up -d --force-recreate --no-deps portafolio-web >/dev/null 2>&1 && \
  sleep 8 && \
  docker exec portafolio-web sh -c 'test -n \"\$UMAMI_API_KEY\"' && echo 'Clave guardada y web recreada'"

echo
echo "Comprobando el contador en producción…"
sleep 5
if curl -s https://24bytes.pro/blog/php2shell-la-mitad-de-internet-no-parchea |
  grep -qo '[0-9.]\+ lecturas'; then
  curl -s https://24bytes.pro/blog/php2shell-la-mitad-de-internet-no-parchea |
    grep -o '[0-9.]\+ lecturas' | head -1
else
  echo "Todavía sin número: las páginas se regeneran cada 30 minutos."
  echo "Para verlo ya: ssh $SERVIDOR 'cd $RUTA && docker compose -f docker-compose.deploy.yml restart portafolio-web'"
fi
