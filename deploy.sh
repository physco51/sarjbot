#!/bin/bash
# ŞarjBot - Google Cloud Run Deployment Script
# Free tier: 2M requests/month, 360K GB-seconds, 180K vCPU-seconds

set -e

PROJECT_ID="${GCP_PROJECT_ID:-sarjbot}"
REGION="europe-west1"
SERVICE_NAME="sarjbot"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "Building Docker image..."
gcloud builds submit --tag "$IMAGE_NAME" --project "$PROJECT_ID"

echo "Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_NAME" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 1 \
  --set-env-vars "CRON_SECRET=sarjbot-cron-$(openssl rand -hex 16)" \
  --project "$PROJECT_ID"

echo ""
echo "Deployment complete!"
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --project "$PROJECT_ID" --format="value(status.url)"
