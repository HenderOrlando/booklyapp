/**
 * @deprecated Use `ReportsClient` from `@/infrastructure/api` instead.
 * This file is kept for backward compatibility with existing hooks.
 * New code should import from `@/infrastructure/api/reports-client`.
 */

import { ReportsClient } from "@/infrastructure/api/reports-client";
import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  DemandFilters,
  DemandReport,
  KPIs,
  ResourceReport,
  UsageFilters,
  UsageReport,
  UserReport,
} from "@/types/entities/report";

const EXPORT_PATH = "/api/v1/reports/export";

export async function getUsageReport(
  filters?: UsageFilters,
): Promise<UsageReport> {
  const response = await ReportsClient.getUsageReport(filters);
  return response.data;
}

export async function getResourceReport(
  resourceId: string,
): Promise<ResourceReport> {
  const response = await ReportsClient.getResourceReport(resourceId);
  return response.data;
}

export async function getUserReport(userId: string): Promise<UserReport> {
  const response = await ReportsClient.getUserReport(userId);
  return response.data;
}

export async function getDemandReport(
  filters?: DemandFilters,
): Promise<DemandReport> {
  const response = await ReportsClient.getDemandReport(filters);
  return response.data;
}

export async function getKPIs(period?: string): Promise<KPIs> {
  const response = await ReportsClient.getKPIs(period);
  return response.data;
}

export async function exportReport(
  reportId: string,
  format: "csv" | "excel" | "pdf",
): Promise<Blob> {
  if (format === "csv") {
    const response = await ReportsClient.exportToCSV(reportId);
    return response.data;
  }

  if (format === "pdf") {
    const response = await ReportsClient.exportToPDF(reportId);
    return response.data;
  }

  const response = await httpClient.post<Blob>(
    EXPORT_PATH,
    { reportId, format },
    { responseType: "blob" },
  );
  return response.data;
}

export async function downloadReport(fileUrl: string): Promise<void> {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileUrl.split("/").pop() || "report";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
