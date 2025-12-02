import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { VideoJob, JobStatus } from '../types';

/**
 * Metric types for tracking
 */
export enum MetricType {
  JOB_SUCCESS = 'job_success',
  JOB_FAILURE = 'job_failure',
  PROCESSING_TIME = 'processing_time',
  API_CALL = 'api_call',
  ERROR_RATE = 'error_rate',
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
    const metricsCollection = collection(db, 'metrics');
    await addDoc(metricsCollection, {
      type,
      value,
      metadata: metadata || {},
      userId: userId || null,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error tracking metric:', error);
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
    processingTime = job.completedAt.getTime() - job.startedAt.getTime();
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
    await trackMetric(MetricType.PROCESSING_TIME, processingTime, { jobId: job.jobId }, job.userId);
  }
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
}

/**
 * Calculate job success rate for a user
 */
export async function calculateJobSuccessRate(userId: string, days: number = 7): Promise<number> {
  try {
    const metricsCollection = collection(db, 'metrics');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Query success metrics
    const successQuery = query(
      metricsCollection,
      where('userId', '==', userId),
      where('type', '==', MetricType.JOB_SUCCESS),
      where('timestamp', '>=', Timestamp.fromDate(cutoffDate))
    );
    
    // Query failure metrics
    const failureQuery = query(
      metricsCollection,
      where('userId', '==', userId),
      where('type', '==', MetricType.JOB_FAILURE),
      where('timestamp', '>=', Timestamp.fromDate(cutoffDate))
    );
    
    const [successSnapshot, failureSnapshot] = await Promise.all([
      getDocs(successQuery),
      getDocs(failureQuery),
    ]);
    
    const successCount = successSnapshot.size;
    const failureCount = failureSnapshot.size;
    const totalCount = successCount + failureCount;
    
    if (totalCount === 0) return 0;
    
    return (successCount / totalCount) * 100;
  } catch (error) {
    console.error('Error calculating success rate:', error);
    return 0;
  }
}

/**
 * Calculate average processing time for a user
 */
export async function calculateAverageProcessingTime(userId: string, days: number = 7): Promise<number> {
  try {
    const metricsCollection = collection(db, 'metrics');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const processingQuery = query(
      metricsCollection,
      where('userId', '==', userId),
      where('type', '==', MetricType.PROCESSING_TIME),
      where('timestamp', '>=', Timestamp.fromDate(cutoffDate))
    );
    
    const snapshot = await getDocs(processingQuery);
    
    if (snapshot.empty) return 0;
    
    let totalTime = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      totalTime += data.value || 0;
    });
    
    return totalTime / snapshot.size;
  } catch (error) {
    console.error('Error calculating average processing time:', error);
    return 0;
  }
}

/**
 * Get API usage statistics
 * @param days - Number of days to look back (default: 7)
 * @param userId - Optional user ID to filter by. If not provided, returns stats for all users (admin only)
 */
export async function getAPIUsageStats(days: number = 7, userId?: string): Promise<{
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
}> {
  try {
    const metricsCollection = collection(db, 'metrics');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Build query with optional userId filter for security
    const queryConstraints = [
      where('type', '==', MetricType.API_CALL),
      where('timestamp', '>=', Timestamp.fromDate(cutoffDate))
    ];
    
    // Add userId filter if provided (for user-specific stats)
    if (userId) {
      queryConstraints.push(where('userId', '==', userId));
    }
    
    const apiQuery = query(metricsCollection, ...queryConstraints);
    
    const snapshot = await getDocs(apiQuery);
    
    let successfulCalls = 0;
    let failedCalls = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.metadata?.success) {
        successfulCalls++;
      } else {
        failedCalls++;
      }
    });
    
    const totalCalls = successfulCalls + failedCalls;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
    
    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      successRate,
    };
  } catch (error) {
    console.error('Error getting API usage stats:', error);
    return {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      successRate: 0,
    };
  }
}

/**
 * Check error rate and determine if alert should be triggered
 */
export async function checkErrorRate(thresholdPercent: number = 50, windowMinutes: number = 15): Promise<{
  shouldAlert: boolean;
  errorRate: number;
  errorCount: number;
  totalCount: number;
}> {
  try {
    const metricsCollection = collection(db, 'metrics');
    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - windowMinutes);
    
    // Query recent failures
    const failureQuery = query(
      metricsCollection,
      where('type', '==', MetricType.JOB_FAILURE),
      where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
      orderBy('timestamp', 'desc')
    );
    
    // Query recent successes
    const successQuery = query(
      metricsCollection,
      where('type', '==', MetricType.JOB_SUCCESS),
      where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
      orderBy('timestamp', 'desc')
    );
    
    const [failureSnapshot, successSnapshot] = await Promise.all([
      getDocs(failureQuery),
      getDocs(successQuery),
    ]);
    
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
    const shouldAlert = errorRate >= thresholdPercent && totalCount >= 5; // At least 5 jobs to avoid false positives
    
    return {
      shouldAlert,
      errorRate,
      errorCount,
      totalCount,
    };
  } catch (error) {
    console.error('Error checking error rate:', error);
    return {
      shouldAlert: false,
      errorRate: 0,
      errorCount: 0,
      totalCount: 0,
    };
  }
}
