/**
 * useToast - Custom Hook
 *
 * Hook para facilitar el uso del sistema de notificaciones Toast.
 * Integrado con Redux para gestión de estado global.
 *
 * @example
 * ```tsx
 * const { showSuccess, showError, showWarning, showInfo } = useToast();
 *
 * showSuccess("Operación exitosa", "Los datos se guardaron correctamente");
 * showError("Error", "No se pudo conectar con el servidor");
 * ```
 */

import type { NotificationType } from "@/store/slices/uiSlice";
import { addNotification, removeNotification } from "@/store/slices/uiSlice";
import { useDispatch } from "react-redux";

interface ToastOptions {
  duration?: number; // Duración en ms, undefined = no auto-dismiss
  id?: string; // ID personalizado (opcional)
}

export function useToast() {
  const dispatch = useDispatch();

  const show = (
    type: NotificationType,
    title: string,
    message: string,
    options: ToastOptions = {}
  ) => {
    const id = options.id || `toast_${Date.now()}_${Math.random()}`;
    const duration = options.duration !== undefined ? options.duration : 5000; // 5s por defecto

    dispatch(
      addNotification({
        id,
        type,
        title,
        message,
        duration,
      })
    );

    // Auto-dismiss si tiene duración
    if (duration > 0) {
      setTimeout(() => {
        dispatch(removeNotification(id));
      }, duration);
    }

    return id;
  };

  const showSuccess = (
    title: string,
    message: string,
    options?: ToastOptions
  ) => {
    return show("success", title, message, options);
  };

  const showError = (
    title: string,
    message: string,
    options?: ToastOptions
  ) => {
    return show("error", title, message, {
      ...options,
      duration: options?.duration ?? 7000,
    }); // Errores duran más
  };

  const showWarning = (
    title: string,
    message: string,
    options?: ToastOptions
  ) => {
    return show("warning", title, message, options);
  };

  const showInfo = (title: string, message: string, options?: ToastOptions) => {
    return show("info", title, message, options);
  };

  const dismiss = (id: string) => {
    dispatch(removeNotification(id));
  };

  return {
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss,
  };
}
