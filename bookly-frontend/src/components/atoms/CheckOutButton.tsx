import { Button } from "@/components/atoms/Button";
import { LogOut } from "lucide-react";
import * as React from "react";

/**
 * CheckOutButton - Atom Component
 *
 * Botón especializado para realizar check-out de una reserva.
 * Incluye icono y estados de carga apropiados.
 *
 * @example
 * ```tsx
 * <CheckOutButton onClick={handleCheckOut} />
 * <CheckOutButton loading={true} disabled={true} />
 * ```
 */

export interface CheckOutButtonProps {
  /** Handler al hacer click */
  onClick: () => void;
  /** Estado de carga */
  loading?: boolean;
  /** Deshabilitado */
  disabled?: boolean;
  /** Texto personalizado (por defecto "Check-out") */
  children?: React.ReactNode;
  /** Tamaño del botón */
  size?: "default" | "sm" | "lg" | "icon";
  /** Clase CSS adicional */
  className?: string;
}

export const CheckOutButton = React.memo<CheckOutButtonProps>(
  ({
    onClick,
    loading = false,
    disabled = false,
    children = "Check-out",
    size = "default",
    className,
  }) => {
    return (
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        variant="secondary"
        size={size}
        className={className}
      >
        <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
        {loading ? "Registrando..." : children}
      </Button>
    );
  }
);

CheckOutButton.displayName = "CheckOutButton";
