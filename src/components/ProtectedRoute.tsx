import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, isGuestMode } from '../services/authService';
import { TEST_MODE } from '../config/testMode';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login page if user is not authenticated
 * In test mode, bypasses authentication check
 * Requirements: 1.4
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In test mode, skip auth check
    if (TEST_MODE) {
      setLoading(false);
      return;
    }

    // Check if guest mode is enabled
    if (isGuestMode()) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // In test mode, always allow access
  if (TEST_MODE) {
    return <>{children}</>;
  }

  // Allow access if guest mode is enabled
  if (isGuestMode()) {
    return <>{children}</>;
  }

  if (!user) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
