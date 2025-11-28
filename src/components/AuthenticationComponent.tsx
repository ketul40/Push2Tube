import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { signInWithGoogle, signOut, onAuthStateChanged } from '../services/authService';
import { ErrorModal } from './ErrorNotification';
import { parseFirebaseError } from '../utils/errorHandler';
import { ErrorResponse } from '../types';
import './AuthenticationComponent.css';

/**
 * AuthenticationComponent
 * Handles user authentication with Google sign-in
 * Displays login UI when not authenticated, user profile when authenticated
 */
const AuthenticationComponent: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [criticalError, setCriticalError] = useState<ErrorResponse | null>(null);

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
      setError(null);
      setCriticalError(null);
      setLoading(true);
      await signInWithGoogle();
      // User state will be updated by onAuthStateChanged listener
    } catch (err) {
      console.error('Sign in error:', err);
      const errorResponse = parseFirebaseError(err);
      setError(errorResponse.message);
      setCriticalError(errorResponse);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      setCriticalError(null);
      await signOut();
      // User state will be updated by onAuthStateChanged listener
    } catch (err) {
      console.error('Sign out error:', err);
      const errorResponse = parseFirebaseError(err);
      setError(errorResponse.message);
      setCriticalError(errorResponse);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Login UI
    return (
      <div className="auth-container">
        <div className="login-card">
          <h2>Welcome to Push2Tube</h2>
          <p>Sign in to start generating AI videos</p>
          <button 
            onClick={handleSignIn}
            className="google-signin-button"
            aria-label="Sign in with Google"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    );
  }

  // User profile display when authenticated
  return (
    <div className="auth-container">
      <ErrorModal 
        error={criticalError} 
        onRetry={handleSignIn}
        onDismiss={() => setCriticalError(null)}
      />
      <div className="user-profile">
        {user.photoURL && (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'User'} 
            className="user-avatar"
          />
        )}
        <div className="user-info">
          <p className="user-name">{user.displayName}</p>
          <p className="user-email">{user.email}</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="signout-button"
          aria-label="Sign out"
        >
          Sign Out
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AuthenticationComponent;
