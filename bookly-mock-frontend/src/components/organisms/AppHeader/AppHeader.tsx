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
  const { data: user, isLoading } = useCurrentUser();

  return (
    <div className={`flex items-center justify-between flex-1 ${className}`}>
      {/* Logo y Título */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Logo SVG */}
          <svg
            className="w-8 h-8 text-brand-primary-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.84-1.19-7-5.14-7-9V8.37l7-3.5 7 3.5V11c0 3.86-3.16 7.81-7 9z" />
            <path d="M9 11l-1.5 1.5L10 15l6-6-1.5-1.5L10 12l-1-1z" />
          </svg>

          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {showUser && user && (
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {user.firstName} {user.lastName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Usuario, Theme y Logout */}
      <div className="flex items-center gap-4">
        {showUser && user && (
          <div className="hidden md:flex flex-col items-end text-sm">
            <span className="font-medium text-white">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)]">{user.email}</span>
          </div>
        )}

        <ThemeToggle />
        <LogoutButton variant="link" />
      </div>
    </div>
  );
}
