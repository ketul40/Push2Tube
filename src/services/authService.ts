import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Authentication service for Push2Tube
 * Handles Google sign-in, sign-out, and authentication state management
 */

const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google using Firebase Authentication
 * Configures persistence to maintain session across browser restarts
 * @returns Promise resolving to the authenticated Firebase user
 */
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  try {
    // Set persistence to local storage for session management
    await setPersistence(auth, browserLocalPersistence);
    
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns Promise that resolves when sign-out is complete
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Listen for authentication state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function to stop listening
 */
export const onAuthStateChanged = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * Get the current authenticated user
 * @returns The current Firebase user or null if not authenticated
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
