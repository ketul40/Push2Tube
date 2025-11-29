# Stripe Payment Integration Setup Guide

This guide explains how to configure Stripe for Push2Tube, including how to switch between Test and Live modes.

## Overview

Push2Tube uses Stripe for subscription payments. The system supports both **Test mode** (for development) and **Live mode** (for production) using the same codebase - you just change the environment variables.

## Quick Start

### 1. Create Products in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **+ Add product**
3. Create three products:
   - **Starter Plan**: $29/month recurring
   - **Pro Plan**: $99/month recurring  
   - **Ultra Plan**: $199/month recurring

### 2. Get Your Stripe Keys

#### For TEST Mode (Development):
1. In Stripe Dashboard, toggle **"Test mode"** ON (top-right)
2. Go to **Developers** → **API keys**
3. Copy:
   - **Publishable key** (`pk_test_...`)
   - **Secret key** (`sk_test_...`) - click "Reveal test key"
4. Go to **Products** → Click each plan → Copy the **Price ID** (`price_...`)

#### For LIVE Mode (Production):
1. In Stripe Dashboard, toggle **"Test mode"** OFF
2. Follow the same steps as above
3. Use the **Live** keys (`pk_live_...`, `sk_live_...`) and **Live** Price IDs

### 3. Set Up Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. Endpoint URL:
   ```
   https://us-central1-push2tube.cloudfunctions.net/stripeWebhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (`whsec_...`)

**Important**: Create separate webhook endpoints for Test and Live modes, as they have different signing secrets.

### 4. Configure Environment Variables

#### Frontend (Root Directory)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Stripe Publishable key:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXX
   ```

#### Backend (Functions Directory)

1. Copy `functions/.env.example` to `functions/.env`:
   ```bash
   cd functions
   cp .env.example .env
   ```

2. Edit `functions/.env` and add all Stripe configuration:
   ```bash
   STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXX
   STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXX
   STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXX
   STRIPE_PRICE_ID_STARTER=price_XXXXXXXXXXXXXXXX
   STRIPE_PRICE_ID_PRO=price_XXXXXXXXXXXXXXXX
   STRIPE_PRICE_ID_ULTRA=price_XXXXXXXXXXXXXXXX
   ```

### 5. Deploy

After setting environment variables:

```bash
# Build and deploy functions
cd functions
npm run build
firebase deploy --only functions

# Build frontend (if needed)
cd ..
npm run build
firebase deploy --only hosting
```

## Switching Between Test and Live Modes

### To Use Test Mode (Development):
1. In Stripe Dashboard, toggle **"Test mode"** ON
2. Update `.env.local` with Test keys:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
3. Update `functions/.env` with Test keys and Price IDs:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_TEST_...
   STRIPE_PRICE_ID_STARTER=price_test_...
   # etc.
   ```
4. Redeploy functions

### To Use Live Mode (Production):
1. In Stripe Dashboard, toggle **"Test mode"** OFF
2. Update `.env.local` with Live keys:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
3. Update `functions/.env` with Live keys and Price IDs:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_LIVE_...
   STRIPE_PRICE_ID_STARTER=price_live_...
   # etc.
   ```
4. Redeploy functions

**Important**: 
- Test cards (like `4242 4242 4242 4242`) only work in Test mode
- Real cards will be charged in Live mode
- Always test thoroughly in Test mode before switching to Live

## Finding Your Keys in Stripe Dashboard

### API Keys:
1. **Developers** → **API keys**
2. **Publishable key**: Visible in the list
3. **Secret key**: Click "Reveal test key" or "Reveal live key"

### Price IDs:
1. **Products** → Click a product (e.g., "Starter Plan")
2. Click the price row (e.g., "$29.00 / month")
3. Copy the **Price ID** from the details panel

### Webhook Signing Secret:
1. **Developers** → **Webhooks**
2. Click your webhook endpoint
3. Click "Reveal" next to **Signing secret**

## Security Best Practices

1. **Never commit `.env` or `.env.local` files** - they're already in `.gitignore`
2. **Use Test mode for development** - prevents accidental charges
3. **Rotate keys periodically** - especially if exposed
4. **Use separate Stripe accounts** - one for test, one for production (optional but recommended)
5. **Monitor webhook events** - check Stripe Dashboard → Webhooks → Events

## Troubleshooting

### Webhook Not Receiving Events
- Verify webhook URL is correct: `https://us-central1-push2tube.cloudfunctions.net/stripeWebhook`
- Check webhook signing secret matches in `functions/.env`
- Ensure webhook endpoint is deployed: `firebase deploy --only functions:stripeWebhook`
- Check Stripe Dashboard → Webhooks → Events for delivery status

### Checkout Not Working
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
- Check browser console for errors
- Ensure Cloud Function `createCheckoutSession` is deployed
- Verify Price IDs match the mode (Test vs Live) you're using

### Subscription Not Updating
- Check webhook events in Stripe Dashboard
- Verify webhook signing secret is correct
- Check Cloud Functions logs: `firebase functions:log`
- Ensure `stripeWebhook` function is deployed

## Support

For Stripe-specific issues, consult:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Support](https://support.stripe.com)

