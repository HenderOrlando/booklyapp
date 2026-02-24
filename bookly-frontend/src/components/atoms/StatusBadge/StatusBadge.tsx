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
  | "APPROVED"
  | "REJECTED"
  | "CHECKED_IN"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

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
  const tResources = useTranslations("resources");
  const tMaintenance = useTranslations("maintenance");
  const tCategories = useTranslations("categories");
  const tApprovals = useTranslations("approvals");
  const tReservations = useTranslations("reservations");

  const getStatusConfig = (
    type: StatusBadgeProps["type"],
    status: string,
  ): StatusConfig => {
    switch (type) {
      case "resource":
        const resourceStatusMap: Record<ResourceStatus, StatusConfig> = {
          AVAILABLE: { text: tResources("available"), variant: "success" },
          RESERVED: { text: tResources("occupied"), variant: "secondary" },
          MAINTENANCE: { text: tResources("maintenance"), variant: "warning" },
          UNAVAILABLE: { text: tResources("unavailable"), variant: "error" },
        };
        return (
          resourceStatusMap[status as ResourceStatus] || {
            text: status,
            variant: "secondary",
          }
        );
      case "maintenance":
        const maintenanceStatusMap: Record<MaintenanceStatus, StatusConfig> = {
          SCHEDULED: { text: tMaintenance("scheduled"), variant: "secondary" },
          IN_PROGRESS: {
            text: tMaintenance("in_progress"),
            variant: "warning",
          },
          COMPLETED: { text: tMaintenance("completed"), variant: "success" },
          CANCELLED: { text: tMaintenance("cancelled"), variant: "error" },
        };
        return (
          maintenanceStatusMap[status as MaintenanceStatus] || {
            text: status,
            variant: "secondary",
          }
        );
      case "maintenanceType":
        const maintenanceTypeMap: Record<MaintenanceType, StatusConfig> = {
          PREVENTIVE: { text: tMaintenance("preventive"), variant: "secondary" },
          CORRECTIVE: { text: tMaintenance("corrective"), variant: "warning" },
          EMERGENCY: { text: tMaintenance("emergency"), variant: "error" },
        };
        return (
          maintenanceTypeMap[status as MaintenanceType] || {
            text: status,
            variant: "secondary",
          }
        );
      case "category":
        const categoryStatusMap: Record<CategoryStatus, StatusConfig> = {
          ACTIVE: { text: tCategories("active"), variant: "success" },
          INACTIVE: { text: tCategories("inactive"), variant: "secondary" },
        };
        return (
          categoryStatusMap[status as CategoryStatus] || {
            text: status,
            variant: "secondary",
          }
        );
      case "approval":
        const approvalStatusMap: Record<ApprovalStatus, StatusConfig> = {
          PENDING: { text: tApprovals("status.pending"), variant: "warning" },
          APPROVED: { text: tApprovals("status.approved"), variant: "success" },
          REJECTED: { text: tApprovals("status.rejected"), variant: "error" },
        };
        return (
          approvalStatusMap[status as ApprovalStatus] || {
            text: status,
            variant: "secondary",
          }
        );
      case "reservation":
        const reservationMap: Record<ReservationStatus, StatusConfig> = {
          PENDING: { text: tReservations("status.pending"), variant: "warning" },
          CONFIRMED: {
            text: tReservations("status.confirmed"),
            variant: "success",
          },
          APPROVED: {
            text: tReservations("status.approved"),
            variant: "success",
          },
          REJECTED: {
            text: tReservations("status.rejected"),
            variant: "error",
          },
          CHECKED_IN: {
            text: tReservations("status.checked_in"),
            variant: "default",
          },
          ACTIVE: {
            text: tReservations("status.active"),
            variant: "default",
          },
          COMPLETED: {
            text: tReservations("status.completed"),
            variant: "success",
          },
          CANCELLED: {
            text: tReservations("status.cancelled"),
            variant: "secondary",
          },
        };
        return (
          reservationMap[status as ReservationStatus] || {
            text: status,
            variant: "secondary",
          }
        );
      default:
        return {
          text: status,
          variant: "secondary",
        };
    }
  };

  const config = getStatusConfig(type, status);

  return (
    <Badge variant={config.variant} className={className}>
      {customText || config.text}
    </Badge>
  );
});
