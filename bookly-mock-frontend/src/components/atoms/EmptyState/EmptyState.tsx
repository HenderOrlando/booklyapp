import * as React from "react";

/**
 * EmptyState - Atom Component
 *
 * Componente para mostrar un estado vacío cuando no hay datos.
 * Mejora la experiencia de usuario con un mensaje claro y acción opcional.
 */

export interface EmptyStateProps {
  /** Icono o emoji a mostrar */
  icon?: React.ReactNode;
  /** Título del estado vacío */
  title: string;
  /** Descripción adicional */
  description?: string;
  /** Acción para realizar (botón, link, etc.) */
  action?: React.ReactNode;
  /** Clase CSS adicional */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {icon && (
        <div className="text-6xl mb-4 opacity-50">
          {typeof icon === "string" ? <span>{icon}</span> : icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
