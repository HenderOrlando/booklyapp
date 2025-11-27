"use client";

import { ExportButton } from "@/components/atoms/ExportButton";
import { AreaChartCard } from "@/components/molecules/AreaChartCard";
import { ReportFilters } from "@/components/molecules/ReportFilters";
import { ScatterChartCard } from "@/components/molecules/ScatterChartCard";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar/AppSidebar";
import { PeriodComparison } from "@/components/organisms/PeriodComparison";
import { SavedFiltersPanel } from "@/components/organisms/SavedFiltersPanel";
import { MainLayout } from "@/components/templates/MainLayout";
import { useChartExport } from "@/hooks/useChartExport";
import { useReportFilters } from "@/hooks/useReportFilters";
import { useSavedFilters } from "@/hooks/useSavedFilters";

export default function ReportesAvanzadoPage() {
  const { filters, setFilters } = useReportFilters();
  const { savedFilters, saveFilter, deleteFilter, toggleFavorite, loadFilter } =
    useSavedFilters();
  const { exportChartAsPDF, exportDataWithCharts } = useChartExport();

  // Mock data for demonstrations
  const trendData = Array.from({ length: 30 }, (_, i) => ({
    name: `Día ${i + 1}`,
    actual: Math.floor(Math.random() * 50) + 20,
    anterior: Math.floor(Math.random() * 45) + 18,
  }));

  const scatterData = Array.from({ length: 50 }, (_, i) => ({
    usage: Math.floor(Math.random() * 100),
    satisfaction: Math.floor(Math.random() * 100),
    size: Math.floor(Math.random() * 50) + 10,
  }));

  const period1 = {
    label: "Mes Actual",
    data: trendData.map((d) => ({ name: d.name, value: d.actual })),
    stats: {
      total: 1234,
      average: 41.1,
      peak: 68,
    },
  };

  const period2 = {
    label: "Mes Anterior",
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
      "Reporte Avanzado de Análisis"
    );
  };

  const handleLoadFilter = (filter: any) => {
    setFilters(loadFilter(filter));
  };

  return (
    <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Análisis Avanzado
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gráficos adicionales, comparaciones y filtros guardables
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
          metric="Reservas"
        />

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div id="area-chart">
            <AreaChartCard
              data={trendData}
              xKey="name"
              yKey={["actual", "anterior"]}
              title="Tendencia con Área"
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
              title="Uso vs Satisfacción"
              color="#8b5cf6"
              height={300}
            />
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
            🎉 Nuevas Funcionalidades Disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800 dark:text-purple-200">
            <div>
              <strong>✨ Gráficos Adicionales:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Gráficos de área (apilados/no apilados)</li>
                <li>• Gráficos de dispersión (scatter)</li>
              </ul>
            </div>
            <div>
              <strong>💾 Filtros Guardables:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Guardar configuraciones de filtros</li>
                <li>• Marcar filtros como favoritos</li>
                <li>• Cargar filtros con un click</li>
              </ul>
            </div>
            <div>
              <strong>📊 Comparación de Períodos:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Comparar mes actual vs anterior</li>
                <li>• Análisis automático de cambios</li>
                <li>• Visualización de tendencias</li>
              </ul>
            </div>
            <div>
              <strong>📥 Exportación Avanzada:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Exportar con gráficos incluidos</li>
                <li>• PDF con múltiples páginas</li>
                <li>• Excel con imágenes embebidas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
