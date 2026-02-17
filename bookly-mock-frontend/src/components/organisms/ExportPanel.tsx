import { ExportButton } from "@/components/atoms/ExportButton";
import { DateRangePicker } from "@/components/molecules/DateRangePicker";
import { FileDown } from "lucide-react";
import * as React from "react";

export interface ExportPanelProps {
  onExport: (format: "csv" | "excel" | "pdf", options: ExportOptions) => void;
  title?: string;
  availableFormats?: ("csv" | "excel" | "pdf")[];
  showDateRange?: boolean;
  showOptions?: boolean;
  className?: string;
}

export interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  startDate?: Date | null;
  endDate?: Date | null;
  includeCharts?: boolean;
  includeMetadata?: boolean;
}

export const ExportPanel = React.memo<ExportPanelProps>(
  ({
    onExport,
    title = "Exportar Reporte",
    availableFormats = ["csv", "excel", "pdf"],
    showDateRange = true,
    showOptions = true,
    className = "",
  }) => {
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    const [endDate, setEndDate] = React.useState<Date | null>(null);
    const [includeCharts, setIncludeCharts] = React.useState(true);
    const [includeMetadata, setIncludeMetadata] = React.useState(true);
    const [exportingFormat, setExportingFormat] = React.useState<
      "csv" | "excel" | "pdf" | null
    >(null);

    const handleExport = async (format: "csv" | "excel" | "pdf") => {
      setExportingFormat(format);
      try {
        await onExport(format, {
          format,
          startDate,
          endDate,
          includeCharts,
          includeMetadata,
        });
      } finally {
        setExportingFormat(null);
      }
    };

    return (
      <div
        className={`bg-white dark:bg-[var(--color-bg-inverse)] border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] rounded-lg p-6 ${className}`}
      >
        <div className="flex items-center gap-2 mb-6">
          <FileDown className="h-5 w-5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
            {title}
          </h3>
        </div>

        <div className="space-y-6">
          {showDateRange && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-2">
                Período de Exportación
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onRangeChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
            </div>
          )}

          {showOptions && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-3">
                Opciones de Exportación
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="rounded border-[var(--color-border-strong)] text-[var(--color-primary-base)] focus:ring-[var(--color-primary-base)]"
                  />
                  <span className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]">
                    Incluir gráficos
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                    className="rounded border-[var(--color-border-strong)] text-[var(--color-primary-base)] focus:ring-[var(--color-primary-base)]"
                  />
                  <span className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]">
                    Incluir metadatos
                  </span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-3">
              Formato de Archivo
            </label>
            <div className="flex flex-wrap gap-3">
              {availableFormats.includes("csv") && (
                <ExportButton
                  format="csv"
                  onExport={handleExport}
                  loading={exportingFormat === "csv"}
                  variant="default"
                />
              )}
              {availableFormats.includes("excel") && (
                <ExportButton
                  format="excel"
                  onExport={handleExport}
                  loading={exportingFormat === "excel"}
                  variant="default"
                />
              )}
              {availableFormats.includes("pdf") && (
                <ExportButton
                  format="pdf"
                  onExport={handleExport}
                  loading={exportingFormat === "pdf"}
                  variant="default"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ExportPanel.displayName = "ExportPanel";
