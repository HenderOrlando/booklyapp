import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import * as React from "react";

/**
 * TimeInput - Atom Component
 *
 * Input especializado para selección de hora.
 * Wrapper sobre Input nativo con type="time" y validaciones.
 *
 * Design System:
 * - Usa Input base component
 * - Grid de 8px en spacing
 * - Formato 24 horas (HH:mm)
 * - Validaciones de min/max hora
 * - Accesible con labels
 *
 * @example
 * ```tsx
 * <TimeInput
 *   label="Hora de inicio"
 *   value="09:00"
 *   onChange={(value) => setHora(value)}
 *   min="08:00"
 *   max="18:00"
 *   step={30}
 *   required
 * />
 * ```
 */

export interface TimeInputProps {
  /** Valor de la hora (formato HH:mm) */
  value?: string;
  /** Callback cuando cambia la hora */
  onChange?: (value: string) => void;
  /** Label del input */
  label?: string;
  /** Hora mínima permitida (HH:mm) */
  min?: string;
  /** Hora máxima permitida (HH:mm) */
  max?: string;
  /** Intervalo en minutos (15, 30, 60) */
  step?: number;
  /** Si el campo es requerido */
  required?: boolean;
  /** Si el campo está deshabilitado */
  disabled?: boolean;
  /** Mensaje de error */
  error?: string;
  /** Placeholder */
  placeholder?: string;
  /** Clase CSS adicional */
  className?: string;
  /** ID del input */
  id?: string;
  /** Name del input */
  name?: string;
}

export const TimeInput = React.memo(function TimeInput({
  value = "",
  onChange,
  label,
  min,
  max,
  step,
  required = false,
  disabled = false,
  error,
  placeholder,
  className = "",
  id,
  name,
}: TimeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  // Convertir step de minutos a segundos para el input
  const stepInSeconds = step ? step * 60 : undefined;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}

      <Input
        type="time"
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={stepInSeconds}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        error={error}
      />
    </div>
  );
});
