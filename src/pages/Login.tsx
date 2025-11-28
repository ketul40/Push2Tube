import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticationComponent from '../components/AuthenticationComponent';
import { onAuthStateChanged } from '../services/authService';
import { trackPageLoad } from '../utils/performanceMonitoring';
import './Login.css';

/**
 * Login Page
 * Displays authentication interface
 * Redirects to dashboard after successful login
 * Requirements: 1.1, 1.2, 1.4
 */
const Login: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Track page load performance
    trackPageLoad('login');
    
    const unsubscribe = onAuthStateChanged((currentUser) => {
      // Redirect to dashboard if already authenticated
      if (currentUser) {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="login-page">
      <div className="login-content">
        <AuthenticationComponent />
      </div>
    </div>
  );
};

export default Login;
