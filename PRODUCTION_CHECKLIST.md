# Production Deployment Checklist

This checklist ensures everything is configured for production, with Stripe in test mode.

## ✅ Frontend Configuration

### Environment Variables (.env.local or production environment)

**Required for Production:**
```env
# Firebase Configuration (Production)
VITE_FIREBASE_API_KEY=your-production-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Firebase Functions (Production)
VITE_FIREBASE_REGION=us-central1
# VITE_FUNCTIONS_BASE_URL is optional - will auto-construct from project ID and region

# Test Mode - MUST BE DISABLED
VITE_TEST_MODE=false
# Or simply don't include this variable

# Stripe - USE TEST KEYS
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXX
```

## ✅ Backend Configuration (Cloud Functions)

### Environment Variables (functions/.env)

**Required for Production:**
```env
# OpenAI/Sora
OPENAI_API_KEY=your-production-key
SORA_API_ENDPOINT=https://api.openai.com/v1/sora/generate

# YouTube
YOUTUBE_CLIENT_ID=your-production-client-id
YOUTUBE_CLIENT_SECRET=your-production-secret
YOUTUBE_REDIRECT_URI=https://your-project-id-us-central1.cloudfunctions.net/youtubeOAuthCallback

# Security
TOKEN_ENCRYPTION_KEY=your-encryption-key

# Stripe - USE TEST KEYS
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_TEST_XXXXXXXXXXXXXXXX
STRIPE_PRICE_ID_STARTER=price_test_XXXXXXXXXXXXXXXX
STRIPE_PRICE_ID_PRO=price_test_XXXXXXXXXXXXXXXX
STRIPE_PRICE_ID_ULTRA=price_test_XXXXXXXXXXXXXXXX
```

## ✅ Code Changes Made

1. **YouTube Service** - Fixed to use production Functions URL instead of localhost
2. **OAuth Callbacks** - Updated to use request origin instead of hardcoded localhost
3. **Test Mode** - Disabled by default (only enabled if `VITE_TEST_MODE=true`)

## ✅ Deployment Steps

1. **Set Environment Variables:**
   - Frontend: Set in your hosting platform or `.env.local` (for build)
   - Backend: Set in Firebase Functions environment

2. **Build Frontend:**
   ```bash
   npm run build
   ```

3. **Deploy Functions:**
   ```bash
   cd functions
   firebase deploy --only functions
   ```

4. **Deploy Frontend:**
   ```bash
   firebase deploy --only hosting
   ```

5. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

## ✅ Verification

After deployment, verify:

- [ ] Sign in works (not using test mode)
- [ ] User documents are created in Firestore
- [ ] YouTube connection works (calls production Functions)
- [ ] Video job creation works
- [ ] Stripe checkout uses test keys (test cards work)
- [ ] No localhost URLs in network requests
- [ ] All Functions use production URLs

## ⚠️ Stripe Test Mode

**Important:** Stripe is configured to use **test keys** (`sk_test_` and `pk_test_`). This means:
- ✅ No real charges will be made
- ✅ Test cards work (e.g., `4242 4242 4242 4242`)
- ✅ You can test the full payment flow safely
- ⚠️ To switch to live mode later, update environment variables with live keys

## 🔄 Switching Stripe to Live Mode (Future)

When ready for real payments:

1. In Stripe Dashboard, toggle **"Test mode"** OFF
2. Get live keys and price IDs
3. Update `functions/.env` with live keys
4. Update frontend environment with live publishable key
5. Redeploy functions and frontend
6. Update webhook endpoint to use live signing secret


