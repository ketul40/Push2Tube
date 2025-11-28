/**
 * YouTube OAuth authentication helper functions
 * Handles OAuth flow, token management, and encryption
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.4
 */

import * as admin from "firebase-admin";
import axios from "axios";
import * as crypto from "crypto";
import {getConfig} from "../config";

const YOUTUBE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_API_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
];

/**
 * Encrypt a token using AES-256-GCM
 * Requirements: 9.4
 */
export function encryptToken(token: string): string {
  const config = getConfig();
  const key = Buffer.from(config.tokenEncryptionKey, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Return iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt a token using AES-256-GCM
 * Requirements: 9.4
 */
export function decryptToken(encryptedToken: string): string {
  const config = getConfig();
  const key = Buffer.from(config.tokenEncryptionKey, "hex");

  const parts = encryptedToken.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Generate OAuth authorization URL
 * Requirements: 2.1
 */
export function generateAuthUrl(userId: string): string {
  const config = getConfig();

  const params = new URLSearchParams({
    client_id: config.youtubeClientId,
    redirect_uri: config.youtubeRedirectUri,
    response_type: "code",
    scope: YOUTUBE_API_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: userId, // Pass userId in state for callback
  });

  return `${YOUTUBE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 * Requirements: 2.2
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const config = getConfig();

  try {
    const response = await axios.post(YOUTUBE_TOKEN_URL, {
      code,
      client_id: config.youtubeClientId,
      client_secret: config.youtubeClientSecret,
      redirect_uri: config.youtubeRedirectUri,
      grant_type: "authorization_code",
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    throw new Error("Failed to exchange authorization code for tokens");
  }
}

/**
 * Get YouTube channel information
 * Requirements: 2.3
 */
export async function getChannelInfo(accessToken: string): Promise<{
  channelId: string;
  channelTitle: string;
}> {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/channels",
      {
        params: {
          part: "snippet",
          mine: true,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("No YouTube channel found for this account");
    }

    const channel = response.data.items[0];
    return {
      channelId: channel.id,
      channelTitle: channel.snippet.title,
    };
  } catch (error) {
    console.error("Error fetching channel info:", error);
    throw new Error("Failed to fetch YouTube channel information");
  }
}

/**
 * Refresh an expired OAuth access token
 * Requirements: 2.4, 2.5
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const config = getConfig();

  try {
    const response = await axios.post(YOUTUBE_TOKEN_URL, {
      refresh_token: refreshToken,
      client_id: config.youtubeClientId,
      client_secret: config.youtubeClientSecret,
      grant_type: "refresh_token",
    });

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Failed to refresh access token");
  }
}

/**
 * Update user record with YouTube connection status
 * Requirements: 2.2, 2.3
 */
export async function updateUserYouTubeConnection(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  channelId: string
): Promise<void> {
  const db = admin.firestore();
  const userRef = db.collection("users").doc(userId);

  const encryptedRefreshToken = encryptToken(refreshToken);
  const encryptedAccessToken = encryptToken(accessToken);
  const expiresAt = Date.now() + expiresIn * 1000;

  await userRef.update({
    youtubeConnected: true,
    youtubeChannelId: channelId,
    oauthRefreshToken: encryptedRefreshToken,
    oauthAccessToken: encryptedAccessToken,
    oauthExpiresAt: expiresAt,
  });
}

/**
 * Check if access token is expired
 * Requirements: 2.4
 */
export function isTokenExpired(expiresAt: number): boolean {
  // Add 5 minute buffer to refresh before actual expiration
  const bufferMs = 5 * 60 * 1000;
  return Date.now() >= expiresAt - bufferMs;
}

/**
 * Get valid access token for user, refreshing if necessary
 * Requirements: 2.4, 2.5
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const db = admin.firestore();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();

  if (!userData?.youtubeConnected) {
    throw new Error("YouTube account not connected");
  }

  if (!userData.oauthAccessToken || !userData.oauthRefreshToken) {
    throw new Error("OAuth tokens not found");
  }

  // Check if token is expired
  if (!userData.oauthExpiresAt || isTokenExpired(userData.oauthExpiresAt)) {
    // Token is expired, refresh it
    try {
      const decryptedRefreshToken = decryptToken(userData.oauthRefreshToken);
      const newTokens = await refreshAccessToken(decryptedRefreshToken);

      // Update user record with new access token
      const encryptedAccessToken = encryptToken(newTokens.accessToken);
      const newExpiresAt = Date.now() + newTokens.expiresIn * 1000;

      await userRef.update({
        oauthAccessToken: encryptedAccessToken,
        oauthExpiresAt: newExpiresAt,
      });

      return newTokens.accessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      // Mark YouTube as disconnected if refresh fails
      await userRef.update({
        youtubeConnected: false,
      });
      throw new Error("Failed to refresh access token. Please reconnect your YouTube account.");
    }
  }

  // Token is still valid, decrypt and return
  return decryptToken(userData.oauthAccessToken);
}

/**
 * Refresh YouTube token for a user
 * Requirements: 2.4, 2.5
 */
export async function refreshYouTubeToken(userId: string): Promise<void> {
  const db = admin.firestore();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();

  if (!userData?.oauthRefreshToken) {
    throw new Error("Refresh token not found");
  }

  try {
    const decryptedRefreshToken = decryptToken(userData.oauthRefreshToken);
    const newTokens = await refreshAccessToken(decryptedRefreshToken);

    // Update user record with new access token
    const encryptedAccessToken = encryptToken(newTokens.accessToken);
    const newExpiresAt = Date.now() + newTokens.expiresIn * 1000;

    await userRef.update({
      oauthAccessToken: encryptedAccessToken,
      oauthExpiresAt: newExpiresAt,
    });
  } catch (error) {
    console.error("Error refreshing YouTube token:", error);
    // Mark YouTube as disconnected if refresh fails
    await userRef.update({
      youtubeConnected: false,
    });
    throw new Error("Failed to refresh YouTube token. Please reconnect your account.");
  }
}

