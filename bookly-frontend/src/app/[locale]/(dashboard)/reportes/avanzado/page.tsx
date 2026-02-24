"use client";

import { ExportButton } from "@/components/atoms/ExportButton";
import { DynamicAreaChartCard as AreaChartCard } from "@/components/molecules/charts-dynamic";
import { ReportFilters } from "@/components/molecules/ReportFilters";
import { DynamicScatterChartCard as ScatterChartCard } from "@/components/molecules/charts-dynamic";
import { PeriodComparison } from "@/components/organisms/PeriodComparison";
import { SavedFiltersPanel } from "@/components/organisms/SavedFiltersPanel";
import { useChartExport } from "@/hooks/useChartExport";
import { useReportFilters } from "@/hooks/useReportFilters";
import { useSavedFilters } from "@/hooks/useSavedFilters";
import { useTranslations } from "next-intl";

export default function ReportesAvanzadoPage() {
  const t = useTranslations("reports");
  const { filters, setFilters } = useReportFilters();
  const { savedFilters, saveFilter, deleteFilter, toggleFavorite, loadFilter } =
    useSavedFilters();
  const { exportChartAsPDF, exportDataWithCharts: _exportDataWithCharts } = useChartExport();

  // Mock data for demonstrations
  const trendData = Array.from({ length: 30 }, (_, i) => ({
    name: `${t("day")} ${i + 1}`,
    actual: Math.floor(Math.random() * 50) + 20,
    anterior: Math.floor(Math.random() * 45) + 18,
  }));

  const scatterData = Array.from({ length: 50 }, (_, _i) => ({
    usage: Math.floor(Math.random() * 100),
    satisfaction: Math.floor(Math.random() * 100),
    size: Math.floor(Math.random() * 50) + 10,
  }));

  const period1 = {
    label: t("current_month"),
    data: trendData.map((d) => ({ name: d.name, value: d.actual })),
    stats: {
      total: 1234,
      average: 41.1,
      peak: 68,
    },
  };

  const period2 = {
    label: t("previous_month"),
    data: trendData.map((d) => ({ name: d.name, value: d.anterior })),
    stats: {
      total: 1098,
      average: 36.6,
      peak: 62,
    },
  };

  const handleExportWithCharts = async () => {
    await exportChartAsPDF(
      ["trend-chart", "scatter-chart", "area-chart"],
      "reporte-avanzado",
      t("advanced_report_name"),
    );
  };

  const handleLoadFilter = (filter: any) => {
    setFilters(loadFilter(filter));
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
              {t("advanced_title")}
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
              {t("advanced_desc")}
            </p>
          </div>
          <ExportButton
            format="pdf"
            onExport={handleExportWithCharts}
            variant="default"
          />
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <ReportFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={[]}
              programs={[]}
              showDateRange
            />
          </div>
          <div>
            <SavedFiltersPanel
              savedFilters={savedFilters}
              onLoadFilter={handleLoadFilter}
              onSaveFilter={saveFilter}
              onDeleteFilter={deleteFilter}
              onToggleFavorite={toggleFavorite}
              currentFilters={filters}
            />
          </div>
        </div>

        {/* Period Comparison */}
        <PeriodComparison
          period1={period1}
          period2={period2}
          metric={t("reservations")}
        />

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div id="area-chart">
            <AreaChartCard
              data={trendData}
              xKey="name"
              yKey={["actual", "anterior"]}
              title={t("area_trend")}
              color={["#3b82f6", "#10b981"]}
              height={300}
              stacked
              showLegend
            />
          </div>
          <div id="scatter-chart">
            <ScatterChartCard
              data={scatterData}
              xKey="usage"
              yKey="satisfaction"
              zKey="size"
              title={t("usage_vs_satisfaction")}
              color="#8b5cf6"
              height={300}
            />
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
            🎉 {t("new_features_title")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800 dark:text-purple-200">
            <div>
              <strong>✨ {t("additional_charts")}:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• {t("area_charts_desc")}</li>
                <li>• {t("scatter_charts_desc")}</li>
              </ul>
            </div>
            <div>
              <strong>💾 {t("saveable_filters")}:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• {t("save_filters_desc")}</li>
                <li>• {t("favorite_filters_desc")}</li>
                <li>• {t("load_filters_desc")}</li>
              </ul>
            </div>
            <div>
              <strong>📊 {t("period_comparison")}:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• {t("compare_months_desc")}</li>
                <li>• {t("auto_change_analysis_desc")}</li>
                <li>• {t("trend_visualization_desc")}</li>
              </ul>
            </div>
            <div>
              <strong>📥 {t("advanced_export")}:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• {t("export_with_charts_desc")}</li>
                <li>• {t("multi_page_pdf_desc")}</li>
                <li>• {t("embedded_images_excel_desc")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
