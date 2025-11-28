import React, { useState, useEffect } from 'react';
import { subscribeToJob } from '../services/videoJobService';
import { VideoJob, JobStatus } from '../types';
import './JobMonitorComponent.css';

interface JobMonitorComponentProps {
  jobId: string | null;
}

/**
 * JobMonitorComponent
 * Displays real-time job status with visual indicators
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
const JobMonitorComponent: React.FC<JobMonitorComponentProps> = ({ jobId }) => {
  const [job, setJob] = useState<VideoJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    // Subscribe to job updates
    const unsubscribe = subscribeToJob(jobId, (updatedJob) => {
      if (updatedJob) {
        setJob(updatedJob);
        setError(null);
      } else {
        setError('Job not found');
      }
    });

    // Cleanup: unsubscribe when component unmounts or jobId changes
    return () => {
      unsubscribe();
    };
  }, [jobId]);

  if (!jobId) {
    return (
      <div className="job-monitor-container">
        <p className="no-job-message">No active job. Submit a prompt to get started!</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-monitor-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-monitor-container">
        <p>Loading job status...</p>
      </div>
    );
  }

  // Get status display information
  const getStatusInfo = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return {
          label: 'Pending',
          description: 'Job is queued for processing',
          icon: '⏳',
          className: 'status-pending'
        };
      case JobStatus.GENERATING_VIDEO:
        return {
          label: 'Generating Video',
          description: 'AI is creating your video with Sora',
          icon: '🎬',
          className: 'status-generating'
        };
      case JobStatus.GENERATING_METADATA:
        return {
          label: 'Generating Metadata',
          description: 'Creating title, description, and tags',
          icon: '📝',
          className: 'status-metadata'
        };
      case JobStatus.UPLOADING_TO_YOUTUBE:
        return {
          label: 'Uploading to YouTube',
          description: 'Publishing your video',
          icon: '📤',
          className: 'status-uploading'
        };
      case JobStatus.COMPLETED:
        return {
          label: 'Completed',
          description: 'Video successfully published!',
          icon: '✅',
          className: 'status-completed'
        };
      case JobStatus.FAILED:
        return {
          label: 'Failed',
          description: job.error || 'An error occurred during processing',
          icon: '❌',
          className: 'status-failed'
        };
      default:
        return {
          label: 'Unknown',
          description: 'Status unknown',
          icon: '❓',
          className: 'status-unknown'
        };
    }
  };

  const statusInfo = getStatusInfo(job.status);

  // Calculate progress percentage
  const getProgressPercentage = (status: JobStatus): number => {
    switch (status) {
      case JobStatus.PENDING:
        return 0;
      case JobStatus.GENERATING_VIDEO:
        return 25;
      case JobStatus.GENERATING_METADATA:
        return 50;
      case JobStatus.UPLOADING_TO_YOUTUBE:
        return 75;
      case JobStatus.COMPLETED:
        return 100;
      case JobStatus.FAILED:
        return 0;
      default:
        return 0;
    }
  };

  const progress = getProgressPercentage(job.status);

  return (
    <div className="job-monitor-container">
      <h2>Current Job Status</h2>
      
      <div className={`status-card ${statusInfo.className}`}>
        <div className="status-header">
          <span className="status-icon">{statusInfo.icon}</span>
          <h3>{statusInfo.label}</h3>
        </div>
        
        <p className="status-description">{statusInfo.description}</p>
        
        {job.status !== JobStatus.FAILED && job.status !== JobStatus.COMPLETED && (
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}
        
        <div className="job-details">
          <p><strong>Job ID:</strong> {job.jobId}</p>
          <p><strong>Prompt:</strong> {job.prompt}</p>
          <p><strong>Created:</strong> {job.createdAt.toLocaleString()}</p>
          
          {job.status === JobStatus.COMPLETED && job.youtubeUrl && (
            <div className="youtube-link">
              <a 
                href={job.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="youtube-button"
              >
                🎥 View on YouTube
              </a>
            </div>
          )}
          
          {job.status === JobStatus.FAILED && job.error && (
            <div className="error-details">
              <p><strong>Error:</strong> {job.error}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Pipeline stages visualization */}
      <div className="pipeline-stages">
        <div className={`stage ${job.status === JobStatus.PENDING || progress >= 0 ? 'active' : ''} ${progress > 0 ? 'completed' : ''}`}>
          <div className="stage-icon">⏳</div>
          <div className="stage-label">Pending</div>
        </div>
        
        <div className={`stage ${job.status === JobStatus.GENERATING_VIDEO || progress >= 25 ? 'active' : ''} ${progress > 25 ? 'completed' : ''}`}>
          <div className="stage-icon">🎬</div>
          <div className="stage-label">Video</div>
        </div>
        
        <div className={`stage ${job.status === JobStatus.GENERATING_METADATA || progress >= 50 ? 'active' : ''} ${progress > 50 ? 'completed' : ''}`}>
          <div className="stage-icon">📝</div>
          <div className="stage-label">Metadata</div>
        </div>
        
        <div className={`stage ${job.status === JobStatus.UPLOADING_TO_YOUTUBE || progress >= 75 ? 'active' : ''} ${progress > 75 ? 'completed' : ''}`}>
          <div className="stage-icon">📤</div>
          <div className="stage-label">Upload</div>
        </div>
        
        <div className={`stage ${job.status === JobStatus.COMPLETED ? 'active completed' : ''}`}>
          <div className="stage-icon">✅</div>
          <div className="stage-label">Done</div>
        </div>
      </div>
    </div>
  );
};

export default JobMonitorComponent;
