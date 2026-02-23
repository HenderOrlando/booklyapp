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
import { Input } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * ListLayout - Bookly Design System
 *
 * Layout para páginas de listado (recursos, reservas, usuarios)
 * Incluye: breadcrumbs, título, filtros, búsqueda, botones de acción
 *
 * Características:
 * - Breadcrumbs de navegación
 * - Barra de título con badge
 * - Barra de acciones (búsqueda, filtros, crear)
 * - Grid responsive para contenido
 * - Paginación opcional
 */

interface ListLayoutProps {
  children: React.ReactNode;
  title: string;
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
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  onCreate?: () => void;
  createLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function ListLayout({
  children,
  title,
  badge,
  breadcrumbs,
  onSearch,
  onFilter,
  onCreate,
  createLabel = "Crear Nuevo",
  actions,
  className,
}: ListLayoutProps) {
  const [searchValue, setSearchValue] = React.useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
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

      {/* Título y Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-content-primary">
            {title}
          </h1>
          {badge && (
            <Badge variant={badge.variant || "default"}>{badge.text}</Badge>
          )}
        </div>

        {/* Botón de crear */}
        {onCreate && (
          <Button onClick={onCreate}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {createLabel}
          </Button>
        )}
      </div>

      {/* Barra de acciones (Búsqueda y Filtros) */}
      {(onSearch || onFilter || actions) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Búsqueda */}
          {onSearch && (
            <div className="w-full sm:w-96">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <Input
                  placeholder="Buscar..."
                  value={searchValue}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Filtros y acciones personalizadas */}
          <div className="flex gap-2 flex-wrap">
            {onFilter && (
              <Button variant="outline" onClick={onFilter}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filtros
              </Button>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Contenido (Grid de tarjetas o tabla) */}
      <div>{children}</div>
    </div>
  );
}
