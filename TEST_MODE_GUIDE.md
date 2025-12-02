# Test Mode Guide

Test Mode allows you to bypass authentication and test authenticated user features locally without requiring actual Firebase authentication or Firestore access.

## Quick Start

1. Create a `.env.local` file in the root directory (if it doesn't exist)
2. Add the following environment variables:

```env
# Enable test mode
VITE_TEST_MODE=true

# Optional: Set subscription plan (free, starter, pro, ultra)
VITE_TEST_SUBSCRIPTION_PLAN=pro

# Optional: Simulate YouTube connection
VITE_TEST_YOUTUBE_CONNECTED=true
```

3. Restart your development server:
```bash
npm run dev
```

## Environment Variables

### Required
- `VITE_TEST_MODE=true` - Enables test mode and bypasses authentication

### Optional
- `VITE_TEST_SUBSCRIPTION_PLAN` - Set to one of: `free`, `starter`, `pro`, `ultra` (default: `free`)
- `VITE_TEST_YOUTUBE_CONNECTED` - Set to `true` to simulate YouTube account connection (default: `false`)

## What Test Mode Does

When test mode is enabled:

1. **Bypasses Authentication**: You'll be automatically logged in as a test user
2. **Mock User Data**: Returns mock user data from memory instead of Firestore
3. **Configurable Subscription**: Test different subscription tiers and quotas
4. **YouTube Connection**: Optionally simulate YouTube account connection
5. **No Firestore Calls**: All user data operations use mock data

## Testing Different Subscription Plans

### Free Plan (Default)
```env
VITE_TEST_MODE=true
VITE_TEST_SUBSCRIPTION_PLAN=free
```
- Quota: 2 videos/month
- Status: None

### Starter Plan
```env
VITE_TEST_MODE=true
VITE_TEST_SUBSCRIPTION_PLAN=starter
```
- Quota: 20 videos/month
- Status: Active

### Pro Plan
```env
VITE_TEST_MODE=true
VITE_TEST_SUBSCRIPTION_PLAN=pro
```
- Quota: 100 videos/month
- Status: Active

### Ultra Plan
```env
VITE_TEST_MODE=true
VITE_TEST_SUBSCRIPTION_PLAN=ultra
```
- Quota: 250 videos/month
- Status: Active

## Example Configurations

### Test as Free User
```env
VITE_TEST_MODE=true
VITE_TEST_SUBSCRIPTION_PLAN=free
VITE_TEST_YOUTUBE_CONNECTED=false
```

### Test as Pro User with YouTube Connected
```env
VITE_TEST_MODE=true
VITE_TEST_SUBSCRIPTION_PLAN=pro
VITE_TEST_YOUTUBE_CONNECTED=true
```

### Test as Ultra User
```env
VITE_TEST_MODE=true
VITE_TEST_SUBSCRIPTION_PLAN=ultra
VITE_TEST_YOUTUBE_CONNECTED=true
```

## Features Available in Test Mode

✅ Dashboard access  
✅ Subscription status display  
✅ Quota management UI  
✅ YouTube connection UI (simulated)  
✅ Video job creation UI  
✅ All authenticated routes  

## Limitations

⚠️ **Video Job Creation**: The UI will work and jobs will be created (with mock job IDs), but actual video generation won't happen. Jobs won't appear in the job monitor since they're not stored in Firestore.  
⚠️ **Stripe Integration**: Checkout and portal sessions won't work (they require real Stripe keys)  
⚠️ **YouTube Upload**: Actual uploads won't work (requires real OAuth)  
⚠️ **Real-time Updates**: Firestore real-time listeners won't work for jobs (they'll show as "not found" since jobs aren't stored)  
⚠️ **Job History**: Job history will be empty in test mode since jobs aren't persisted to Firestore  

## Disabling Test Mode

To disable test mode and use real authentication:

1. Remove `VITE_TEST_MODE` from `.env.local` or set it to `false`
2. Restart your development server
3. You'll need to sign in with Google to access protected routes

## Troubleshooting

### Test mode not working?
- Make sure `.env.local` is in the root directory (same level as `package.json`)
- Restart the dev server after changing environment variables
- Check browser console for any errors

### Want to test quota limits?
You can modify `MOCK_USER_DATA.videosUsedThisMonth` in `src/config/testMode.ts` to test different usage scenarios.

### Need to test different subscription statuses?
Modify `MOCK_USER_DATA.subscriptionStatus` in `src/config/testMode.ts` to test `active`, `canceled`, `past_due`, etc.

