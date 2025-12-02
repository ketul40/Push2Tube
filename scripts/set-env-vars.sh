#!/bin/bash

# Script to set TOKEN_ENCRYPTION_KEY environment variable for all Firebase Functions
# Usage: Run this script from the project root directory using Git Bash

# Configuration
PROJECT_ID="push2tube"  # Change this to your actual project ID if different
REGION="us-central1"
ENV_VAR_NAME="TOKEN_ENCRYPTION_KEY"

# SECURITY: Never hardcode encryption keys in scripts!
# Read from environment variable or prompt user
if [ -z "$TOKEN_ENCRYPTION_KEY" ]; then
  echo "ERROR: TOKEN_ENCRYPTION_KEY environment variable is not set"
  echo ""
  echo "Please set it before running this script:"
  echo "  export TOKEN_ENCRYPTION_KEY='your-key-here'"
  echo "  ./scripts/set-env-vars.sh"
  echo ""
  echo "Or generate a new key:"
  echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  exit 1
fi

ENV_VAR_VALUE="$TOKEN_ENCRYPTION_KEY"

# List of all functions
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

echo "=========================================="
echo "Setting environment variable for all functions"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Variable: $ENV_VAR_NAME"
echo "=========================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo "ERROR: gcloud CLI is not installed or not in PATH"
  echo "Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
  echo "ERROR: Not authenticated with gcloud"
  echo "Please run: gcloud auth login"
  exit 1
fi

# Set the project
echo "Setting GCP project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

echo ""
echo "Updating environment variables for all functions..."
echo ""

# Counter for success/failure
SUCCESS=0
FAILED=0

# Update each function
for FUNCTION in "${FUNCTIONS[@]}"; do
  echo -n "Updating $FUNCTION... "
  
  if gcloud functions deploy $FUNCTION \
    --gen2 \
    --runtime=nodejs20 \
    --region=$REGION \
    --update-env-vars "$ENV_VAR_NAME=$ENV_VAR_VALUE" \
    --quiet \
    --project=$PROJECT_ID 2>&1 | grep -q "Deployed function"; then
    echo "✓ Success"
    ((SUCCESS++))
  else
    # Try without --gen2 flag (for v1 functions)
    if gcloud functions deploy $FUNCTION \
      --runtime=nodejs20 \
      --region=$REGION \
      --update-env-vars "$ENV_VAR_NAME=$ENV_VAR_VALUE" \
      --quiet \
      --project=$PROJECT_ID 2>&1 | grep -q "Deployed function"; then
      echo "✓ Success (v1)"
      ((SUCCESS++))
    else
      echo "✗ Failed"
      echo "  Note: This function may need to be updated manually via Google Cloud Console"
      ((FAILED++))
    fi
  fi
done

echo ""
echo "=========================================="
echo "Summary:"
echo "  Success: $SUCCESS"
echo "  Failed: $FAILED"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
  echo ""
  echo "Some functions failed to update. You can update them manually:"
  echo "1. Go to https://console.cloud.google.com/functions"
  echo "2. Click on each failed function"
  echo "3. Click 'Edit' → 'Runtime environment variables' → 'Add variable'"
  echo "4. Add: $ENV_VAR_NAME = [your encryption key]"
  exit 1
else
  echo ""
  echo "All functions updated successfully! ✓"
  exit 0
fi


