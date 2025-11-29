import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Video, Zap, Upload, Shield, ArrowRight, Play } from 'lucide-react';
import { onAuthStateChanged, isGuestMode } from '@/services/authService';

/**
 * Home Page
 * Beautiful landing page with feature highlights and authentication options
 * Allows users to sign in or try as guest
 */
const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if already in guest mode or authenticated
    if (isGuestMode()) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const unsubscribe = onAuthStateChanged((currentUser) => {
      if (currentUser) {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleTryAsGuest = () => {
    // Store guest mode flag in localStorage
    localStorage.setItem('guestMode', 'true');
    navigate('/dashboard');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Create engaging videos from simple text prompts using advanced AI technology',
      color: 'text-neon-green'
    },
    {
      icon: Video,
      title: 'Viral Short Clips',
      description: 'Create engaging short-form videos optimized for YouTube Shorts that capture attention',
      color: 'text-neon-cyan'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience rapid video generation with our optimized processing pipeline',
      color: 'text-yellow-400'
    },
    {
      icon: Upload,
      title: 'Auto Upload',
      description: 'Seamlessly upload your videos directly to YouTube with one click',
      color: 'text-neon-purple'
    },
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

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-between max-w-[1200px] lg:max-w-[1400px] xl:max-w-[1600px] 1440p:max-w-[1800px] mx-auto">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-green blur-2xl opacity-50"></div>
                <h1 className="relative text-xl sm:text-2xl lg:text-3xl font-bold whitespace-nowrap">
                  <span className="text-neon-green text-glow-green">PUSH</span>
                  <span className="text-neon-cyan text-glow-cyan">2</span>
                  <span className="text-white">TUBE</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <Button
                onClick={handleTryAsGuest}
                variant="outline"
                className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hidden sm:flex text-sm lg:text-base px-3 lg:px-4"
              >
                Try as Guest
              </Button>
              <Button
                onClick={handleSignIn}
                className="bg-neon-green hover:bg-neon-green/80 text-black font-semibold text-sm sm:text-base px-4 lg:px-6"
              >
                Sign In
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12 lg:py-16 xl:py-20 1440p:py-24">
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 1440p:max-w-7xl mx-auto text-center space-y-6 sm:space-y-8 lg:space-y-10 xl:space-y-12 animate-fade-in">
            {/* Main Heading */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="inline-flex items-center justify-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-2 sm:mb-4">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-neon-green" />
                <span className="text-xs sm:text-sm lg:text-base text-neon-green font-medium">AI-Powered Short Video Creation</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 1440p:text-8xl font-bold leading-tight mx-auto px-2 sm:px-4">
                <span className="text-white block">Transform Your Ideas Into</span>
                <span className="text-glow-green text-neon-green block">Viral YouTube Shorts</span>
                <span className="text-white block">Instantly</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl 1440p:text-3xl text-gray-300 max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                Create short viral videos from simple text prompts and automatically upload them as YouTube Shorts. 
                No video editing skills required.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 pt-4 sm:pt-6 lg:pt-8">
              <Button
                onClick={handleTryAsGuest}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-neon-green to-neon-cyan hover:from-neon-green/90 hover:to-neon-cyan/90 text-black font-bold text-base sm:text-lg lg:text-xl px-6 sm:px-8 lg:px-10 xl:px-12 py-4 sm:py-5 lg:py-6 xl:py-7 h-auto glow-green transition-all duration-300 hover:scale-105"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                Try Free Now
              </Button>
              <Button
                onClick={handleSignIn}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-white/20 hover:border-neon-cyan/50 text-white hover:text-neon-cyan font-semibold text-base sm:text-lg lg:text-xl px-6 sm:px-8 lg:px-10 xl:px-12 py-4 sm:py-5 lg:py-6 xl:py-7 h-auto transition-all duration-300 hover:scale-105"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                Sign In with Google
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 pt-6 sm:pt-8 lg:pt-10 text-xs sm:text-sm lg:text-base text-gray-400 px-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-neon-green" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-neon-cyan" />
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-neon-purple" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12 sm:py-16 lg:py-20 xl:py-24 1440p:py-32">
          <div className="max-w-6xl lg:max-w-7xl xl:max-w-8xl 1440p:max-w-[1800px] mx-auto">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16 xl:mb-20 space-y-3 sm:space-y-4 lg:space-y-6 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 1440p:text-7xl font-bold text-white">
                Everything You Need to{' '}
                <span className="text-glow-cyan text-neon-cyan">Create & Share</span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl 1440p:text-2xl text-gray-400 max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
                Powerful features designed to make video creation effortless and enjoyable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 px-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="glass border-white/10 hover:border-neon-green/30 transition-all duration-300 hover:scale-105 group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg bg-neon-green/10 ${feature.color} group-hover:bg-neon-green/20 transition-colors`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-300 text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12 sm:py-16 lg:py-20 xl:py-24 1440p:py-32">
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl 1440p:max-w-7xl mx-auto px-4">
            <Card className="glass-strong border-neon-green/30 glow-green text-center p-4 sm:p-6 lg:p-8 xl:p-10">
              <CardHeader className="space-y-3 sm:space-y-4 lg:space-y-6">
                <CardTitle className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 1440p:text-6xl font-bold text-white">
                  Ready to Get Started?
                </CardTitle>
                <CardDescription className="text-sm sm:text-base lg:text-lg xl:text-xl 1440p:text-2xl text-gray-300">
                  Join thousands of creators who are already using Push2Tube to create amazing videos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 lg:pt-8">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6">
                  <Button
                    onClick={handleTryAsGuest}
                    size="lg"
                    className="w-full sm:w-auto bg-neon-green hover:bg-neon-green/80 text-black font-bold text-base sm:text-lg lg:text-xl px-6 sm:px-8 lg:px-10 xl:px-12 py-4 sm:py-5 lg:py-6 xl:py-7 h-auto"
                  >
                    Start Creating Now
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2" />
                  </Button>
                  <Button
                    onClick={handleSignIn}
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 font-semibold text-base sm:text-lg lg:text-xl px-6 sm:px-8 lg:px-10 xl:px-12 py-4 sm:py-5 lg:py-6 xl:py-7 h-auto"
                  >
                    Sign In with Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-10 border-t border-white/10">
          <div className="max-w-[1200px] lg:max-w-[1400px] xl:max-w-[1600px] 1440p:max-w-[1800px] mx-auto text-center text-xs sm:text-sm lg:text-base text-gray-500">
            <p>© {new Date().getFullYear()} Push2Tube. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;

