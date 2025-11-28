/**
 * Example usage of authentication middleware
 * This file demonstrates how to use the auth middleware in Cloud Functions
 */

import * as functions from "firebase-functions";
import {authenticateRequest, verifyUserAccess} from "./auth";
import {ErrorResponse} from "../types";

/**
 * Example HTTP Cloud Function with authentication
 * This demonstrates the pattern for authenticated endpoints
 */
export const exampleAuthenticatedFunction = functions.https.onRequest(
  async (request, response) => {
    await authenticateRequest(request, response, async (authContext) => {
      try {
        // Extract request data
        const {userId} = request.body;

        // Verify the authenticated user can access this data
        verifyUserAccess(authContext, userId);

        // Process the request
        // ... your business logic here ...

        response.json({
          success: true,
          message: "Request processed successfully",
          userId: authContext.userId,
        });
      } catch (error: any) {
        const errorResponse: ErrorResponse = {
          code: "REQUEST_FAILED",
          message: error.message || "Request processing failed",
          retryable: false,
          timestamp: Date.now(),
        };
        response.status(400).json(errorResponse);
      }
    });
  }
);
