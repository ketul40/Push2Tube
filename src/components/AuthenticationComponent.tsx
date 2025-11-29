import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { signInWithGoogle, signOut, onAuthStateChanged } from '@/services/authService';
import { parseFirebaseError } from '@/utils/errorHandler';
import { ErrorResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

/**
 * AuthenticationComponent
 * Handles user authentication with Google sign-in
 * Displays login UI when not authenticated, user profile when authenticated
 */
const AuthenticationComponent: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setSigning(true);
      await signInWithGoogle();
      // User state will be updated by onAuthStateChanged listener
    } catch (err) {
      console.error('Sign in error:', err);
      const errorResponse = parseFirebaseError(err);
      toast.error(errorResponse.message);
      setSigning(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      // User state will be updated by onAuthStateChanged listener
    } catch (err) {
      console.error('Sign out error:', err);
      const errorResponse = parseFirebaseError(err);
      toast.error(errorResponse.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
      </div>
    );
  }

  if (!user) {
    // Login UI
    return (
      <div className="flex items-center justify-center min-h-screen p-4 animate-fade-in">
        <Card className="w-full max-w-md glass glow-green border-neon-green/20">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-green blur-2xl opacity-50"></div>
                <CardTitle className="relative text-4xl font-bold">
                  <span className="text-neon-green text-glow-green">PUSH</span>
                  <span className="text-neon-cyan text-glow-cyan">2</span>
                  <span className="text-white">TUBE</span>
                </CardTitle>
              </div>
            </div>
            <CardDescription className="text-lg text-gray-300">
              AI-Powered Video Automation
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Sign in to start generating AI videos and uploading to YouTube
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSignIn}
              disabled={signing}
              className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold transition-all duration-300 hover:scale-105 hover:glow-cyan"
              size="lg"
            >
              {signing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
            
            <div className="text-center text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User profile display when authenticated
  return (
    <Card className="glass border-neon-green/20">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-neon-green/50 blur-md rounded-full"></div>
            <Avatar className="h-16 w-16 border-2 border-neon-green relative">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback className="bg-neon-green/20 text-neon-green font-bold">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white">{user.displayName}</h3>
              <Badge variant="outline" className="border-neon-green text-neon-green">
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthenticationComponent;
