import { ExportButton } from "@/components/atoms/ExportButton";
import type { Report } from "@/types/entities/report";
import { Printer } from "lucide-react";
import * as React from "react";

/**
 * ReportViewer - Visualizador de reportes generados
 *
 * Muestra un reporte con opciones de exportación y visualización.
 *
 * @component
 * @example
 * ```tsx
 * <ReportViewer
 *   report={generatedReport}
 *   onExport={handleExport}
 * />
 * ```
 */

export interface ReportViewerProps {
  report: Report | null;
  title: string;
  description?: string;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  onPrint?: () => void;
  loading?: boolean;
  className?: string;
}

export const ReportViewer = React.memo<ReportViewerProps>(
  ({
    report,
    title,
    description,
    onExport,
    onPrint,
    loading = false,
    className = "",
  }) => {
    const [exportingFormat, setExportingFormat] = React.useState<
      "csv" | "excel" | "pdf" | null
    >(null);

    const handleExport = async (format: "csv" | "excel" | "pdf") => {
      setExportingFormat(format);
      try {
        await onExport(format);
      } finally {
        setExportingFormat(null);
      }
    };

    // Formatear fecha
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Renderizar contenido según tipo
    const renderContent = () => {
      if (loading || !report) {
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-base)] mb-4" />
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
              Generando reporte...
            </p>
          </div>
        );
      }

      // Renderizar datos del reporte
      return (
        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] rounded-lg">
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1">
                Tipo
              </p>
              <p className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                {report.type}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1">
                Generado
              </p>
              <p className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                {formatDate(report.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1">
                Período
              </p>
              <p className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                {new Date(report.startDate).toLocaleDateString("es-ES")} -{" "}
                {new Date(report.endDate).toLocaleDateString("es-ES")}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1">
                ID
              </p>
              <p className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] truncate">
                {report.id}
              </p>
            </div>
          </div>

          {/* Data Preview */}
          <div className="prose dark:prose-invert max-w-none">
            <pre className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(report, null, 2)}
            </pre>
          </div>
        </div>
      );
    };

    return (
      <div
        className={`
          bg-white dark:bg-[var(--color-bg-inverse)] 
          border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] 
          rounded-lg
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-2">
              {title}
            </h2>
            {description && (
              <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">{description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <ExportButton
              format="csv"
              onExport={handleExport}
              loading={exportingFormat === "csv"}
              variant="outline"
              size="sm"
            />
            <ExportButton
              format="excel"
              onExport={handleExport}
              loading={exportingFormat === "excel"}
              variant="outline"
              size="sm"
            />
            <ExportButton
              format="pdf"
              onExport={handleExport}
              loading={exportingFormat === "pdf"}
              variant="outline"
              size="sm"
            />

            {onPrint && (
              <button
                onClick={onPrint}
                className="
                  inline-flex items-center gap-2
                  px-3 py-1.5
                  text-sm font-medium
                  text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]
                  bg-transparent
                  border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)]
                  rounded-lg
                  hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-inverse)]
                  transition-colors
                "
                title="Imprimir"
              >
                <Printer className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </div>
    );
  }
);

ReportViewer.displayName = "ReportViewer";
