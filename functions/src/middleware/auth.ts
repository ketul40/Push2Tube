/**
 * Authentication middleware for Cloud Functions
 * Verifies Firebase ID tokens and attaches user context to requests
 */

import * as admin from "firebase-admin";
import {Request, Response} from "firebase-functions/v1";
import {AuthenticatedRequest, ErrorResponse} from "../types";
import {createLogger} from "../utils/logger";

const logger = createLogger("AuthMiddleware");

/**
 * Extract Bearer token from Authorization header
 * @param request HTTP request
 * @returns Token string or null if not found
 */
function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Verify Firebase ID token and extract user information
 * @param idToken Firebase ID token
 * @returns Authenticated user context
 * @throws Error if token is invalid
 */
export async function verifyIdToken(idToken: string): Promise<AuthenticatedRequest> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    return {
      userId: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error) {
    logger.error("Token verification failed", error);
    throw new Error("Invalid or expired authentication token");
  }
}

/**
 * Middleware to authenticate HTTP requests
 * Extracts and verifies Firebase ID token from Authorization header
 * Attaches user context to request object
 *
 * @param request HTTP request
 * @param response HTTP response
 * @param next Callback to continue processing
 */
export async function authenticateRequest(
  request: Request,
  response: Response,
  next: (authContext: AuthenticatedRequest) => Promise<void>
): Promise<void> {
  try {
    // Extract token from Authorization header
    const idToken = extractBearerToken(request);

    if (!idToken) {
      logger.warn("Missing authorization token");
      const errorResponse: ErrorResponse = {
        code: "UNAUTHORIZED",
        message: "Missing authentication token",
        retryable: false,
        timestamp: Date.now(),
      };
      response.status(401).json(errorResponse);
      return;
    }

    // Verify token and get user context
    const authContext = await verifyIdToken(idToken);
    logger.info("Request authenticated", {userId: authContext.userId});

    // Call next handler with authenticated context
    await next(authContext);
  } catch (error: any) {
    logger.error("Authentication failed", error);

    const errorResponse: ErrorResponse = {
      code: "AUTHENTICATION_FAILED",
      message: error.message || "Authentication failed",
      retryable: false,
      timestamp: Date.now(),
    };

    response.status(401).json(errorResponse);
  }
}

/**
 * Verify that a user ID matches the authenticated user
 * Prevents users from accessing other users' data
 *
 * @param authContext Authenticated user context
 * @param targetUserId User ID being accessed
 * @throws Error if user IDs don't match
 */
export function verifyUserAccess(
  authContext: AuthenticatedRequest,
  targetUserId: string
): void {
  if (authContext.userId !== targetUserId) {
    logger.warn("Unauthorized access attempt", {
      authenticatedUser: authContext.userId,
      targetUser: targetUserId,
    });
    throw new Error("Unauthorized: Cannot access another user's data");
  }
}
