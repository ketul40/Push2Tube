/**
 * Metrics tracking utilities for Cloud Functions
 * Tracks job success rate, processing time, and API usage
 */

import * as admin from "firebase-admin";
import {VideoJob, JobStatus} from "../types";
import {createLogger} from "./logger";

const logger = createLogger("metricsTracking");

/**
 * Metric types for tracking
 */
export enum MetricType {
  JOB_SUCCESS = "job_success",
  JOB_FAILURE = "job_failure",
  PROCESSING_TIME = "processing_time",
  API_CALL = "api_call",
  ERROR_RATE = "error_rate",
}

/**
 * Track a custom metric
 */
export async function trackMetric(
  type: MetricType,
  value: number,
  metadata?: Record<string, any>,
  userId?: string
): Promise<void> {
  try {
    const db = admin.firestore();
    const metricsCollection = db.collection("metrics");
    
    await metricsCollection.add({
      type,
      value,
      metadata: metadata || {},
      userId: userId || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    logger.error("Error tracking metric", {type, error});
    // Don't throw - metrics tracking should not break the app
  }
}

/**
 * Track job completion (success or failure)
 */
export async function trackJobCompletion(job: VideoJob): Promise<void> {
  const isSuccess = job.status === JobStatus.COMPLETED;
  const metricType = isSuccess ? MetricType.JOB_SUCCESS : MetricType.JOB_FAILURE;
  
  // Calculate processing time if available
  let processingTime = 0;
  if (job.startedAt && job.completedAt) {
    const startTime = job.startedAt instanceof admin.firestore.Timestamp ?
      job.startedAt.toMillis() : new Date(job.startedAt).getTime();
    const endTime = job.completedAt instanceof admin.firestore.Timestamp ?
      job.completedAt.toMillis() : new Date(job.completedAt).getTime();
    processingTime = endTime - startTime;
  }
  
  const metadata = {
    jobId: job.jobId,
    status: job.status,
    hasError: !!job.error,
    errorMessage: job.error || null,
    retryCount: job.retryCount,
    processingTimeMs: processingTime,
  };
  
  await trackMetric(metricType, 1, metadata, job.userId);
  
  // Also track processing time separately if available
  if (processingTime > 0) {
    await trackMetric(
      MetricType.PROCESSING_TIME,
      processingTime,
      {jobId: job.jobId},
      job.userId
    );
  }
  
  logger.info("Job completion tracked", {
    jobId: job.jobId,
    isSuccess,
    processingTimeMs: processingTime,
  });
}

/**
 * Track API call
 */
export async function trackAPIUsage(
  apiName: string,
  success: boolean,
  durationMs?: number,
  userId?: string
): Promise<void> {
  const metadata = {
    apiName,
    success,
    durationMs: durationMs || 0,
  };
  
  await trackMetric(MetricType.API_CALL, 1, metadata, userId);
  
  logger.info("API usage tracked", {apiName, success, durationMs});
}

/**
 * Check error rate and determine if alert should be triggered
 */
export async function checkErrorRate(
  thresholdPercent: number = 50,
  windowMinutes: number = 15
): Promise<{
  shouldAlert: boolean;
  errorRate: number;
  errorCount: number;
  totalCount: number;
}> {
  try {
    const db = admin.firestore();
    const metricsCollection = db.collection("metrics");
    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - windowMinutes);
    
    // Query recent failures
    const failureSnapshot = await metricsCollection
      .where("type", "==", MetricType.JOB_FAILURE)
      .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(cutoffDate))
      .get();
    
    // Query recent successes
    const successSnapshot = await metricsCollection
      .where("type", "==", MetricType.JOB_SUCCESS)
      .where("timestamp", ">=", admin.firestore.Timestamp.fromDate(cutoffDate))
      .get();
    
    const errorCount = failureSnapshot.size;
    const successCount = successSnapshot.size;
    const totalCount = errorCount + successCount;
    
    if (totalCount === 0) {
      return {
        shouldAlert: false,
        errorRate: 0,
        errorCount: 0,
        totalCount: 0,
      };
    }
    
    const errorRate = (errorCount / totalCount) * 100;
    // At least 5 jobs to avoid false positives
    const shouldAlert = errorRate >= thresholdPercent && totalCount >= 5;
    
    if (shouldAlert) {
      logger.warn("High error rate detected", {
        errorRate,
        errorCount,
        totalCount,
        thresholdPercent,
        windowMinutes,
      });
    }
    
    return {
      shouldAlert,
      errorRate,
      errorCount,
      totalCount,
    };
  } catch (error) {
    logger.error("Error checking error rate", {error});
    return {
      shouldAlert: false,
      errorRate: 0,
      errorCount: 0,
      totalCount: 0,
    };
  }
}
