/**
 * Stripe helper functions
 * Handles Stripe customer management, checkout sessions, and subscription operations
 */

import Stripe from "stripe";
import * as admin from "firebase-admin";
import { getConfig } from "../config";
import { createLogger } from "../utils/logger";
import { SubscriptionPlan, PlanDetails } from "../types/subscription";

const logger = createLogger("stripe");

let stripeInstance: Stripe | null = null;

/**
 * Initialize and return Stripe client instance
 */
export function initializeStripe(): Stripe {
  if (!stripeInstance) {
    const config = getConfig();
    if (!config.stripeSecretKey) {
      throw new Error("Stripe secret key is not configured");
    }
    stripeInstance = new Stripe(config.stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
  }
  return stripeInstance;
}

/**
 * Get or create a Stripe customer for a user
 * @param userId - Firebase Auth user ID
 * @param email - User email address
 * @returns Stripe customer ID
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string
): Promise<string> {
  const stripe = initializeStripe();
  const db = admin.firestore();

  try {
    // Check if user already has a Stripe customer ID
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (userData?.stripeCustomerId) {
      // Verify customer still exists in Stripe
      try {
        await stripe.customers.retrieve(userData.stripeCustomerId);
        return userData.stripeCustomerId;
      } catch (error) {
        logger.warn("Stripe customer not found, creating new one", {
          userId,
          oldCustomerId: userData.stripeCustomerId,
        });
      }
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        firebaseUserId: userId,
      },
    });

    // Update user document with customer ID
    await db.collection("users").doc(userId).update({
      stripeCustomerId: customer.id,
    });

    logger.info("Created new Stripe customer", {
      userId,
      customerId: customer.id,
    });

    return customer.id;
  } catch (error) {
    logger.error("Failed to get or create Stripe customer", { error, userId });
    throw new Error(
      `Failed to create Stripe customer: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get plan details including Stripe Price ID and quota
 * @param planName - Plan name (starter, pro, ultra)
 * @returns Plan details object
 */
export function getPlanDetails(planName: string): PlanDetails {
  const config = getConfig();

  const planMap: Record<string, PlanDetails> = {
    [SubscriptionPlan.FREE]: {
      name: SubscriptionPlan.FREE,
      priceId: "",
      quota: 2,
      price: 0,
    },
    [SubscriptionPlan.STARTER]: {
      name: SubscriptionPlan.STARTER,
      priceId: config.stripePriceIdStarter,
      quota: 20,
      price: 29,
    },
    [SubscriptionPlan.PRO]: {
      name: SubscriptionPlan.PRO,
      priceId: config.stripePriceIdPro,
      quota: 100,
      price: 99,
    },
    [SubscriptionPlan.ULTRA]: {
      name: SubscriptionPlan.ULTRA,
      priceId: config.stripePriceIdUltra,
      quota: 250,
      price: 199,
    },
  };

  const plan = planMap[planName.toLowerCase()];
  if (!plan) {
    throw new Error(`Invalid plan name: ${planName}`);
  }

  return plan;
}

/**
 * Check if user has video quota remaining
 * @param userId - Firebase Auth user ID
 * @returns Object with quota status
 */
export async function checkVideoQuota(userId: string): Promise<{
  hasQuota: boolean;
  remaining: number;
  used: number;
  quota: number;
  plan: SubscriptionPlan;
}> {
  const db = admin.firestore();
  
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error(`User not found: ${userId}`);
    }

    const userData = userDoc.data();
    const plan = (userData?.subscriptionPlan as SubscriptionPlan) || SubscriptionPlan.FREE;
    const planDetails = getPlanDetails(plan);
    const videosUsed = userData?.videosUsedThisMonth || 0;
    const quota = planDetails.quota;
    const remaining = Math.max(0, quota - videosUsed);

    return {
      hasQuota: remaining > 0,
      remaining,
      used: videosUsed,
      quota,
      plan,
    };
  } catch (error) {
    logger.error("Failed to check video quota", { error, userId });
    throw error;
  }
}

/**
 * Increment video usage counter for a user
 * @param userId - Firebase Auth user ID
 */
export async function incrementVideoUsage(userId: string): Promise<void> {
  const db = admin.firestore();

  try {
    const userRef = db.collection("users").doc(userId);
    
    await userRef.update({
      videosUsedThisMonth: admin.firestore.FieldValue.increment(1),
    });

    logger.info("Incremented video usage", { userId });
  } catch (error) {
    logger.error("Failed to increment video usage", { error, userId });
    throw error;
  }
}

/**
 * Reset monthly usage counter for all users
 * Called by scheduled function at start of each month
 */
export async function resetMonthlyUsage(): Promise<void> {
  const db = admin.firestore();

  try {
    const usersSnapshot = await db.collection("users").get();
    const batch = db.batch();
    let batchCount = 0;

    usersSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        videosUsedThisMonth: 0,
      });
      batchCount++;

      // Firestore batch limit is 500 operations
      if (batchCount >= 500) {
        batch.commit();
        batchCount = 0;
      }
    });

    if (batchCount > 0) {
      await batch.commit();
    }

    logger.info("Reset monthly video usage for all users");
  } catch (error) {
    logger.error("Failed to reset monthly usage", { error });
    throw error;
  }
}

