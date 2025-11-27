"use client";

import { Badge } from "@/components/atoms/Badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/atoms/Breadcrumb";
import { Button } from "@/components/atoms/Button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/Tabs";
import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * DetailLayout - Bookly Design System
 *
 * Layout para páginas de detalle (recurso, reserva, usuario)
 * Incluye: breadcrumbs, header con título y badge, tabs, acciones
 *
 * Características:
 * - Breadcrumbs de navegación
 * - Header con título, badge y acciones
 * - Tabs para secciones (Detalles, Historial, etc.)
 * - Panel lateral opcional para info rápida
 * - Responsive
 */

interface DetailLayoutProps {
  children?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?:
      | "default"
      | "success"
      | "warning"
      | "error"
      | "primary"
      | "secondary";
  };
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  tabs?: Array<{
    value: string;
    label: string;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function DetailLayout({
  children,
  title,
  subtitle,
  badge,
  breadcrumbs,
  tabs,
  defaultTab,
  actions,
  sidebar,
  onBack,
  onEdit,
  onDelete,
  className,
}: DetailLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index < breadcrumbs.length - 1 ? (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink href={crumb.href || "#"}>
                        {crumb.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          {/* Botón volver */}
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-2 -ml-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver
            </Button>
          )}

          {/* Título y Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {title}
            </h1>
            {badge && (
              <Badge variant={badge.variant || "default"}>{badge.text}</Badge>
            )}
          </div>

          {/* Subtítulo */}
          {subtitle && (
            <p className="text-[var(--color-text-secondary)] mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Eliminar
            </Button>
          )}
          {actions}
        </div>
      </div>

      {/* Contenido con sidebar opcional */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contenido principal */}
        <div className={cn(sidebar ? "lg:col-span-2" : "lg:col-span-3")}>
          {tabs && tabs.length > 0 ? (
            <Tabs defaultValue={defaultTab || tabs[0].value}>
              <TabsList className="mb-4">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            children
          )}
        </div>

        {/* Sidebar */}
        {sidebar && <div className="lg:col-span-1">{sidebar}</div>}
      </div>
    </div>
  );
}
