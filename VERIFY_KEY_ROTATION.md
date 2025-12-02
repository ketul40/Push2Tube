# Verify Encryption Key Rotation

You've successfully rotated the encryption key! Now let's verify everything is working.

## ✅ What You've Done

- [x] Generated a new encryption key
- [x] Updated all 11 Firebase Functions with the new key
- [x] Functions deployed with new key

## 🔍 Verification Steps

### Step 1: Verify All Functions Have the New Key

1. Go to: https://console.cloud.google.com/functions
2. Spot-check a few functions:
   - Click on `youtubeOAuthCallback` (most critical)
   - Click on `createVideoJob`
   - Click on `processVideoJob`
3. For each, verify:
   - **Runtime environment variables** section shows `TOKEN_ENCRYPTION_KEY`
   - The value is your **new key** (not the old one)
   - All functions have the **same** new key

### Step 2: Test YouTube OAuth Connection

**Important**: Existing users' YouTube connections will be broken because their tokens were encrypted with the old key. This is expected and normal.

1. **Go to your production app**
2. **Sign in** to your account
3. **Try to connect YouTube**:
   - If you had a previous connection, it will fail (expected)
   - You'll need to reconnect
4. **Complete the OAuth flow**:
   - Authorize the app
   - You should be redirected back successfully
5. **Check for success**:
   - ✅ Connection should complete
   - ✅ No encryption/decryption errors
   - ✅ New tokens should be stored

### Step 3: Check Function Logs

1. Go to Google Cloud Console → Functions
2. Click on `youtubeOAuthCallback`
3. Click **LOGS** tab
4. Look for recent activity:
   - ✅ Should see successful token encryption
   - ❌ Should NOT see "Invalid encrypted token format" errors
   - ❌ Should NOT see "Missing required environment variables" errors

### Step 4: Verify in Firestore

1. Go to Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Find your user document
4. Check:
   - `youtubeConnected` should be `true` (after reconnecting)
   - `oauthAccessToken` should be a long encrypted string (new format)
   - `oauthRefreshToken` should be a long encrypted string (new format)
   - `youtubeChannelId` should have a channel ID

## ⚠️ Important Notes

### Existing Users

**All existing YouTube connections are now invalid** because:
- Their tokens were encrypted with the old key
- The new key can't decrypt old tokens
- This is **expected behavior** after key rotation

**What users need to do:**
- Reconnect their YouTube accounts
- Go through the OAuth flow again
- New tokens will be encrypted with the new key

### Testing Checklist

- [ ] All 11 functions have the new key
- [ ] Tested YouTube OAuth connection (new connection works)
- [ ] Function logs show no errors
- [ ] New tokens are stored in Firestore
- [ ] Old connections fail gracefully (expected)
- [ ] New connections work successfully

## 🎉 Success Indicators

You'll know the rotation is successful when:

1. ✅ New YouTube OAuth connections work
2. ✅ No errors in function logs about encryption/decryption
3. ✅ New tokens are stored in Firestore with new encryption
4. ✅ All functions can access `TOKEN_ENCRYPTION_KEY` environment variable

## 🐛 Troubleshooting

### Issue: "Invalid encrypted token format"

**Cause**: Trying to decrypt old tokens with new key
**Solution**: This is expected. Users need to reconnect.

### Issue: "Missing required environment variables: tokenEncryptionKey"

**Cause**: Function doesn't have the environment variable set
**Solution**: 
- Double-check the function has `TOKEN_ENCRYPTION_KEY` set
- Make sure you clicked "Deploy" after adding it
- Wait a few minutes for deployment to complete

### Issue: YouTube connection fails

**Cause**: Could be several things
**Solution**:
- Check function logs for specific errors
- Verify the key is set correctly
- Test with a fresh OAuth connection (not an existing one)

## Next Steps

Once verified:
1. ✅ Key rotation is complete
2. ✅ All functions are using the new key
3. ✅ New connections work correctly
4. ⚠️ Existing users need to reconnect (communicate this if needed)
5. ✅ Security issue resolved!

## Optional: Notify Users

If you have active users, you may want to:
- Add a notice in your app about reconnecting YouTube
- Send an email notification
- Update your documentation

But for now, the critical security issue is resolved! 🎉

