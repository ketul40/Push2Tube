#!/bin/bash

# Simplified script using Firebase CLI approach
# This script uses gcloud to update environment variables for all functions
# Run from project root using Git Bash

PROJECT_ID="push2tube"
REGION="us-central1"
ENV_VAR_NAME="TOKEN_ENCRYPTION_KEY"
ENV_VAR_VALUE="4ecb38472d72c06982b56f08fad67efff2a26e15b2cf35bce0c399a36c99967c"

FUNCTIONS=(
  "createVideoJob"
  "createCheckoutSession"
  "createPortalSession"
  "stripeWebhook"
  "getYouTubeAuthUrl"
  "youtubeOAuthCallback"
  "processVideoJob"
  "cleanupCompletedJob"
  "cleanupOldJobs"
  "monitorErrorRate"
  "resetMonthlyUsage"
)

echo "Setting $ENV_VAR_NAME for all functions..."
echo ""

gcloud config set project $PROJECT_ID

for FUNCTION in "${FUNCTIONS[@]}"; do
  echo "Updating $FUNCTION..."
  gcloud functions deploy $FUNCTION \
    --runtime=nodejs20 \
    --region=$REGION \
    --update-env-vars "$ENV_VAR_NAME=$ENV_VAR_VALUE" \
    --quiet || echo "  Warning: $FUNCTION update may have failed"
done

echo ""
echo "Done! Check Google Cloud Console to verify."


