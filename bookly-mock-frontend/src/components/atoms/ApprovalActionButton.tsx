import { Button } from "@/components/atoms/Button";
import { CheckCircle, MessageSquare, UserPlus, XCircle } from "lucide-react";
import * as React from "react";

/**
 * ApprovalActionButton - Atom Component
 *
 * Botón especializado para acciones de aprobación con iconos y estilos apropiados.
 * Soporta múltiples tipos de acciones: aprobar, rechazar, comentar, delegar.
 *
 * @example
 * ```tsx
 * <ApprovalActionButton action="approve" onClick={handleApprove} />
 * <ApprovalActionButton action="reject" onClick={handleReject} loading={true} />
 * ```
 */

export interface ApprovalActionButtonProps {
  /** Tipo de acción */
  action: "approve" | "reject" | "comment" | "delegate";
  /** Handler al hacer click */
  onClick: () => void;
  /** Estado de carga */
  loading?: boolean;
  /** Deshabilitado */
  disabled?: boolean;
  /** Texto personalizado (sobrescribe el default) */
  children?: React.ReactNode;
  /** Tamaño del botón */
  size?: "default" | "sm" | "lg" | "icon";
  /** Clase CSS adicional */
  className?: string;
}

const ACTION_CONFIG = {
  approve: {
    label: "Aprobar",
    icon: CheckCircle,
    variant: "default" as const,
  },
  reject: {
    label: "Rechazar",
    icon: XCircle,
    variant: "destructive" as const,
  },
  comment: {
    label: "Comentar",
    icon: MessageSquare,
    variant: "outline" as const,
  },
  delegate: {
    label: "Delegar",
    icon: UserPlus,
    variant: "secondary" as const,
  },
};

export const ApprovalActionButton = React.memo<ApprovalActionButtonProps>(
  ({
    action,
    onClick,
    loading = false,
    disabled = false,
    children,
    size = "default",
    className,
  }) => {
    const config = ACTION_CONFIG[action];
    const Icon = config.icon;
    const label = children || config.label;

    return (
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        variant={config.variant}
        size={size}
        className={className}
      >
        {!loading && <Icon className="mr-2 h-4 w-4" aria-hidden="true" />}
        {loading ? "Procesando..." : label}
      </Button>
    );
  }
);

ApprovalActionButton.displayName = "ApprovalActionButton";
