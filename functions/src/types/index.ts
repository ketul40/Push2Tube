/**
 * Shared type definitions for Cloud Functions
 */

import {Timestamp} from "firebase-admin/firestore";

/**
 * Job status enum matching frontend
 */
export enum JobStatus {
  PENDING = "pending",
  GENERATING_VIDEO = "generating_video",
  GENERATING_METADATA = "generating_metadata",
  UPLOADING_TO_YOUTUBE = "uploading_to_youtube",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * Video Job document structure
 */
export interface VideoJob {
  jobId: string;
  userId: string;
  prompt: string;
  status: JobStatus;
  privacyStatus: string;

  // Video generation
  videoUrl?: string;
  videoDuration?: number;

  // Metadata
  title?: string;
  description?: string;
  tags?: string[];

  // YouTube
  youtubeVideoId?: string;
  youtubeUrl?: string;

  // Timestamps
  createdAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;

  // Error handling
  error?: string;
  retryCount: number;
}

/**
 * User document structure
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  youtubeConnected: boolean;
  youtubeChannelId?: string;
  oauthRefreshToken?: string;
  oauthAccessToken?: string;
  oauthExpiresAt?: number;
  defaultPrivacyStatus: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
  timestamp: number;
}

/**
 * Request context with authenticated user
 */
export interface AuthenticatedRequest {
  userId: string;
  email?: string;
}
