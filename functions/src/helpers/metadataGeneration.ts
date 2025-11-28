/**
 * Metadata generation helper functions
 * Handles OpenAI API integration for generating YouTube metadata
 */

import axios from "axios";
import {getConfig} from "../config";
import {createLogger} from "../utils/logger";
import {trackAPIUsage} from "../utils/metricsTracking";

const logger = createLogger("metadataGeneration");

/**
 * Generated metadata for YouTube video
 */
export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
}

/**
 * OpenAI API response structure
 */
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Generate YouTube metadata using OpenAI API
 * Implements retry logic with up to 3 attempts
 * @param prompt - Original video prompt
 * @returns Generated title, description, and tags
 * @throws Error if metadata generation fails after all retries
 */
export async function generateMetadata(prompt: string): Promise<VideoMetadata> {
  const config = getConfig();
  const maxAttempts = config.maxRetryAttempts;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const startTime = Date.now();
    try {
      logger.info(`Attempting metadata generation (attempt ${attempt}/${maxAttempts})`, {
        promptLength: prompt.length,
      });

      const metadata = await attemptMetadataGeneration(prompt);
      const durationMs = Date.now() - startTime;

      // Validate all fields are non-empty
      if (!metadata.title || metadata.title.trim() === "") {
        throw new Error("Generated title is empty");
      }
      if (!metadata.description || metadata.description.trim() === "") {
        throw new Error("Generated description is empty");
      }
      if (!metadata.tags || metadata.tags.length === 0) {
        throw new Error("Generated tags array is empty");
      }

      // Validate tags are non-empty strings
      const hasEmptyTag = metadata.tags.some((tag) => !tag || tag.trim() === "");
      if (hasEmptyTag) {
        throw new Error("Generated tags contain empty values");
      }

      logger.info("Metadata generation successful", {
        attempt,
        titleLength: metadata.title.length,
        descriptionLength: metadata.description.length,
        tagCount: metadata.tags.length,
      });

      // Track successful API call
      await trackAPIUsage("openai_metadata", true, durationMs);

      return metadata;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(`Metadata generation attempt ${attempt} failed`, {
        error: lastError.message,
        attempt,
        maxAttempts,
      });

      // Track failed API call
      await trackAPIUsage("openai_metadata", false, durationMs);

      // If this is not the last attempt, wait before retrying
      if (attempt < maxAttempts) {
        const delayMs = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s, 4s
        logger.info(`Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // All attempts failed
  logger.error("Metadata generation failed after all retries", {
    attempts: maxAttempts,
    lastError: lastError?.message,
  });

  throw new Error(
    `Metadata generation failed after ${maxAttempts} attempts: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Single attempt to generate metadata using OpenAI API
 * @param prompt - Original video prompt
 * @returns Generated metadata
 * @throws Error if API call fails or response is invalid
 */
async function attemptMetadataGeneration(prompt: string): Promise<VideoMetadata> {
  const config = getConfig();

  // Construct system prompt for metadata generation
  const systemPrompt = `You are a YouTube metadata expert. Given a video prompt, generate optimized YouTube metadata.
Your response must be valid JSON with this exact structure:
{
  "title": "An engaging, SEO-optimized title (max 100 characters)",
  "description": "A detailed, informative description (200-500 words) that includes relevant keywords",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Requirements:
- Title must be catchy, clear, and under 100 characters
- Description must be detailed and include relevant keywords naturally
- Provide 5-10 relevant tags for discoverability
- All fields must be non-empty
- Tags should be single words or short phrases`;

  const userPrompt = `Generate YouTube metadata for a video with this prompt: "${prompt}"`;

  try {
    // Call OpenAI Chat Completions API
    const response = await axios.post<OpenAIResponse>(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {role: "system", content: systemPrompt},
          {role: "user", content: userPrompt},
        ],
        temperature: 0.7,
        response_format: {type: "json_object"},
      },
      {
        headers: {
          "Authorization": `Bearer ${config.openaiApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      }
    );

    // Validate response structure
    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI API: missing content");
    }

    // Parse JSON response
    const content = response.data.choices[0].message.content;
    const metadata = JSON.parse(content) as VideoMetadata;

    // Validate structure
    if (typeof metadata.title !== "string") {
      throw new Error("Invalid metadata: title must be a string");
    }
    if (typeof metadata.description !== "string") {
      throw new Error("Invalid metadata: description must be a string");
    }
    if (!Array.isArray(metadata.tags)) {
      throw new Error("Invalid metadata: tags must be an array");
    }

    return metadata;
  } catch (error) {
    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || error.message;
        throw new Error(`OpenAI API error (${status}): ${message}`);
      } else if (error.request) {
        throw new Error("OpenAI API request timeout or network error");
      }
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse OpenAI response as JSON: ${error.message}`);
    }

    // Re-throw other errors
    throw error;
  }
}
