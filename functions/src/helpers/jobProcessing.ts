/**
 * Job processing helper functions
 * Handles individual steps in the video job pipeline
 */

import * as admin from "firebase-admin";
import {JobStatus, VideoJob} from "../types";
import {generateMetadata, VideoMetadata} from "./metadataGeneration";
import {uploadToYouTube, YouTubeUploadResult} from "./youtubeUpload";
import {createLogger} from "../utils/logger";
import {trackJobCompletion} from "../utils/metricsTracking";

const logger = createLogger("jobProcessing");

/**
 * Process metadata generation step for a video job
 * Updates job status, generates metadata, and stores results
 * @param jobId - Video job ID
 * @returns Generated metadata
 * @throws Error if metadata generation fails
 */
export async function processMetadataGeneration(jobId: string): Promise<VideoMetadata> {
  const db = admin.firestore();
  const jobRef = db.collection("videoJobs").doc(jobId);

  try {
    // Get current job data
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists) {
      throw new Error(`Job ${jobId} not found`);
    }

    const job = jobDoc.data() as VideoJob;

    // Update status to generating_metadata
    logger.info("Starting metadata generation", {jobId, prompt: job.prompt});
    await jobRef.update({
      status: JobStatus.GENERATING_METADATA,
    });

    // Generate metadata using OpenAI
    const metadata = await generateMetadata(job.prompt);

    // Store metadata in job record
    logger.info("Storing metadata in job record", {
      jobId,
      titleLength: metadata.title.length,
      descriptionLength: metadata.description.length,
      tagCount: metadata.tags.length,
    });

    await jobRef.update({
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags,
    });

    logger.info("Metadata generation completed successfully", {jobId});

    return metadata;
  } catch (error) {
    // Handle generation failures
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Metadata generation failed", {
      jobId,
      error: errorMessage,
    });

    // Update job status to failed
    await jobRef.update({
      status: JobStatus.FAILED,
      error: `Metadata generation failed: ${errorMessage}`,
    });

    throw error;
  }
}

/**
 * Update job status
 * Helper function to update job status in Firestore
 * @param jobId - Video job ID
 * @param status - New status
 */
export async function updateJobStatus(jobId: string, status: JobStatus): Promise<void> {
  const db = admin.firestore();
  const jobRef = db.collection("videoJobs").doc(jobId);

  await jobRef.update({
    status,
  });

  logger.info("Job status updated", {jobId, status});
}

/**
 * Update job with error
 * Helper function to mark job as failed with error message
 * @param jobId - Video job ID
 * @param error - Error message
 */
export async function updateJobError(jobId: string, error: string): Promise<void> {
  const db = admin.firestore();
  const jobRef = db.collection("videoJobs").doc(jobId);

  await jobRef.update({
    status: JobStatus.FAILED,
    error,
  });

  logger.error("Job marked as failed", {jobId, error});
}

/**
 * Process YouTube upload step for a video job
 * Updates job status, uploads video to YouTube, and stores results
 * Requirements: 5.5, 6.4
 * @param jobId - Video job ID
 * @returns YouTube upload result
 * @throws Error if upload fails
 */
export async function processYouTubeUpload(jobId: string): Promise<YouTubeUploadResult> {
  const db = admin.firestore();
  const jobRef = db.collection("videoJobs").doc(jobId);

  try {
    // Get current job data
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists) {
      throw new Error(`Job ${jobId} not found`);
    }

    const job = jobDoc.data() as VideoJob;

    // Validate required fields
    if (!job.videoUrl) {
      throw new Error("Video URL not found in job record");
    }

    if (!job.title || !job.description || !job.tags) {
      throw new Error("Metadata not found in job record");
    }

    // Extract storage path from video URL
    // videoUrl format: https://storage.googleapis.com/bucket/videos/jobId/video.mp4?...
    const storagePath = `videos/${jobId}/video.mp4`;

    // Update status to uploading_to_youtube (Requirements: 6.4)
    logger.info("Starting YouTube upload", {
      jobId,
      userId: job.userId,
      title: job.title,
      privacyStatus: job.privacyStatus,
    });

    await jobRef.update({
      status: JobStatus.UPLOADING_TO_YOUTUBE,
    });

    // Call uploadToYouTube with job data (Requirements: 5.5)
    const uploadResult = await uploadToYouTube(
      job.userId,
      storagePath,
      job.title,
      job.description,
      job.tags,
      job.privacyStatus
    );

    // Store YouTube video ID in job record (Requirements: 5.5)
    logger.info("Storing YouTube video ID in job record", {
      jobId,
      youtubeVideoId: uploadResult.videoId,
      youtubeUrl: uploadResult.videoUrl,
    });

    await jobRef.update({
      youtubeVideoId: uploadResult.videoId,
      youtubeUrl: uploadResult.videoUrl,
    });

    // Update job status to completed (Requirements: 5.5, 6.4)
    logger.info("Updating job status to completed", {jobId});

    await jobRef.update({
      status: JobStatus.COMPLETED,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info("YouTube upload completed successfully", {
      jobId,
      youtubeVideoId: uploadResult.videoId,
    });

    // Track job completion metrics
    const updatedJobDoc = await jobRef.get();
    if (updatedJobDoc.exists) {
      await trackJobCompletion(updatedJobDoc.data() as VideoJob);
    }

    return uploadResult;
  } catch (error) {
    // Handle upload failures (Requirements: 5.5)
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("YouTube upload failed", {
      jobId,
      error: errorMessage,
    });

    // Update job status to failed
    await jobRef.update({
      status: JobStatus.FAILED,
      error: `YouTube upload failed: ${errorMessage}`,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Track job failure metrics
    const failedJobDoc = await jobRef.get();
    if (failedJobDoc.exists) {
      await trackJobCompletion(failedJobDoc.data() as VideoJob);
    }

    throw error;
  }
}
