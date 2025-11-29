import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { getUserById } from '@/services/userService';
import { connectYouTube } from '@/services/youtubeService';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Youtube, CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
      toast.success('YouTube account connected successfully!');
      // Reload user data to reflect connection
      loadUserData();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (success === 'false') {
      toast.error(errorMsg || 'Failed to connect YouTube account');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await getUserById(user.uid);
      setUserData(data);
    } catch (err) {
      console.error('Error loading user data:', err);
      toast.error('Failed to load YouTube connection status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      await connectYouTube();
      // User will be redirected to OAuth flow
    } catch (err) {
      console.error('Error connecting YouTube:', err);
      toast.error('Failed to initiate YouTube connection. Please try again.');
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card className="glass border-red-500/20">
        <CardContent className="flex items-center space-x-3 py-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">Failed to load user data</p>
        </CardContent>
      </Card>
    );
  }

  const isConnected = userData.youtubeConnected;

  return (
    <Card className={`glass transition-all duration-300 ${isConnected ? 'border-neon-cyan/30 glow-cyan' : 'border-white/10'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isConnected ? 'bg-neon-cyan/10' : 'bg-white/5'}`}>
              <Youtube className={`w-6 h-6 ${isConnected ? 'text-neon-cyan' : 'text-gray-400'}`} />
            </div>
            <div>
              <CardTitle className="text-lg">YouTube Connection</CardTitle>
              <CardDescription>
                {isConnected ? 'Your account is connected' : 'Connect to enable uploads'}
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={isConnected ? 'default' : 'outline'} 
            className={isConnected ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50' : 'border-gray-600 text-gray-400'}
          >
            {isConnected ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <Circle className="w-3 h-3 mr-1" />
            )}
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-neon-cyan mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">YouTube Account Active</p>
                  {userData.youtubeChannelId && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Channel ID: {userData.youtubeChannelId}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Videos will be automatically uploaded to your connected channel
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-gray-300">
                Connect your YouTube account to enable automatic video uploads with optimized metadata.
              </p>
            </div>
            
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-green hover:opacity-90 text-black font-semibold transition-all duration-300 hover:scale-105"
              size="lg"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Youtube className="w-5 h-5 mr-2" />
                  Connect YouTube Account
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YouTubeConnectionComponent;
