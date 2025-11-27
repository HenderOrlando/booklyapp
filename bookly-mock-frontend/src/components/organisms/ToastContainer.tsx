/**
 * ToastContainer - Organism Component
 *
 * Contenedor global para todas las notificaciones Toast.
 * Lee las notificaciones del Redux store y las renderiza.
 * Se coloca en el layout principal de la aplicación.
 *
 * @example
 * ```tsx
 * // En layout.tsx o providers.tsx
 * <ToastContainer />
 * ```
 */

import { Toast } from "@/components/atoms/Toast";
import type { Notification } from "@/store/slices/uiSlice";
import { removeNotification } from "@/store/slices/uiSlice";
import type { RootState } from "@/store/store";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

export const ToastContainer = React.memo(() => {
  const notifications = useSelector(
    (state: RootState) => state.ui.notifications
  );
  const dispatch = useDispatch();

  const handleClose = React.useCallback(
    (id: string) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  // Si no hay notificaciones, no renderizar nada
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col items-end"
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map((notification: Notification) => (
        <Toast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={handleClose}
        />
      ))}
    </div>
  );
});

ToastContainer.displayName = "ToastContainer";
