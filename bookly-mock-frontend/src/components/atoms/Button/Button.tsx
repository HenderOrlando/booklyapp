import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Button Component - Bookly Design System
 *
 * Variantes según sistema de diseño:
 * - primary: Acción más importante (azul) - token action.primary
 * - secondary: Acciones secundarias (turquesa) - token action.secondary
 * - ghost: Acciones de bajo peso visual - fondo transparente
 * - destructive: Acciones destructivas (rojo)
 * - outline: Variante con borde
 * - link: Estilo de enlace
 *
 * Estados manejados:
 * - default, hover, active, focus, disabled
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Botón primario - Bookly Design System
        default:
          "bg-brand-primary-500 text-[var(--color-text-inverse)] hover:bg-brand-primary-600 active:bg-brand-primary-700 disabled:bg-[var(--color-action-primary-disabled)] dark:bg-brand-primary-600 dark:hover:bg-brand-primary-500",
        // Botón secundario - Bookly Design System
        secondary:
          "bg-brand-secondary-500 text-[var(--color-text-inverse)] hover:bg-brand-secondary-600 active:bg-brand-secondary-700 dark:bg-brand-secondary-600 dark:hover:bg-brand-secondary-500",
        // Botón destructivo - Estados de error
        destructive:
          "bg-state-error-500 text-[var(--color-text-inverse)] hover:bg-state-error-700 active:bg-state-error-900",
        // Botón outline
        outline:
          "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]",
        // Botón ghost - Bookly Design System
        ghost:
          "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-action-ghost-hover)]",
        // Botón link
        link: "text-brand-primary-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
