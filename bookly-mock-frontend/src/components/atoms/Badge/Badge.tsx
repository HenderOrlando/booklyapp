import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Badge Component - Bookly Design System
 * Usado para indicar estados, categorías o etiquetas
 *
 * Variantes:
 * - default: Neutro (grises)
 * - success: Estado exitoso (verde)
 * - warning: Advertencia (naranja)
 * - error: Error o rechazado (rojo)
 * - primary: Acción primaria (azul)
 * - secondary: Acción secundaria (turquesa)
 */

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        success:
          "border-state-success-200 bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)]",
        warning:
          "border-state-warning-200 bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)]",
        error:
          "border-state-error-200 bg-[var(--color-state-error-bg)] text-[var(--color-state-error-text)]",
        primary:
          "border-transparent bg-brand-primary-500 text-white dark:bg-brand-primary-600",
        secondary:
          "border-transparent bg-brand-secondary-500 text-white dark:bg-brand-secondary-600",
        outline:
          "border-[var(--color-border-strong)] text-[var(--color-text-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
