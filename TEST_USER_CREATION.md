# Testing User Data Collection

## Step 1: Turn Off Test Mode

1. Open `.env.local` in the root directory
2. Set `VITE_TEST_MODE=false` or remove the line entirely:
```env
VITE_TEST_MODE=false
```

3. Save the file
4. **Restart your development server**:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Step 2: Sign In

1. Go to `http://localhost:5173/`
2. Click **"Sign In with Google"**
3. Sign in with your Google account (`ketul40@gmail.com`)
4. You should be redirected to the Dashboard

## Step 3: Check Browser Console

Open the browser console (F12) and look for:
- `✅ User document created/updated in Firestore` - This confirms the user document was created

## Step 4: Verify in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. You should now see a `users` collection
5. Click on it - you should see your user document with your UID
6. The document should have fields like:
   - `uid`
   - `email`
   - `displayName`
   - `subscriptionPlan`: `"free"`
   - `subscriptionStatus`: `"none"`
   - `videoQuota`: `2`
   - `videosUsedThisMonth`: `0`
   - etc.

## What Happens

When you sign in:
1. Firebase Authentication creates/authenticates your user
2. The Dashboard's `onAuthStateChanged` listener detects the sign-in
3. It automatically calls `createOrUpdateUser()` which:
   - Creates a new user document in Firestore (if it doesn't exist)
   - Or updates the existing one with latest login time
   - Sets default values (free plan, 2 videos/month quota, etc.)

## Next Steps

Once you see your user document in Firestore:
1. You can manually update it to grant yourself a Pro subscription (see `GRANT_SUBSCRIPTION.md`)
2. Or use the script: `node scripts/grant-subscription.js ketul40@gmail.com pro`

## Troubleshooting

**User document not appearing?**
- Check browser console for errors
- Make sure Firestore security rules allow writes
- Verify you're signed in (check Authentication tab in Firebase Console)

**Permission denied errors?**
- Check Firestore security rules allow users to create their own documents
- The rules should allow: `allow create: if isOwner(userId);`

**Still seeing test mode?**
- Make sure `.env.local` has `VITE_TEST_MODE=false`
- Restart the dev server after changing `.env.local`
- Clear browser cache/localStorage if needed



