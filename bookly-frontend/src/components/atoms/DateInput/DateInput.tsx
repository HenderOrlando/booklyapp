import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import * as React from "react";

/**
 * DateInput - Atom Component
 *
 * Input especializado para selección de fechas.
 * Wrapper sobre Input nativo con type="date" y validaciones.
 *
 * Design System:
 * - Usa Input base component
 * - Grid de 8px en spacing
 * - Tokens semánticos para colores
 * - Validaciones de min/max fecha
 * - Accesible con labels
 *
 * @example
 * ```tsx
 * <DateInput
 *   label="Fecha de reserva"
 *   value={fecha}
 *   onChange={(value) => setFecha(value)}
 *   min="2025-01-01"
 *   required
 * />
 * ```
 */

export interface DateInputProps {
  /** Valor de la fecha (formato YYYY-MM-DD) */
  value?: string;
  /** Callback cuando cambia la fecha */
  onChange?: (value: string) => void;
  /** Label del input */
  label?: string;
  /** Fecha mínima permitida (YYYY-MM-DD) */
  min?: string;
  /** Fecha máxima permitida (YYYY-MM-DD) */
  max?: string;
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

export const DateInput = React.memo(function DateInput({
  value = "",
  onChange,
  label,
  min,
  max,
  required = false,
  disabled = false,
  error,
  placeholder,
  className = "",
  id,
  name,
}: DateInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}

      <Input
        type="date"
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        error={error}
      />
    </div>
  );
});
