"use client";

import { usePublicConfig } from "@/hooks/useAppConfig";
import { cn } from "@/lib/utils";
import Image from "next/image";
import * as React from "react";

/**
 * AuthLayout - Bookly Design System
 *
 * Layout para páginas de autenticación (login, registro, recuperación)
 * Sin sidebar, diseño centrado con branding
 *
 * Características:
 * - Diseño centrado
 * - Branding de Bookly
 * - Fondo con gradiente sutil
 * - Responsive
 * - Tokens de color aplicados
 */

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showLogo?: boolean;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  description,
  showLogo = true,
  className,
}: AuthLayoutProps) {
  const { data: publicConfig } = usePublicConfig();

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center",
        "bg-app",
        "p-4",
        className,
      )}
    >
      <div className="w-full max-w-md">
        {/* Logo y Branding */}
        {showLogo && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-80 h-24 transition-all duration-300">
                {/* Logo a color para modo claro */}
                <div className="dark:hidden block relative w-full h-full">
                  <Image
                    src="/images/logo_dsi_color.png"
                    alt="Departamento de Sistemas e Informática - UFPS"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                {/* Logo blanco para modo oscuro */}
                <div className="hidden dark:block relative w-full h-full">
                  <Image
                    src="/images/logo_dsi_white.png"
                    alt="Departamento de Sistemas e Informática - UFPS"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-content-primary mb-2">
              {publicConfig?.appName ?? "Bookly"}
            </h1>
            <p className="text-content-secondary">
              Sistema de Reservas Institucionales
            </p>
          </div>
        )}

        {/* Tarjeta de contenido */}
        <div
          className={cn(
            "bg-surface rounded-lg shadow-lg",
            "border border-line-subtle",
            "p-8",
          )}
        >
          {/* Título y descripción opcionales */}
          {(title || description) && (
            <div className="mb-6">
              {title && (
                <h2 className="text-2xl font-semibold text-content-primary mb-2">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-content-secondary">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Contenido (formulario) */}
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-content-secondary">
            © {new Date().getFullYear()} Universidad Francisco de Paula
            Santander
          </p>
        </div>
      </div>
    </div>
  );
}
