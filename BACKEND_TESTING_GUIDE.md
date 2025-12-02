# Backend Testing Guide

This guide explains how to test your Firebase Cloud Functions both locally and in production.

## Option 1: Local Testing with Firebase Emulators (Recommended)

Testing locally is faster, safer, and doesn't consume production resources.

### Prerequisites

1. Install Firebase CLI globally (if not already installed):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Install emulator dependencies:
```bash
firebase init emulators
# Select: Functions, Firestore, Auth
```

### Running Functions Locally

1. **Start the emulators:**
```bash
cd functions
npm run serve
```

This will:
- Build your TypeScript functions
- Start the Firebase emulators
- Make functions available at `http://localhost:5001`

2. **Update your frontend to use emulators:**

Create or update `.env.local`:
```env
# Disable test mode
VITE_TEST_MODE=false

# Point to local emulators
VITE_FIREBASE_EMULATOR_HOST=localhost
VITE_FIREBASE_EMULATOR_FIRESTORE_PORT=8080
VITE_FIREBASE_EMULATOR_AUTH_PORT=9099
VITE_FIREBASE_EMULATOR_FUNCTIONS_PORT=5001
```

3. **Update Firebase config** (if needed):

Check `src/config/firebase.ts` to ensure it connects to emulators when they're available.

4. **Test your functions:**
- Start your frontend: `npm run dev`
- Create video jobs and test the full flow
- Check emulator logs in the terminal

### Emulator UI

The emulators provide a web UI at:
- **Functions**: http://localhost:4000
- **Firestore**: http://localhost:4000/firestore
- **Auth**: http://localhost:4000/auth

You can view and edit data directly in the emulator UI.

## Option 2: Deploy to Production/Staging

If you want to test with real Firebase services:

### Prerequisites

1. **Disable test mode:**
```env
# In .env.local
VITE_TEST_MODE=false
```

2. **Build your frontend:**
```bash
npm run build
```

3. **Deploy functions:**
```bash
cd functions
npm run deploy
```

This deploys all Cloud Functions to your Firebase project.

4. **Deploy frontend (optional):**
```bash
npm run deploy
# Or: firebase deploy --only hosting
```

### Testing Deployed Functions

1. Sign in with your real Google account (ketul40@gmail.com)
2. Test video generation
3. Monitor logs:
```bash
cd functions
npm run logs
# Or: firebase functions:log
```

### Important Notes

⚠️ **Costs**: Deployed functions use real resources and may incur costs  
⚠️ **API Keys**: Make sure your production API keys are configured  
⚠️ **Quotas**: Real API calls count against your quotas  
⚠️ **Data**: Real data is created in Firestore and Storage  

## Recommended Testing Workflow

1. **Start with local emulators** - Test basic functionality
2. **Fix issues locally** - Faster iteration
3. **Deploy to staging** - Test with real services (if you have a staging project)
4. **Deploy to production** - Only after thorough testing

## Troubleshooting

### Emulators not starting?
- Make sure ports 4000, 5001, 8080, 9099 are not in use
- Check Firebase CLI is up to date: `firebase --version`

### Functions not connecting?
- Verify emulator ports match your config
- Check browser console for connection errors
- Ensure `.env.local` has correct emulator settings

### Permission errors?
- Make sure you're authenticated in the emulator
- Check Firestore security rules allow your operations
- Verify user document exists in Firestore

## Next Steps

After testing, you can:
1. Grant yourself a subscription (see `scripts/grant-subscription.js`)
2. Test with different subscription tiers
3. Test YouTube OAuth flow
4. Test full video generation pipeline

