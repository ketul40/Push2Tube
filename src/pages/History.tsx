import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import Navigation from '../components/Navigation';
import JobHistoryComponent from '../components/JobHistoryComponent';
import { onAuthStateChanged } from '../services/authService';
import { trackPageLoad } from '../utils/performanceMonitoring';
import './History.css';

/**
 * History Page
 * Displays user's video generation history
 * Requirements: 7.1
 */
const History: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track page load performance
    trackPageLoad('history');
    
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
      <div className="history-page">
        <Navigation />
        <div className="page-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }

  return (
    <div className="history-page">
      <Navigation />
      <div className="page-content">
        <JobHistoryComponent user={user} onJobSelect={handleJobSelect} />
      </div>
    </div>
  );
};

export default History;
