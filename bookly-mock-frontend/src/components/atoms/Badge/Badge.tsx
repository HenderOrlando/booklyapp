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
          "border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]",
        success:
          "border-[var(--color-state-success-border)] bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)]",
        warning:
          "border-[var(--color-state-warning-border)] bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)]",
        error:
          "border-[var(--color-state-error-border)] bg-[var(--color-state-error-bg)] text-[var(--color-state-error-text)]",
        primary:
          "border-transparent bg-[var(--color-action-primary)] text-[var(--color-text-inverse)]",
        secondary:
          "border-transparent bg-[var(--color-action-secondary)] text-[var(--color-text-inverse)]",
        outline:
          "border-[var(--color-border-strong)] text-[var(--color-text-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
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
