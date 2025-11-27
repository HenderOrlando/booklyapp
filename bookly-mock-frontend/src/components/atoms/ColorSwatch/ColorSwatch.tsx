/**
 * ColorSwatch - Atom Component
 *
 * Muestra una muestra de color en diferentes tamaños.
 * Usado principalmente en categorías y temas.
 */

export interface ColorSwatchProps {
  /** Color en formato hexadecimal */
  color: string;
  /** Tamaño del swatch */
  size?: "sm" | "md" | "lg";
  /** Borde del swatch */
  bordered?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Tooltip/título al hacer hover */
  title?: string;
}

// Grid de 8px: tamaños en múltiplos de 4 u 8
const sizeClasses = {
  sm: "w-6 h-6", // 24px (3 * 8px)
  md: "w-8 h-8", // 32px (4 * 8px)
  lg: "w-12 h-12", // 48px (6 * 8px)
};

export function ColorSwatch({
  color,
  size = "md",
  bordered = true,
  className = "",
  title,
}: ColorSwatchProps) {
  const borderClass = bordered
    ? "ring-2 ring-[var(--color-border-subtle)] ring-offset-2 ring-offset-[var(--color-background)]"
    : "";

  return (
    <div
      className={`rounded-lg shadow-sm flex-shrink-0 ${sizeClasses[size]} ${borderClass} ${className}`}
      style={{ backgroundColor: color }}
      title={title || color}
      aria-label={`Color: ${color}`}
      role="img"
    />
  );
}
