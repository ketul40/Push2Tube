/**
 * Error handling utilities for frontend
 */

import { ErrorResponse, ErrorSeverity } from '../types';

/**
 * Error codes matching backend
 */
export enum ErrorCode {
  // Authentication errors
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_MISSING_TOKEN = 'AUTH_MISSING_TOKEN',
  AUTH_OAUTH_FAILED = 'AUTH_OAUTH_FAILED',
  
  // Validation errors
  VALIDATION_EMPTY_PROMPT = 'VALIDATION_EMPTY_PROMPT',
  VALIDATION_INVALID_PRIVACY = 'VALIDATION_INVALID_PRIVACY',
  VALIDATION_MISSING_FIELD = 'VALIDATION_MISSING_FIELD',
  
  // API errors
  SORA_GENERATION_FAILED = 'SORA_GENERATION_FAILED',
  OPENAI_METADATA_FAILED = 'OPENAI_METADATA_FAILED',
  YOUTUBE_UPLOAD_FAILED = 'YOUTUBE_UPLOAD_FAILED',
  YOUTUBE_QUOTA_EXCEEDED = 'YOUTUBE_QUOTA_EXCEEDED',
  YOUTUBE_TOKEN_REFRESH_FAILED = 'YOUTUBE_TOKEN_REFRESH_FAILED',
  
  // System errors
  FIRESTORE_WRITE_FAILED = 'FIRESTORE_WRITE_FAILED',
  STORAGE_UPLOAD_FAILED = 'STORAGE_UPLOAD_FAILED',
  FUNCTION_TIMEOUT = 'FUNCTION_TIMEOUT',
  
  // Generic
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication
  [ErrorCode.AUTH_INVALID_TOKEN]: 'Your session is invalid. Please sign in again.',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCode.AUTH_MISSING_TOKEN]: 'Authentication required. Please sign in.',
  [ErrorCode.AUTH_OAUTH_FAILED]: 'Failed to connect your YouTube account. Please try again.',
  
  // Validation
  [ErrorCode.VALIDATION_EMPTY_PROMPT]: 'Please enter a prompt for your video.',
  [ErrorCode.VALIDATION_INVALID_PRIVACY]: 'Invalid privacy setting. Please choose public, unlisted, or private.',
  [ErrorCode.VALIDATION_MISSING_FIELD]: 'Required field is missing. Please check your input.',
  
  // API errors
  [ErrorCode.SORA_GENERATION_FAILED]: 'Video generation failed. Please try again with a different prompt.',
  [ErrorCode.OPENAI_METADATA_FAILED]: 'Failed to generate video metadata. Please try again.',
  [ErrorCode.YOUTUBE_UPLOAD_FAILED]: 'Failed to upload video to YouTube. Please try again.',
  [ErrorCode.YOUTUBE_QUOTA_EXCEEDED]: 'YouTube API quota exceeded. Please try again later.',
  [ErrorCode.YOUTUBE_TOKEN_REFRESH_FAILED]: 'Your YouTube connection has expired. Please reconnect your account.',
  
  // System errors
  [ErrorCode.FIRESTORE_WRITE_FAILED]: 'Failed to save data. Please try again.',
  [ErrorCode.STORAGE_UPLOAD_FAILED]: 'Failed to upload video file. Please try again.',
  [ErrorCode.FUNCTION_TIMEOUT]: 'Request timed out. Please try again.',
  
  // Generic
  [ErrorCode.INTERNAL_ERROR]: 'An internal error occurred. Please try again.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * Critical errors that require modal display
 */
const CRITICAL_ERRORS = new Set([
  ErrorCode.AUTH_INVALID_TOKEN,
  ErrorCode.AUTH_TOKEN_EXPIRED,
  ErrorCode.AUTH_MISSING_TOKEN,
  ErrorCode.AUTH_OAUTH_FAILED,
  ErrorCode.YOUTUBE_TOKEN_REFRESH_FAILED,
]);

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  details?: string,
  retryable: boolean = false
): ErrorResponse {
  return {
    code,
    message: ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
    details,
    retryable,
    timestamp: Date.now(),
  };
}

/**
 * Format error for user display
 */
export function formatErrorMessage(error: ErrorResponse): string {
  let message = error.message;
  
  if (error.retryable) {
    message += ' You can try again.';
  }
  
  return message;
}

/**
 * Determine error severity
 */
export function getErrorSeverity(error: ErrorResponse): ErrorSeverity {
  if (CRITICAL_ERRORS.has(error.code as ErrorCode)) {
    return ErrorSeverity.CRITICAL;
  }
  
  if (error.code.startsWith('VALIDATION_')) {
    return ErrorSeverity.WARNING;
  }
  
  return ErrorSeverity.ERROR;
}

/**
 * Check if error should be displayed as modal
 */
export function isCriticalError(error: ErrorResponse): boolean {
  return CRITICAL_ERRORS.has(error.code as ErrorCode);
}

/**
 * Convert unknown error to ErrorResponse
 */
export function toErrorResponse(error: any): ErrorResponse {
  // If it's already an ErrorResponse, return it
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return error as ErrorResponse;
  }
  
  // Try to determine error type from error message
  const errorMessage = error?.message || String(error);
  
  if (errorMessage.includes('quota')) {
    return createErrorResponse(ErrorCode.YOUTUBE_QUOTA_EXCEEDED, errorMessage, false);
  }
  
  if (errorMessage.includes('token') || errorMessage.includes('auth')) {
    return createErrorResponse(ErrorCode.AUTH_INVALID_TOKEN, errorMessage, false);
  }
  
  if (errorMessage.includes('timeout')) {
    return createErrorResponse(ErrorCode.FUNCTION_TIMEOUT, errorMessage, true);
  }
  
  // Default to unknown error
  return createErrorResponse(ErrorCode.UNKNOWN_ERROR, errorMessage, true);
}

/**
 * Log error to console (can be extended to send to monitoring service)
 */
export function logError(
  context: string,
  error: Error | ErrorResponse | any,
  metadata?: Record<string, any>
): void {
  console.error(`[${context}]`, {
    error: error?.message || error,
    stack: error?.stack,
    ...metadata,
  });
}

/**
 * Parse Firebase error to ErrorResponse
 */
export function parseFirebaseError(error: any): ErrorResponse {
  const code = error?.code || '';
  
  if (code.includes('auth/invalid-credential') || code.includes('auth/user-not-found')) {
    return createErrorResponse(ErrorCode.AUTH_INVALID_TOKEN, error.message, false);
  }
  
  if (code.includes('auth/network-request-failed')) {
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, 'Network error. Please check your connection.', true);
  }
  
  if (code.includes('permission-denied')) {
    return createErrorResponse(ErrorCode.AUTH_INVALID_TOKEN, 'Permission denied. Please sign in again.', false);
  }
  
  return toErrorResponse(error);
}
