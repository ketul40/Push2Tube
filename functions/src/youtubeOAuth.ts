/**
 * YouTube OAuth Cloud Functions
 * Handles OAuth authorization flow and callback
 * Requirements: 2.1, 2.2, 2.3
 */

import * as functions from "firebase-functions";
import {verifyIdToken} from "./middleware/auth";
import {
  generateAuthUrl,
  exchangeCodeForTokens,
  getChannelInfo,
  updateUserYouTubeConnection,
  disconnectUserYouTube,
} from "./helpers/youtubeAuth";

/**
 * Helper function to set CORS headers
 * Ensures headers are always set consistently
 */
function setCorsHeaders(response: functions.Response): void {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Max-Age", "3600");
}

/**
 * Generate YouTube OAuth authorization URL
 * Requirements: 2.1
 */
export const getYouTubeAuthUrl = functions.https.onRequest(
  async (request, response) => {
    // Set CORS headers FIRST - before any other operation
    setCorsHeaders(response);

    // Handle preflight OPTIONS request
    // Must return early with headers already set
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    try {
      // Verify Firebase ID token
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // Ensure CORS headers are set on error response
        setCorsHeaders(response);
        response.status(401).json({
          code: "UNAUTHORIZED",
          message: "Missing or invalid authorization token",
          retryable: false,
          timestamp: Date.now(),
        });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      const authContext = await verifyIdToken(idToken);

      // Generate authorization URL
      const authUrl = generateAuthUrl(authContext.userId);

      // Ensure CORS headers are set on success response
      setCorsHeaders(response);
      response.status(200).json({
        authUrl,
        userId: authContext.userId,
      });
    } catch (error) {
      console.error("Error generating YouTube auth URL:", error);
      // Ensure CORS headers are set on error response
      setCorsHeaders(response);
      response.status(500).json({
        code: "AUTH_URL_GENERATION_FAILED",
        message: "Failed to generate YouTube authorization URL",
        retryable: true,
        timestamp: Date.now(),
      });
    }
  }
);

/**
 * Handle YouTube OAuth callback
 * Exchange authorization code for tokens and update user record
 * Requirements: 2.2, 2.3
 */
export const youtubeOAuthCallback = functions.https.onRequest(
  async (request, response) => {
    try {
      const {code, state} = request.query;

      if (!code || typeof code !== "string") {
        response.status(400).send("Missing authorization code");
        return;
      }

      if (!state || typeof state !== "string") {
        response.status(400).send("Missing state parameter");
        return;
      }

      const userId = state;

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code);

      // Get channel information
      const channelInfo = await getChannelInfo(tokens.accessToken);

      // Update user record
      await updateUserYouTubeConnection(
        userId,
        tokens.accessToken,
        tokens.refreshToken,
        tokens.expiresIn,
        channelInfo.channelId
      );

      // Redirect to success page
      // Use origin from request, or construct from Firebase project
      const origin = request.headers.origin || 
        (process.env.FIREBASE_PROJECT_ID 
          ? `https://${process.env.FIREBASE_PROJECT_ID}.web.app`
          : "https://push2tube.web.app");
      
      response.redirect(
        `${origin}/dashboard?success=true&channel=${encodeURIComponent(channelInfo.channelTitle)}`
      );
    } catch (error) {
      console.error("Error in YouTube OAuth callback:", error);
      const origin = request.headers.origin || 
        (process.env.FIREBASE_PROJECT_ID 
          ? `https://${process.env.FIREBASE_PROJECT_ID}.web.app`
          : "https://push2tube.web.app");
      
      response.redirect(
        `${origin}/dashboard?success=false&error=${encodeURIComponent("Failed to connect YouTube account")}`
      );
    }
  }
);

/**
 * Disconnect YouTube account
 * Removes YouTube connection and clears all tokens
 * Requirements: 2.3
 */
export const disconnectYouTube = functions.https.onRequest(
  async (request, response) => {
    // Set CORS headers FIRST - before any other operation
    setCorsHeaders(response);

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    try {
      // Verify Firebase ID token
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        setCorsHeaders(response);
        response.status(401).json({
          code: "UNAUTHORIZED",
          message: "Missing or invalid authorization token",
          retryable: false,
          timestamp: Date.now(),
        });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      const authContext = await verifyIdToken(idToken);

      // Disconnect YouTube account
      await disconnectUserYouTube(authContext.userId);

      setCorsHeaders(response);
      response.status(200).json({
        success: true,
        message: "YouTube account disconnected successfully",
      });
    } catch (error) {
      console.error("Error disconnecting YouTube:", error);
      setCorsHeaders(response);
      response.status(500).json({
        code: "DISCONNECT_FAILED",
        message: "Failed to disconnect YouTube account",
        retryable: true,
        timestamp: Date.now(),
      });
    }
  }
);

