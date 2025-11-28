/**
 * YouTube connection service
 * Handles YouTube OAuth connection and status
 * Requirements: 2.1, 2.3
 */

import { getCurrentUser } from './authService';

const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || 'http://localhost:5001/push2tube-dev/us-central1';

/**
 * Get YouTube OAuth authorization URL
 * Requirements: 2.1
 */
export async function getYouTubeAuthUrl(): Promise<string> {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const idToken = await user.getIdToken();

  const response = await fetch(`${FUNCTIONS_BASE_URL}/getYouTubeAuthUrl`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get YouTube authorization URL');
  }

  const data = await response.json();
  return data.authUrl;
}

/**
 * Initiate YouTube OAuth connection
 * Opens authorization URL in new window
 * Requirements: 2.1
 */
export async function connectYouTube(): Promise<void> {
  try {
    const authUrl = await getYouTubeAuthUrl();
    
    // Open OAuth flow in same window
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error connecting YouTube:', error);
    throw error;
  }
}

