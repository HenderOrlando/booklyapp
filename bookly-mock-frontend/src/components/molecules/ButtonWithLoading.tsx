/**
 * ButtonWithLoading - Molecule Component
 *
 * Botón que muestra un spinner durante operaciones asíncronas.
 * Integrado con el Design System y deshabilitado automáticamente durante carga.
 *
 * @example
 * ```tsx
 * <ButtonWithLoading
 *   isLoading={mutation.isPending}
 *   loadingText="Guardando..."
 *   onClick={handleSave}
 * >
 *   Guardar
 * </ButtonWithLoading>
 * ```
 */

import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import * as React from "react";

export interface ButtonWithLoadingProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantClasses = {
  primary:
    "bg-primary-600 hover:bg-primary-700 text-white disabled:bg-primary-300",
  secondary:
    "bg-secondary-600 hover:bg-secondary-700 text-white disabled:bg-secondary-300",
  outline:
    "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 disabled:border-primary-300 disabled:text-primary-300",
  danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const ButtonWithLoading = React.memo<ButtonWithLoadingProps>(
  ({
    isLoading = false,
    loadingText,
    variant = "primary",
    size = "md",
    children,
    disabled,
    className = "",
    ...props
  }) => {
    return (
      <button
        type="button"
        disabled={disabled || isLoading}
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          rounded-lg font-medium
          transition-all duration-200
          disabled:cursor-not-allowed disabled:opacity-60
          flex items-center justify-center gap-2
          ${className}
        `}
        {...props}
      >
        {isLoading && <LoadingSpinner size="sm" className="text-current" />}
        <span>{isLoading && loadingText ? loadingText : children}</span>
      </button>
    );
  }
);

ButtonWithLoading.displayName = "ButtonWithLoading";
