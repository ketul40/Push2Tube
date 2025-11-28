/**
 * Configuration module for Cloud Functions
 * Loads and validates environment variables
 */

export interface Config {
  // OpenAI
  openaiApiKey: string;
  soraApiEndpoint: string;

  // YouTube
  youtubeClientId: string;
  youtubeClientSecret: string;
  youtubeRedirectUri: string;

  // Application
  maxRetryAttempts: number;
  videoStorageExpiryHours: number;

  // Security
  tokenEncryptionKey: string;
}

/**
 * Load configuration from environment variables
 * @returns Configuration object
 * @throws Error if required environment variables are missing
 */
export function loadConfig(): Config {
  const config: Config = {
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    soraApiEndpoint: process.env.SORA_API_ENDPOINT || "https://api.openai.com/v1/sora/generate",

    youtubeClientId: process.env.YOUTUBE_CLIENT_ID || "",
    youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
    youtubeRedirectUri: process.env.YOUTUBE_REDIRECT_URI || "",

    maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || "3", 10),
    videoStorageExpiryHours: parseInt(process.env.VIDEO_STORAGE_EXPIRY_HOURS || "24", 10),

    tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY || "",
  };

  // Validate required fields
  const requiredFields: (keyof Config)[] = [
    "openaiApiKey",
    "youtubeClientId",
    "youtubeClientSecret",
    "tokenEncryptionKey",
  ];

  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingFields.join(", ")}`
    );
  }

  return config;
}

// Export singleton config instance
let configInstance: Config | null = null;

/**
 * Get the configuration instance
 * @returns Configuration object
 */
export function getConfig(): Config {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}
