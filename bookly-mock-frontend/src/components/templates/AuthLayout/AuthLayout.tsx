"use client";

import { cn } from "@/lib/utils";
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
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center",
        "bg-gradient-to-br from-brand-primary-50 to-brand-secondary-50",
        "dark:from-slate-900 dark:to-slate-800",
        "p-4",
        className
      )}
    >
      <div className="w-full max-w-md">
        {/* Logo y Branding */}
        {showLogo && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary-500 text-white mb-4">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              Bookly
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Sistema de Reservas Institucionales
            </p>
          </div>
        )}

        {/* Tarjeta de contenido */}
        <div
          className={cn(
            "bg-[var(--color-bg-surface)] rounded-lg shadow-lg",
            "border border-[var(--color-border-subtle)]",
            "p-8"
          )}
        >
          {/* Título y descripción opcionales */}
          {(title || description) && (
            <div className="mb-6">
              {title && (
                <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-[var(--color-text-secondary)]">
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
          <p className="text-sm text-[var(--color-text-secondary)]">
            © {new Date().getFullYear()} Universidad Francisco de Paula
            Santander
          </p>
        </div>
      </div>
    </div>
  );
}
