/**
 * useReportMutations - Mutations para Reportes
 *
 * Dominio: Reports (Reportes y Análisis)
 *
 * Gestiona generación y exportación de reportes del sistema
 */

import { useToast } from "@/hooks/useToast";
import { httpClient } from "@/infrastructure/http/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DTO para generar reporte
 */
export interface GenerateReportDto {
  type: "USAGE" | "USERS" | "RESOURCES" | "DEMAND" | "FEEDBACK" | "CUSTOM";
  startDate: string;
  endDate: string;
  filters?: {
    resourceIds?: string[];
    userIds?: string[];
    programIds?: string[];
    categoryIds?: string[];
    status?: string[];
  };
  groupBy?: "DAY" | "WEEK" | "MONTH" | "RESOURCE" | "USER" | "PROGRAM";
  includeCharts?: boolean;
  includeRawData?: boolean;
}

/**
 * DTO para exportar reporte
 */
export interface ExportReportDto {
  reportId: string;
  format: "PDF" | "CSV" | "EXCEL" | "JSON";
  includeCharts?: boolean;
  language?: "es" | "en";
}

/**
 * DTO para programar reporte automático
 */
export interface ScheduleReportDto {
  name: string;
  reportConfig: GenerateReportDto;
  schedule: {
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    dayOfWeek?: number; // 0-6 para semanal
    dayOfMonth?: number; // 1-31 para mensual
    time: string; // HH:mm
  };
  recipients: string[]; // Emails
  format: "PDF" | "EXCEL";
  isActive?: boolean;
}

// ============================================
// CACHE KEYS
// ============================================

export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters?: string) => [...reportKeys.lists(), { filters }] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  scheduled: ["reports", "scheduled"] as const,
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para generar un reporte
 *
 * @example
 * ```typescript
 * const generateReport = useGenerateReport();
 *
 * generateReport.mutate({
 *   type: "USAGE",
 *   startDate: "2025-01-01",
 *   endDate: "2025-12-31",
 *   filters: {
 *     resourceIds: ["resource-123"]
 *   },
 *   groupBy: "MONTH",
 *   includeCharts: true
 * }, {
 *   onSuccess: (report) => {
 *     console.log("Reporte generado:", report.id);
 *   }
 * });
 * ```
 */
export function useGenerateReport() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: GenerateReportDto) => {
      const response = await httpClient.post("/reports/generate", data);
      return response;
    },
    onSuccess: () => {
      showSuccess(
        "Reporte Generado",
        "El reporte se ha generado correctamente"
      );
      // Invalidar lista de reportes
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al generar el reporte";
      showError("Error al Generar", errorMessage);
      console.error("Error al generar reporte:", error);
    },
  });
}

/**
 * Hook para exportar un reporte
 *
 * Genera un archivo descargable del reporte
 *
 * @example
 * ```typescript
 * const exportReport = useExportReport();
 *
 * exportReport.mutate({
 *   reportId: "report-123",
 *   format: "PDF",
 *   includeCharts: true,
 *   language: "es"
 * }, {
 *   onSuccess: (file) => {
 *     // Descargar archivo
 *     const url = window.URL.createObjectURL(file);
 *     const a = document.createElement('a');
 *     a.href = url;
 *     a.download = 'reporte.pdf';
 *     a.click();
 *   }
 * });
 * ```
 */
export function useExportReport() {
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: async (data: ExportReportDto) => {
      const response = await httpClient.post(
        `/reports/${data.reportId}/export`,
        data,
        { responseType: "blob" }
      );
      return response;
    },
    onSuccess: () => {
      showSuccess("Reporte Exportado", "La descarga comenzará en breve");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al exportar el reporte";
      showError("Error al Exportar", errorMessage);
      console.error("Error al exportar reporte:", error);
    },
  });
}

/**
 * Hook para eliminar un reporte
 *
 * @example
 * ```typescript
 * const deleteReport = useDeleteReport();
 *
 * deleteReport.mutate("report-123");
 * ```
 */
export function useDeleteReport() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/reports/${id}`);
      return id;
    },
    onSuccess: (id) => {
      showSuccess("Reporte Eliminado", "El reporte se eliminó correctamente");
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al eliminar el reporte";
      showError("Error al Eliminar", errorMessage);
      console.error("Error al eliminar reporte:", error);
    },
  });
}

/**
 * Hook para programar reporte automático
 *
 * Configura generación y envío automático de reportes
 *
 * @example
 * ```typescript
 * const scheduleReport = useScheduleReport();
 *
 * scheduleReport.mutate({
 *   name: "Reporte Mensual de Uso",
 *   reportConfig: {
 *     type: "USAGE",
 *     startDate: "first_day_of_month",
 *     endDate: "last_day_of_month",
 *     groupBy: "DAY"
 *   },
 *   schedule: {
 *     frequency: "MONTHLY",
 *     dayOfMonth: 1,
 *     time: "08:00"
 *   },
 *   recipients: ["admin@bookly.com"],
 *   format: "PDF"
 * });
 * ```
 */
export function useScheduleReport() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: ScheduleReportDto) => {
      const response = await httpClient.post("/reports/schedule", data);
      return response;
    },
    onSuccess: () => {
      showSuccess(
        "Reporte Programado",
        "La programación se guardó exitosamente"
      );
      queryClient.invalidateQueries({ queryKey: reportKeys.scheduled });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al programar el reporte";
      showError("Error al Programar", errorMessage);
      console.error("Error al programar reporte:", error);
    },
  });
}

/**
 * Hook para actualizar reporte programado
 */
export function useUpdateScheduledReport() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ScheduleReportDto>;
    }) => {
      const response = await httpClient.put(`/reports/schedule/${id}`, data);
      return response;
    },
    onSuccess: () => {
      showSuccess(
        "Programación Actualizada",
        "Los cambios se guardaron correctamente"
      );
      queryClient.invalidateQueries({ queryKey: reportKeys.scheduled });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al actualizar la programación";
      showError("Error al Actualizar", errorMessage);
      console.error("Error al actualizar reporte programado:", error);
    },
  });
}

/**
 * Hook para eliminar reporte programado
 */
export function useDeleteScheduledReport() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/reports/schedule/${id}`);
      return id;
    },
    onSuccess: () => {
      showSuccess(
        "Programación Eliminada",
        "La programación se eliminó correctamente"
      );
      queryClient.invalidateQueries({ queryKey: reportKeys.scheduled });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al eliminar la programación";
      showError("Error al Eliminar", errorMessage);
      console.error("Error al eliminar reporte programado:", error);
    },
  });
}

/**
 * Hook para compartir reporte
 *
 * Envía reporte por email a usuarios específicos
 *
 * @example
 * ```typescript
 * const shareReport = useShareReport();
 *
 * shareReport.mutate({
 *   reportId: "report-123",
 *   recipients: ["user1@bookly.com", "user2@bookly.com"],
 *   format: "PDF",
 *   message: "Adjunto reporte de uso del mes"
 * });
 * ```
 */
export function useShareReport() {
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: async (data: {
      reportId: string;
      recipients: string[];
      format: "PDF" | "EXCEL";
      message?: string;
    }) => {
      const response = await httpClient.post(
        `/reports/${data.reportId}/share`,
        data
      );
      return response;
    },
    onSuccess: () => {
      showSuccess("Reporte Compartido", "El reporte se ha enviado por correo");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al compartir el reporte";
      showError("Error al Compartir", errorMessage);
      console.error("Error al compartir reporte:", error);
    },
  });
}
