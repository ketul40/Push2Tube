import React, { useState, useEffect } from 'react';
import { subscribeToJob } from '@/services/videoJobService';
import { VideoJob, JobStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Clock, 
  Film, 
  FileText, 
  Upload, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

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

  // Get status display information
  const getStatusInfo = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return {
          label: 'Pending',
          description: 'Job is queued for processing',
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/30'
        };
      case JobStatus.GENERATING_VIDEO:
        return {
          label: 'Generating Video',
          description: 'AI is creating your video with Sora',
          icon: Film,
          color: 'text-neon-cyan',
          bgColor: 'bg-neon-cyan/10',
          borderColor: 'border-neon-cyan/30'
        };
      case JobStatus.GENERATING_METADATA:
        return {
          label: 'Generating Metadata',
          description: 'Creating title, description, and tags',
          icon: FileText,
          color: 'text-neon-green',
          bgColor: 'bg-neon-green/10',
          borderColor: 'border-neon-green/30'
        };
      case JobStatus.UPLOADING_TO_YOUTUBE:
        return {
          label: 'Uploading to YouTube',
          description: 'Publishing your video',
          icon: Upload,
          color: 'text-neon-purple',
          bgColor: 'bg-neon-purple/10',
          borderColor: 'border-neon-purple/30'
        };
      case JobStatus.COMPLETED:
        return {
          label: 'Completed',
          description: 'Video successfully published!',
          icon: CheckCircle2,
          color: 'text-neon-green',
          bgColor: 'bg-neon-green/10',
          borderColor: 'border-neon-green/50'
        };
      case JobStatus.FAILED:
        return {
          label: 'Failed',
          description: job?.error || 'An error occurred during processing',
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/30'
        };
      default:
        return {
          label: 'Unknown',
          description: 'Status unknown',
          icon: AlertCircle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/30'
        };
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (status: JobStatus): number => {
    switch (status) {
      case JobStatus.PENDING:
        return 10;
      case JobStatus.GENERATING_VIDEO:
        return 35;
      case JobStatus.GENERATING_METADATA:
        return 65;
      case JobStatus.UPLOADING_TO_YOUTUBE:
        return 85;
      case JobStatus.COMPLETED:
        return 100;
      case JobStatus.FAILED:
        return 0;
      default:
        return 0;
    }
  };

  if (!jobId) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="p-4 rounded-full bg-white/5">
            <Film className="w-12 h-12 text-gray-400" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-gray-400 font-medium">No Active Job</p>
            <p className="text-sm text-muted-foreground">Submit a prompt to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass border-red-500/20">
        <CardContent className="flex items-center space-x-3 py-6">
          <XCircle className="w-6 h-6 text-red-400" />
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(job.status);
  const progress = getProgressPercentage(job.status);
  const StatusIcon = statusInfo.icon;

  const stages = [
    { icon: Clock, label: 'Queue', status: JobStatus.PENDING, progress: 10 },
    { icon: Film, label: 'Generate', status: JobStatus.GENERATING_VIDEO, progress: 35 },
    { icon: FileText, label: 'Metadata', status: JobStatus.GENERATING_METADATA, progress: 65 },
    { icon: Upload, label: 'Upload', status: JobStatus.UPLOADING_TO_YOUTUBE, progress: 85 },
    { icon: CheckCircle2, label: 'Complete', status: JobStatus.COMPLETED, progress: 100 },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className={`glass ${statusInfo.borderColor} border transition-all duration-300`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Current Job Status</CardTitle>
            <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Description */}
          <div className={`p-4 rounded-lg ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
            <p className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.description}
            </p>
          </div>

          {/* Progress Bar */}
          {job.status !== JobStatus.FAILED && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className={statusInfo.color}>{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-white/5"
              />
            </div>
          )}

          {/* Pipeline Stages */}
          <div className="grid grid-cols-5 gap-2">
            {stages.map((stage) => {
              const StageIcon = stage.icon;
              const isActive = progress >= stage.progress;
              const isCurrent = job.status === stage.status;
              
              return (
                <div
                  key={stage.status}
                  className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all duration-300 ${
                    isCurrent
                      ? 'bg-neon-green/10 border border-neon-green/30'
                      : isActive
                      ? 'bg-white/5'
                      : 'bg-white/5 opacity-40'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      isCurrent
                        ? 'bg-neon-green/20 text-neon-green animate-pulse'
                        : isActive
                        ? 'bg-neon-cyan/20 text-neon-cyan'
                        : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    <StageIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-medium text-center ${
                      isCurrent ? 'text-neon-green' : isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Job Details */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Job ID:</span>
                <span className="text-sm font-mono text-white">{job.jobId}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm text-white">{job.createdAt.toLocaleString()}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Prompt:</span>
                <p className="text-sm text-white bg-white/5 p-3 rounded-lg border border-white/10">
                  {job.prompt}
                </p>
              </div>
            </div>

            {/* YouTube Link */}
            {job.status === JobStatus.COMPLETED && job.youtubeUrl && (
              <Button
                asChild
                className="w-full bg-gradient-to-r from-neon-green to-neon-cyan hover:opacity-90 text-black font-semibold"
                size="lg"
              >
                <a href={job.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View on YouTube
                </a>
              </Button>
            )}

            {/* Error Details */}
            {job.status === JobStatus.FAILED && job.error && (
              <div className="p-4 rounded-lg bg-red-400/10 border border-red-400/30">
                <p className="text-sm font-medium text-red-400 flex items-start space-x-2">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{job.error}</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobMonitorComponent;
