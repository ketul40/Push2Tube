# Setting TOKEN_ENCRYPTION_KEY Manually (No CLI Required)

Since you don't have `gcloud` CLI installed, here's the easiest way to set the environment variable for all functions using the Google Cloud Console UI.

## Step-by-Step Instructions

### 1. Go to Google Cloud Console

1. Open: https://console.cloud.google.com
2. Make sure you're in the **Push2Tube Prod** project (check the project selector at the top)

### 2. Navigate to Cloud Functions

1. In the left menu, click **Cloud Functions** (under "Serverless")
   - Or go directly to: https://console.cloud.google.com/functions

### 3. Update Each Function

You need to update all 11 functions. For each one:

1. **Click on the function name** (e.g., `createVideoJob`)
2. Click the **"EDIT"** button (top right)
3. Scroll down to **"Runtime, build, connections and security settings"**
4. Expand that section
5. Find **"Runtime environment variables"**
6. Click **"ADD VARIABLE"**
7. Enter:
   - **Name**: `TOKEN_ENCRYPTION_KEY`
   - **Value**: Generate a secure 64-character hex key using:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
     **IMPORTANT**: Never use keys from documentation or commit them to version control!
8. Click **"DEPLOY"** (bottom of the page)
9. Wait for deployment to complete (usually 1-2 minutes)

### 4. Repeat for All Functions

Do this for each of these 11 functions:

1. ✅ createVideoJob
2. ✅ createCheckoutSession
3. ✅ createPortalSession
4. ✅ stripeWebhook
5. ✅ getYouTubeAuthUrl
6. ✅ youtubeOAuthCallback
7. ✅ processVideoJob
8. ✅ cleanupCompletedJob
9. ✅ cleanupOldJobs
10. ✅ monitorErrorRate
11. ✅ resetMonthlyUsage

## Quick Tip

- You can open each function in a new tab to speed things up
- The deployment takes 1-2 minutes per function
- You can do this in batches (update a few, then come back later)

## Alternative: Install Google Cloud SDK

If you want to use the script instead, you can install Google Cloud SDK:

1. Download: https://cloud.google.com/sdk/docs/install
2. Install it
3. Run: `gcloud auth login`
4. Then run the script again

But the Console method above is actually faster for a one-time setup!


