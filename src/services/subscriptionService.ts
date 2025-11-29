/**
 * Subscription service
 * Handles Stripe checkout sessions, portal access, and subscription management
 */

import { getCurrentUser } from './authService';
import { getUserById } from './userService';
import { User } from '../types';
import { QuotaStatus, SubscriptionPlan } from '../types/subscription';

const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || 
  `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'push2tube-dev'}-${import.meta.env.VITE_FIREBASE_REGION || 'us-central1'}.cloudfunctions.net`;

/**
 * Create a Stripe Checkout session for subscription
 * @param planName - Plan name (starter, pro, ultra)
 * @returns Checkout session URL
 */
export async function createCheckoutSession(planName: string): Promise<string> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const idToken = await user.getIdToken();

  const response = await fetch(`${FUNCTIONS_BASE_URL}/createCheckoutSession`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  const data = await response.json();
  return data.url;
}

/**
 * Create a Stripe Customer Portal session for managing subscription
 * @returns Portal session URL
 */
export async function createPortalSession(): Promise<string> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const idToken = await user.getIdToken();

  const response = await fetch(`${FUNCTIONS_BASE_URL}/createPortalSession`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create portal session');
  }

  const data = await response.json();
  return data.url;
}

/**
 * Get user's subscription status from Firestore
 * @param userId - User ID
 * @returns User object with subscription information
 */
export async function getUserSubscription(userId: string): Promise<User | null> {
  return getUserById(userId);
}

/**
 * Get remaining video quota for user
 * @param userId - User ID
 * @returns Quota status object
 */
export async function getRemainingQuota(userId: string): Promise<QuotaStatus> {
  const user = await getUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  const remaining = Math.max(0, user.videoQuota - user.videosUsedThisMonth);

  return {
    hasQuota: remaining > 0,
    remaining,
    used: user.videosUsedThisMonth,
    quota: user.videoQuota,
    plan: user.subscriptionPlan,
  };
}

/**
 * Get plan details including quota and pricing
 */
export function getPlanDetails(planName: SubscriptionPlan): {
  name: string;
  quota: number;
  price: number;
} {
  const plans = {
    [SubscriptionPlan.FREE]: { name: 'Free', quota: 2, price: 0 },
    [SubscriptionPlan.STARTER]: { name: 'Starter', quota: 20, price: 29 },
    [SubscriptionPlan.PRO]: { name: 'Pro', quota: 100, price: 99 },
    [SubscriptionPlan.ULTRA]: { name: 'Ultra', quota: 250, price: 199 },
  };

  return plans[planName] || plans[SubscriptionPlan.FREE];
}

