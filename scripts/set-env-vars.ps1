# PowerShell script to set TOKEN_ENCRYPTION_KEY environment variable for all Firebase Functions
# Usage: Run this script from the project root directory
# Note: You may need to run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Configuration
$PROJECT_ID = "push2tube"  # Change this to your actual project ID if different
$REGION = "us-central1"
$ENV_VAR_NAME = "TOKEN_ENCRYPTION_KEY"
$ENV_VAR_VALUE = "4ecb38472d72c06982b56f08fad67efff2a26e15b2cf35bce0c399a36c99967c"

# List of all functions
$FUNCTIONS = @(
  "createVideoJob",
  "createCheckoutSession",
  "createPortalSession",
  "stripeWebhook",
  "getYouTubeAuthUrl",
  "youtubeOAuthCallback",
  "processVideoJob",
  "cleanupCompletedJob",
  "cleanupOldJobs",
  "monitorErrorRate",
  "resetMonthlyUsage"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setting environment variable for all functions"
Write-Host "Project: $PROJECT_ID"
Write-Host "Region: $REGION"
Write-Host "Variable: $ENV_VAR_NAME"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
} catch {
    Write-Host "ERROR: gcloud CLI is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Check if user is authenticated
$authStatus = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1
if (-not $authStatus) {
    Write-Host "ERROR: Not authenticated with gcloud" -ForegroundColor Red
    Write-Host "Please run: gcloud auth login"
    exit 1
}

# Set the project
Write-Host "Setting GCP project to $PROJECT_ID..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

Write-Host ""
Write-Host "Updating environment variables for all functions..." -ForegroundColor Yellow
Write-Host ""

# Counter for success/failure
$SUCCESS = 0
$FAILED = 0

# Update each function
foreach ($FUNCTION in $FUNCTIONS) {
    Write-Host -NoNewline "Updating $FUNCTION... "
    
    # Try with --gen2 flag first (for v2 functions)
    $output = gcloud functions deploy $FUNCTION `
        --gen2 `
        --runtime=nodejs20 `
        --region=$REGION `
        --update-env-vars "$ENV_VAR_NAME=$ENV_VAR_VALUE" `
        --quiet `
        --project=$PROJECT_ID 2>&1
    
    if ($LASTEXITCODE -eq 0 -and $output -match "Deployed function") {
        Write-Host "✓ Success" -ForegroundColor Green
        $SUCCESS++
    } else {
        # Try without --gen2 flag (for v1 functions)
        $output = gcloud functions deploy $FUNCTION `
            --runtime=nodejs20 `
            --region=$REGION `
            --update-env-vars "$ENV_VAR_NAME=$ENV_VAR_VALUE" `
            --quiet `
            --project=$PROJECT_ID 2>&1
        
        if ($LASTEXITCODE -eq 0 -and $output -match "Deployed function") {
            Write-Host "✓ Success (v1)" -ForegroundColor Green
            $SUCCESS++
        } else {
            Write-Host "✗ Failed" -ForegroundColor Red
            Write-Host "  Note: This function may need to be updated manually via Google Cloud Console" -ForegroundColor Yellow
            $FAILED++
        }
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Summary:"
Write-Host "  Success: $SUCCESS" -ForegroundColor Green
Write-Host "  Failed: $FAILED" -ForegroundColor $(if ($FAILED -gt 0) { "Red" } else { "Green" })
Write-Host "==========================================" -ForegroundColor Cyan

if ($FAILED -gt 0) {
    Write-Host ""
    Write-Host "Some functions failed to update. You can update them manually:" -ForegroundColor Yellow
    Write-Host "1. Go to https://console.cloud.google.com/functions"
    Write-Host "2. Click on each failed function"
    Write-Host "3. Click 'Edit' → 'Runtime environment variables' → 'Add variable'"
    Write-Host "4. Add: $ENV_VAR_NAME = $ENV_VAR_VALUE"
    exit 1
} else {
    Write-Host ""
    Write-Host "All functions updated successfully! ✓" -ForegroundColor Green
    exit 0
}


