# Quick Guide: Create User Document in Firebase Console

If the `users` collection doesn't exist, here's how to create your user document:

## Step-by-Step Instructions

1. **Get your Firebase User ID (UID)**:
   - Sign in to your app (with test mode OFF)
   - Open browser console (F12)
   - Type: `firebase.auth().currentUser.uid`
   - Copy the UID (looks like: `2oOpN9tROVSnTtoqulE6S0pUDGs1`)

2. **In Firebase Console**:
   - Go to Firestore Database
   - Click **"+ Start collection"**
   - Collection ID: `users`
   - Document ID: **Paste your UID here**
   - Click **"Save"**

3. **Add Fields** (click "+ Add field" for each):
   
   **Basic Info:**
   - `uid` → string → Your UID
   - `email` → string → `ketul40@gmail.com`
   - `displayName` → string → Your name
   - `youtubeConnected` → boolean → `false`
   - `defaultPrivacyStatus` → string → `unlisted`
   - `createdAt` → timestamp → Now
   - `lastLoginAt` → timestamp → Now

   **Subscription (Pro Plan):**
   - `subscriptionPlan` → string → `pro`
   - `subscriptionStatus` → string → `active`
   - `videoQuota` → number → `100`
   - `videosUsedThisMonth` → number → `0`
   - `currentPeriodStart` → timestamp → Now
   - `currentPeriodEnd` → timestamp → 30 days from now

4. **Save** the document

Now you should be able to see your user in the `users` collection!



