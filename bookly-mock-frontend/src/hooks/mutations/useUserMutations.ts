/**
 * useUserMutations - Mutations para Usuarios
 *
 * Dominio: Users (Usuarios y Perfiles)
 *
 * Gestiona operaciones de escritura sobre usuarios
 */

import { useToast } from "@/hooks/useToast";
import {
  AuthClient,
  type ChangePasswordDto,
  type UpdateProfileDto,
} from "@/infrastructure/api/auth-client";
import { httpClient } from "@/infrastructure/http/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DTO para actualizar perfil de usuario
 */
export type UpdateUserProfileDto = UpdateProfileDto;

// ============================================
// CACHE KEYS
// ============================================

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: ["users", "profile"] as const,
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para actualizar el perfil del usuario actual
 *
 * @example
 * ```typescript
 * const updateProfile = useUpdateUserProfile();
 *
 * updateProfile.mutate({
 *   firstName: "Juan",
 *   lastName: "Pérez",
 *   phone: "+57 300 123 4567"
 * });
 * ```
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateUserProfileDto) => {
      return AuthClient.updateProfile(data);
    },
    onSuccess: () => {
      showSuccess(
        "Perfil Actualizado",
        "Tu información se guardó correctamente",
      );
      // Invalidar perfil del usuario
      queryClient.invalidateQueries({ queryKey: userKeys.profile });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar perfil";
      showError("Error al Actualizar", errorMessage);
      console.error("Error al actualizar perfil:", error);
    },
  });
}

/**
 * Hook para cambiar la contraseña del usuario
 *
 * @example
 * ```typescript
 * const changePassword = useChangePassword();
 *
 * changePassword.mutate({
 *   currentPassword: "old123",
 *   newPassword: "new456",
 *   confirmPassword: "new456"
 * });
 * ```
 */
export function useChangePassword() {
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: ChangePasswordDto) => {
      return AuthClient.changePassword(data);
    },
    onSuccess: () => {
      showSuccess(
        "Contraseña Actualizada",
        "Tu contraseña se cambió exitosamente",
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Error al cambiar contraseña";
      showError("Error al Cambiar Contraseña", errorMessage);
      console.error("Error al cambiar contraseña:", error);
    },
  });
}

/**
 * Hook para subir foto de perfil
 *
 * @example
 * ```typescript
 * const uploadPhoto = useUploadProfilePhoto();
 *
 * uploadPhoto.mutate(photoFile);
 * ```
 */
export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await httpClient.post("/users/profile/photo", formData);
      return response;
    },
    onSuccess: () => {
      showSuccess(
        "Foto Actualizada",
        "Tu foto de perfil se subió correctamente",
      );
      queryClient.invalidateQueries({ queryKey: userKeys.profile });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Error al subir foto";
      showError("Error al Subir Foto", errorMessage);
      console.error("Error al subir foto:", error);
    },
  });
}

/**
 * Hook para actualizar preferencias de usuario
 *
 * @example
 * ```typescript
 * const updatePreferences = useUpdateUserPreferences();
 *
 * updatePreferences.mutate({
 *   theme: "dark",
 *   language: "es",
 *   notifications: true
 * });
 * ```
 */
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (preferences: Record<string, unknown>) => {
      const response = await httpClient.put("/users/preferences", {
        preferences,
      });
      return response;
    },
    onSuccess: () => {
      showSuccess(
        "Preferencias Guardadas",
        "Tus preferencias se han actualizado",
      );
      queryClient.invalidateQueries({ queryKey: userKeys.profile });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al actualizar preferencias";
      showError("Error al Guardar", errorMessage);
      console.error("Error al actualizar preferencias:", error);
    },
  });
}
