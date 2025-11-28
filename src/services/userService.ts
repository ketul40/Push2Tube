import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '../types';

/**
 * Create or update a user document in Firestore
 * Requirements: 1.3, 2.2, 10.4
 */
export async function createOrUpdateUser(
  uid: string,
  email: string,
  displayName: string
): Promise<User> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  const now = new Date();

  if (userSnap.exists()) {
    // Update existing user
    await updateDoc(userRef, {
      email,
      displayName,
      lastLoginAt: serverTimestamp(),
    });

    const updatedSnap = await getDoc(userRef);
    const data = updatedSnap.data();
    
    return {
      uid: data!.uid,
      email: data!.email,
      displayName: data!.displayName,
      youtubeConnected: data!.youtubeConnected,
      youtubeChannelId: data?.youtubeChannelId,
      oauthRefreshToken: data?.oauthRefreshToken,
      oauthAccessToken: data?.oauthAccessToken,
      oauthExpiresAt: data?.oauthExpiresAt,
      defaultPrivacyStatus: data!.defaultPrivacyStatus,
      createdAt: data!.createdAt.toDate(),
      lastLoginAt: now,
    };
  } else {
    // Create new user
    const newUser = {
      uid,
      email,
      displayName,
      youtubeConnected: false,
      defaultPrivacyStatus: 'unlisted',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(userRef, newUser);

    return {
      uid,
      email,
      displayName,
      youtubeConnected: false,
      defaultPrivacyStatus: 'unlisted',
      createdAt: now,
      lastLoginAt: now,
    };
  }
}

/**
 * Get a user by their UID
 * Requirements: 1.3, 2.2, 10.4
 */
export async function getUserById(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    youtubeConnected: data.youtubeConnected,
    youtubeChannelId: data?.youtubeChannelId,
    oauthRefreshToken: data?.oauthRefreshToken,
    oauthAccessToken: data?.oauthAccessToken,
    oauthExpiresAt: data?.oauthExpiresAt,
    defaultPrivacyStatus: data.defaultPrivacyStatus,
    createdAt: data.createdAt.toDate(),
    lastLoginAt: data.lastLoginAt.toDate(),
  };
}

/**
 * Update user preferences (e.g., default privacy status)
 * Requirements: 10.4
 */
export async function updateUserPreferences(
  uid: string,
  preferences: {
    defaultPrivacyStatus?: string;
    youtubeConnected?: boolean;
    youtubeChannelId?: string;
    oauthRefreshToken?: string;
    oauthAccessToken?: string;
    oauthExpiresAt?: number;
  }
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, preferences);
}
