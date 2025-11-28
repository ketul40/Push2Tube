/**
 * Tests for authentication middleware
 */

import * as admin from "firebase-admin";
import {verifyIdToken, verifyUserAccess} from "./auth";
import {AuthenticatedRequest} from "../types";

// Mock Firebase Admin
jest.mock("firebase-admin", () => ({
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

describe("Authentication Middleware", () => {
  describe("verifyIdToken", () => {
    it("should verify valid token and return user context", async () => {
      const mockDecodedToken = {
        uid: "user123",
        email: "test@example.com",
      };

      const mockVerifyIdToken = jest.fn().mockResolvedValue(mockDecodedToken);
      (admin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      });

      const result = await verifyIdToken("valid-token");

      expect(result).toEqual({
        userId: "user123",
        email: "test@example.com",
      });
      expect(mockVerifyIdToken).toHaveBeenCalledWith("valid-token");
    });

    it("should throw error for invalid token", async () => {
      const mockVerifyIdToken = jest.fn().mockRejectedValue(
        new Error("Token verification failed")
      );
      (admin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      });

      await expect(verifyIdToken("invalid-token")).rejects.toThrow(
        "Invalid or expired authentication token"
      );
    });

    it("should throw error for expired token", async () => {
      const mockVerifyIdToken = jest.fn().mockRejectedValue(
        new Error("Firebase ID token has expired")
      );
      (admin.auth as jest.Mock).mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      });

      await expect(verifyIdToken("expired-token")).rejects.toThrow(
        "Invalid or expired authentication token"
      );
    });
  });

  describe("verifyUserAccess", () => {
    it("should allow access when user IDs match", () => {
      const authContext: AuthenticatedRequest = {
        userId: "user123",
        email: "test@example.com",
      };

      expect(() => verifyUserAccess(authContext, "user123")).not.toThrow();
    });

    it("should throw error when user IDs don't match", () => {
      const authContext: AuthenticatedRequest = {
        userId: "user123",
        email: "test@example.com",
      };

      expect(() => verifyUserAccess(authContext, "user456")).toThrow(
        "Unauthorized: Cannot access another user's data"
      );
    });

    it("should prevent cross-user data access", () => {
      const authContext: AuthenticatedRequest = {
        userId: "attacker",
      };

      expect(() => verifyUserAccess(authContext, "victim")).toThrow();
    });
  });
});
