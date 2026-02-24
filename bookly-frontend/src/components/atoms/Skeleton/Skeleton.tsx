import { cn } from "@/lib/utils";

/**
 * Skeleton Component - Bookly Design System
 *
 * Indicadores de carga para mejorar UX
 * Usado en: listados cargando, tarjetas, formularios
 *
 * Tokens aplicados:
 * - Fondo base: bg.muted
 * - Animación: pulse para simular carga
 * - Compatible con modo claro/oscuro
 */

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--color-bg-muted)]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
