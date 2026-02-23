"use client";

import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * MainLayout - Bookly Design System
 *
 * Layout principal de la aplicación tipo dashboard:
 * - Header superior (por defecto AppHeader)
 * - Sidebar lateral (por defecto AppSidebar, colapsable en mobile)
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
  header = <AppHeader />,
  sidebar = <AppSidebar />,
  className,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div
      className={cn(
        "min-h-screen bg-app",
        "dark:bg-app",
        className,
      )}
    >
      {/* Header */}
      {header && (
        <header
          className={cn(
            "sticky top-0 z-50 w-full",
            "border-b border-line-subtle",
            "bg-action-primary text-content-inverse",
          )}
        >
          <div className="flex h-16 items-center px-4">
            {/* Botón toggle sidebar en mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 lg:hidden p-2 rounded-md hover:bg-action-primary-hover"
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
                "border-r border-line-subtle",
                "bg-inverse text-content-inverse",
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
            "flex-1 min-w-0 min-h-[calc(100vh-4rem)]",
            "transition-all duration-300",
          )}
        >
          <div className="w-full p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
