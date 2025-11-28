/**
 * Firebase Storage helper functions
 * Handles video file storage operations
 */

import axios from "axios";
import * as admin from "firebase-admin";
import {getConfig} from "../config";
import {createLogger} from "../utils/logger";

const logger = createLogger("storage");

/**
 * Result from uploadToStorage function
 */
export interface UploadToStorageResult {
  storagePath: string;
  signedUrl: string;
}

/**
 * Upload video to Firebase Storage
 * Downloads video from Sora URL and uploads to Firebase Storage
 * @param videoUrl - URL of the video from Sora
 * @param jobId - Job ID for organizing storage
 * @returns Storage path and signed URL
 * @throws Error if upload fails
 */
export async function uploadToStorage(
  videoUrl: string,
  jobId: string
): Promise<UploadToStorageResult> {
  const config = getConfig();

  try {
    logger.info("Starting video download from Sora", {videoUrl, jobId});

    // Download video from Sora URL
    const response = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      timeout: 300000, // 5 minute timeout
    });

    const videoBuffer = Buffer.from(response.data);
    logger.info("Video downloaded successfully", {
      size: videoBuffer.length,
      jobId,
    });

    // Get Firebase Storage bucket
    const bucket = admin.storage().bucket();

    // Define storage path
    const storagePath = `videos/${jobId}/video.mp4`;
    const file = bucket.file(storagePath);

    logger.info("Uploading video to Firebase Storage", {storagePath, jobId});

    // Upload to Firebase Storage
    await file.save(videoBuffer, {
      metadata: {
        contentType: "video/mp4",
        metadata: {
          jobId: jobId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    logger.info("Video uploaded to Firebase Storage", {storagePath, jobId});

    // Generate signed URL for access
    const expirationTime = Date.now() + (config.videoStorageExpiryHours * 60 * 60 * 1000);
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: expirationTime,
    });

    logger.info("Signed URL generated", {jobId, expiresIn: config.videoStorageExpiryHours});

    return {
      storagePath,
      signedUrl,
    };
  } catch (error) {
    logger.error("Video upload to storage failed", {error, jobId});

    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          `Failed to download video from Sora: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.request) {
        throw new Error("Failed to download video from Sora: network error or timeout");
      }
    }

    // Re-throw other errors
    throw new Error(
      `Storage upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Delete video from Firebase Storage
 * @param storagePath - Path to the video file in storage
 */
export async function deleteFromStorage(storagePath: string): Promise<void> {
  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);

    await file.delete();
    logger.info("Video deleted from storage", {storagePath});
  } catch (error) {
    logger.error("Failed to delete video from storage", {error, storagePath});
    // Don't throw - deletion failures shouldn't break the workflow
  }
}
