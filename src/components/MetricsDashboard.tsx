import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  calculateJobSuccessRate,
  calculateAverageProcessingTime,
  getAPIUsageStats,
} from '@/utils/metricsTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  Activity, 
  Target,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface MetricsDashboardProps {
  user: FirebaseUser;
}

/**
 * MetricsDashboard Component
 * Displays custom metrics including job success rate, processing time, and API usage
 * Requirements: Task 16.2 - Track job success rate, average processing time, API usage
 */
const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ user }) => {
  const [successRate, setSuccessRate] = useState<number>(0);
  const [avgProcessingTime, setAvgProcessingTime] = useState<number>(0);
  const [apiStats, setApiStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('7'); // Default 7 days

  useEffect(() => {
    loadMetrics();
  }, [user, timeRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange);
      const [rate, avgTime, stats] = await Promise.all([
        calculateJobSuccessRate(user.uid, days),
        calculateAverageProcessingTime(user.uid, days),
        getAPIUsageStats(days, user.uid), // Pass userId for user-specific API stats
      ]);

      setSuccessRate(rate);
      setAvgProcessingTime(avgTime);
      setApiStats(stats);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number): string => {
    if (ms === 0) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const metrics = [
    {
      title: 'Job Success Rate',
      value: `${successRate.toFixed(1)}%`,
      description: 'Completed successfully',
      icon: Target,
      color: 'text-neon-green',
      bgColor: 'bg-neon-green/10',
      borderColor: 'border-neon-green/30',
    },
    {
      title: 'Avg Processing Time',
      value: formatTime(avgProcessingTime),
      description: 'From start to completion',
      icon: Clock,
      color: 'text-neon-cyan',
      bgColor: 'bg-neon-cyan/10',
      borderColor: 'border-neon-cyan/30',
    },
    {
      title: 'API Calls',
      value: apiStats.totalCalls.toString(),
      description: `${apiStats.successfulCalls} success, ${apiStats.failedCalls} failed`,
      icon: Activity,
      color: 'text-neon-purple',
      bgColor: 'bg-neon-purple/10',
      borderColor: 'border-neon-purple/30',
    },
    {
      title: 'API Success Rate',
      value: `${apiStats.successRate.toFixed(1)}%`,
      description: 'Successful API responses',
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30',
    },
  ];

  if (loading) {
    return (
      <Card className="glass border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Analytics</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Performance metrics and insights
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-neon-green" />
        </CardContent>
      </Card>
    );
  }

  // Check if we have any data to show
  const hasData = successRate > 0 || avgProcessingTime > 0 || apiStats.totalCalls > 0;

  return (
    <Card className="glass border-white/10 hover:border-neon-green/20 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Analytics</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Performance metrics and insights
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px] h-8 bg-white/5 border-white/10 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] border-white/20">
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData && !loading ? (
          <div className="py-8 text-center">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              No metrics available yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Metrics will appear after you create videos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              const isEmpty = metric.value === '0' || metric.value === 'N/A' || metric.value === '0.0%';
              
              return (
                <div
                  key={metric.title}
                  className={`relative p-3 rounded-lg border transition-all duration-300 ${
                    isEmpty 
                      ? 'border-white/5 bg-white/2' 
                      : `${metric.borderColor} bg-white/5 hover:bg-white/10`
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-1.5 rounded-md ${metric.bgColor} ${isEmpty ? 'opacity-50' : ''}`}>
                      <Icon className={`w-4 h-4 ${metric.color}`} />
                    </div>
                    {metric.title === 'Job Success Rate' && successRate >= 90 && successRate > 0 && (
                      <Badge className="bg-neon-green/20 text-neon-green border-0 text-[10px] px-1.5 py-0 h-4">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                        Excellent
                      </Badge>
                    )}
                    {metric.title === 'Job Success Rate' && successRate < 70 && successRate > 0 && (
                      <Badge className="bg-red-400/20 text-red-400 border-0 text-[10px] px-1.5 py-0 h-4">
                        <XCircle className="w-2.5 h-2.5 mr-0.5" />
                        Low
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className={`text-lg font-bold ${metric.color} ${isEmpty ? 'opacity-50' : ''}`}>
                      {metric.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">
                      {metric.title}
                    </p>
                  </div>

                  {/* Progress bar for rates */}
                  {(metric.title.includes('Rate') || metric.title.includes('Success')) && !isEmpty && (
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full ${metric.bgColor} transition-all duration-1000 rounded-full`}
                        style={{
                          width: `${Math.min(parseFloat(metric.value) || 0, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsDashboard;
