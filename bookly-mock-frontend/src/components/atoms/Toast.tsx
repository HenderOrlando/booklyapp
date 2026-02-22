/**
 * Toast - Atom Component
 *
 * Componente individual de notificación Toast.
 * Integrado con el Design System para colores y estilos.
 *
 * @example
 * ```tsx
 * <Toast
 *   id="toast-1"
 *   type="success"
 *   title="Éxito"
 *   message="La operación se completó correctamente"
 *   onClose={() => handleClose("toast-1")}
 * />
 * ```
 */

import type { NotificationType } from "@/store/slices/uiSlice";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import * as React from "react";

export interface ToastProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-[var(--color-state-success-bg)]",
    borderColor: "border-[var(--color-state-success-border)]",
    iconColor: "text-[var(--color-state-success-text)]",
    titleColor: "text-[var(--color-state-success-text)]",
    messageColor: "text-[var(--color-state-success-text)]",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-[var(--color-state-error-bg)]",
    borderColor: "border-[var(--color-state-error-border)]",
    iconColor: "text-[var(--color-state-error-text)]",
    titleColor: "text-[var(--color-state-error-text)]",
    messageColor: "text-[var(--color-state-error-text)]",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-[var(--color-state-warning-bg)]",
    borderColor: "border-[var(--color-state-warning-border)]",
    iconColor: "text-[var(--color-state-warning-text)]",
    titleColor: "text-[var(--color-state-warning-text)]",
    messageColor: "text-[var(--color-state-warning-text)]",
  },
  info: {
    icon: Info,
    bgColor: "bg-[var(--color-state-info-bg)]",
    borderColor: "border-[var(--color-state-info-border)]",
    iconColor: "text-[var(--color-state-info-text)]",
    titleColor: "text-[var(--color-state-info-text)]",
    messageColor: "text-[var(--color-state-info-text)]",
  },
};

export const Toast = React.memo<ToastProps>(
  ({ id, type, title, message, onClose }) => {
    const config = toastConfig[type];
    const Icon = config.icon;

    return (
      <div
        className={`
          ${config.bgColor} ${config.borderColor}
          border rounded-lg shadow-lg p-4 mb-3
          flex items-start gap-3
          animate-in slide-in-from-right-full duration-300
          min-w-[320px] max-w-[420px]
        `}
        role="alert"
      >
        {/* Icono */}
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
            {title}
          </h4>
          <p className={`text-sm ${config.messageColor}`}>{message}</p>
        </div>

        {/* Botón cerrar */}
        <button
          type="button"
          onClick={() => onClose(id)}
          className={`
            flex-shrink-0 p-1 rounded-md
            hover:bg-[var(--color-action-ghost-hover)]
            transition-colors
            ${config.iconColor}
          `}
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  },
);

Toast.displayName = "Toast";
