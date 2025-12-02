/**
 * Test Mode Configuration
 * Allows bypassing authentication for testing purposes
 * 
 * Usage:
 * 1. Set VITE_TEST_MODE=true in .env.local
 * 2. Optionally set VITE_TEST_SUBSCRIPTION_PLAN to one of: free, starter, pro, ultra
 * 3. Optionally set VITE_TEST_YOUTUBE_CONNECTED=true to simulate YouTube connection
 * 
 * Example .env.local:
 *   VITE_TEST_MODE=true
 *   VITE_TEST_SUBSCRIPTION_PLAN=pro
 *   VITE_TEST_YOUTUBE_CONNECTED=true
 */

import { SubscriptionPlan, SubscriptionStatus } from '@/types/subscription';
import { User } from '@/types';

// Check if test mode is enabled via environment variable
export const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';

// Get test subscription plan from environment (defaults to 'free')
const TEST_PLAN_ENV = (import.meta.env.VITE_TEST_SUBSCRIPTION_PLAN || 'free').toLowerCase();
const TEST_SUBSCRIPTION_PLAN = Object.values(SubscriptionPlan).includes(TEST_PLAN_ENV as SubscriptionPlan)
  ? (TEST_PLAN_ENV as SubscriptionPlan)
  : SubscriptionPlan.FREE;

// Get test YouTube connection status
const TEST_YOUTUBE_CONNECTED = import.meta.env.VITE_TEST_YOUTUBE_CONNECTED === 'true';

// Subscription quotas
const PLAN_QUOTAS: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.FREE]: 2,
  [SubscriptionPlan.STARTER]: 20,
  [SubscriptionPlan.PRO]: 100,
  [SubscriptionPlan.ULTRA]: 250,
};

// Mock Firebase User object for test mode
export const MOCK_USER = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-id-token',
  getIdTokenResult: async () => ({
    token: 'mock-id-token',
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: 'test',
    signInSecondFactor: null,
    authTime: new Date().toISOString(),
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
} as any;

// Mock User data for test mode (Firestore user document)
export const MOCK_USER_DATA: User = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  youtubeConnected: TEST_YOUTUBE_CONNECTED,
  youtubeChannelId: TEST_YOUTUBE_CONNECTED ? 'UC_TEST_CHANNEL_ID' : undefined,
  defaultPrivacyStatus: 'unlisted',
  createdAt: new Date(),
  lastLoginAt: new Date(),
  subscriptionPlan: TEST_SUBSCRIPTION_PLAN,
  subscriptionStatus: TEST_SUBSCRIPTION_PLAN === SubscriptionPlan.FREE 
    ? SubscriptionStatus.NONE 
    : SubscriptionStatus.ACTIVE,
  stripeCustomerId: TEST_SUBSCRIPTION_PLAN !== SubscriptionPlan.FREE ? 'cus_test_123' : undefined,
  stripeSubscriptionId: TEST_SUBSCRIPTION_PLAN !== SubscriptionPlan.FREE ? 'sub_test_123' : undefined,
  currentPeriodStart: TEST_SUBSCRIPTION_PLAN !== SubscriptionPlan.FREE ? new Date() : undefined,
  currentPeriodEnd: TEST_SUBSCRIPTION_PLAN !== SubscriptionPlan.FREE 
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    : undefined,
  videosUsedThisMonth: 0, // You can modify this to test quota limits
  videoQuota: PLAN_QUOTAS[TEST_SUBSCRIPTION_PLAN],
};


