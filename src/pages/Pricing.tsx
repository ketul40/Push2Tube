import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Star, ArrowRight, Loader2 } from 'lucide-react';
import { createCheckoutSession, getUserSubscription, getRemainingQuota } from '@/services/subscriptionService';
import { getCurrentUser } from '@/services/authService';
import { SubscriptionPlan, SubscriptionStatus } from '@/types/subscription';
import { User } from '@/types';

/**
 * Pricing Page
 * Displays pricing plans with features and benefits
 * Matches the app's dark theme with neon accents
 */
const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<{ remaining: number; quota: number } | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        try {
          const userData = await getUserSubscription(currentUser.uid);
          if (userData) {
            setUser(userData);
            const quota = await getRemainingQuota(currentUser.uid);
            setQuotaStatus({ remaining: quota.remaining, quota: quota.quota });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, []);

  const handleGetStarted = async (planName: string) => {
    if (planName === 'free') {
      navigate('/login');
      return;
    }

    setLoading(planName);
    try {
      const checkoutUrl = await createCheckoutSession(planName);
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout');
      setLoading(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      planName: SubscriptionPlan.FREE,
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out Push2Tube',
      videosPerMonth: 2,
      quality: 'Standard (720p)',
      features: [
        '2 videos per month',
        'Standard quality (720p)',
        'Auto YouTube upload',
        'Metadata generation',
        'Job history',
        'Community support',
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outline' as const,
      popular: false,
      color: 'text-gray-300',
      borderColor: 'border-white/10',
      glowColor: '',
    },
    {
      name: 'Starter',
      planName: SubscriptionPlan.STARTER,
      price: '$29',
      period: '/month',
      description: 'For creators starting their journey',
      videosPerMonth: 20,
      quality: 'Standard (720p)',
      features: [
        '20 videos per month',
        'Standard quality (720p)',
        'Auto YouTube upload',
        'Metadata generation',
        'Job history',
        'Email support',
      ],
      buttonText: 'Start Starter Plan',
      buttonVariant: 'default' as const,
      popular: true,
      color: 'text-neon-green',
      borderColor: 'border-neon-green/50',
      glowColor: 'glow-green',
      savings: 'Save 70% vs pay-per-use',
    },
    {
      name: 'Pro',
      planName: SubscriptionPlan.PRO,
      price: '$99',
      period: '/month',
      description: 'For serious content creators',
      videosPerMonth: 100,
      quality: 'Standard or Premium',
      features: [
        '100 videos per month',
        'Standard & Premium quality',
        'Priority processing',
        'Auto YouTube upload',
        'Advanced metadata',
        'Priority email support',
      ],
      buttonText: 'Start Pro Plan',
      buttonVariant: 'default' as const,
      popular: false,
      color: 'text-neon-cyan',
      borderColor: 'border-neon-cyan/50',
      glowColor: 'glow-cyan',
      savings: 'Save 75% vs pay-per-use',
    },
    {
      name: 'Ultra',
      planName: SubscriptionPlan.ULTRA,
      price: '$199',
      period: '/month',
      description: 'For agencies and power users',
      videosPerMonth: 250,
      quality: 'All Quality Options',
      features: [
        '250 videos per month',
        'All quality options (720p, 1024p)',
        'Priority processing',
        'Auto YouTube upload',
        'Advanced metadata',
        'Priority support + SLA',
      ],
      buttonText: 'Start Ultra Plan',
      buttonVariant: 'default' as const,
      popular: false,
      color: 'text-neon-purple',
      borderColor: 'border-neon-purple/50',
      glowColor: 'glow-purple',
      savings: 'Save 80% vs pay-per-use',
    },
  ];

  const isCurrentPlan = (planName: SubscriptionPlan) => {
    return user?.subscriptionPlan === planName && 
           user?.subscriptionStatus === SubscriptionStatus.ACTIVE;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/10 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12 lg:py-16 xl:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-4">
              <Sparkles className="w-4 h-4 text-neon-green" />
              <span className="text-sm text-neon-green font-medium">Simple, Transparent Pricing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="text-white">Choose Your</span>
              <br />
              <span className="text-glow-green text-neon-green">Perfect Plan</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto">
              All plans include AI video generation, automatic YouTube upload, and metadata generation.
            </p>

            {user && quotaStatus && (
              <div className="pt-4">
                <p className="text-sm text-gray-400">
                  Current plan: <span className="text-neon-green font-semibold">{user.subscriptionPlan}</span> • 
                  Remaining videos: <span className="text-neon-cyan font-semibold">{quotaStatus.remaining}/{quotaStatus.quota}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-12 lg:pb-16 xl:pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {plans.map((plan, index) => {
                const isCurrent = isCurrentPlan(plan.planName);
                const isLoading = loading === plan.planName.toLowerCase();

                return (
                  <Card
                    key={plan.name}
                    className={`glass ${plan.borderColor} hover:border-opacity-100 transition-all duration-300 relative ${
                      plan.popular ? 'lg:scale-105' : ''
                    } animate-fade-in ${isCurrent ? 'ring-2 ring-neon-green' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-neon-green text-black font-bold px-4 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    {isCurrent && (
                      <div className="absolute -top-4 right-4">
                        <Badge variant="outline" className="border-neon-green/50 text-neon-green bg-neon-green/10">
                          Current Plan
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-2xl font-bold ${plan.color}`}>
                          {plan.name}
                        </CardTitle>
                        {plan.savings && (
                          <Badge variant="outline" className="text-xs border-neon-green/50 text-neon-green">
                            {plan.savings}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline space-x-1">
                          <span className={`text-4xl font-bold ${plan.color} ${plan.glowColor}`}>
                            {plan.price}
                          </span>
                          <span className="text-gray-400 text-sm">{plan.period}</span>
                        </div>
                        <CardDescription className="text-gray-300">
                          {plan.description}
                        </CardDescription>
                      </div>

                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Videos/month:</span>
                          <span className={`font-bold ${plan.color}`}>{plan.videosPerMonth}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Quality:</span>
                          <span className={`font-semibold ${plan.color}`}>{plan.quality}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Per video:</span>
                          <span className={`font-semibold ${plan.color}`}>
                            ${(parseInt(plan.price.replace('$', '')) / plan.videosPerMonth).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <Check className={`w-5 h-5 ${plan.color} flex-shrink-0 mt-0.5`} />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-6">
                      <Button
                        variant={plan.buttonVariant}
                        disabled={isLoading || isCurrent}
                        className={`w-full ${
                          plan.buttonVariant === 'default'
                            ? `bg-gradient-to-r ${
                                plan.name === 'Starter'
                                  ? 'from-neon-green to-neon-cyan'
                                  : plan.name === 'Pro'
                                  ? 'from-neon-cyan to-neon-green'
                                  : 'from-neon-purple to-neon-cyan'
                              } hover:opacity-90 text-black font-bold`
                            : 'border-2 border-white/20 hover:border-neon-green/50 text-white hover:text-neon-green'
                        } transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100`}
                        onClick={() => handleGetStarted(plan.planName)}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : isCurrent ? (
                          'Current Plan'
                        ) : (
                          <>
                            {plan.buttonText}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-12 lg:pb-16 xl:pb-20">
          <div className="max-w-4xl mx-auto">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white text-center mb-2">
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neon-green">
                    What happens if I exceed my monthly limit?
                  </h3>
                  <p className="text-gray-300">
                    Videos beyond your plan limit are prevented. You'll need to upgrade your plan or wait until next month when your quota resets.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neon-cyan">
                    Can I change plans anytime?
                  </h3>
                  <p className="text-gray-300">
                    Yes! You can upgrade or downgrade your plan at any time through the Customer Portal. Changes take effect immediately, and you'll be charged prorated amounts.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neon-purple">
                    Do unused videos roll over?
                  </h3>
                  <p className="text-gray-300">
                    No, video credits reset each month. However, you can always upgrade your plan if you need more videos.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neon-green">
                    What's the difference between quality options?
                  </h3>
                  <p className="text-gray-300">
                    Standard (720p) uses sora-2 model, Premium (720p) uses sora-2-pro for better quality, and Ultra (1024p) uses sora-2-pro at highest resolution for maximum detail.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-12 lg:pb-16 xl:pb-20">
          <div className="max-w-4xl mx-auto">
            <Card className="glass-strong border-neon-green/30 glow-green text-center">
              <CardHeader className="space-y-4">
                <CardTitle className="text-3xl lg:text-4xl font-bold text-white">
                  Ready to Start Creating?
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Join thousands of creators using Push2Tube to create viral YouTube Shorts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-neon-green to-neon-cyan hover:opacity-90 text-black font-bold px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
                    onClick={() => navigate('/login')}
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  {user && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
                      onClick={() => navigate('/dashboard')}
                    >
                      View Dashboard
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

