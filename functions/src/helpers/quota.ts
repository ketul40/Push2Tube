/**
 * Quota management helper functions
 * Handles video quota checking and enforcement
 */

import * as admin from "firebase-admin";
import { createLogger } from "../utils/logger";
import { SubscriptionPlan, QuotaStatus } from "../types/subscription";
import { getPlanDetails } from "./stripe";

const logger = createLogger("quota");

/**
 * Check user's video quota status
 * @param userId - Firebase Auth user ID
 * @returns Quota status object
 */
export async function checkUserQuota(userId: string): Promise<QuotaStatus> {
  const db = admin.firestore();

  try {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      throw new Error(`User not found: ${userId}`);
    }

    const userData = userDoc.data();
    const plan =
      (userData?.subscriptionPlan as SubscriptionPlan) || SubscriptionPlan.FREE;
    const planDetails = getPlanDetails(plan);
    const videosUsed = userData?.videosUsedThisMonth || 0;
    const quota = planDetails.quota;
    const remaining = Math.max(0, quota - videosUsed);

    logger.info("Checked user quota", {
      userId,
      plan,
      used: videosUsed,
      quota,
      remaining,
    });

    return {
      hasQuota: remaining > 0,
      remaining,
      used: videosUsed,
      quota,
      plan,
    };
  } catch (error) {
    logger.error("Failed to check user quota", { error, userId });
    throw error;
  }
}

/**
 * Reset monthly usage for a specific user
 * Useful for testing or manual resets
 * @param userId - Firebase Auth user ID
 */
export async function resetUserMonthlyUsage(userId: string): Promise<void> {
  const db = admin.firestore();

  try {
    await db.collection("users").doc(userId).update({
      videosUsedThisMonth: 0,
    });

    logger.info("Reset monthly usage for user", { userId });
  } catch (error) {
    logger.error("Failed to reset user monthly usage", { error, userId });
    throw error;
  }
}

/**
 * Get quota information for display purposes
 * @param userId - Firebase Auth user ID
 * @returns Quota status with formatted information
 */
export async function getQuotaInfo(userId: string): Promise<QuotaStatus & {
  percentageUsed: number;
  planName: string;
}> {
  const quotaStatus = await checkUserQuota(userId);
  const percentageUsed =
    quotaStatus.quota > 0
      ? Math.round((quotaStatus.used / quotaStatus.quota) * 100)
      : 0;

  const planNames: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.FREE]: "Free",
    [SubscriptionPlan.STARTER]: "Starter",
    [SubscriptionPlan.PRO]: "Pro",
    [SubscriptionPlan.ULTRA]: "Ultra",
  };

  return {
    ...quotaStatus,
    percentageUsed,
    planName: planNames[quotaStatus.plan],
  };
}




