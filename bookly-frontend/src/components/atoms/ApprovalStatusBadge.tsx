import { Badge } from "@/components/atoms/Badge";
import type { ApprovalStatus } from "@/types/entities/approval";
import {
  AlertCircle,
  Ban,
  CheckCircle,
  Clock,
  Timer,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * ApprovalStatusBadge - Atom Component
 *
 * Badge especializado para mostrar el estado de una solicitud de aprobación
 * con iconos y colores apropiados para cada estado.
 *
 * @example
 * ```tsx
 * <ApprovalStatusBadge status="PENDING" />
 * <ApprovalStatusBadge status="APPROVED" showIcon={false} />
 * ```
 */

export interface ApprovalStatusBadgeProps {
  /** Estado de la aprobación */
  status: ApprovalStatus;
  /** Mostrar icono junto al texto */
  showIcon?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

const STATUS_CONFIG: Record<
  ApprovalStatus,
  {
    translationKey: string;
    variant:
      | "default"
      | "secondary"
      | "success"
      | "warning"
      | "error"
      | "outline"
      | "primary";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  PENDING: {
    translationKey: "status.pending",
    variant: "warning",
    icon: Clock,
  },
  IN_REVIEW: {
    translationKey: "status.in_review",
    variant: "secondary",
    icon: AlertCircle,
  },
  APPROVED: {
    translationKey: "status.approved",
    variant: "success",
    icon: CheckCircle,
  },
  REJECTED: {
    translationKey: "status.rejected",
    variant: "error",
    icon: XCircle,
  },
  CANCELLED: {
    translationKey: "status.cancelled",
    variant: "outline",
    icon: Ban,
  },
  EXPIRED: {
    translationKey: "status_expired",
    variant: "default",
    icon: Timer,
  },
};

export const ApprovalStatusBadge = React.memo<ApprovalStatusBadgeProps>(
  ({ status, showIcon = true, className }) => {
    const t = useTranslations("approvals");
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={className}>
        {showIcon && <Icon className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />}
        {t(config.translationKey)}
      </Badge>
    );
  }
);

ApprovalStatusBadge.displayName = "ApprovalStatusBadge";
