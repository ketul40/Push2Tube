import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import Navigation from '@/components/Navigation';
import YouTubeConnectionComponent from '@/components/YouTubeConnectionComponent';
import PromptSubmissionComponent from '@/components/PromptSubmissionComponent';
import JobMonitorComponent from '@/components/JobMonitorComponent';
import MetricsDashboard from '@/components/MetricsDashboard';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import { onAuthStateChanged } from '@/services/authService';
import { getJobsByUserId } from '@/services/videoJobService';
import { createOrUpdateUser } from '@/services/userService';
import { JobStatus } from '@/types';
import { trackPageLoad } from '@/utils/performanceMonitoring';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { TEST_MODE, MOCK_USER } from '@/config/testMode';
import { isGuestMode } from '@/services/authService';

/**
 * Dashboard Page
 * Main interface for video generation with responsive grid layout
 * Combines prompt submission, job monitoring, and YouTube connection
 * Requirements: 3.1, 6.5, 7.1
 */
const Dashboard: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<FirebaseUser | null>(TEST_MODE ? MOCK_USER as FirebaseUser : null);
  const [loading, setLoading] = useState(!TEST_MODE);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0
  });

  useEffect(() => {
    // Track page load performance
    trackPageLoad('dashboard');
    
    // In test mode, skip auth check
    if (TEST_MODE) {
      setLoading(false);
      return;
    }

    // Check if guest mode is enabled
    if (isGuestMode()) {
      setLoading(false);
      // Create a guest user object for UI consistency
      setUser({
        uid: 'guest-user',
        email: 'guest@push2tube.com',
        displayName: 'Guest User',
      } as FirebaseUser);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        // Create or update user document in Firestore
        try {
          await createOrUpdateUser(
            currentUser.uid,
            currentUser.email || '',
            currentUser.displayName || 'User'
          );
          console.log('✅ User document created/updated in Firestore');
        } catch (error) {
          console.error('Error creating/updating user document:', error);
          // Don't block the UI if this fails
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle job selection from history page
  useEffect(() => {
    const state = location.state as { selectedJobId?: string } | null;
    if (state?.selectedJobId) {
      setCurrentJobId(state.selectedJobId);
    }
  }, [location]);

  // Load user stats
  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        const jobs = await getJobsByUserId(user.uid);
        const completed = jobs.filter(job => job.status === JobStatus.COMPLETED).length;
        const failed = jobs.filter(job => job.status === JobStatus.FAILED).length;
        
        setStats({
          total: jobs.length,
          completed,
          failed
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, [user]);

  const handleJobCreated = (jobId: string) => {
    setCurrentJobId(jobId);
    // Refresh stats
    if (user) {
      setStats(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
          <Loader2 className="w-12 h-12 animate-spin text-neon-green" />
        </div>
      </div>
    );
  }

  if (!user && !isGuestMode()) {
    return null; // ProtectedRoute will handle redirect
  }

  // At this point, user must be set (either authenticated or guest mode)
  // Create a guaranteed non-null user object for components
  const currentUser = user || ({
    uid: 'guest-user',
    email: 'guest@push2tube.com',
    displayName: 'Guest User',
  } as FirebaseUser);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl"></div>
      
      <Navigation />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 lg:py-8 space-y-6 lg:space-y-8 animate-fade-in">
          {/* Header with Stats */}
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                <span className="text-glow-green">Dashboard</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Create short viral videos and upload them as YouTube Shorts automatically
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="glass border-white/10 hover:border-neon-green/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Jobs</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-neon-cyan/10">
                      <TrendingUp className="w-6 h-6 text-neon-cyan" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 hover:border-neon-green/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">Completed</p>
                      <p className="text-3xl font-bold text-neon-green mt-1">{stats.completed}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-neon-green/10">
                      <CheckCircle2 className="w-6 h-6 text-neon-green" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 hover:border-red-500/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">Failed</p>
                      <p className="text-3xl font-bold text-red-400 mt-1">{stats.failed}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-400/10">
                      <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Main Actions */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <YouTubeConnectionComponent user={currentUser} />
              <PromptSubmissionComponent user={currentUser} onJobCreated={handleJobCreated} />
              <JobMonitorComponent jobId={currentJobId} />
            </div>

            {/* Right Column - Analytics */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-20 space-y-6">
                <SubscriptionStatus />
                <MetricsDashboard user={currentUser} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
