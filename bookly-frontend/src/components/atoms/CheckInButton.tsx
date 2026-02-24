import { Button } from "@/components/atoms/Button";
import { LogIn } from "lucide-react";
import * as React from "react";

/**
 * CheckInButton - Atom Component
 *
 * Botón especializado para realizar check-in de una reserva.
 * Incluye icono y estados de carga apropiados.
 *
 * @example
 * ```tsx
 * <CheckInButton onClick={handleCheckIn} />
 * <CheckInButton loading={true} disabled={true} />
 * ```
 */

export interface CheckInButtonProps {
  /** Handler al hacer click */
  onClick: () => void;
  /** Estado de carga */
  loading?: boolean;
  /** Deshabilitado */
  disabled?: boolean;
  /** Texto personalizado (por defecto "Check-in") */
  children?: React.ReactNode;
  /** Tamaño del botón */
  size?: "default" | "sm" | "lg" | "icon";
  /** Clase CSS adicional */
  className?: string;
}

export const CheckInButton = React.memo<CheckInButtonProps>(
  ({
    onClick,
    loading = false,
    disabled = false,
    children = "Check-in",
    size = "default",
    className,
  }) => {
    return (
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        variant="default"
        size={size}
        className={className}
      >
        <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
        {loading ? "Registrando..." : children}
      </Button>
    );
  }
);

CheckInButton.displayName = "CheckInButton";
