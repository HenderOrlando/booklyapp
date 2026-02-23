"use client";

import { Card, CardContent } from "@/components/atoms/Card";
import { ExportPanel } from "@/components/organisms/ExportPanel";
import { ReportFilters } from "@/components/molecules/ReportFilters";
import type { ReportFiltersState } from "@/components/molecules/ReportFilters";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import * as React from "react";

/**
 * ReportPageLayout - Template estándar para todas las páginas de reportes
 *
 * Garantiza consistencia visual, i18n, tokens de diseño,
 * filtros, exportación y estados (loading/empty/error) en todos los reportes.
 *
 * Aplica: RF-31 a RF-40, Design System tokens, BDD
 *
 * @component
 * @example
 * ```tsx
 * <ReportPageLayout
 *   title={t("users_title")}
 *   description={t("users_desc")}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   onExport={handleExport}
 *   kpis={kpiCards}
 *   loading={isLoading}
 *   error={error}
 * >
 *   <UserActivityTable data={data} />
 * </ReportPageLayout>
 * ```
 */

export interface ReportKpiCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgClass?: string;
  valueClass?: string;
}

export interface ReportPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  filters?: ReportFiltersState;
  onFiltersChange?: (filters: ReportFiltersState) => void;
  showFilters?: boolean;
  showExport?: boolean;
  onExport?: (format: "csv" | "excel" | "pdf", options: unknown) => void;
  exportTitle?: string;
  exportFormats?: ("csv" | "excel" | "pdf")[];
  exportShowDateRange?: boolean;
  exportShowOptions?: boolean;
  kpis?: ReportKpiCard[];
  kpiColumns?: 3 | 4;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  isEmpty?: boolean;
  categories?: Array<{ id: string; name: string }>;
  programs?: Array<{ id: string; name: string }>;
  className?: string;
}

export function ReportPageLayout({
  children,
  title,
  description,
  filters,
  onFiltersChange,
  showFilters = true,
  showExport = true,
  onExport,
  exportTitle,
  exportFormats = ["csv", "excel", "pdf"],
  exportShowDateRange = true,
  exportShowOptions = true,
  kpis,
  kpiColumns = 3,
  loading = false,
  error = null,
  emptyMessage = "No hay datos disponibles para los filtros seleccionados.",
  isEmpty = false,
  categories = [],
  programs = [],
  className,
}: ReportPageLayoutProps) {
  const kpiGridClass =
    kpiColumns === 4
      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      : "grid grid-cols-1 gap-4 sm:grid-cols-3";

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && kpis.length > 0 && (
        <div className={kpiGridClass}>
          {kpis.map((kpi, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "rounded-lg p-2",
                    kpi.iconBgClass ??
                      "bg-[var(--color-action-primary)]/10",
                  )}
                >
                  {kpi.icon}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      kpi.valueClass ??
                        "text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]",
                    )}
                  >
                    {kpi.value}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    {kpi.label}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Content Area: Filters + Main + Export */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          {showFilters && filters && onFiltersChange && (
            <ReportFilters
              filters={filters}
              onFiltersChange={onFiltersChange}
              categories={categories}
              programs={programs}
              showDateRange
            />
          )}

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-action-primary)] mb-4" />
                <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  Cargando datos del reporte...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {!loading && error && (
            <Card className="border-[var(--color-state-error-border)]">
              <CardContent className="flex items-center gap-3 py-6">
                <AlertTriangle className="h-5 w-5 text-[var(--color-state-error-text)]" />
                <p className="text-sm text-[var(--color-state-error-text)]">
                  {error}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && isEmpty && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {emptyMessage}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          {!loading && !error && !isEmpty && children}
        </div>

        {/* Export Panel */}
        {showExport && onExport && (
          <div>
            <ExportPanel
              onExport={onExport}
              title={exportTitle}
              availableFormats={exportFormats}
              showDateRange={exportShowDateRange}
              showOptions={exportShowOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
