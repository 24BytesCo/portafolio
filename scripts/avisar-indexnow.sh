#!/usr/bin/env bash
# Avisa a IndexNow (Bing, Yandex, Naver) de las URLs del sitemap.
# Google no participa en IndexNow, pero Bing alimenta a Copilot y a ChatGPT,
# que es por donde llega buena parte del tráfico de los sitios de 24Bytes.
set -euo pipefail

CLAVE="a7a56f0ca102ac657135b6066f0d1758"
HOST="24bytes.pro"

mapfile -t URLS < <(curl -sf "https://$HOST/sitemap.xml" |
  grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g')

if [[ ${#URLS[@]} -eq 0 ]]; then
  echo "No se pudo leer el sitemap de $HOST" >&2
  exit 1
fi

CUERPO=$(python3 -c '
import json, sys
host, clave = sys.argv[1], sys.argv[2]
print(json.dumps({
    "host": host,
    "key": clave,
    "keyLocation": f"https://{host}/{clave}.txt",
    "urlList": [u.strip() for u in sys.stdin if u.strip()],
}))' "$HOST" "$CLAVE" <<<"$(printf '%s\n' "${URLS[@]}")")

CODIGO=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  -H 'Content-Type: application/json; charset=utf-8' \
  --data "$CUERPO" https://api.indexnow.org/indexnow)

echo "IndexNow: ${#URLS[@]} URLs enviadas, respuesta $CODIGO"
[[ "$CODIGO" == "200" || "$CODIGO" == "202" ]]
