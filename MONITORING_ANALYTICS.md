# Monitoring and Analytics Implementation

This document describes the monitoring and analytics features implemented for the Push2Tube platform.

## Overview

The monitoring and analytics system tracks application performance, job success rates, processing times, and API usage to provide insights into system health and user experience.

## Features Implemented

### 1. Firebase Performance Monitoring (Task 16.1)

#### Frontend Performance Tracking
- **Page Load Tracking**: Automatically tracks load times for all pages (Dashboard, History, Login)
- **API Call Tracking**: Monitors duration and success/failure of Firestore operations
- **Custom Operations**: Tracks any custom operations with start/stop timing

#### Implementation Files
- `src/utils/performanceMonitoring.ts` - Performance tracking utilities
- `src/config/firebase.ts` - Firebase Performance SDK initialization
- `src/pages/*.tsx` - Page load tracking integration
- `src/services/videoJobService.ts` - API call tracking

#### Key Functions
- `trackPageLoad(pageName)` - Track page load performance
- `trackAPICall(apiName)` - Track API call duration and status
- `trackCustomOperation(operationName)` - Track custom operations
- `withPerformanceTracking(fn)` - Wrapper for async functions

### 2. Custom Metrics Tracking (Task 16.2)

#### Metrics Collected

**Job Metrics**
- Job success rate (percentage of completed vs failed jobs)
- Job failure rate
- Average processing time (from creation to completion)
- Individual job processing times

**API Metrics**
- Total API calls
- Successful API calls
- Failed API calls
- API success rate
- API call duration

**Error Monitoring**
- Error rate over time windows
- Error count and total job count
- Automatic alerting when error rate exceeds threshold

#### Implementation Files

**Frontend**
- `src/utils/metricsTracking.ts` - Metrics tracking utilities
- `src/components/MetricsDashboard.tsx` - Metrics visualization component
- `src/components/MetricsDashboard.css` - Dashboard styling
- `src/pages/Dashboard.tsx` - Integrated metrics dashboard

**Backend (Cloud Functions)**
- `functions/src/utils/metricsTracking.ts` - Server-side metrics tracking
- `functions/src/helpers/metadataGeneration.ts` - OpenAI API usage tracking
- `functions/src/helpers/youtubeUpload.ts` - YouTube API usage tracking
- `functions/src/helpers/jobProcessing.ts` - Job completion tracking
- `functions/src/index.ts` - Error rate monitoring function

#### Key Functions

**Frontend**
- `trackMetric(type, value, metadata, userId)` - Track custom metric
- `trackJobCompletion(job)` - Track job success/failure
- `trackAPIUsage(apiName, success, duration, userId)` - Track API calls
- `calculateJobSuccessRate(userId, days)` - Calculate success rate
- `calculateAverageProcessingTime(userId, days)` - Calculate avg processing time
- `getAPIUsageStats(days)` - Get API usage statistics
- `checkErrorRate(threshold, windowMinutes)` - Check for error rate spikes

**Backend**
- Same functions as frontend, adapted for Cloud Functions environment
- `monitorErrorRate()` - Scheduled Cloud Function that runs every 15 minutes

### 3. Metrics Dashboard

A visual dashboard component that displays:
- Job success rate with percentage
- Average processing time in human-readable format
- Total API calls with success/failure breakdown
- API success rate percentage
- Time range selector (24 hours, 7 days, 30 days)

### 4. Error Rate Alerting

Automated monitoring system that:
- Runs every 15 minutes via scheduled Cloud Function
- Checks error rate over 15-minute window
- Triggers alerts when error rate exceeds 50% (with minimum 5 jobs)
- Logs detailed error information for investigation
- Ready for integration with external alerting systems (email, Slack, PagerDuty)

## Database Structure

### Metrics Collection

```typescript
{
  type: string,              // MetricType enum value
  value: number,             // Metric value
  metadata: object,          // Additional context
  userId: string | null,     // User ID (null for system-wide metrics)
  timestamp: Timestamp       // When metric was recorded
}
```

### Metric Types
- `job_success` - Successful job completion
- `job_failure` - Failed job
- `processing_time` - Job processing duration in milliseconds
- `api_call` - API call event
- `error_rate` - Error rate calculation

## Firestore Indexes

Added indexes for efficient metrics queries:

1. **User Metrics by Type and Time**
   - Fields: `userId` (ASC), `type` (ASC), `timestamp` (DESC)
   - Purpose: Query user-specific metrics filtered by type

2. **Global Metrics by Type and Time**
   - Fields: `type` (ASC), `timestamp` (DESC)
   - Purpose: Query system-wide metrics filtered by type

## Usage

### Viewing Metrics
1. Navigate to the Dashboard page
2. Scroll to the Analytics section
3. Select desired time range (24 hours, 7 days, or 30 days)
4. View real-time metrics

### Monitoring Alerts
- Error rate alerts are automatically logged in Cloud Functions logs
- Check Firebase Console > Functions > Logs for alert notifications
- Search for "HIGH ERROR RATE DETECTED" in logs

### Extending Metrics
To add new metrics:
1. Add new metric type to `MetricType` enum
2. Call `trackMetric()` with appropriate values
3. Create visualization in `MetricsDashboard` component if needed

## Performance Considerations

- Metrics tracking is non-blocking and won't affect user experience
- Failed metric writes are logged but don't throw errors
- Metrics queries use indexed fields for optimal performance
- Dashboard caches metrics data to reduce Firestore reads

## Future Enhancements

Potential improvements:
- Real-time metrics streaming with WebSockets
- Advanced analytics with charts and graphs
- Export metrics to external analytics platforms
- Custom alert thresholds per user
- Detailed API performance breakdown
- Geographic distribution of users
- Cost tracking and optimization insights
