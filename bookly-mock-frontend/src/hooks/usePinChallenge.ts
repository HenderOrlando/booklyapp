"use client";

/**
 * usePinChallenge - Hook para verificación PIN en acciones críticas (RF-45)
 *
 * Envuelve acciones destructivas/sensibles con un desafío PIN.
 * El flujo es:
 * 1. Llamar a `challenge(action, entityId?)` para abrir el modal
 * 2. El usuario ingresa su PIN
 * 3. Si es correcto, se ejecuta el callback `onSuccess`
 * 4. Si falla, se muestra error con intentos restantes
 *
 * Acciones críticas definidas:
 * - delete_resource, delete_user, delete_role
 * - change_permissions, revoke_role
 * - batch_approve, batch_reject
 * - change_pin, reset_system_config
 */

import { AuthClient } from "@/infrastructure/api/auth-client";
import * as React from "react";

export type CriticalAction =
  | "delete_resource"
  | "delete_user"
  | "delete_role"
  | "change_permissions"
  | "revoke_role"
  | "batch_approve"
  | "batch_reject"
  | "change_pin"
  | "reset_system_config";

export interface PinChallengeState {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  action: CriticalAction | null;
  entityId: string | undefined;
  attemptsLeft: number;
}

export interface UsePinChallengeOptions {
  maxAttempts?: number;
  onSuccess?: (challengeToken: string, action: CriticalAction, entityId?: string) => void;
  onLocked?: () => void;
  onCancel?: () => void;
}

const MAX_DEFAULT_ATTEMPTS = 3;

export function usePinChallenge(options: UsePinChallengeOptions = {}) {
  const {
    maxAttempts = MAX_DEFAULT_ATTEMPTS,
    onSuccess,
    onLocked,
    onCancel,
  } = options;

  const [state, setState] = React.useState<PinChallengeState>({
    isOpen: false,
    isLoading: false,
    error: null,
    action: null,
    entityId: undefined,
    attemptsLeft: maxAttempts,
  });

  const pendingResolve = React.useRef<
    ((token: string) => void) | null
  >(null);
  const pendingReject = React.useRef<
    ((reason: Error) => void) | null
  >(null);

  const reset = React.useCallback(() => {
    setState({
      isOpen: false,
      isLoading: false,
      error: null,
      action: null,
      entityId: undefined,
      attemptsLeft: maxAttempts,
    });
    pendingResolve.current = null;
    pendingReject.current = null;
  }, [maxAttempts]);

  /**
   * Abre el modal PIN y retorna una Promise que resuelve con el challengeToken
   */
  const challenge = React.useCallback(
    (action: CriticalAction, entityId?: string): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        pendingResolve.current = resolve;
        pendingReject.current = reject;

        setState((prev) => ({
          ...prev,
          isOpen: true,
          isLoading: false,
          error: null,
          action,
          entityId,
          attemptsLeft: maxAttempts,
        }));
      });
    },
    [maxAttempts],
  );

  /**
   * Maneja el envío del PIN desde el modal
   */
  const handleSubmit = React.useCallback(
    async (pin: string) => {
      if (!state.action) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await AuthClient.verifyPin(
          pin,
          state.action,
          state.entityId,
        );

        if (response.success && response.data?.authorized) {
          const token = response.data.challengeToken;

          onSuccess?.(token, state.action, state.entityId);
          pendingResolve.current?.(token);
          reset();
        } else {
          const remaining = state.attemptsLeft - 1;

          if (remaining <= 0) {
            onLocked?.();
            pendingReject.current?.(new Error("PIN_LOCKED"));
            reset();
            return;
          }

          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: response.message || "PIN incorrecto",
            attemptsLeft: remaining,
          }));
        }
      } catch (err: unknown) {
        const remaining = state.attemptsLeft - 1;

        if (remaining <= 0) {
          onLocked?.();
          pendingReject.current?.(new Error("PIN_LOCKED"));
          reset();
          return;
        }

        const message =
          err instanceof Error ? err.message : "Error al verificar PIN";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
          attemptsLeft: remaining,
        }));
      }
    },
    [state.action, state.entityId, state.attemptsLeft, onSuccess, onLocked, reset],
  );

  /**
   * Cierra el modal sin verificar
   */
  const handleClose = React.useCallback(() => {
    onCancel?.();
    pendingReject.current?.(new Error("PIN_CANCELLED"));
    reset();
  }, [onCancel, reset]);

  return {
    ...state,
    challenge,
    handleSubmit,
    handleClose,
  };
}
