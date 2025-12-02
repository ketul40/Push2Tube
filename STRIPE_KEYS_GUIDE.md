# How to Find Your Stripe Keys - Quick Reference

## Finding Keys in Stripe Dashboard

### Step 1: Choose Test or Live Mode

**In Stripe Dashboard (top-right corner):**
- Toggle **"Test mode"** ON for development/testing
- Toggle **"Test mode"** OFF for production (real charges)

### Step 2: Get API Keys

1. **Navigate to API Keys:**
   - Left sidebar → **Developers** → **API keys**

2. **Publishable Key:**
   - Look in the **"Standard keys"** section
   - **Publishable key** is visible directly
   - Starts with `pk_test_...` (Test) or `pk_live_...` (Live)
   - Copy this value → Use for `VITE_STRIPE_PUBLISHABLE_KEY` in `.env.local`

3. **Secret Key:**
   - In the same **"Standard keys"** section
   - Find **"Secret key"** row
   - Click **"Reveal test key"** (Test mode) or **"Reveal live key"** (Live mode)
   - Copy the value (starts with `sk_test_...` or `sk_live_...`)
   - **Keep this secret!** → Use for `STRIPE_SECRET_KEY` in `functions/.env`

### Step 3: Get Price IDs

For each of your three plans (Starter, Pro, Ultra):

1. **Navigate to Products:**
   - Left sidebar → **Products**

2. **Click on a Product:**
   - Click **"Starter Plan"** (or Pro/Ultra)

3. **Find the Price:**
   - In the **"Pricing"** section, you'll see the price (e.g., "$29.00 / month")
   - Click on the price row

4. **Copy Price ID:**
   - In the details panel on the right, find **"Price ID"**
   - It looks like: `price_1Pabc123xyz...`
   - Copy this value
   - Use for:
     - `STRIPE_PRICE_ID_STARTER` (Starter Plan)
     - `STRIPE_PRICE_ID_PRO` (Pro Plan)
     - `STRIPE_PRICE_ID_ULTRA` (Ultra Plan)

**Important:** Price IDs are different between Test and Live modes. Make sure you're copying from the correct mode!

### Step 4: Get Webhook Signing Secret

1. **Navigate to Webhooks:**
   - Left sidebar → **Developers** → **Webhooks**

2. **Find or Create Webhook:**
   - If you haven't created one, click **"+ Add endpoint"**
   - Endpoint URL: `https://us-central1-push2tube.cloudfunctions.net/stripeWebhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Click **"Add endpoint"**

3. **Get Signing Secret:**
   - Click on your webhook endpoint
   - Find **"Signing secret"** section
   - Click **"Reveal"**
   - Copy the value (starts with `whsec_...`)
   - Use for `STRIPE_WEBHOOK_SECRET` in `functions/.env`

**Note:** You need separate webhook endpoints for Test and Live modes, each with its own signing secret.

## Quick Checklist

- [ ] Toggle Test/Live mode in Stripe Dashboard
- [ ] Copy Publishable key (`pk_test_...` or `pk_live_...`)
- [ ] Copy Secret key (`sk_test_...` or `sk_live_...`)
- [ ] Copy Price ID for Starter Plan (`price_...`)
- [ ] Copy Price ID for Pro Plan (`price_...`)
- [ ] Copy Price ID for Ultra Plan (`price_...`)
- [ ] Create webhook endpoint and copy Signing secret (`whsec_...`)
- [ ] Add all values to `.env.local` (frontend) and `functions/.env` (backend)
- [ ] Redeploy functions: `firebase deploy --only functions`

## Visual Guide

```
Stripe Dashboard
│
├── Developers
│   ├── API keys
│   │   ├── Publishable key → pk_test_... or pk_live_...
│   │   └── Secret key → sk_test_... or sk_live_... (click Reveal)
│   │
│   └── Webhooks
│       └── [Your endpoint] → Signing secret → whsec_...
│
└── Products
    ├── Starter Plan → Pricing → Price ID → price_...
    ├── Pro Plan → Pricing → Price ID → price_...
    └── Ultra Plan → Pricing → Price ID → price_...
```

## Security Reminder

- **Never commit** `.env` or `.env.local` files (they're in `.gitignore`)
- **Never share** your Secret key or Webhook signing secret
- **Use Test mode** for development to avoid accidental charges
- **Rotate keys** if they're ever exposed


