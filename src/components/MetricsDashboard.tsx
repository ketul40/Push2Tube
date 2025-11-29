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
        getAPIUsageStats(days),
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
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Performance metrics and insights</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="glass border-white/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Time Range:</span>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-white/20">
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card
                  key={metric.title}
                  className={`glass border ${metric.borderColor} hover:scale-105 transition-all duration-300 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                        <Icon className={`w-5 h-5 ${metric.color}`} />
                      </div>
                      {metric.title === 'Job Success Rate' && successRate >= 90 && (
                        <Badge className="bg-neon-green/20 text-neon-green border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Excellent
                        </Badge>
                      )}
                      {metric.title === 'Job Success Rate' && successRate < 70 && (
                        <Badge className="bg-red-400/20 text-red-400 border-0">
                          <XCircle className="w-3 h-3 mr-1" />
                          Low
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {metric.title}
                      </p>
                      <p className={`text-3xl font-bold ${metric.color} mt-1`}>
                        {metric.value}
                      </p>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>

                    {/* Progress bar for rates */}
                    {(metric.title.includes('Rate') || metric.title.includes('Success')) && (
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${metric.bgColor} transition-all duration-1000`}
                          style={{
                            width: `${parseFloat(metric.value)}%`,
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsDashboard;
