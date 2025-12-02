/**
 * Subscription-related type definitions (Frontend)
 */

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  ULTRA = 'ultra',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  NONE = 'none',
}

export interface PlanDetails {
  name: SubscriptionPlan;
  quota: number; // Videos per month
  price: number; // Price in dollars
}

export interface QuotaStatus {
  hasQuota: boolean;
  remaining: number;
  used: number;
  quota: number;
  plan: SubscriptionPlan;
}




