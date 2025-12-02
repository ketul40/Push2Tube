# Debugging User Document Creation

## Steps to Debug

### 1. Check Browser Console

After signing in, open the browser console (F12) and look for these messages:

**Expected logs:**
- `🔄 Creating/updating user document...` - Function is being called
- `📝 createOrUpdateUser called` - Function started
- `📝 User document does not exist, creating new...` - Creating new document
- `✅ User document created successfully` - Success!

**Error logs to watch for:**
- `❌ Error creating/updating user document:` - Something went wrong
- `Error details:` - More information about the error

### 2. Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by "firestore"
4. Sign in again
5. Look for Firestore requests:
   - Should see a `write` request to `/users/{your-uid}`
   - Check if it returns 200 (success) or an error

### 3. Check Firestore Rules

The rules should allow users to create their own documents:
```
allow create: if isOwner(userId);
```

To verify:
1. Go to Firebase Console → Firestore → Rules
2. Make sure the rules are deployed
3. Check if there are any syntax errors

### 4. Verify Deployment

Make sure the latest code is deployed:

1. **Check if code was committed:**
```bash
git log --oneline -5
```

2. **Check if frontend was built:**
```bash
npm run build
```

3. **Check if hosting was deployed:**
```bash
firebase deploy --only hosting
```

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in browser settings

### 5. Test Locally First

Before deploying, test locally:

1. Make sure `.env.local` has `VITE_TEST_MODE=false`
2. Run `npm run dev`
3. Sign in and check console logs
4. Check if user document appears in Firestore

### 6. Check Authentication

Verify you're actually authenticated:

1. In browser console, run:
```javascript
firebase.auth().currentUser
```

2. Should return your user object with `uid`, `email`, etc.

3. If it returns `null`, you're not authenticated

### 7. Manual Test

Try creating the user document manually to test permissions:

1. Go to Firebase Console → Firestore
2. Click "+ Start collection"
3. Collection ID: `users`
4. Document ID: Your UID (from `firebase.auth().currentUser.uid`)
5. Add a field: `uid` (string) = your UID
6. Click Save

If this works, the issue is with the code. If it fails, it's a permissions issue.

## Common Issues

### Issue: "Permission denied"
**Solution:** Check Firestore rules are deployed and allow user creation

### Issue: No console logs appear
**Solution:** 
- Code might not be deployed
- Check if you're on the right URL
- Clear cache and hard refresh

### Issue: Function called but document not created
**Solution:**
- Check Network tab for Firestore errors
- Check browser console for detailed error messages
- Verify Firestore rules allow creation

### Issue: "User already exists" but can't see it
**Solution:**
- Check if you're looking at the right Firebase project
- Check if collection name is exactly `users` (case-sensitive)
- Try refreshing Firestore console

## Next Steps

If you see errors in the console, share them and I can help debug further!

