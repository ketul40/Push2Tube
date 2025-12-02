# Grant Subscription to User

There are two ways to grant a subscription to a user (like yourself):

## Method 1: Using Firebase Console (Easiest)

### Step 1: Get Your User ID

First, you need to find your Firebase User ID (UID). You can get this by:

**Option A: From the app**
1. Sign in to your app (disable test mode first: `VITE_TEST_MODE=false`)
2. Open browser console (F12)
3. Run: `firebase.auth().currentUser.uid`
4. Copy the UID

**Option B: From Authentication tab**
1. Go to Firebase Console → **Authentication**
2. Find your user (`ketul40@gmail.com`)
3. Click on it - the UID is shown at the top

### Step 2: Create or Find User Document

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click **"Start collection"** (if `users` doesn't exist) or click on **`users`** collection
5. If creating new:
   - Collection ID: `users`
   - Document ID: **Your UID from Step 1** (important: use your actual Firebase Auth UID)
   - Click **"Add field"** and add the following fields:

### Step 3: Add/Update Fields

Click on your user document (or create it with your UID), then add/update these fields:

**Required Fields:**
- `uid` (string): Your Firebase Auth UID
- `email` (string): `ketul40@gmail.com`
- `displayName` (string): Your name
- `youtubeConnected` (boolean): `false`
- `defaultPrivacyStatus` (string): `unlisted`
- `createdAt` (timestamp): Current date/time
- `lastLoginAt` (timestamp): Current date/time

**Subscription Fields:**
- `subscriptionPlan` (string): `pro`
- `subscriptionStatus` (string): `active`
- `videoQuota` (number): `100`
- `videosUsedThisMonth` (number): `0`
- `currentPeriodStart` (timestamp): Current date/time
- `currentPeriodEnd` (timestamp): 30 days from now

**Note**: If you get permission errors, you may need to temporarily modify Firestore security rules or use the script method instead.

## Method 2: Using Node Script (Recommended)

### Prerequisites

1. Install Firebase Admin SDK:
```bash
npm install firebase-admin
```

2. Get your Firebase service account key:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save it as `serviceAccountKey.json` in the project root
   - **Important**: Add `serviceAccountKey.json` to `.gitignore` (already done)

### Run the Script

```bash
node scripts/grant-subscription.js ketul40@gmail.com pro
```

This will:
- Find your user by email
- Update subscription to Pro plan
- Set quota to 100 videos/month
- Set subscription status to active
- Set period dates (30 days from now)

### Available Plans

- `free` - 2 videos/month
- `starter` - 20 videos/month  
- `pro` - 100 videos/month
- `ultra` - 250 videos/month

## Method 3: Using Firebase CLI (Alternative)

If you prefer using Firebase CLI, you can use the Firebase Admin SDK with application default credentials:

1. Login to Firebase:
```bash
firebase login
```

2. Set application default credentials:
```bash
firebase login:ci
```

3. Then use the script (it will use default credentials instead of service account key)

## Verify Subscription

After granting the subscription:

1. Sign out and sign back in (or refresh the page)
2. Check the Dashboard - you should see "Pro" subscription status
3. Check quota - should show 100 videos/month
4. Try creating a video job to test

## Troubleshooting

### "User not found" error?
- Make sure the user has signed in at least once
- Check the email is correct (case-sensitive)
- Verify the user document exists in Firestore

### Permission denied?
- Make sure you're using admin credentials (service account key)
- Or temporarily modify Firestore rules to allow updates
- Or use Firebase Console (which has admin access)

### Script not working?
- Make sure `serviceAccountKey.json` exists in project root
- Verify Node.js is installed: `node --version`
- Check Firebase Admin SDK is installed: `npm list firebase-admin`

