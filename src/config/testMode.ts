/**
 * Test Mode Configuration
 * Allows bypassing authentication for testing purposes
 */

// Check if test mode is enabled via environment variable
export const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';

// Mock user object for test mode
export const MOCK_USER = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-id-token',
  getIdTokenResult: async () => ({
    token: 'mock-id-token',
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: 'test',
    signInSecondFactor: null,
    authTime: new Date().toISOString(),
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
} as any;

