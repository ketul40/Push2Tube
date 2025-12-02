# ⚠️ URGENT: Encryption Key Rotation Required

## Security Issue

The production encryption key has been exposed in repository files. **This key must be rotated immediately.**

## Immediate Actions Required

### Step 1: Generate a New Key

Generate a new 64-character hexadecimal encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Save this new key securely** - you'll need it for all functions.

### Step 2: Update All Functions

Update all 11 functions with the new key via Google Cloud Console:

1. Go to: https://console.cloud.google.com/functions
2. For each function:
   - Click the function name
   - Click **EDIT**
   - Scroll to **Runtime environment variables**
   - **Update** `TOKEN_ENCRYPTION_KEY` with your new key
   - Click **DEPLOY**

Functions to update:
- createVideoJob
- createCheckoutSession
- createPortalSession
- stripeWebhook
- getYouTubeAuthUrl
- youtubeOAuthCallback
- processVideoJob
- cleanupCompletedJob
- cleanupOldJobs
- monitorErrorRate
- resetMonthlyUsage

### Step 3: Handle Existing Encrypted Data

**Important**: Existing OAuth tokens encrypted with the old key will no longer be decryptable.

You have two options:

#### Option A: Force Re-authentication (Simplest)

Users will need to reconnect their YouTube accounts:
- Their existing `oauthAccessToken` and `oauthRefreshToken` will be invalid
- They'll need to go through the OAuth flow again
- This is the safest approach

#### Option B: Migration Script (If you need to preserve connections)

Create a migration script that:
1. Reads all user documents with encrypted tokens
2. Decrypts with the old key (if you still have it temporarily)
3. Re-encrypts with the new key
4. Updates Firestore

**Warning**: This requires temporarily having both keys available, which is a security risk.

### Step 4: Remove Old Key References

1. ✅ **Already done**: Removed from documentation files
2. ✅ **Already done**: Updated scripts to read from environment variables
3. ⚠️ **You must do**: Remove the key from git history (if possible)
4. ⚠️ **You must do**: Verify no other files contain the key

### Step 5: Verify New Key is Working

1. Test YouTube OAuth connection in your app
2. Check function logs for errors
3. Verify tokens are being encrypted/decrypted correctly
4. Confirm new encrypted tokens are stored in Firestore

## Prevention for Future

1. ✅ Never commit secrets to version control
2. ✅ Use Google Cloud Secret Manager for production
3. ✅ Scripts now read from environment variables
4. ✅ Documentation updated with security warnings
5. ✅ Created `SECURITY.md` with best practices

## Timeline

- **Immediate**: Generate new key and update all functions
- **Within 24 hours**: Complete rotation and verify functionality
- **Within 48 hours**: Remove old key from any remaining locations
- **Ongoing**: Monitor for any issues with token decryption

## Verification Checklist

- [ ] New key generated
- [ ] All 11 functions updated with new key
- [ ] Functions deployed successfully
- [ ] Tested YouTube OAuth connection
- [ ] Verified no errors in function logs
- [ ] Confirmed new tokens are encrypted correctly
- [ ] Removed old key from all files
- [ ] Updated team (if applicable)
- [ ] Documented the rotation in your security log

## Need Help?

If you encounter issues during rotation:
1. Check function logs in Google Cloud Console
2. Verify the key format (must be 64 hex characters)
3. Ensure all functions have the same key
4. Test with a single function first before updating all

