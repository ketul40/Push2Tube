import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import Navigation from '@/components/Navigation';
import JobHistoryComponent from '@/components/JobHistoryComponent';
import { onAuthStateChanged } from '@/services/authService';
import { trackPageLoad } from '@/utils/performanceMonitoring';
import { Loader2 } from 'lucide-react';
import { TEST_MODE, MOCK_USER } from '@/config/testMode';

/**
 * History Page
 * Displays user's video generation history with card-based layout
 * Requirements: 7.1
 */
const History: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<FirebaseUser | null>(TEST_MODE ? MOCK_USER as FirebaseUser : null);
  const [loading, setLoading] = useState(!TEST_MODE);

  useEffect(() => {
    // Track page load performance
    trackPageLoad('history');
    
    // In test mode, skip auth check
    if (TEST_MODE) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleJobSelect = (jobId: string) => {
    // Navigate to dashboard with selected job
    navigate('/dashboard', { state: { selectedJobId: jobId } });
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

  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl"></div>
      
      <Navigation />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              <span className="text-glow-cyan">History</span>
            </h1>
            <p className="text-muted-foreground">
              View and manage your video generation history
            </p>
          </div>

          {/* Job History Component */}
          <JobHistoryComponent user={user} onJobSelect={handleJobSelect} />
        </div>
      </div>
    </div>
  );
};

export default History;
