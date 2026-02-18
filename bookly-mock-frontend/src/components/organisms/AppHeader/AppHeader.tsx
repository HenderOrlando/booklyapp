"use client";

import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { LogoutButton } from "@/components/molecules/LogoutButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * AppHeader - Header superior de la aplicación
 *
 * Header estandarizado que se usa en todas las páginas principales
 * Muestra el logo, título opcional y botón de logout
 */

interface AppHeaderProps {
  title?: string; // Título personalizado de la página (opcional)
  showUser?: boolean; // Mostrar información del usuario
  className?: string;
}

export function AppHeader({
  title = "Bookly",
  showUser = true,
  className = "",
}: AppHeaderProps) {
  // React Query: Usuario actual (reemplaza Redux)
  const { data: user } = useCurrentUser();

  return (
    <div className={`flex items-center justify-between flex-1 ${className}`}>
      {/* Logo y Título (Organización y Bookly) */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Logo SVG */}
          <svg
            className="w-8 h-8 text-[var(--color-text-inverse)]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.84-1.19-7-5.14-7-9V8.37l7-3.5 7 3.5V11c0 3.86-3.16 7.81-7 9z" />
            <path d="M9 11l-1.5 1.5L10 15l6-6-1.5-1.5L10 12l-1-1z" />
          </svg>

          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-[var(--color-text-inverse)] leading-tight">
              Universidad Francisco de Paula Santander
            </h1>
            <span className="text-xs font-medium text-[var(--color-text-tertiary)] leading-tight">
              Bookly
            </span>
          </div>
        </div>
      </div>

      {/* Sección de Usuario, Theme y Logout */}
      <div className="flex items-center gap-6">
        {showUser && user && (
          <div className="hidden md:flex flex-col items-end text-sm leading-tight">
            <span className="font-bold text-[var(--color-text-inverse)]">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-[10px] text-[var(--color-text-tertiary)]">
              {user.email}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton
            variant="link"
            className="text-[var(--color-text-inverse)] hover:text-[var(--color-text-tertiary)] transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
