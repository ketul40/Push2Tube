import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticationComponent from '@/components/AuthenticationComponent';
import { onAuthStateChanged } from '@/services/authService';
import { trackPageLoad } from '@/utils/performanceMonitoring';

/**
 * Login Page
 * Displays authentication interface with futuristic animated background
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
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 grid-bg opacity-30"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-green/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <AuthenticationComponent />
      </div>

      {/* Floating Particles Effect (Optional) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-green/50 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Login;
