/**
 * YouTube upload helper functions
 * Handles video upload to YouTube Data API
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import axios from "axios";
import * as admin from "firebase-admin";
import {getValidAccessToken} from "./youtubeAuth";
import {createLogger} from "../utils/logger";
import {trackAPIUsage} from "../utils/metricsTracking";

const logger = createLogger("youtubeUpload");

const YOUTUBE_UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos";

/**
 * Result from uploadToYouTube function
 */
export interface YouTubeUploadResult {
  videoId: string;
  videoUrl: string;
}

/**
 * Upload video to YouTube with metadata
 * Requirements: 5.1, 5.2, 5.3, 5.4
 * 
 * @param userId - User ID to retrieve OAuth token
 * @param videoStoragePath - Path to video in Firebase Storage
 * @param title - Video title
 * @param description - Video description
 * @param tags - Video tags
 * @param privacyStatus - Privacy status (public, unlisted, private)
 * @returns YouTube video ID and URL
 * @throws Error if upload fails
 */
export async function uploadToYouTube(
  userId: string,
  videoStoragePath: string,
  title: string,
  description: string,
  tags: string[],
  privacyStatus: string
): Promise<YouTubeUploadResult> {
  const startTime = Date.now();
  try {
    logger.info("Starting YouTube upload", {
      userId,
      videoStoragePath,
      titleLength: title.length,
      tagCount: tags.length,
      privacyStatus,
    });

    // Retrieve user's OAuth access token (Requirements: 5.1)
    const accessToken = await getValidAccessToken(userId);
    logger.info("Retrieved valid access token", {userId});

    // Download video from Firebase Storage (Requirements: 5.2)
    const bucket = admin.storage().bucket();
    const file = bucket.file(videoStoragePath);

    logger.info("Downloading video from Firebase Storage", {videoStoragePath});
    const [videoBuffer] = await file.download();
    logger.info("Video downloaded from storage", {
      size: videoBuffer.length,
      videoStoragePath,
    });

    // Prepare metadata for YouTube upload (Requirements: 5.3)
    const metadata = {
      snippet: {
        title: title,
        description: description,
        tags: tags,
        categoryId: "22", // People & Blogs category
      },
      status: {
        privacyStatus: privacyStatus, // Requirements: 5.4
        selfDeclaredMadeForKids: false,
      },
    };

    logger.info("Prepared YouTube metadata", {
      title,
      descriptionLength: description.length,
      tagCount: tags.length,
      privacyStatus,
    });

    // Upload video to YouTube Data API (Requirements: 5.2)
    // Using resumable upload for reliability with large files
    const uploadUrl = await initiateResumableUpload(accessToken, metadata);
    logger.info("Initiated resumable upload", {uploadUrl});

    const videoId = await uploadVideoContent(uploadUrl, videoBuffer);
    logger.info("Video uploaded successfully to YouTube", {videoId});

    // Return YouTube video ID and URL (Requirements: 5.1)
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    logger.info("YouTube upload completed", {videoId, videoUrl});

    // Track successful API call
    const durationMs = Date.now() - startTime;
    await trackAPIUsage("youtube_upload", true, durationMs, userId);

    return {
      videoId,
      videoUrl,
    };
  } catch (error) {
    logger.error("YouTube upload failed", {error, userId, videoStoragePath});

    // Track failed API call
    const durationMs = Date.now() - startTime;
    await trackAPIUsage("youtube_upload", false, durationMs, userId);

    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("YouTube authentication failed. Please reconnect your YouTube account.");
      } else if (error.response?.status === 403) {
        throw new Error("YouTube API quota exceeded or insufficient permissions.");
      } else if (error.response?.status === 400) {
        throw new Error(`Invalid upload request: ${error.response.data?.error?.message || "Unknown error"}`);
      }
    }

    throw new Error(
      `YouTube upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Initiate a resumable upload session
 * @param accessToken - OAuth access token
 * @param metadata - Video metadata
 * @returns Upload URL for resumable upload
 */
async function initiateResumableUpload(
  accessToken: string,
  metadata: any
): Promise<string> {
  try {
    const response = await axios.post(
      `${YOUTUBE_UPLOAD_URL}?uploadType=resumable&part=snippet,status`,
      metadata,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": "video/mp4",
        },
      }
    );

    const uploadUrl = response.headers.location;
    if (!uploadUrl) {
      throw new Error("No upload URL returned from YouTube");
    }

    return uploadUrl;
  } catch (error) {
    logger.error("Failed to initiate resumable upload", {error});
    throw error;
  }
}

/**
 * Upload video content to the resumable upload URL
 * @param uploadUrl - Resumable upload URL
 * @param videoBuffer - Video file buffer
 * @returns YouTube video ID
 */
async function uploadVideoContent(
  uploadUrl: string,
  videoBuffer: Buffer
): Promise<string> {
  try {
    const response = await axios.put(uploadUrl, videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": videoBuffer.length,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 600000, // 10 minute timeout for large uploads
    });

    const videoId = response.data.id;
    if (!videoId) {
      throw new Error("No video ID returned from YouTube");
    }

    return videoId;
  } catch (error) {
    logger.error("Failed to upload video content", {error});
    throw error;
  }
}
