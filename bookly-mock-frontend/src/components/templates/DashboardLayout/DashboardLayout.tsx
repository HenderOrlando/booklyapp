"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * DashboardLayout - Bookly Design System
 *
 * Layout especializado para dashboards con KPIs
 * Incluye grid para tarjetas de métricas y secciones de contenido
 *
 * Características:
 * - Grid responsive para KPIs
 * - Secciones de contenido flexibles
 * - Estados de carga con Skeleton
 * - Tokens de color aplicados
 */

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  description,
  icon,
  trend,
  loading,
  className,
}: KPICardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-content-secondary">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-content-secondary">{icon}</div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-content-primary">
          {value}
        </div>
        {description && (
          <p className="text-xs text-content-secondary mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div
            className={cn(
              "flex items-center text-xs mt-2",
              trend.isPositive
                ? "text-state-success-700 dark:text-state-success-200"
                : "text-state-error-700 dark:text-state-error-200"
            )}
          >
            <svg
              className={cn(
                "w-4 h-4 mr-1",
                trend.isPositive ? "" : "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <span>{Math.abs(trend.value)}% desde el mes pasado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  kpis?: React.ReactNode;
  className?: string;
}

export function DashboardLayout({
  children,
  kpis,
  className,
}: DashboardLayoutProps) {
  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* KPIs Grid */}
      {kpis && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{kpis}</div>
      )}

      {/* Contenido principal */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
