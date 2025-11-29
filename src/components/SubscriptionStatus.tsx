import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Calendar, 
  Video, 
  ExternalLink, 
  Loader2,
  Crown,
  Zap
} from 'lucide-react';
import { getUserSubscription, createPortalSession, getRemainingQuota } from '@/services/subscriptionService';
import { getCurrentUser } from '@/services/authService';
import { User } from '@/types';
import { SubscriptionPlan, SubscriptionStatus } from '@/types/subscription';
import { useNavigate } from 'react-router-dom';

/**
 * Subscription Status Component
 * Displays current subscription plan, usage, and management options
 */
const SubscriptionStatusComponent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<{
    remaining: number;
    used: number;
    quota: number;
    percentageUsed: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const userData = await getUserSubscription(currentUser.uid);
      if (userData) {
        setUser(userData);
        
        const quota = await getRemainingQuota(currentUser.uid);
        const percentageUsed = quota.quota > 0 
          ? Math.round((quota.used / quota.quota) * 100) 
          : 0;
        
        setQuotaStatus({
          remaining: quota.remaining,
          used: quota.used,
          quota: quota.quota,
          percentageUsed,
        });
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const portalUrl = await createPortalSession();
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert(error instanceof Error ? error.message : 'Failed to open customer portal');
      setPortalLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (loading) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-neon-green" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  const planNames: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.FREE]: 'Free',
    [SubscriptionPlan.STARTER]: 'Starter',
    [SubscriptionPlan.PRO]: 'Pro',
    [SubscriptionPlan.ULTRA]: 'Ultra',
  };

  const planColors: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.FREE]: 'text-gray-400',
    [SubscriptionPlan.STARTER]: 'text-neon-green',
    [SubscriptionPlan.PRO]: 'text-neon-cyan',
    [SubscriptionPlan.ULTRA]: 'text-neon-purple',
  };

  const planName = planNames[user.subscriptionPlan] || 'Free';
  const planColor = planColors[user.subscriptionPlan] || 'text-gray-400';
  const isActive = user.subscriptionStatus === SubscriptionStatus.ACTIVE;
  const isPaidPlan = user.subscriptionPlan !== SubscriptionPlan.FREE;

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="glass border-white/10 hover:border-neon-green/30 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
            <Crown className={`w-5 h-5 ${planColor}`} />
            <span>Subscription</span>
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`${
              isActive 
                ? 'border-neon-green/50 text-neon-green bg-neon-green/10' 
                : 'border-gray-500/50 text-gray-400 bg-gray-500/10'
            }`}
          >
            {planName}
          </Badge>
        </div>
        <CardDescription className="text-gray-400">
          Manage your subscription and monitor usage
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Usage Stats */}
        {quotaStatus && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center space-x-2">
                <Video className="w-4 h-4" />
                <span>Video Usage</span>
              </span>
              <span className="text-white font-semibold">
                {quotaStatus.used} / {quotaStatus.quota}
              </span>
            </div>
            
            <Progress 
              value={quotaStatus.percentageUsed} 
              className="h-2"
            />
            
            <div className="flex items-center justify-between text-xs">
              <span className={`${
                quotaStatus.remaining > 0 
                  ? 'text-neon-green' 
                  : 'text-red-400'
              }`}>
                {quotaStatus.remaining} videos remaining
              </span>
              <span className="text-gray-500">
                {quotaStatus.percentageUsed}% used
              </span>
            </div>
          </div>
        )}

        {/* Subscription Details */}
        {isPaidPlan && isActive && user.currentPeriodEnd && (
          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Renews on</span>
              </span>
              <span className="text-white font-semibold">
                {formatDate(user.currentPeriodEnd)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
          {isPaidPlan ? (
            <Button
              variant="outline"
              className="w-full border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Subscription
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-neon-green to-neon-cyan hover:opacity-90 text-black font-bold"
              onClick={handleUpgrade}
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusComponent;

