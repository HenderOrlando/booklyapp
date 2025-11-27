import type { VariantProps } from "class-variance-authority";
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
const resourceStatusMap: Record<ResourceStatus, StatusConfig> = {
  AVAILABLE: { text: "Disponible", variant: "success" }, // state.success
  RESERVED: { text: "Reservado", variant: "secondary" }, // action.secondary
  MAINTENANCE: { text: "Mantenimiento", variant: "warning" }, // state.warning
  UNAVAILABLE: { text: "No Disponible", variant: "error" }, // state.error
};

/**
 * Configuración de estados para mantenimientos
 */
// Estados de mantenimiento usando tokens semánticos
const maintenanceStatusMap: Record<MaintenanceStatus, StatusConfig> = {
  SCHEDULED: { text: "Programado", variant: "secondary" }, // action.secondary
  IN_PROGRESS: { text: "En Progreso", variant: "warning" }, // state.warning
  COMPLETED: { text: "Completado", variant: "success" }, // state.success
  CANCELLED: { text: "Cancelado", variant: "error" }, // state.error
};

/**
 * Configuración de tipos de mantenimiento
 */
const maintenanceTypeMap: Record<MaintenanceType, StatusConfig> = {
  PREVENTIVE: { text: "Preventivo", variant: "secondary" },
  CORRECTIVE: { text: "Correctivo", variant: "warning" },
  EMERGENCY: { text: "Emergencia", variant: "error" },
};

/**
 * Configuración de estados para categorías
 */
const categoryStatusMap: Record<CategoryStatus, StatusConfig> = {
  ACTIVE: { text: "Activa", variant: "success" },
  INACTIVE: { text: "Inactiva", variant: "secondary" },
};

/**
 * Configuración de estados de aprobación
 */
const approvalStatusMap: Record<ApprovalStatus, StatusConfig> = {
  PENDING: { text: "Pendiente", variant: "warning" },
  APPROVED: { text: "Aprobado", variant: "success" },
  REJECTED: { text: "Rechazado", variant: "error" },
};

/**
 * Obtiene la configuración de estado según el tipo
 */
function getStatusConfig(
  type: StatusBadgeProps["type"],
  status: string
): StatusConfig {
  switch (type) {
    case "resource":
      return (
        resourceStatusMap[status as ResourceStatus] || {
          text: status,
          variant: "secondary",
        }
      );
    case "maintenance":
      return (
        maintenanceStatusMap[status as MaintenanceStatus] || {
          text: status,
          variant: "secondary",
        }
      );
    case "maintenanceType":
      return (
        maintenanceTypeMap[status as MaintenanceType] || {
          text: status,
          variant: "secondary",
        }
      );
    case "category":
      return (
        categoryStatusMap[status as CategoryStatus] || {
          text: status,
          variant: "secondary",
        }
      );
    case "approval":
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
      // Por defecto, intenta resource
      return (
        resourceStatusMap[status as ResourceStatus] || {
          text: status,
          variant: "secondary",
        }
      );
  }
}

export const StatusBadge = React.memo(function StatusBadge({
  type = "resource",
  status,
  className,
  customText,
}: StatusBadgeProps) {
  const config = getStatusConfig(type, status);

  return (
    <Badge variant={config.variant} className={className}>
      {customText || config.text}
    </Badge>
  );
});
