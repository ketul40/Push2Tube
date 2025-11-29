import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { getJobsByUserId } from '@/services/videoJobService';
import { VideoJob, JobStatus } from '@/types';
import { parseFirebaseError } from '@/utils/errorHandler';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Search, 
  Filter, 
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Film,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [filteredJobs, setFilteredJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all jobs for the user (already sorted by createdAt desc)
        const userJobs = await getJobsByUserId(user.uid);
        setJobs(userJobs);
        setFilteredJobs(userJobs);
      } catch (err) {
        console.error('Error fetching job history:', err);
        const errorResponse = parseFirebaseError(err);
        setError(errorResponse.message);
        toast.error(errorResponse.message, {
          action: {
            label: 'Retry',
            onClick: () => fetchJobs(),
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user.uid]);

  // Filter jobs based on search query and status
  useEffect(() => {
    let filtered = jobs;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(job => 
        job.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.jobId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  }, [searchQuery, statusFilter, jobs]);

  // Get status badge styling
  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return { 
          label: 'Pending', 
          icon: Clock,
          className: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' 
        };
      case JobStatus.GENERATING_VIDEO:
        return { 
          label: 'Generating', 
          icon: Film,
          className: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30' 
        };
      case JobStatus.GENERATING_METADATA:
        return { 
          label: 'Metadata', 
          icon: Film,
          className: 'bg-neon-green/10 text-neon-green border-neon-green/30' 
        };
      case JobStatus.UPLOADING_TO_YOUTUBE:
        return { 
          label: 'Uploading', 
          icon: Film,
          className: 'bg-neon-purple/10 text-neon-purple border-neon-purple/30' 
        };
      case JobStatus.COMPLETED:
        return { 
          label: 'Completed', 
          icon: CheckCircle2,
          className: 'bg-neon-green/10 text-neon-green border-neon-green/30' 
        };
      case JobStatus.FAILED:
        return { 
          label: 'Failed', 
          icon: XCircle,
          className: 'bg-red-400/10 text-red-400 border-red-400/30' 
        };
      default:
        return { 
          label: 'Unknown', 
          icon: Clock,
          className: 'bg-gray-400/10 text-gray-400 border-gray-400/30' 
        };
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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle>Job History</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glass border-red-500/20">
        <CardHeader>
          <CardTitle>Job History</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-3 py-6">
          <XCircle className="w-6 h-6 text-red-400" />
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle>Job History</CardTitle>
          <CardDescription>Your video generation history</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="p-4 rounded-full bg-white/5">
            <Film className="w-12 h-12 text-gray-400" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-gray-400 font-medium">No videos yet</p>
            <p className="text-sm text-muted-foreground">
              Submit a prompt on the dashboard to create your first video!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header with Search and Filters */}
      <Card className="glass border-white/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Job History</CardTitle>
              <CardDescription>
                {filteredJobs.length} of {jobs.length} job{jobs.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by prompt, title, or job ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 focus:border-neon-green/50"
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                statusFilter === 'all' 
                  ? 'bg-neon-green/20 text-neon-green border-neon-green/50' 
                  : 'border-white/20 hover:border-white/40'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </Badge>
            {Object.values(JobStatus).map((status) => {
              const badge = getStatusBadge(status);
              const StatusIcon = badge.icon;
              return (
                <Badge
                  key={status}
                  variant="outline"
                  className={`cursor-pointer transition-all ${
                    statusFilter === status ? badge.className : 'border-white/20 hover:border-white/40'
                  }`}
                  onClick={() => setStatusFilter(status)}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {badge.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredJobs.map((job) => {
          const statusBadge = getStatusBadge(job.status);
          const StatusIcon = statusBadge.icon;
          
          return (
            <Card
              key={job.jobId}
              className={`glass border-white/10 hover:border-neon-green/30 transition-all duration-300 ${
                onJobSelect ? 'cursor-pointer hover:scale-[1.02]' : ''
              }`}
              onClick={() => onJobSelect && onJobSelect(job.jobId)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className={statusBadge.className}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusBadge.label}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatRelativeTime(job.createdAt)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-white line-clamp-3 leading-relaxed">
                  {job.prompt}
                </p>
                
                {job.title && (
                  <div className="p-2 rounded bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="text-sm text-white font-medium">{job.title}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-mono">
                    ID: {job.jobId.substring(0, 12)}...
                  </span>
                  <Badge variant="outline" className="text-xs border-white/20">
                    {job.privacyStatus}
                  </Badge>
                </div>

                {/* YouTube Link for Completed Jobs */}
                {job.status === JobStatus.COMPLETED && job.youtubeUrl && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a href={job.youtubeUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on YouTube
                    </a>
                  </Button>
                )}

                {/* Error Message for Failed Jobs */}
                {job.status === JobStatus.FAILED && job.error && (
                  <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/30">
                    <p className="text-xs text-red-400">
                      <strong>Error:</strong> {job.error}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredJobs.length === 0 && jobs.length > 0 && (
        <Card className="glass border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Filter className="w-12 h-12 text-gray-400" />
            <div className="text-center space-y-2">
              <p className="text-gray-400 font-medium">No matching jobs</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobHistoryComponent;
