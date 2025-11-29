/**
 * Subscription-related type definitions
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

export interface Subscription {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  videosUsedThisMonth: number;
  videoQuota: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanDetails {
  name: SubscriptionPlan;
  priceId: string; // Stripe Price ID
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

