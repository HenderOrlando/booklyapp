import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Alert Component - Bookly Design System
 * Comunica estados del sistema: éxito, advertencia, error, información
 *
 * Composición:
 * - Alert (contenedor principal)
 * - AlertTitle (título)
 * - AlertDescription (descripción)
 *
 * Variantes según sistema de diseño:
 * - default: Información general
 * - success: Operación exitosa
 * - warning: Advertencia o precaución
 * - error: Error o acción fallida
 */

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success:
          "border-[var(--color-state-success-border)] bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)] [&>svg]:text-[var(--color-state-success-text)]",
        warning:
          "border-[var(--color-state-warning-border)] bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)] [&>svg]:text-[var(--color-state-warning-text)]",
        error:
          "border-[var(--color-state-error-border)] bg-[var(--color-state-error-bg)] text-[var(--color-state-error-text)] [&>svg]:text-[var(--color-state-error-text)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
