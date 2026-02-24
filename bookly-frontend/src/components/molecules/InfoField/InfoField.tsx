import * as React from "react";

/**
 * InfoField - Molecule Component
 *
 * Campo de información reutilizable para mostrar pares label-valor.
 * Elimina código duplicado en páginas de detalle.
 *
 * Design System:
 * - Usa tokens semánticos: text.primary, text.secondary
 * - Padding y spacing en múltiplos de 4/8px (grid de 8px)
 * - Bordes con border.subtle
 */

export interface InfoFieldProps {
  /** Etiqueta del campo */
  label: string;
  /** Valor a mostrar */
  value: React.ReactNode;
  /** Variante de visualización */
  variant?: "default" | "inline" | "card";
  /** Clases CSS adicionales */
  className?: string;
  /** Si ocupa todo el ancho disponible */
  fullWidth?: boolean;
}

export function InfoField({
  label,
  value,
  variant = "default",
  className = "",
  fullWidth = false,
}: InfoFieldProps) {
  const widthClass = fullWidth ? "col-span-2" : "";

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${widthClass} ${className}`}>
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          {label}:
        </span>
        <span className="text-sm text-[var(--color-text-primary)]">
          {value}
        </span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`p-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-background-subtle)] ${widthClass} ${className}`}
      >
        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
          {label}
        </p>
        <div className="text-base text-[var(--color-text-primary)]">
          {value}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`${widthClass} ${className}`}>
      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
        {label}
      </p>
      <div className="text-sm text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}
