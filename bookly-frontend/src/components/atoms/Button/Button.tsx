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
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Botón primario - Bookly Design System
        default:
          "bg-action-primary text-content-inverse hover:bg-action-primary-hover active:brightness-95 disabled:bg-action-primary-disabled disabled:text-content-inverse",
        // Botón secundario - Bookly Design System
        secondary:
          "bg-action-secondary text-content-inverse hover:bg-action-secondary-hover active:brightness-95",
        // Botón destructivo - Estados de error
        destructive:
          "bg-state-error-text text-content-inverse hover:brightness-95 active:brightness-90",
        // Botón outline
        outline:
          "border border-line-strong bg-transparent text-content-primary hover:bg-app",
        // Botón ghost - Bookly Design System
        ghost:
          "bg-transparent text-content-primary hover:bg-action-ghost-hover",
        // Botón link
        link: "text-content-link underline-offset-4 hover:underline",
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
  },
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
