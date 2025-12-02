#!/bin/bash

# Simplified script using Firebase CLI approach
# This script uses gcloud to update environment variables for all functions
# Run from project root using Git Bash

PROJECT_ID="push2tube"
REGION="us-central1"
ENV_VAR_NAME="TOKEN_ENCRYPTION_KEY"

# SECURITY: Never hardcode encryption keys in scripts!
# Read from environment variable
if [ -z "$TOKEN_ENCRYPTION_KEY" ]; then
  echo "ERROR: TOKEN_ENCRYPTION_KEY environment variable is not set"
  echo ""
  echo "Set it before running:"
  echo "  export TOKEN_ENCRYPTION_KEY='your-key-here'"
  echo "  ./scripts/set-env-vars-simple.sh"
  exit 1
fi

ENV_VAR_VALUE="$TOKEN_ENCRYPTION_KEY"

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


