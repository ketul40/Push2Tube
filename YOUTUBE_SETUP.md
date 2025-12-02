# YouTube OAuth Setup Guide

This guide explains how to get your YouTube OAuth Client ID and Client Secret from Google Cloud Console.

## Step 1: Go to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (or create one if you haven't)
3. Make sure you're in the correct project

## Step 2: Enable YouTube Data API v3

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "YouTube Data API v3"
3. Click on it and click **"Enable"**
4. Wait for it to enable (may take a minute)

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

### If you haven't configured OAuth consent screen:

You'll be prompted to configure it first:

1. Click **"Configure Consent Screen"**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: Push2Tube (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. On **Scopes** page, click **"Save and Continue"** (no need to add scopes here)
7. On **Test users** page, click **"Save and Continue"** (add your email if needed)
8. Click **"Back to Dashboard"**

### Create OAuth Client ID:

1. Go back to **Credentials** → **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. **Application type**: Select **"Web application"**
3. **Name**: Push2Tube (or any name you prefer)
4. **Authorized JavaScript origins**: 
   - Add: `https://your-project-id.web.app` (your Firebase hosting URL)
   - Add: `https://your-project-id.firebaseapp.com` (alternative Firebase URL)
   - Add: `http://localhost:5173` (for local development)
5. **Authorized redirect URIs**:
   - Add: `https://your-project-id-us-central1.cloudfunctions.net/youtubeOAuthCallback`
   - Add: `http://localhost:5173` (for local development)
   
   **Important**: Replace `your-project-id` with your actual Firebase project ID!
   
   Example:
   ```
   https://push2tube-dev-us-central1.cloudfunctions.net/youtubeOAuthCallback
   ```

6. Click **"Create"**

## Step 4: Get Your Credentials

After creating, you'll see a popup with:
- **Your Client ID**: Something like `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- **Your Client Secret**: Something like `GOCSPX-abcdefghijklmnopqrstuvwxyz`

**Important**: Copy these immediately! The secret won't be shown again.

## Step 5: Add to Environment Variables

### For Local Development (functions/.env):

```env
YOUTUBE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
YOUTUBE_REDIRECT_URI=https://your-project-id-us-central1.cloudfunctions.net/youtubeOAuthCallback
```

### For Production (Firebase Functions):

Set these in Firebase Functions environment:

```bash
firebase functions:config:set \
  youtube.client_id="123456789-abcdefghijklmnop.apps.googleusercontent.com" \
  youtube.client_secret="GOCSPX-abcdefghijklmnopqrstuvwxyz" \
  youtube.redirect_uri="https://your-project-id-us-central1.cloudfunctions.net/youtubeOAuthCallback"
```

Or use Firebase Console:
1. Go to Firebase Console → Functions → Configuration
2. Add environment variables:
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
   - `YOUTUBE_REDIRECT_URI`

## Step 6: Generate Token Encryption Key

You also need a `TOKEN_ENCRYPTION_KEY` for encrypting OAuth tokens:

```bash
# Generate a 32-byte (256-bit) hex key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it to your environment variables:

```env
TOKEN_ENCRYPTION_KEY=your-generated-64-character-hex-string
```

## Step 7: Verify Setup

1. Deploy your functions:
   ```bash
   cd functions
   firebase deploy --only functions
   ```

2. Test YouTube connection in your app
3. Check that OAuth flow works

## Troubleshooting

### "Redirect URI mismatch" error?
- Make sure the redirect URI in Google Cloud Console exactly matches:
  `https://your-project-id-us-central1.cloudfunctions.net/youtubeOAuthCallback`
- Check your project ID is correct
- Check the region matches (us-central1)

### "API not enabled" error?
- Make sure YouTube Data API v3 is enabled in Google Cloud Console
- Wait a few minutes after enabling for it to propagate

### "Invalid client" error?
- Double-check your Client ID and Secret are correct
- Make sure there are no extra spaces when copying
- Verify you're using the correct credentials (not from a different project)

### Can't find OAuth consent screen?
- Go to **APIs & Services** → **OAuth consent screen**
- Make sure you've completed the setup

## Security Notes

- ⚠️ **Never commit** your Client Secret to git
- ⚠️ Keep your credentials secure
- ⚠️ Use different credentials for development and production (optional but recommended)
- ✅ The Client ID can be public (it's used in frontend)
- ✅ The Client Secret must be kept private (only in backend)

## Next Steps

After setting up YouTube OAuth:
1. Test the connection in your app
2. Verify tokens are stored encrypted in Firestore
3. Test video upload functionality



