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
  icon = "🔍",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center bg-[var(--color-bg-primary)]/30 rounded-xl border-2 border-dashed border-[var(--color-border-subtle)] ${className}`}
    >
      <div className="mb-6 p-4 bg-[var(--color-bg-surface)] rounded-full shadow-sm border border-[var(--color-border-subtle)]">
        <div className="text-5xl">
          {typeof icon === "string" ? <span>{icon}</span> : icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--color-text-secondary)] mb-8 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">{action}</div>}
    </div>
  );
}
