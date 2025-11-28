import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  calculateJobSuccessRate,
  calculateAverageProcessingTime,
  getAPIUsageStats,
} from '../utils/metricsTracking';
import './MetricsDashboard.css';

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
  const [timeRange, setTimeRange] = useState<number>(7); // Default 7 days

  useEffect(() => {
    loadMetrics();
  }, [user, timeRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [rate, avgTime, stats] = await Promise.all([
        calculateJobSuccessRate(user.uid, timeRange),
        calculateAverageProcessingTime(user.uid, timeRange),
        getAPIUsageStats(timeRange),
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

  if (loading) {
    return (
      <div className="metrics-dashboard">
        <h2>Analytics</h2>
        <p>Loading metrics...</p>
      </div>
    );
  }

  return (
    <div className="metrics-dashboard">
      <div className="metrics-header">
        <h2>Analytics</h2>
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(Number(e.target.value))}>
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">✓</div>
          <div className="metric-content">
            <div className="metric-label">Job Success Rate</div>
            <div className="metric-value">{successRate.toFixed(1)}%</div>
            <div className="metric-description">
              Percentage of jobs completed successfully
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱</div>
          <div className="metric-content">
            <div className="metric-label">Avg Processing Time</div>
            <div className="metric-value">{formatTime(avgProcessingTime)}</div>
            <div className="metric-description">
              Average time from job creation to completion
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-label">API Calls</div>
            <div className="metric-value">{apiStats.totalCalls}</div>
            <div className="metric-description">
              {apiStats.successfulCalls} successful, {apiStats.failedCalls} failed
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-label">API Success Rate</div>
            <div className="metric-value">{apiStats.successRate.toFixed(1)}%</div>
            <div className="metric-description">
              Percentage of successful API calls
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
