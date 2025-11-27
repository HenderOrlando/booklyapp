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
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    titleColor: "text-green-900 dark:text-green-100",
    messageColor: "text-green-700 dark:text-green-300",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-900 dark:text-red-100",
    messageColor: "text-red-700 dark:text-red-300",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    titleColor: "text-yellow-900 dark:text-yellow-100",
    messageColor: "text-yellow-700 dark:text-yellow-300",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-900 dark:text-blue-100",
    messageColor: "text-blue-700 dark:text-blue-300",
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
            hover:bg-black/5 dark:hover:bg-white/10
            transition-colors
            ${config.iconColor}
          `}
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }
);

Toast.displayName = "Toast";
