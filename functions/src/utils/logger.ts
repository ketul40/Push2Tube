/**
 * Logging utility for Cloud Functions
 */

import * as functions from "firebase-functions";

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    functions.logger.debug(`[${this.context}] ${message}`, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    functions.logger.info(`[${this.context}] ${message}`, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    functions.logger.warn(`[${this.context}] ${message}`, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: any): void {
    functions.logger.error(`[${this.context}] ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
    });
  }
}

/**
 * Create a logger instance
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}
