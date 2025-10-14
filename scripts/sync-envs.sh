#!/usr/bin/env bash
set -euo pipefail

# --- Config ---
PROJECT_ID="portafolio-475017"
REGION="us-central1"
SERVICE="portfolio-web"

if [[ ! -f .env ]]; then
  echo "[sync-envs] No se encontró .env en la raíz. Aborta." >&2
  exit 1
fi

echo "[sync-envs] Región por defecto: $REGION"
gcloud config set run/region "$REGION" >/dev/null

# Claves a sincronizar (incluye contacto, Turnstile y Resend)
read -r -d '' KEYS << 'EOF'
DATABASE_URL
NEXT_PUBLIC_CONTACT_FORM_ENABLED
NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
RESEND_API_KEY
EMAIL_FROM
EMAIL_TO
ALLOWED_ORIGINS
BETTER_AUTH_URL
BETTER_AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
EOF

declare -A MAP
# Leer .env línea por línea, limpiando comillas simples y dobles
while IFS= read -r raw; do
  [[ -z "$raw" || "$raw" =~ ^# ]] && continue
  key="${raw%%=*}"
  val="${raw#*=}"
  # quitar CR y comillas de borde
  val="${val%$'\r'}"; val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
  if grep -qx "$key" <<< "$KEYS"; then
    MAP[$key]="$val"
  fi
done < .env

# Forzar activación del formulario
MAP[NEXT_PUBLIC_CONTACT_FORM_ENABLED]="true"

# Construir cadena KEY=VAL separada por comas
ENV_STRING=""
while IFS= read -r k; do
  v="${MAP[$k]:-}"
  [[ -z "$v" ]] && continue
  # Escapar comas para gcloud
  v="${v//,/\,}"
  if [[ -z "$ENV_STRING" ]]; then
    ENV_STRING="$k=$v"
  else
    ENV_STRING+=",$k=$v"
  fi
done <<< "$KEYS"

if [[ -z "$ENV_STRING" ]]; then
  echo "[sync-envs] No se encontraron claves válidas para actualizar." >&2
  exit 1
fi

echo "[sync-envs] Actualizando variables del servicio $SERVICE …"
gcloud run services update "$SERVICE" --region "$REGION" --update-env-vars "$ENV_STRING"

echo "[sync-envs] Variables aplicadas:"
gcloud run services describe "$SERVICE" --region "$REGION" \
  --format="table(spec.template.spec.containers[0].env.name,spec.template.spec.containers[0].env.value)"

echo "[sync-envs] Listo."
