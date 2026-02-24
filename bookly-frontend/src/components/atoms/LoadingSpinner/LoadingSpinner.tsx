/**
 * LoadingSpinner - Atom Component
 *
 * Spinner de carga reutilizable con diferentes tamaños y texto opcional.
 * Reemplaza el código inline duplicado en múltiples páginas.
 */

export interface LoadingSpinnerProps {
  /** Tamaño del spinner */
  size?: "sm" | "md" | "lg";
  /** Texto a mostrar debajo del spinner */
  text?: string;
  /** Si true, centra el spinner en toda la pantalla */
  fullScreen?: boolean;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

// Grid de 8px: tamaños en múltiplos de 8
const sizeClasses = {
  sm: "h-8 w-8 border-2", // 32px (4 * 8px)
  md: "h-12 w-12 border-2", // 48px (6 * 8px)
  lg: "h-16 w-16 border-4", // 64px (8 * 8px)
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function LoadingSpinner({
  size = "md",
  text,
  fullScreen = false,
  className = "",
}: LoadingSpinnerProps) {
  const containerClasses = fullScreen
    ? "flex items-center justify-center h-96"
    : `flex items-center justify-center ${className}`;

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-brand-primary-500 mx-auto mb-4 ${sizeClasses[size]}`}
          role="status"
          aria-label="Cargando"
        />
        {text && (
          <p
            className={`text-[var(--color-text-secondary)] ${textSizeClasses[size]}`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
