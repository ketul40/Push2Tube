# Firestore Indexes

This document describes the Firestore indexes required for Push2Tube and how to deploy them.

## Index Configuration

The `firestore.indexes.json` file defines the following composite indexes:

### 1. User Jobs Query Index
- **Fields**: `userId` (ASC), `createdAt` (DESC)
- **Purpose**: Efficiently fetch all jobs for a specific user, ordered by creation time (newest first)
- **Used by**: `getJobsByUserId()` in `videoJobService.ts`
- **Requirements**: 7.1, 7.4

### 2. Status Query Index
- **Fields**: `status` (ASC), `createdAt` (DESC)
- **Purpose**: Query jobs by status, ordered by creation time
- **Used by**: Admin monitoring, analytics
- **Requirements**: 7.1

### 3. Combined User-Status Query Index
- **Fields**: `userId` (ASC), `status` (ASC), `createdAt` (DESC)
- **Purpose**: Filter user's jobs by status, ordered by creation time
- **Used by**: Future filtering features (e.g., show only completed jobs)
- **Requirements**: 7.1, 7.4

## Deployment

### Option 1: Firebase Console (Manual)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database > Indexes
4. Click "Add Index" and manually create each index from the configuration above

### Option 2: Firebase CLI (Recommended)
1. Install Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```

4. Deploy the indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Option 3: Automatic Creation
When you run a query that requires an index, Firestore will provide an error message with a direct link to create the required index. Click the link to automatically create the index.

## Testing Index Performance

After deploying the indexes, you can test query performance:

1. **Test User Jobs Query**:
   - Log in to the application
   - Navigate to the Job History page
   - Check browser console for query timing
   - Expected: < 100ms for up to 1000 jobs

2. **Monitor in Firebase Console**:
   - Go to Firestore Database > Usage
   - Check "Read operations" metrics
   - Verify queries are using indexes (not full collection scans)

## Index Build Time

- Small collections (< 1000 documents): ~1-5 minutes
- Medium collections (1000-10000 documents): ~5-30 minutes
- Large collections (> 10000 documents): ~30 minutes to several hours

You can monitor index build status in the Firebase Console under Firestore > Indexes.

## Maintenance

Indexes are automatically maintained by Firestore. No manual maintenance is required. However:

- Review index usage periodically in Firebase Console
- Remove unused indexes to reduce storage costs
- Add new indexes as query patterns evolve

## Cost Considerations

- Each index entry counts toward storage quota
- Writes to indexed fields are slightly slower (negligible for most use cases)
- For Push2Tube's expected usage (< 10,000 jobs/month), index costs are minimal

## Troubleshooting

### "Missing Index" Error
If you see an error like "The query requires an index", the error message will include a direct link to create the required index. Click the link or deploy the indexes using the Firebase CLI.

### Slow Queries
If queries are slow even with indexes:
1. Check that indexes are fully built (not in "Building" state)
2. Verify the query is using the correct index (check Firebase Console > Firestore > Usage)
3. Consider pagination for large result sets (> 100 documents)

### Index Build Failures
If index builds fail:
1. Check Firebase Console for error messages
2. Verify you have sufficient permissions
3. Ensure field types match the index configuration
4. Contact Firebase support if issues persist


## Metrics Collection Indexes

### Index 4: User Metrics by Type and Time
- **Collection**: `metrics`
- **Fields**:
  - `userId` (Ascending)
  - `type` (Ascending)
  - `timestamp` (Descending)
- **Purpose**: Query metrics for a specific user filtered by metric type and ordered by time
- **Used by**: 
  - `calculateJobSuccessRate()` - Get success/failure metrics for a user
  - `calculateAverageProcessingTime()` - Get processing time metrics for a user

### Index 5: Global Metrics by Type and Time
- **Collection**: `metrics`
- **Fields**:
  - `type` (Ascending)
  - `timestamp` (Descending)
- **Purpose**: Query all metrics filtered by type and ordered by time
- **Used by**:
  - `getAPIUsageStats()` - Get API usage statistics across all users
  - `checkErrorRate()` - Monitor system-wide error rates
  - `monitorErrorRate()` Cloud Function - Scheduled error rate monitoring
