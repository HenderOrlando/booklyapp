"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * MainLayout - Bookly Design System
 *
 * Layout principal de la aplicación tipo dashboard:
 * - Header superior
 * - Sidebar lateral (colapsable en mobile)
 * - Área de contenido principal
 *
 * Fondos según tokens:
 * - Fondo general app: bg.app
 * - Header: primario o neutro oscuro
 * - Sidebar: neutro oscuro
 * - Contenido: bg.surface
 */

interface MainLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function MainLayout({
  children,
  header,
  sidebar,
  className,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div
      className={cn(
        "min-h-screen bg-[var(--color-bg-app)]",
        "dark:bg-[var(--color-bg-app)]",
        className,
      )}
    >
      {/* Header */}
      {header && (
        <header
          className={cn(
            "sticky top-0 z-50 w-full",
            "border-b border-[var(--color-border-subtle)]",
            "bg-[var(--color-navigation-header-bg,var(--color-action-primary))] text-[var(--color-text-inverse)]",
          )}
        >
          <div className="flex h-16 items-center px-4">
            {/* Botón toggle sidebar en mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 lg:hidden p-2 rounded-md hover:bg-[var(--color-navigation-header-hover,var(--color-action-primary-hover))]"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {header}
          </div>
        </header>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Overlay en mobile */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-64",
                "flex flex-col",
                "border-r border-[var(--color-border-subtle)]",
                "bg-[var(--color-navigation-sidebar-bg,var(--color-bg-inverse))] text-[var(--color-text-inverse)]",
                "transition-transform duration-300",
                "lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
              )}
            >
              <div className="flex-1 overflow-y-auto p-4">{sidebar}</div>
            </aside>
          </>
        )}

        {/* Contenido principal */}
        <main
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)]",
            "transition-all duration-300",
          )}
        >
          <div className="container mx-auto p-6 min-w-0 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
