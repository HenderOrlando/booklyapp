import { CALENDAR_COLORS } from "@libs/common/constants";
import { SlotStatus } from "@libs/common/enums";
import { Injectable } from "@nestjs/common";

/**
 * Servicio para asignación de colores a slots de calendario
 * Mapea estados de slots a códigos de color hexadecimales
 */
@Injectable()
export class SlotColorService {
  /**
   * Obtener color por estado de slot
   */
  getColorByStatus(status: SlotStatus, isOwnReservation = false): string {
    // Si es reserva propia, usar color especial
    if (
      isOwnReservation &&
      (status === SlotStatus.RESERVED || status === SlotStatus.PENDING)
    ) {
      return CALENDAR_COLORS.OWN_RESERVATION;
    }

    switch (status) {
      case SlotStatus.AVAILABLE:
        return CALENDAR_COLORS.AVAILABLE;
      case SlotStatus.RESERVED:
        return CALENDAR_COLORS.RESERVED;
      case SlotStatus.PENDING:
        return CALENDAR_COLORS.PENDING;
      case SlotStatus.BLOCKED:
        return CALENDAR_COLORS.BLOCKED;
      case SlotStatus.OWN_RESERVATION:
        return CALENDAR_COLORS.OWN_RESERVATION;
      default:
        return CALENDAR_COLORS.BLOCKED; // Fallback
    }
  }

  /**
   * Obtener toda la leyenda de colores
   */
  getLegend() {
    return {
      available: CALENDAR_COLORS.AVAILABLE,
      reserved: CALENDAR_COLORS.RESERVED,
      pending: CALENDAR_COLORS.PENDING,
      blocked: CALENDAR_COLORS.BLOCKED,
      ownReservation: CALENDAR_COLORS.OWN_RESERVATION,
    };
  }

  /**
   * Validar si un código de color es válido
   */
  isValidColor(color: string): boolean {
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    return hexColorRegex.test(color);
  }
}
