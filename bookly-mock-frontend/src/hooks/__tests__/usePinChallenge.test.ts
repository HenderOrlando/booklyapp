/**
 * Unit tests for usePinChallenge hook (RF-45)
 *
 * Tests:
 * - challenge() opens modal state
 * - handleSubmit() calls AuthClient.verifyPin
 * - Successful PIN verification resolves promise
 * - Failed PIN decrements attemptsLeft
 * - Account locks after max attempts
 * - handleClose() rejects promise with PIN_CANCELLED
 */

import { renderHook, act } from "@testing-library/react";
import { usePinChallenge } from "../usePinChallenge";
import { AuthClient } from "@/infrastructure/api/auth-client";

// Mock AuthClient
jest.mock("@/infrastructure/api/auth-client", () => ({
  AuthClient: {
    verifyPin: jest.fn(),
  },
}));

const mockVerifyPin = AuthClient.verifyPin as jest.Mock;

describe("usePinChallenge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start with modal closed", () => {
    const { result } = renderHook(() => usePinChallenge());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.action).toBeNull();
  });

  it("should open modal when challenge() is called", async () => {
    const { result } = renderHook(() => usePinChallenge());

    act(() => {
      // Don't await - it returns a promise that resolves on PIN submit
      result.current.challenge("delete_resource", "res-123");
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.action).toBe("delete_resource");
    expect(result.current.entityId).toBe("res-123");
    expect(result.current.attemptsLeft).toBe(3);
  });

  it("should resolve promise on successful PIN verification", async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => usePinChallenge({ onSuccess }));

    mockVerifyPin.mockResolvedValueOnce({
      success: true,
      data: {
        authorized: true,
        challengeToken: "token-abc-123",
        expiresIn: 300,
      },
    });

    let challengePromise: Promise<string>;
    act(() => {
      challengePromise = result.current.challenge("delete_user", "user-456");
    });

    await act(async () => {
      await result.current.handleSubmit("123456");
    });

    const token = await challengePromise!;
    expect(token).toBe("token-abc-123");
    expect(onSuccess).toHaveBeenCalledWith(
      "token-abc-123",
      "delete_user",
      "user-456",
    );
    expect(result.current.isOpen).toBe(false);
    expect(mockVerifyPin).toHaveBeenCalledWith("123456", "delete_user", "user-456");
  });

  it("should decrement attemptsLeft on failed PIN", async () => {
    const { result } = renderHook(() => usePinChallenge());

    mockVerifyPin.mockResolvedValueOnce({
      success: false,
      message: "PIN incorrecto",
      data: { authorized: false },
    });

    act(() => {
      result.current.challenge("delete_resource");
    });

    await act(async () => {
      await result.current.handleSubmit("000000");
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.error).toBe("PIN incorrecto");
    expect(result.current.attemptsLeft).toBe(2);
  });

  it("should lock account after max attempts exhausted", async () => {
    const onLocked = jest.fn();
    const { result } = renderHook(() =>
      usePinChallenge({ maxAttempts: 1, onLocked }),
    );

    mockVerifyPin.mockResolvedValueOnce({
      success: false,
      message: "PIN incorrecto",
      data: { authorized: false },
    });

    let challengePromise: Promise<string>;
    act(() => {
      challengePromise = result.current.challenge("delete_role");
    });

    await act(async () => {
      await result.current.handleSubmit("000000");
    });

    expect(onLocked).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);

    await expect(challengePromise!).rejects.toThrow("PIN_LOCKED");
  });

  it("should reject with PIN_CANCELLED when modal is closed", async () => {
    const onCancel = jest.fn();
    const { result } = renderHook(() => usePinChallenge({ onCancel }));

    let challengePromise: Promise<string>;
    act(() => {
      challengePromise = result.current.challenge("change_permissions");
    });

    act(() => {
      result.current.handleClose();
    });

    expect(onCancel).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);

    await expect(challengePromise!).rejects.toThrow("PIN_CANCELLED");
  });

  it("should handle network errors gracefully", async () => {
    const { result } = renderHook(() => usePinChallenge());

    mockVerifyPin.mockRejectedValueOnce(new Error("Network error"));

    act(() => {
      result.current.challenge("delete_resource");
    });

    await act(async () => {
      await result.current.handleSubmit("123456");
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.attemptsLeft).toBe(2);
    expect(result.current.isOpen).toBe(true);
  });
});
