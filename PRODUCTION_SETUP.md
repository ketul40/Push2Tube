# Production Setup Guide

This guide ensures everything is configured for production deployment, with Stripe in test mode.

## ✅ What's Been Fixed

1. **YouTube Service** - Now uses production Functions URL instead of localhost
2. **OAuth Callbacks** - Use request origin or production URL fallback
3. **Stripe Checkout** - Uses request origin or production URL fallback
4. **Test Mode** - Disabled by default (only active if `VITE_TEST_MODE=true`)

## 📋 Environment Variables Checklist

### Frontend (.env.local or hosting platform)

```env
# REQUIRED: Disable test mode
VITE_TEST_MODE=false

# Firebase Configuration (Production)
VITE_FIREBASE_API_KEY=your-production-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Firebase Functions (auto-constructed, but can override)
VITE_FIREBASE_REGION=us-central1
# VITE_FUNCTIONS_BASE_URL is optional

# Stripe - USE TEST KEYS (pk_test_...)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXX
```

### Backend (functions/.env)

```env
# OpenAI/Sora (Production)
OPENAI_API_KEY=your-production-key
SORA_API_ENDPOINT=https://api.openai.com/v1/sora/generate

# YouTube (Production)
YOUTUBE_CLIENT_ID=your-production-client-id
YOUTUBE_CLIENT_SECRET=your-production-secret
YOUTUBE_REDIRECT_URI=https://your-project-id-us-central1.cloudfunctions.net/youtubeOAuthCallback

# Security
TOKEN_ENCRYPTION_KEY=your-encryption-key

# Stripe - USE TEST KEYS (sk_test_...)
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_TEST_XXXXXXXXXXXXXXXX
STRIPE_PRICE_ID_STARTER=price_test_XXXXXXXXXXXXXXXX
STRIPE_PRICE_ID_PRO=price_test_XXXXXXXXXXXXXXXX
STRIPE_PRICE_ID_ULTRA=price_test_XXXXXXXXXXXXXXXX
```

## 🚀 Deployment Steps

1. **Set Environment Variables:**
   - Frontend: In your hosting platform or `.env.local` (for build)
   - Backend: In Firebase Functions environment

2. **Build and Deploy:**
   ```bash
   # Build frontend
   npm run build
   
   # Deploy everything
   firebase deploy
   
   # Or deploy individually:
   firebase deploy --only functions
   firebase deploy --only hosting
   firebase deploy --only firestore:rules
   ```

3. **Set Functions Environment Variables:**
   ```bash
   cd functions
   firebase functions:config:set \
     openai.api_key="your-key" \
     youtube.client_id="your-id" \
     youtube.client_secret="your-secret" \
     stripe.secret_key="sk_test_..."
   ```

   Or use `.env` file (recommended):
   ```bash
   # Set environment variables in Firebase Console
   # Or use: firebase functions:secrets:set SECRET_NAME
   ```

## ✅ Verification Checklist

After deployment, verify:

- [ ] **Authentication**: Sign in works (not using test mode)
- [ ] **User Documents**: User documents are created in Firestore
- [ ] **YouTube Connection**: Works and calls production Functions
- [ ] **Video Jobs**: Can create video jobs
- [ ] **Stripe**: Checkout uses test keys (test cards work)
- [ ] **No Localhost**: Network tab shows no localhost URLs
- [ ] **Functions URLs**: All use production cloudfunctions.net URLs

## 🔍 How to Verify

1. **Check Browser Console:**
   - No test mode messages
   - Functions calls go to `*.cloudfunctions.net`
   - No localhost URLs

2. **Check Network Tab:**
   - Filter by "cloudfunctions"
   - All requests should be to `*.cloudfunctions.net`
   - No `localhost:5001` requests

3. **Test Stripe:**
   - Use test card: `4242 4242 4242 4242`
   - Should work (test mode)
   - No real charges

## ⚠️ Important Notes

### Stripe Test Mode
- ✅ Currently configured for **test mode** (safe for testing)
- ✅ Uses `sk_test_` and `pk_test_` keys
- ✅ Test cards work, no real charges
- ⚠️ To switch to live mode later, update environment variables

### Test Mode
- ✅ Disabled by default (`VITE_TEST_MODE=false` or not set)
- ✅ Only enabled if explicitly set to `true`
- ✅ All authentication uses real Firebase Auth
- ✅ All data goes to production Firestore

### Localhost References
- ✅ All hardcoded localhost URLs removed
- ✅ Functions use request origin or production fallback
- ✅ OAuth callbacks redirect to production URLs

## 🐛 Troubleshooting

**Still seeing localhost?**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check environment variables are set correctly
- Verify build includes latest code

**Functions not working?**
- Check Functions are deployed: `firebase functions:list`
- Verify environment variables in Functions
- Check Functions logs: `firebase functions:log`

**Stripe not working?**
- Verify test keys are set (start with `sk_test_` and `pk_test_`)
- Check Stripe Dashboard is in test mode
- Verify webhook secret matches test mode

