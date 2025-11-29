import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithGoogle, onAuthStateChanged, enableGuestMode } from '@/services/authService';
import { parseFirebaseError } from '@/utils/errorHandler';
import { trackPageLoad } from '@/utils/performanceMonitoring';
import { TEST_MODE } from '@/config/testMode';
import { isGuestMode } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play, Sparkles, Video, Zap, ArrowLeft, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Login Page
 * Beautiful, user-friendly login interface with modern design
 * Redirects to dashboard after successful login
 * Requirements: 1.1, 1.2, 1.4
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    // Track page load performance
    trackPageLoad('login');
    
    // In test mode, automatically redirect to dashboard
    if (TEST_MODE) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Redirect if already in guest mode
    if (isGuestMode()) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    const unsubscribe = onAuthStateChanged((currentUser) => {
      // Redirect to dashboard if already authenticated
      if (currentUser) {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async () => {
    try {
      setSigning(true);
      await signInWithGoogle();
      // Navigation will happen via onAuthStateChanged
    } catch (err) {
      console.error('Sign in error:', err);
      const errorResponse = parseFirebaseError(err);
      toast.error(errorResponse.message);
      setSigning(false);
    }
  };

  const handleTryAsGuest = () => {
    enableGuestMode();
    navigate('/dashboard');
    toast.success('Welcome! You are now in guest mode');
  };

  const features = [
    { icon: Sparkles, text: 'AI-Powered Generation' },
    { icon: Video, text: 'Viral Short Clips' },
    { icon: Zap, text: 'Lightning Fast' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      <div className="absolute top-1/4 -left-20 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 xl:w-[500px] xl:h-[500px] 1440p:w-[600px] 1440p:h-[600px] bg-neon-green/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 xl:w-[500px] xl:h-[500px] 1440p:w-[600px] 1440p:h-[600px] bg-neon-cyan/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[700px] sm:h-[700px] lg:w-[800px] lg:h-[800px] xl:w-[1000px] xl:h-[1000px] 1440p:w-[1200px] 1440p:h-[1200px] bg-neon-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
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

      {/* Navigation Back Button */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-4 sm:pt-6 lg:pt-8 pb-3 sm:pb-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-neon-cyan transition-colors group text-sm sm:text-base lg:text-lg"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-120px)] p-4 sm:p-6 lg:p-8 xl:p-12">
        <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl 1440p:max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 1440p:gap-16 items-center lg:items-start">
          {/* Left Side - Branding & Features */}
          <div className="hidden lg:flex lg:flex-col space-y-6 lg:space-y-8 xl:space-y-10 animate-fade-in lg:sticky lg:top-24">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-2 sm:mb-4">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-neon-green" />
                <span className="text-xs sm:text-sm lg:text-base text-neon-green font-medium">Welcome Back</span>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-neon-green blur-2xl opacity-30"></div>
                <h1 className="relative text-4xl lg:text-5xl xl:text-6xl 1440p:text-7xl font-bold leading-tight">
                  <span className="text-white">Sign in to</span>
                  <br />
                  <span className="text-glow-green text-neon-green">Push2Tube</span>
                </h1>
              </div>
              
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl 1440p:text-3xl text-gray-300 max-w-md lg:max-w-lg xl:max-w-xl">
                Create short viral videos and upload them as YouTube Shorts automatically
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-5 pt-2 sm:pt-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-3 lg:space-x-4 text-gray-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-2 sm:p-2.5 lg:p-3 rounded-lg bg-neon-green/10">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-neon-green" />
                    </div>
                    <span className="text-base sm:text-lg lg:text-xl xl:text-2xl">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8 pt-3 sm:pt-4 text-xs sm:text-sm lg:text-base text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-neon-green" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
                <span>Free to Try</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="w-full max-w-md mx-auto lg:max-w-full animate-fade-in">
            <Card className="glass-strong glow-green border-neon-green/30 p-4 sm:p-6 lg:p-8 xl:p-10">
              <CardHeader className="text-center space-y-3 sm:space-y-4 lg:space-y-6 pb-4 sm:pb-6 lg:pb-8 px-4 sm:px-6 pt-4 sm:pt-6">
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-4 sm:mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-neon-green blur-2xl opacity-50"></div>
                    <CardTitle className="relative text-3xl sm:text-4xl font-bold">
                      <span className="text-neon-green text-glow-green">PUSH</span>
                      <span className="text-neon-cyan text-glow-cyan">2</span>
                      <span className="text-white">TUBE</span>
                    </CardTitle>
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 1440p:text-5xl font-bold text-white">
                    Get Started
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300">
                    Sign in to your account or try as guest
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 sm:space-y-4 lg:space-y-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
                <Button
                  onClick={handleSignIn}
                  disabled={signing}
                  className="w-full h-12 sm:h-14 lg:h-16 xl:h-[72px] bg-white hover:bg-gray-100 text-black font-semibold text-sm sm:text-base lg:text-lg xl:text-xl transition-all duration-300 hover:scale-105 hover:glow-cyan"
                  size="lg"
                >
                  {signing ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                        <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </Button>

                <div className="relative py-3 sm:py-4 lg:py-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10"></span>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm uppercase">
                    <span className="bg-card px-3 sm:px-4 lg:px-6 text-gray-400">Or continue as</span>
                  </div>
                </div>

                <Button
                  onClick={handleTryAsGuest}
                  variant="outline"
                  className="w-full h-12 sm:h-14 lg:h-16 xl:h-[72px] border-2 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan font-semibold text-sm sm:text-base lg:text-lg xl:text-xl transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                  Try as Guest
                </Button>
                
                <div className="text-center pt-4 space-y-2">
                  <p className="text-xs text-gray-400">
                    By signing in, you agree to our{' '}
                    <a href="#" className="text-neon-cyan hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-neon-cyan hover:underline">Privacy Policy</a>
                  </p>
                  <p className="text-xs text-gray-500">
                    Guest mode has limited features
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
