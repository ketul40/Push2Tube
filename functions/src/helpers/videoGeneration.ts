/**
 * Video generation helper functions
 * Handles Sora API integration for video generation
 */

import axios from "axios";
import {getConfig} from "../config";
import {createLogger} from "../utils/logger";

const logger = createLogger("videoGeneration");

/**
 * Response from Sora API
 */
export interface SoraVideoResponse {
  videoUrl: string;
  duration: number;
  status: string;
}

/**
 * Result from generateVideo function
 */
export interface GenerateVideoResult {
  videoUrl: string;
  duration: number;
}

/**
 * Generate video using Sora API
 * @param prompt - Text prompt for video generation
 * @returns Video URL and duration
 * @throws Error if video generation fails
 */
export async function generateVideo(prompt: string): Promise<GenerateVideoResult> {
  const config = getConfig();

  try {
    logger.info("Starting video generation with Sora", {promptLength: prompt.length});

    // Call Sora API
    const response = await axios.post<SoraVideoResponse>(
      config.soraApiEndpoint,
      {
        prompt: prompt,
        // Default parameters for video generation
        duration: 5, // 5 seconds default
        resolution: "1080p",
      },
      {
        headers: {
          "Authorization": `Bearer ${config.openaiApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 300000, // 5 minute timeout for video generation
      }
    );

    // Validate response
    if (!response.data || !response.data.videoUrl) {
      throw new Error("Invalid response from Sora API: missing videoUrl");
    }

    logger.info("Video generation successful", {
      videoUrl: response.data.videoUrl,
      duration: response.data.duration,
    });

    return {
      videoUrl: response.data.videoUrl,
      duration: response.data.duration || 5,
    };
  } catch (error) {
    logger.error("Video generation failed", {error});

    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // API returned an error response
        const status = error.response.status;
        const message = error.response.data?.error?.message || error.message;

        throw new Error(
          `Sora API error (${status}): ${message}`
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new Error("Sora API request timeout or network error");
      }
    }

    // Re-throw other errors
    throw new Error(`Video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
