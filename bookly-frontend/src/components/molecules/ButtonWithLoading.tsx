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
    "border border-[var(--color-action-primary)] bg-[var(--color-action-primary)] text-[var(--color-text-inverse)] hover:border-[var(--color-action-primary-hover)] hover:bg-[var(--color-action-primary-hover)] disabled:border-[var(--color-action-primary-disabled)] disabled:bg-[var(--color-action-primary-disabled)] disabled:text-[var(--color-text-secondary)]",
  secondary:
    "border border-[var(--color-action-secondary)] bg-[var(--color-action-secondary)] text-[var(--color-text-inverse)] hover:border-[var(--color-action-secondary-hover)] hover:bg-[var(--color-action-secondary-hover)] disabled:border-[var(--color-action-primary-disabled)] disabled:bg-[var(--color-action-primary-disabled)] disabled:text-[var(--color-text-secondary)]",
  outline:
    "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] disabled:border-[var(--color-border-subtle)] disabled:text-[var(--color-text-tertiary)]",
  danger:
    "border border-[var(--color-state-error-text)] bg-[var(--color-state-error-text)] text-[var(--color-text-inverse)] hover:brightness-95 disabled:border-[var(--color-state-error-border)] disabled:bg-[var(--color-state-error-border)] disabled:text-[var(--color-text-inverse)]",
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
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2
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
  },
);

ButtonWithLoading.displayName = "ButtonWithLoading";
