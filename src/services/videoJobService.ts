import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { VideoJob, JobStatus } from '../types';
import { trackAPICall } from '../utils/performanceMonitoring';
import { getUserById } from './userService';

/**
 * Create a new video job in Firestore
 * Requirements: 3.2, 6.1
 */
export async function createVideoJob(
  userId: string,
  prompt: string,
  privacyStatus: string = 'unlisted'
): Promise<string> {
  const tracker = trackAPICall('createVideoJob');
  tracker.start();
  
  try {
    // Validate prompt is non-empty
    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt cannot be empty');
    }

    // Check video quota before creating job
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const remainingQuota = user.videoQuota - user.videosUsedThisMonth;
    if (remainingQuota <= 0) {
      throw new Error(
        `Video quota exceeded. You have used ${user.videosUsedThisMonth}/${user.videoQuota} videos this month. Please upgrade your plan or wait for next month.`
      );
    }

    const jobsCollection = collection(db, 'videoJobs');
    
    const newJob = {
      userId,
      prompt: prompt.trim(),
      status: JobStatus.PENDING,
      privacyStatus,
      retryCount: 0,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(jobsCollection, newJob);
    
    // Update the document with its own ID as jobId
    await updateDoc(docRef, {
      jobId: docRef.id,
    });

    tracker.addAttribute('status', 'success');
    return docRef.id;
  } catch (error) {
    tracker.addAttribute('status', 'error');
    throw error;
  } finally {
    tracker.stop();
  }
}

/**
 * Get all video jobs for a specific user
 * Requirements: 7.1
 */
export async function getJobsByUserId(userId: string): Promise<VideoJob[]> {
  const tracker = trackAPICall('getJobsByUserId');
  tracker.start();
  
  try {
    const jobsCollection = collection(db, 'videoJobs');
    const q = query(
      jobsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const jobs: VideoJob[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        jobId: data.jobId || doc.id,
        userId: data.userId,
        prompt: data.prompt,
        status: data.status as JobStatus,
        privacyStatus: data.privacyStatus,
        videoUrl: data.videoUrl,
        videoDuration: data.videoDuration,
        title: data.title,
        description: data.description,
        tags: data.tags,
        youtubeVideoId: data.youtubeVideoId,
        youtubeUrl: data.youtubeUrl,
        createdAt: data.createdAt?.toDate() || new Date(),
        startedAt: data.startedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        error: data.error,
        retryCount: data.retryCount || 0,
      });
    });

    tracker.addAttribute('status', 'success');
    tracker.addMetric('jobCount', jobs.length);
    return jobs;
  } catch (error) {
    tracker.addAttribute('status', 'error');
    throw error;
  } finally {
    tracker.stop();
  }
}

/**
 * Update the status of a video job
 * Requirements: 6.2, 6.3, 6.4
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  additionalData?: Partial<VideoJob>
): Promise<void> {
  const jobRef = doc(db, 'videoJobs', jobId);
  
  const updateData: any = {
    status,
  };

  // Add timestamps based on status
  if (status === JobStatus.GENERATING_VIDEO && !additionalData?.startedAt) {
    updateData.startedAt = serverTimestamp();
  }
  
  if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
    updateData.completedAt = serverTimestamp();
  }

  // Merge any additional data
  if (additionalData) {
    Object.assign(updateData, additionalData);
  }

  await updateDoc(jobRef, updateData);
}

/**
 * Subscribe to real-time updates for a specific job
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export function subscribeToJob(
  jobId: string,
  callback: (job: VideoJob | null) => void
): Unsubscribe {
  const jobRef = doc(db, 'videoJobs', jobId);

  return onSnapshot(jobRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }

    const data = docSnap.data();
    const job: VideoJob = {
      jobId: data.jobId || docSnap.id,
      userId: data.userId,
      prompt: data.prompt,
      status: data.status as JobStatus,
      privacyStatus: data.privacyStatus,
      videoUrl: data.videoUrl,
      videoDuration: data.videoDuration,
      title: data.title,
      description: data.description,
      tags: data.tags,
      youtubeVideoId: data.youtubeVideoId,
      youtubeUrl: data.youtubeUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
      startedAt: data.startedAt?.toDate(),
      completedAt: data.completedAt?.toDate(),
      error: data.error,
      retryCount: data.retryCount || 0,
    };

    callback(job);
  });
}
