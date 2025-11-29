// Core type definitions for Push2Tube

import { SubscriptionPlan, SubscriptionStatus } from './subscription';

export enum JobStatus {
  PENDING = 'pending',
  GENERATING_VIDEO = 'generating_video',
  GENERATING_METADATA = 'generating_metadata',
  UPLOADING_TO_YOUTUBE = 'uploading_to_youtube',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

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
  createdAt: Date;
  lastLoginAt: Date;
  
  // Subscription fields
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  videosUsedThisMonth: number;
  videoQuota: number;
}

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
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Error handling
  error?: string;
  retryCount: number;
}

export interface Config {
  // Firebase
  FIREBASE_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  
  // OpenAI
  OPENAI_API_KEY: string;
  SORA_API_ENDPOINT: string;
  
  // YouTube
  YOUTUBE_CLIENT_ID: string;
  YOUTUBE_CLIENT_SECRET: string;
  YOUTUBE_REDIRECT_URI: string;
  
  // Application
  MAX_RETRY_ATTEMPTS: number;
  VIDEO_STORAGE_EXPIRY_HOURS: number;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
  timestamp: number;
}

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}
