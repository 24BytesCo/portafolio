#!/usr/bin/env bash
set -euo pipefail

# --- Config ---
PROJECT_ID="portafolio-475017"
REGION="us-central1"
REPO="portfolio"
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/portfolio-web:latest"
SERVICE="portfolio-web"

echo "[deploy] Región por defecto: $REGION"
gcloud config set run/region "$REGION" >/dev/null

# Preparar build.env con variables necesarias para Next (client y server)
echo "[deploy] Preparando build.env para el paso de build de Next"

KEYS_FILE=".keys.deploy.tmp"
cat > "$KEYS_FILE" << 'EOF'
DATABASE_URL
RESEND_API_KEY
EMAIL_FROM
EMAIL_TO
ALLOWED_ORIGINS
NEXT_PUBLIC_CONTACT_FORM_ENABLED
NEXT_PUBLIC_TURNSTILE_SITE_KEY
NEXT_PUBLIC_CONTACT_CAPTCHA_PROVIDER
NEXT_PUBLIC_ANALYTICS_PROVIDER
NEXT_PUBLIC_CF_ANALYTICS_TOKEN
NEXT_PUBLIC_PLAUSIBLE_DOMAIN
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
BETTER_AUTH_SECRET
BETTER_AUTH_URL
AUTH_REDIRECT_PROXY_URL
EOF

# Construir build.env desde .env (si existe)
if [[ -f .env ]]; then
  echo "# Generado por deploy.sh" > build.env
  while IFS= read -r key || [[ -n "$key" ]]; do
    [[ -z "$key" ]] && continue
    # Obtener valor del .env sin fallar si la clave no existe
    line=$(grep -m1 -E "^$key=" .env || true)
    val="${line#*=}"
    # limpiar CR y comillas
    val="${val%$'\r'}"; val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
    echo "$key=$val" >> build.env
  done < "$KEYS_FILE"
else
  echo "[deploy] Aviso: no se encontró .env; se continuará sin build.env"
fi

echo "[deploy] Construyendo imagen con Cloud Build: $IMAGE"
gcloud builds submit --tag "$IMAGE" .

# Limpiar build.env local
if [[ -f build.env ]]; then rm -f build.env; fi
if [[ -f "$KEYS_FILE" ]]; then rm -f "$KEYS_FILE"; fi

echo "[deploy] Desplegando servicio $SERVICE …"
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080

echo "[deploy] URL del servicio:"
gcloud run services describe "$SERVICE" --region "$REGION" --format="value(status.url)"

echo "[deploy] Hecho."
