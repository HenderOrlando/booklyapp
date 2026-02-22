import { AvailabilityIndicator } from "@/components/atoms/AvailabilityIndicator";
import { Button } from "@/components/atoms/Button";
import type { TimeSlot } from "@/types/entities/reservation";
import * as React from "react";

/**
 * TimeSlotSelector - Molecule Component
 *
 * Selector visual de horarios disponibles.
 * Muestra una grid de slots por hora con estado de disponibilidad.
 *
 * Design System:
 * - Grid responsivo de slots
 * - AvailabilityIndicator integrado
 * - Selección simple o rango
 * - Tokens semánticos para colores
 * - Grid de 8px en spacing
 * - Accesible
 *
 * @example
 * ```tsx
 * <TimeSlotSelector
 *   slots={slotsDisponibles}
 *   selectedSlots={slotsSeleccionados}
 *   onSelectSlot={(slot) => handleSelect(slot)}
 *   mode="single"
 * />
 * ```
 */

export interface TimeSlotSelectorProps {
  /** Slots disponibles para mostrar */
  slots: TimeSlot[];
  /** Slots actualmente seleccionados */
  selectedSlots?: string[];
  /** Callback al seleccionar un slot */
  onSelectSlot?: (slotId: string) => void;
  /** Callback al deseleccionar un slot */
  onDeselectSlot?: (slotId: string) => void;
  /** Modo de selección */
  mode?: "single" | "range";
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Mostrar indicador de disponibilidad */
  showIndicator?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export const TimeSlotSelector = React.memo(function TimeSlotSelector({
  slots,
  selectedSlots = [],
  onSelectSlot,
  onDeselectSlot,
  mode: _mode = "single",
  disabled = false,
  showIndicator = true,
  className = "",
}: TimeSlotSelectorProps) {
  const handleSlotClick = (slotId: string, isAvailable: boolean) => {
    if (disabled || !isAvailable) return;

    const isSelected = selectedSlots.includes(slotId);

    if (isSelected) {
      onDeselectSlot?.(slotId);
    } else {
      onSelectSlot?.(slotId);
    }
  };

  // Agrupar slots por hora para mejor visualización
  const groupedSlots = React.useMemo(() => {
    return slots.reduce(
      (acc, slot) => {
        const hour = slot.startTime.split(":")[0];
        if (!acc[hour]) {
          acc[hour] = [];
        }
        acc[hour].push(slot);
        return acc;
      },
      {} as Record<string, TimeSlot[]>
    );
  }, [slots]);

  const hours = Object.keys(groupedSlots).sort();

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Header con leyenda */}
      {showIndicator && (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <AvailabilityIndicator status="available" showLabel size="sm" />
          <AvailabilityIndicator status="occupied" showLabel size="sm" />
          <AvailabilityIndicator status="partial" showLabel size="sm" />
        </div>
      )}

      {/* Grid de slots */}
      <div className="grid gap-4">
        {hours.map((hour) => (
          <div key={hour} className="flex flex-col gap-2">
            {/* Hora */}
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">
              {hour}:00
            </h4>

            {/* Slots de esa hora */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {groupedSlots[hour].map((slot) => {
                const isSelected = selectedSlots.includes(slot.id);
                const isAvailable = slot.available;

                return (
                  <Button
                    key={slot.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSlotClick(slot.id, isAvailable)}
                    disabled={disabled || !isAvailable}
                    className={`
                      relative
                      ${!isAvailable && "opacity-50 cursor-not-allowed"}
                      ${isSelected && "ring-2 ring-[var(--color-brand-primary-500)]"}
                    `}
                  >
                    {/* Indicador de disponibilidad */}
                    {showIndicator && (
                      <div className="absolute top-1 right-1">
                        <AvailabilityIndicator
                          status={isAvailable ? "available" : "occupied"}
                          size="sm"
                        />
                      </div>
                    )}

                    {/* Horario */}
                    <span className="text-xs">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Info de slots vacíos */}
      {slots.length === 0 && (
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          No hay horarios disponibles para esta fecha
        </div>
      )}
    </div>
  );
});
