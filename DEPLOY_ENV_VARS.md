# Setting Environment Variables for Production

## Quick Setup

### Method 1: Google Cloud Console (Easiest UI Method)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: **push2tube** (or your project ID)
3. Navigate to: **Cloud Functions** → Select any function → **Edit**
4. Scroll down to **Runtime, build, connections and security settings**
5. Click **Runtime environment variables**
6. Click **Add variable**
7. Add:
   - **Name**: `TOKEN_ENCRYPTION_KEY`
   - **Value**: `4ecb38472d72c06982b56f08fad67efff2a26e15b2cf35bce0c399a36c99967c`
8. Click **Deploy** (this will redeploy the function with the new variable)

**Note**: This sets it for one function. For all functions, use Method 2 or 3.

### Method 2: Firebase CLI (Recommended - Sets for All Functions)

Open **Git Bash** or **CMD** (not PowerShell) and run:

Open **Git Bash** or **CMD** (not PowerShell) and run:

```bash
# From project root directory
cd functions

# Set the environment variable (this will be available to all functions)
firebase functions:config:set app.token_encryption_key="4ecb38472d72c06982b56f08fad67efff2a26e15b2cf35bce0c399a36c99967c"
```

**Wait!** Since your code uses `process.env.TOKEN_ENCRYPTION_KEY` (not `functions.config()`), you need to use **Method 3** instead.

### Method 3: Set During Deployment (Best for Your Code)

Since your code reads from `process.env`, the easiest way is to create a script that sets environment variables during deployment. However, the simplest approach is to use **Google Cloud Console** (Method 1) or set them via **Google Cloud CLI**:

```bash
# Using Google Cloud CLI (gcloud)
gcloud functions deploy FUNCTION_NAME \
  --set-env-vars TOKEN_ENCRYPTION_KEY=4ecb38472d72c06982b56f08fad67efff2a26e15b2cf35bce0c399a36c99967c \
  --region=us-central1
```

But this requires deploying each function individually. **The easiest solution is Method 1 (Google Cloud Console)**.

## Step 2: Deploy Functions

**If you used Method 1 (Google Cloud Console)**: The function will be redeployed automatically when you save.

**If you used Method 2 or 3**: Deploy your functions:

```bash
# From the project root
cd functions
npm run build
cd ..
firebase deploy --only functions
```

Or deploy everything:

```bash
firebase deploy
```

## Alternative: Use .env file with dotenv (Simplest for Your Setup)

Since your code uses `process.env`, you can also use a `.env` file that gets loaded. However, `.env` files are not automatically deployed. 

**The recommended approach**: Use **Google Cloud Console (Method 1)** to set the environment variable for your functions, as it's the most straightforward and works with your existing code.

## Step 3: Verify Deployment

1. Check Functions logs:
   ```bash
   firebase functions:log
   ```

2. Test a function call to ensure the environment variable is loaded correctly

3. Check Firebase Console → Functions → Configuration to verify the variable is set

## Important Notes

- The `.env` file is **only for local development** - it doesn't get deployed
- Environment variables set in Firebase Console are available to all functions
- Secrets are more secure but require code changes to access them
- For now, using environment variables (Method 1) is the simplest approach
