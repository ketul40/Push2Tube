# Verifying Environment Variable Setup

After setting `TOKEN_ENCRYPTION_KEY` for all functions, follow these steps to verify everything is working.

## Step 1: Verify in Google Cloud Console

1. Go to: https://console.cloud.google.com/functions
2. Click on any function (e.g., `createVideoJob`)
3. Scroll down to **"Runtime environment variables"**
4. Verify you see: `TOKEN_ENCRYPTION_KEY` with your key value
5. Repeat for a few other functions to confirm they all have it

## Step 2: Check Function Logs

1. In Google Cloud Console, go to **Cloud Functions**
2. Click on `youtubeOAuthCallback` (this function uses the encryption key)
3. Click the **"LOGS"** tab
4. Look for any errors about missing `TOKEN_ENCRYPTION_KEY`
5. If you see errors like "Missing required environment variables: tokenEncryptionKey", the variable isn't set correctly

## Step 3: Test YouTube OAuth Connection

The encryption key is used when users connect their YouTube account. Test this:

1. **Go to your production app**: https://your-project-id.web.app (or your deployed URL)
2. **Sign in** to your account
3. **Navigate to Dashboard** or wherever the YouTube connection button is
4. **Click "Connect YouTube"** or similar button
5. **Complete the OAuth flow**:
   - You'll be redirected to Google
   - Authorize the app
   - You'll be redirected back
6. **Check for errors**:
   - If it works: ✅ The encryption key is working!
   - If you see errors about encryption/decryption: ❌ The key might not be set correctly

## Step 4: Check Function Logs After Test

1. Go back to Google Cloud Console → Functions
2. Click on `youtubeOAuthCallback`
3. Check the **LOGS** tab for recent activity
4. Look for:
   - ✅ Success messages about token encryption
   - ❌ Errors about "Invalid encrypted token format" or "Missing required environment variables"

## Step 5: Verify in Firestore

1. Go to Firebase Console → Firestore Database
2. Navigate to the `users` collection
3. Find your user document
4. Check if these fields exist (they should be encrypted):
   - `oauthAccessToken` (should be a long encrypted string)
   - `oauthRefreshToken` (should be a long encrypted string)
   - `youtubeConnected` (should be `true`)
   - `youtubeChannelId` (should have a channel ID)

If these fields exist and are encrypted, the encryption key is working! ✅

## Common Issues

### Issue: "Missing required environment variables: tokenEncryptionKey"

**Solution:**
- Double-check the variable name is exactly: `TOKEN_ENCRYPTION_KEY` (all caps, with underscores)
- Make sure you clicked "Deploy" after adding the variable
- Wait a few minutes for the deployment to complete

### Issue: "Invalid encrypted token format"

**Solution:**
- This usually means the key changed or is different between functions
- Make sure ALL functions have the SAME `TOKEN_ENCRYPTION_KEY` value
- The key should be a 64-character hexadecimal string (32 bytes)
- Generate a new key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Never use keys from documentation or commit them to version control!**

### Issue: YouTube connection fails silently

**Solution:**
- Check the browser console (F12) for errors
- Check function logs in Google Cloud Console
- Make sure the `youtubeOAuthCallback` function has the environment variable set

## Success Indicators

✅ **Everything is working if:**
- No errors in function logs
- YouTube OAuth connection completes successfully
- User document in Firestore has encrypted tokens
- `youtubeConnected` is set to `true`

## Next Steps

Once verified:
1. ✅ Your encryption key is set up correctly
2. ✅ Users can connect their YouTube accounts
3. ✅ OAuth tokens are being encrypted before storage
4. ✅ You're ready to test video generation and upload!

