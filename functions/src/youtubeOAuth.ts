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
} from "./helpers/youtubeAuth";

/**
 * Generate YouTube OAuth authorization URL
 * Requirements: 2.1
 */
export const getYouTubeAuthUrl = functions.https.onRequest(
  async (request, response) => {
    // Enable CORS
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET, POST");
    response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    try {
      // Verify Firebase ID token
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

      response.status(200).json({
        authUrl,
        userId: authContext.userId,
      });
    } catch (error) {
      console.error("Error generating YouTube auth URL:", error);
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
      response.redirect(
        `${request.headers.origin || "http://localhost:5173"}/youtube-connected?success=true&channel=${encodeURIComponent(channelInfo.channelTitle)}`
      );
    } catch (error) {
      console.error("Error in YouTube OAuth callback:", error);
      response.redirect(
        `${request.headers.origin || "http://localhost:5173"}/youtube-connected?success=false&error=${encodeURIComponent("Failed to connect YouTube account")}`
      );
    }
  }
);

