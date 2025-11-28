import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { getUserById } from '../services/userService';
import { connectYouTube } from '../services/youtubeService';
import { User } from '../types';
import './YouTubeConnectionComponent.css';

/**
 * YouTubeConnectionComponent
 * Manages YouTube account connection via OAuth
 * Displays connection status and provides connect/disconnect functionality
 * Requirements: 2.1, 2.3
 */

interface YouTubeConnectionComponentProps {
  user: FirebaseUser;
}

const YouTubeConnectionComponent: React.FC<YouTubeConnectionComponentProps> = ({ user }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [user.uid]);

  useEffect(() => {
    // Check for OAuth callback success/failure in URL
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const errorMsg = params.get('error');

    if (success === 'true') {
      setError(null);
      // Reload user data to reflect connection
      loadUserData();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (success === 'false') {
      setError(errorMsg || 'Failed to connect YouTube account');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await getUserById(user.uid);
      setUserData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load YouTube connection status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);
      await connectYouTube();
      // User will be redirected to OAuth flow
    } catch (err) {
      console.error('Error connecting YouTube:', err);
      setError('Failed to initiate YouTube connection. Please try again.');
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="youtube-connection-container">
        <p>Loading YouTube connection status...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="youtube-connection-container">
        <p className="error-message">Failed to load user data</p>
      </div>
    );
  }

  return (
    <div className="youtube-connection-container">
      <h3>YouTube Connection</h3>
      
      {userData.youtubeConnected ? (
        <div className="connection-status connected">
          <div className="status-icon">✓</div>
          <div className="status-info">
            <p className="status-text">Connected</p>
            {userData.youtubeChannelId && (
              <p className="channel-info">Channel ID: {userData.youtubeChannelId}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="connection-status disconnected">
          <div className="status-icon">○</div>
          <div className="status-info">
            <p className="status-text">Not Connected</p>
            <p className="status-description">
              Connect your YouTube account to enable automatic video uploads
            </p>
          </div>
        </div>
      )}

      {!userData.youtubeConnected && (
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="connect-button"
          aria-label="Connect YouTube account"
        >
          {connecting ? 'Connecting...' : 'Connect YouTube'}
        </button>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default YouTubeConnectionComponent;

