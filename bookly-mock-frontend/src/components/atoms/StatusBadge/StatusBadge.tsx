import type { VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";
import React from "react";
import { Badge, badgeVariants } from "../Badge";

/**
 * StatusBadge - Atom Component
 *
 * Badge especializado para mostrar estados del sistema con traducciones y variantes predefinidas.
 * Encapsula la lógica de mapeo de estados a variantes de Badge.
 */

// Tipos de estados soportados
export type ResourceStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "MAINTENANCE"
  | "UNAVAILABLE";
export type MaintenanceStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type MaintenanceType = "PREVENTIVE" | "CORRECTIVE" | "EMERGENCY";
export type CategoryStatus = "ACTIVE" | "INACTIVE";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface StatusBadgeProps {
  /** Tipo de entidad (determina el esquema de colores) */
  type?:
    | "resource"
    | "maintenance"
    | "maintenanceType"
    | "category"
    | "approval"
    | "reservation";
  /** Estado a mostrar */
  status:
    | ResourceStatus
    | MaintenanceStatus
    | MaintenanceType
    | CategoryStatus
    | ApprovalStatus
    | ReservationStatus
    | string;
  /** Clase CSS adicional */
  className?: string;
  /** Texto personalizado (sobrescribe el texto por defecto) */
  customText?: string;
}

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

interface StatusConfig {
  text: string;
  variant: BadgeVariant;
}

/**
 * Configuración de estados para recursos
 */
// Tokens del design system: usar state.success, state.warning, state.error
export const StatusBadge = React.memo(function StatusBadge({
  type = "resource",
  status,
  className,
  customText,
}: StatusBadgeProps) {
  const t = useTranslations("resources");

  const resourceStatusMap: Record<ResourceStatus, StatusConfig> = {
    AVAILABLE: { text: t("available"), variant: "success" },
    RESERVED: { text: t("occupied"), variant: "secondary" },
    MAINTENANCE: { text: t("maintenance"), variant: "warning" },
    UNAVAILABLE: { text: t("unavailable"), variant: "error" },
  };

  const getStatusConfig = (
    type: StatusBadgeProps["type"],
    status: string,
  ): StatusConfig => {
    switch (type) {
      case "resource":
        return (
          resourceStatusMap[status as ResourceStatus] || {
            text: status,
            variant: "secondary",
          }
        );
      case "maintenance":
        const maintenanceStatusMap: Record<MaintenanceStatus, StatusConfig> = {
          SCHEDULED: { text: "Programado", variant: "secondary" },
          IN_PROGRESS: { text: "En Progreso", variant: "warning" },
          COMPLETED: { text: "Completado", variant: "success" },
          CANCELLED: { text: "Cancelado", variant: "error" },
        };
        return (
          maintenanceStatusMap[status as MaintenanceStatus] || {
            text: status,
            variant: "secondary",
          }
        );
      case "maintenanceType":
        const maintenanceTypeMap: Record<MaintenanceType, StatusConfig> = {
          PREVENTIVE: { text: "Preventivo", variant: "secondary" },
          CORRECTIVE: { text: "Correctivo", variant: "warning" },
          EMERGENCY: { text: "Emergencia", variant: "error" },
        };
        return (
          maintenanceTypeMap[status as MaintenanceType] || {
            text: status,
            variant: "secondary",
          }
        );
      case "category":
        const categoryStatusMap: Record<CategoryStatus, StatusConfig> = {
          ACTIVE: { text: "Activa", variant: "success" },
          INACTIVE: { text: "Inactiva", variant: "secondary" },
        };
        return (
          categoryStatusMap[status as CategoryStatus] || {
            text: status,
            variant: "secondary",
          }
        );
      case "approval":
        const approvalStatusMap: Record<ApprovalStatus, StatusConfig> = {
          PENDING: { text: "Pendiente", variant: "warning" },
          APPROVED: { text: "Aprobado", variant: "success" },
          REJECTED: { text: "Rechazado", variant: "error" },
        };
        return (
          approvalStatusMap[status as ApprovalStatus] || {
            text: status,
            variant: "secondary",
          }
        );
      case "reservation":
        const reservationMap: Record<ReservationStatus, StatusConfig> = {
          PENDING: { text: "Pendiente", variant: "warning" },
          CONFIRMED: { text: "Confirmada", variant: "success" },
          IN_PROGRESS: { text: "En Progreso", variant: "default" },
          COMPLETED: { text: "Completada", variant: "success" },
          CANCELLED: { text: "Cancelada", variant: "secondary" },
          REJECTED: { text: "Rechazada", variant: "error" },
        };
        return (
          reservationMap[status as ReservationStatus] || {
            text: status,
            variant: "secondary",
          }
        );
      default:
        return (
          resourceStatusMap[status as ResourceStatus] || {
            text: status,
            variant: "secondary",
          }
        );
    }
  };

  const config = getStatusConfig(type, status);

  return (
    <Badge variant={config.variant} className={className}>
      {customText || config.text}
    </Badge>
  );
});
