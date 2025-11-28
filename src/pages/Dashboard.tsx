import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import Navigation from '../components/Navigation';
import YouTubeConnectionComponent from '../components/YouTubeConnectionComponent';
import PromptSubmissionComponent from '../components/PromptSubmissionComponent';
import JobMonitorComponent from '../components/JobMonitorComponent';
import MetricsDashboard from '../components/MetricsDashboard';
import { onAuthStateChanged } from '../services/authService';
import { getJobsByUserId } from '../services/videoJobService';
import { JobStatus } from '../types';
import { trackPageLoad } from '../utils/performanceMonitoring';
import './Dashboard.css';

/**
 * Dashboard Page
 * Main interface for video generation
 * Combines prompt submission, job monitoring, and YouTube connection
 * Requirements: 3.1, 6.5, 7.1
 */
const Dashboard: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0
  });

  useEffect(() => {
    // Track page load performance
    trackPageLoad('dashboard');
    
    const unsubscribe = onAuthStateChanged((currentUser) => {
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
      <div className="dashboard-page">
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
    <div className="dashboard-page">
      <Navigation />
      <div className="page-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Jobs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.failed}</div>
              <div className="stat-label">Failed</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
            <YouTubeConnectionComponent user={user} />
            <PromptSubmissionComponent user={user} onJobCreated={handleJobCreated} />
            <JobMonitorComponent jobId={currentJobId} />
            <MetricsDashboard user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
