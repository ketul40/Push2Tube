import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export middleware (for use in other functions)
export * from "./middleware/auth";

// Export helper functions
export * from "./helpers/videoGeneration";
export * from "./helpers/storage";
export * from "./helpers/metadataGeneration";
export * from "./helpers/jobProcessing";
export * from "./helpers/youtubeAuth";

// Export Cloud Functions
export * from "./youtubeOAuth";

// Import required modules for job processing
import {JobStatus, VideoJob, ErrorResponse, AuthenticatedRequest} from "./types";
import {generateVideo} from "./helpers/videoGeneration";
import {uploadToStorage, deleteFromStorage} from "./helpers/storage";
import {processMetadataGeneration, processYouTubeUpload, updateJobStatus, updateJobError} from "./helpers/jobProcessing";
import {authenticateRequest} from "./middleware/auth";
import {createLogger} from "./utils/logger";

const logger = createLogger("CloudFunctions");

/**
 * Cloud Function: processVideoJob
 * Triggered when a new VideoJob document is created in Firestore
 * Orchestrates the entire video generation pipeline:
 * 1. Generate video with Sora
 * 2. Upload video to Firebase Storage
 * 3. Generate metadata with OpenAI
 * 4. Upload video to YouTube
 * Requirements: 3.3, 6.2, 6.3, 6.4, 8.5
 */
export const processVideoJob = functions.firestore
  .document("videoJobs/{jobId}")
  .onCreate(async (snapshot, context) => {
    const jobId = context.params.jobId;
    const job = snapshot.data() as VideoJob;

    logger.info("Processing new video job", {
      jobId,
      userId: job.userId,
      prompt: job.prompt,
    });

    try {
      // Step 1: Generate video with Sora (Requirements: 3.3, 6.2)
      logger.info("Step 1: Generating video", {jobId});
      await updateJobStatus(jobId, JobStatus.GENERATING_VIDEO);

      const videoResult = await generateVideo(job.prompt);
      logger.info("Video generation completed", {
        jobId,
        videoUrl: videoResult.videoUrl,
        duration: videoResult.duration,
      });

      // Step 2: Upload video to Firebase Storage (Requirements: 3.3)
      logger.info("Step 2: Uploading to storage", {jobId});
      const storageResult = await uploadToStorage(videoResult.videoUrl, jobId);

      // Update job with video information
      await admin.firestore().collection("videoJobs").doc(jobId).update({
        videoUrl: storageResult.signedUrl,
        videoDuration: videoResult.duration,
      });

      logger.info("Video uploaded to storage", {
        jobId,
        storagePath: storageResult.storagePath,
      });

      // Step 3: Generate metadata with OpenAI (Requirements: 6.3)
      logger.info("Step 3: Generating metadata", {jobId});
      await processMetadataGeneration(jobId);

      // Step 4: Upload to YouTube (Requirements: 6.4)
      logger.info("Step 4: Uploading to YouTube", {jobId});
      await processYouTubeUpload(jobId);

      logger.info("Video job completed successfully", {jobId});
    } catch (error) {
      // Handle errors and update job with error details (Requirements: 8.5)
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Video job processing failed", {
        jobId,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Update job status to failed with error message (Requirements: 8.5)
      await updateJobError(jobId, errorMessage);
    }
  });

/**
 * Cloud Function: createVideoJob
 * HTTP endpoint to create a new video job
 * Verifies authentication, validates payload, creates Firestore document
 * Requirements: 3.2, 9.1, 9.2
 */
export const createVideoJob = functions.https.onRequest(async (request, response) => {
  // Set CORS headers
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  // Only allow POST requests
  if (request.method !== "POST") {
    const errorResponse: ErrorResponse = {
      code: "METHOD_NOT_ALLOWED",
      message: "Only POST requests are allowed",
      retryable: false,
      timestamp: Date.now(),
    };
    response.status(405).json(errorResponse);
    return;
  }

  // Authenticate request (Requirements: 9.1, 9.2)
  await authenticateRequest(request, response, async (authContext: AuthenticatedRequest) => {
    try {
      // Validate request payload (Requirements: 3.2)
      const {prompt, privacyStatus} = request.body;

      if (!prompt || typeof prompt !== "string") {
        const errorResponse: ErrorResponse = {
          code: "INVALID_PAYLOAD",
          message: "Missing or invalid 'prompt' field",
          retryable: false,
          timestamp: Date.now(),
        };
        response.status(400).json(errorResponse);
        return;
      }

      // Validate prompt is non-empty (Requirements: 3.2)
      if (prompt.trim().length === 0) {
        const errorResponse: ErrorResponse = {
          code: "EMPTY_PROMPT",
          message: "Prompt cannot be empty",
          retryable: false,
          timestamp: Date.now(),
        };
        response.status(400).json(errorResponse);
        return;
      }

      // Validate privacy status
      const validPrivacyStatuses = ["public", "unlisted", "private"];
      const finalPrivacyStatus = privacyStatus && validPrivacyStatuses.includes(privacyStatus) ?
        privacyStatus : "unlisted";

      logger.info("Creating video job", {
        userId: authContext.userId,
        promptLength: prompt.length,
        privacyStatus: finalPrivacyStatus,
      });

      // Create VideoJob document in Firestore (Requirements: 3.2)
      const db = admin.firestore();
      const jobRef = db.collection("videoJobs").doc();
      const jobId = jobRef.id;

      const newJob: Partial<VideoJob> = {
        jobId,
        userId: authContext.userId,
        prompt: prompt.trim(),
        status: JobStatus.PENDING,
        privacyStatus: finalPrivacyStatus,
        createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
        retryCount: 0,
      };

      await jobRef.set(newJob);

      logger.info("Video job created successfully", {
        jobId,
        userId: authContext.userId,
      });

      // Return job ID to frontend (Requirements: 3.2)
      response.status(201).json({
        jobId,
        status: JobStatus.PENDING,
      });
    } catch (error) {
      logger.error("Failed to create video job", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: authContext.userId,
      });

      const errorResponse: ErrorResponse = {
        code: "JOB_CREATION_FAILED",
        message: error instanceof Error ? error.message : "Failed to create video job",
        retryable: true,
        timestamp: Date.now(),
      };

      response.status(500).json(errorResponse);
    }
  });
});

/**
 * Cloud Function: cleanupCompletedJob
 * Triggered when a VideoJob document is updated to completed status
 * Deletes the video file from Firebase Storage after successful YouTube upload
 * Requirements: 5.5
 */
export const cleanupCompletedJob = functions.firestore
  .document("videoJobs/{jobId}")
  .onUpdate(async (change, context) => {
    const jobId = context.params.jobId;
    const beforeData = change.before.data() as VideoJob;
    const afterData = change.after.data() as VideoJob;

    // Only proceed if job status changed to completed
    if (beforeData.status !== JobStatus.COMPLETED && afterData.status === JobStatus.COMPLETED) {
      logger.info("Starting cleanup for completed job", {
        jobId,
        userId: afterData.userId,
      });

      try {
        // Delete video from Firebase Storage if it exists
        if (afterData.videoUrl) {
          // Extract storage path from the job data
          // The storage path is stored as videos/{jobId}/video.mp4
          const storagePath = `videos/${jobId}/video.mp4`;

          logger.info("Deleting video from storage", {
            jobId,
            storagePath,
          });

          await deleteFromStorage(storagePath);

          logger.info("Video cleanup completed successfully", {
            jobId,
            storagePath,
          });
        } else {
          logger.info("No video URL found, skipping storage cleanup", {jobId});
        }
      } catch (error) {
        // Log error but don't fail the function
        // Cleanup failures shouldn't affect the completed job
        logger.error("Cleanup operation failed", {
          jobId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  });

/**
 * Cloud Function: cleanupOldJobs
 * Scheduled function to delete old job records (90 days TTL)
 * Runs daily to clean up expired job records
 * Requirements: 5.5
 */
export const cleanupOldJobs = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const db = admin.firestore();
    const logger = createLogger("cleanupOldJobs");

    // Calculate cutoff date (90 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);

    logger.info("Starting cleanup of old jobs", {
      cutoffDate: cutoffDate.toISOString(),
    });

    try {
      // Query for jobs older than 90 days
      const oldJobsQuery = db
        .collection("videoJobs")
        .where("createdAt", "<", cutoffTimestamp)
        .limit(500); // Process in batches to avoid timeouts

      const snapshot = await oldJobsQuery.get();

      if (snapshot.empty) {
        logger.info("No old jobs found to clean up");
        return null;
      }

      logger.info("Found old jobs to delete", {count: snapshot.size});

      // Delete jobs in batch
      const batch = db.batch();
      let deletedCount = 0;

      for (const doc of snapshot.docs) {
        const job = doc.data() as VideoJob;

        // Delete associated video from storage if it still exists
        if (job.videoUrl) {
          const storagePath = `videos/${job.jobId}/video.mp4`;
          try {
            await deleteFromStorage(storagePath);
            logger.info("Deleted video for old job", {
              jobId: job.jobId,
              storagePath,
            });
          } catch (error) {
            // Log but continue - storage file might already be deleted
            logger.warn("Failed to delete video for old job", {
              jobId: job.jobId,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        // Add job deletion to batch
        batch.delete(doc.ref);
        deletedCount++;
      }

      // Commit batch deletion
      await batch.commit();

      logger.info("Old jobs cleanup completed", {
        deletedCount,
        cutoffDate: cutoffDate.toISOString(),
      });

      return {
        deletedCount,
        cutoffDate: cutoffDate.toISOString(),
      };
    } catch (error) {
      logger.error("Old jobs cleanup failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  });

/**
 * Cloud Function: monitorErrorRate
 * Scheduled function that checks error rate and logs alerts
 * Runs every 15 minutes to monitor system health
 * Requirements: Task 16.2 - Set up alerts for error rate spikes
 */
export const monitorErrorRate = functions.pubsub
  .schedule("every 15 minutes")
  .onRun(async (context) => {
    const {checkErrorRate} = await import("./utils/metricsTracking");
    
    logger.info("Running error rate monitoring check");

    try {
      // Check error rate with 50% threshold over 15 minute window
      const result = await checkErrorRate(50, 15);

      if (result.shouldAlert) {
        logger.error("HIGH ERROR RATE DETECTED", {
          errorRate: result.errorRate,
          errorCount: result.errorCount,
          totalCount: result.totalCount,
          threshold: 50,
          windowMinutes: 15,
        });

        // In production, this would trigger:
        // - Email/SMS alerts to administrators
        // - Slack/Discord notifications
        // - PagerDuty incidents
        // - Cloud Monitoring alerts
      } else {
        logger.info("Error rate within acceptable range", {
          errorRate: result.errorRate,
          errorCount: result.errorCount,
          totalCount: result.totalCount,
        });
      }

      return null;
    } catch (error) {
      logger.error("Error monitoring check failed", {error});
      return null;
    }
  });
