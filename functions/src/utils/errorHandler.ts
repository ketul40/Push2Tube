/**
 * Error handling utilities for Cloud Functions
 */

import {ErrorResponse} from "../types";
import {createLogger} from "./logger";

const logger = createLogger("ErrorHandler");

/**
 * Error codes for different error types
 */
export enum ErrorCode {
  // Authentication errors
  AUTH_INVALID_TOKEN = "AUTH_INVALID_TOKEN",
  AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  AUTH_MISSING_TOKEN = "AUTH_MISSING_TOKEN",
  AUTH_OAUTH_FAILED = "AUTH_OAUTH_FAILED",
  
  // Validation errors
  VALIDATION_EMPTY_PROMPT = "VALIDATION_EMPTY_PROMPT",
  VALIDATION_INVALID_PRIVACY = "VALIDATION_INVALID_PRIVACY",
  VALIDATION_MISSING_FIELD = "VALIDATION_MISSING_FIELD",
  
  // API errors
  SORA_GENERATION_FAILED = "SORA_GENERATION_FAILED",
  OPENAI_METADATA_FAILED = "OPENAI_METADATA_FAILED",
  YOUTUBE_UPLOAD_FAILED = "YOUTUBE_UPLOAD_FAILED",
  YOUTUBE_QUOTA_EXCEEDED = "YOUTUBE_QUOTA_EXCEEDED",
  YOUTUBE_TOKEN_REFRESH_FAILED = "YOUTUBE_TOKEN_REFRESH_FAILED",
  
  // System errors
  FIRESTORE_WRITE_FAILED = "FIRESTORE_WRITE_FAILED",
  STORAGE_UPLOAD_FAILED = "STORAGE_UPLOAD_FAILED",
  FUNCTION_TIMEOUT = "FUNCTION_TIMEOUT",
  
  // Generic
  INTERNAL_ERROR = "INTERNAL_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Authentication
  [ErrorCode.AUTH_INVALID_TOKEN]: "Your session is invalid. Please sign in again.",
  [ErrorCode.AUTH_TOKEN_EXPIRED]: "Your session has expired. Please sign in again.",
  [ErrorCode.AUTH_MISSING_TOKEN]: "Authentication required. Please sign in.",
  [ErrorCode.AUTH_OAUTH_FAILED]: "Failed to connect your YouTube account. Please try again.",
  
  // Validation
  [ErrorCode.VALIDATION_EMPTY_PROMPT]: "Please enter a prompt for your video.",
  [ErrorCode.VALIDATION_INVALID_PRIVACY]: "Invalid privacy setting. Please choose public, unlisted, or private.",
  [ErrorCode.VALIDATION_MISSING_FIELD]: "Required field is missing. Please check your input.",
  
  // API errors
  [ErrorCode.SORA_GENERATION_FAILED]: "Video generation failed. Please try again with a different prompt.",
  [ErrorCode.OPENAI_METADATA_FAILED]: "Failed to generate video metadata. Please try again.",
  [ErrorCode.YOUTUBE_UPLOAD_FAILED]: "Failed to upload video to YouTube. Please try again.",
  [ErrorCode.YOUTUBE_QUOTA_EXCEEDED]: "YouTube API quota exceeded. Please try again later.",
  [ErrorCode.YOUTUBE_TOKEN_REFRESH_FAILED]: "Your YouTube connection has expired. Please reconnect your account.",
  
  // System errors
  [ErrorCode.FIRESTORE_WRITE_FAILED]: "Failed to save data. Please try again.",
  [ErrorCode.STORAGE_UPLOAD_FAILED]: "Failed to upload video file. Please try again.",
  [ErrorCode.FUNCTION_TIMEOUT]: "Request timed out. Please try again.",
  
  // Generic
  [ErrorCode.INTERNAL_ERROR]: "An internal error occurred. Please try again.",
  [ErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again.",
};

/**
 * Determine if an error is retryable
 */
const RETRYABLE_ERRORS = new Set([
  ErrorCode.OPENAI_METADATA_FAILED,
  ErrorCode.YOUTUBE_UPLOAD_FAILED,
  ErrorCode.FIRESTORE_WRITE_FAILED,
  ErrorCode.STORAGE_UPLOAD_FAILED,
  ErrorCode.FUNCTION_TIMEOUT,
  ErrorCode.INTERNAL_ERROR,
]);

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: ErrorCode,
  details?: string
): ErrorResponse {
  return {
    code,
    message: ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
    details,
    retryable: RETRYABLE_ERRORS.has(code),
    timestamp: Date.now(),
  };
}

/**
 * Format error for user display
 */
export function formatErrorMessage(error: ErrorResponse): string {
  let message = error.message;
  
  if (error.retryable) {
    message += " You can try again.";
  }
  
  return message;
}

/**
 * Log error with context
 */
export function logError(
  context: string,
  error: Error | any,
  metadata?: Record<string, any>
): void {
  const errorData = {
    message: error?.message || String(error),
    stack: error?.stack,
    ...metadata,
  };
  
  logger.error(`Error in ${context}`, errorData);
}

/**
 * Convert unknown error to ErrorResponse
 */
export function toErrorResponse(error: any): ErrorResponse {
  // If it's already an ErrorResponse, return it
  if (error && typeof error === "object" && "code" in error && "message" in error) {
    return error as ErrorResponse;
  }
  
  // Try to determine error type from error message
  const errorMessage = error?.message || String(error);
  
  if (errorMessage.includes("quota")) {
    return createErrorResponse(ErrorCode.YOUTUBE_QUOTA_EXCEEDED, errorMessage);
  }
  
  if (errorMessage.includes("token") || errorMessage.includes("auth")) {
    return createErrorResponse(ErrorCode.AUTH_INVALID_TOKEN, errorMessage);
  }
  
  if (errorMessage.includes("timeout")) {
    return createErrorResponse(ErrorCode.FUNCTION_TIMEOUT, errorMessage);
  }
  
  // Default to unknown error
  return createErrorResponse(ErrorCode.UNKNOWN_ERROR, errorMessage);
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  return fn().catch((error) => {
    logError(context, error);
    throw toErrorResponse(error);
  });
}
