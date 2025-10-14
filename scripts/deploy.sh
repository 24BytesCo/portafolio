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

echo "[deploy] Construyendo imagen con Cloud Build: $IMAGE"
gcloud builds submit --tag "$IMAGE" .

echo "[deploy] Desplegando servicio $SERVICE …"
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080

echo "[deploy] URL del servicio:"
gcloud run services describe "$SERVICE" --region "$REGION" --format="value(status.url)"

echo "[deploy] Hecho."
