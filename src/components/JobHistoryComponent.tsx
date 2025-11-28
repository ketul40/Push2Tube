import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { getJobsByUserId } from '../services/videoJobService';
import { VideoJob, JobStatus } from '../types';
import { showToast } from './ErrorNotification';
import { parseFirebaseError } from '../utils/errorHandler';
import './JobHistoryComponent.css';

interface JobHistoryComponentProps {
  user: FirebaseUser;
  onJobSelect?: (jobId: string) => void;
}

/**
 * JobHistoryComponent
 * Displays user's video generation history
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
const JobHistoryComponent: React.FC<JobHistoryComponentProps> = ({ user, onJobSelect }) => {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all jobs for the user (already sorted by createdAt desc)
        const userJobs = await getJobsByUserId(user.uid);
        setJobs(userJobs);
      } catch (err) {
        console.error('Error fetching job history:', err);
        const errorResponse = parseFirebaseError(err);
        setError(errorResponse.message);
        showToast(errorResponse, () => fetchJobs());
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user.uid]);

  // Get status badge styling
  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return { label: 'Pending', className: 'badge-pending' };
      case JobStatus.GENERATING_VIDEO:
        return { label: 'Generating', className: 'badge-generating' };
      case JobStatus.GENERATING_METADATA:
        return { label: 'Metadata', className: 'badge-metadata' };
      case JobStatus.UPLOADING_TO_YOUTUBE:
        return { label: 'Uploading', className: 'badge-uploading' };
      case JobStatus.COMPLETED:
        return { label: 'Completed', className: 'badge-completed' };
      case JobStatus.FAILED:
        return { label: 'Failed', className: 'badge-failed' };
      default:
        return { label: 'Unknown', className: 'badge-unknown' };
    }
  };

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="job-history-container">
        <h2>Job History</h2>
        <p className="loading-message">Loading your job history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-history-container">
        <h2>Job History</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="job-history-container">
        <h2>Job History</h2>
        <div className="empty-state">
          <p>No jobs yet. Submit a prompt to create your first video!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-history-container">
      <h2>Job History</h2>
      <p className="job-count">{jobs.length} job{jobs.length !== 1 ? 's' : ''} total</p>
      
      <div className="jobs-list">
        {jobs.map((job) => {
          const statusBadge = getStatusBadge(job.status);
          
          return (
            <div 
              key={job.jobId} 
              className={`job-card ${onJobSelect ? 'clickable' : ''}`}
              onClick={() => onJobSelect && onJobSelect(job.jobId)}
            >
              <div className="job-header">
                <span className={`status-badge ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
                <span className="job-timestamp">
                  {formatRelativeTime(job.createdAt)}
                </span>
              </div>
              
              <div className="job-content">
                <p className="job-prompt">{job.prompt}</p>
                
                {job.title && (
                  <p className="job-title">
                    <strong>Title:</strong> {job.title}
                  </p>
                )}
                
                <div className="job-meta">
                  <span className="job-id">ID: {job.jobId.substring(0, 8)}...</span>
                  <span className="job-privacy">{job.privacyStatus}</span>
                </div>
              </div>
              
              {/* Display YouTube link for completed jobs */}
              {job.status === JobStatus.COMPLETED && job.youtubeUrl && (
                <div className="job-footer">
                  <a 
                    href={job.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="youtube-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    🎥 View on YouTube
                  </a>
                </div>
              )}
              
              {/* Display error message for failed jobs */}
              {job.status === JobStatus.FAILED && job.error && (
                <div className="job-footer error-footer">
                  <p className="error-text">
                    <strong>Error:</strong> {job.error}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobHistoryComponent;
