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
      title: 'Professional Quality',
      description: 'Generate high-quality videos with stunning visuals and smooth animations',
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
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-green/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
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
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-green blur-2xl opacity-50"></div>
                <h1 className="relative text-2xl font-bold">
                  <span className="text-neon-green text-glow-green">PUSH</span>
                  <span className="text-neon-cyan text-glow-cyan">2</span>
                  <span className="text-white">TUBE</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleTryAsGuest}
                variant="outline"
                className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hidden sm:flex"
              >
                Try as Guest
              </Button>
              <Button
                onClick={handleSignIn}
                className="bg-neon-green hover:bg-neon-green/80 text-black font-semibold"
              >
                Sign In
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            {/* Main Heading */}
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-4">
                <Sparkles className="w-4 h-4 text-neon-green" />
                <span className="text-sm text-neon-green font-medium">AI-Powered Video Automation</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">Transform Your Ideas Into</span>
                <br />
                <span className="text-glow-green text-neon-green">Stunning Videos</span>
                <br />
                <span className="text-white">Instantly</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mt-6">
                Create professional-quality videos from simple text prompts and automatically upload them to YouTube. 
                No video editing skills required.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={handleTryAsGuest}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-neon-green to-neon-cyan hover:from-neon-green/90 hover:to-neon-cyan/90 text-black font-bold text-lg px-8 py-6 h-auto glow-green transition-all duration-300 hover:scale-105"
              >
                <Play className="w-5 h-5 mr-2" />
                Try Free Now
              </Button>
              <Button
                onClick={handleSignIn}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-white/20 hover:border-neon-cyan/50 text-white hover:text-neon-cyan font-semibold text-lg px-8 py-6 h-auto transition-all duration-300 hover:scale-105"
              >
                <Shield className="w-5 h-5 mr-2" />
                Sign In with Google
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-gray-400">
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                Everything You Need to
                <span className="text-glow-cyan text-neon-cyan"> Create & Share</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Powerful features designed to make video creation effortless and enjoyable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto">
            <Card className="glass-strong border-neon-green/30 glow-green text-center">
              <CardHeader className="space-y-4">
                <CardTitle className="text-3xl sm:text-4xl font-bold text-white">
                  Ready to Get Started?
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Join thousands of creators who are already using Push2Tube to create amazing videos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={handleTryAsGuest}
                    size="lg"
                    className="w-full sm:w-auto bg-neon-green hover:bg-neon-green/80 text-black font-bold text-lg px-8 py-6 h-auto"
                  >
                    Start Creating Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={handleSignIn}
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 font-semibold text-lg px-8 py-6 h-auto"
                  >
                    Sign In with Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-white/10">
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Push2Tube. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;

