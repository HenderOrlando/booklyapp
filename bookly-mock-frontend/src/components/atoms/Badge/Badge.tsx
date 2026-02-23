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
          "border-transparent bg-app text-content-primary",
        success:
          "border-state-success-border bg-state-success-bg text-state-success-text",
        warning:
          "border-state-warning-border bg-state-warning-bg text-state-warning-text",
        error:
          "border-state-error-border bg-state-error-bg text-state-error-text",
        primary:
          "border-transparent bg-action-primary text-content-inverse",
        secondary:
          "border-transparent bg-action-secondary text-content-inverse",
        outline:
          "border-line-strong text-content-primary",
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
