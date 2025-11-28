import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithGoogle, signOut, onAuthStateChanged, getCurrentUser } from './authService';
import * as firebaseAuth from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  setPersistence: vi.fn(),
  browserLocalPersistence: {},
}));

vi.mock('../config/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('should call Firebase signInWithPopup with Google provider', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue();
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValue({
        user: mockUser,
      } as any);

      const result = await signInWithGoogle();

      expect(firebaseAuth.setPersistence).toHaveBeenCalled();
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw error when sign in fails', async () => {
      const error = new Error('Sign in failed');
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue();
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValue(error);

      await expect(signInWithGoogle()).rejects.toThrow('Sign in failed');
    });
  });

  describe('signOut', () => {
    it('should call Firebase signOut', async () => {
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      await signOut();

      expect(firebaseAuth.signOut).toHaveBeenCalled();
    });

    it('should throw error when sign out fails', async () => {
      const error = new Error('Sign out failed');
      vi.mocked(firebaseAuth.signOut).mockRejectedValue(error);

      await expect(signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('onAuthStateChanged', () => {
    it('should call Firebase onAuthStateChanged with callback', () => {
      const mockUnsubscribe = vi.fn();
      const mockCallback = vi.fn();
      vi.mocked(firebaseAuth.onAuthStateChanged).mockReturnValue(mockUnsubscribe);

      const unsubscribe = onAuthStateChanged(mockCallback);

      expect(firebaseAuth.onAuthStateChanged).toHaveBeenCalledWith(
        expect.anything(),
        mockCallback
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user from auth', () => {
      const result = getCurrentUser();
      expect(result).toBe(null);
    });
  });
});
