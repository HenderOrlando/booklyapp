/**
 * @deprecated Use `ReportsClient` from `@/infrastructure/api` instead.
 * This file is kept for backward compatibility with existing hooks.
 * New code should import from `@/infrastructure/api/reports-client`.
 */

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

const USAGE_REPORTS_PATH = "/api/v1/usage-reports";
const DEMAND_REPORTS_PATH = "/api/v1/demand-reports";
const USER_REPORTS_PATH = "/api/v1/user-reports";
const EXPORT_PATH = "/api/v1/reports/export";

export async function getUsageReport(
  filters?: UsageFilters,
): Promise<UsageReport> {
  const response = await httpClient.get<UsageReport>(USAGE_REPORTS_PATH, {
    params: filters,
  });
  return response.data;
}

export async function getResourceReport(
  resourceId: string,
): Promise<ResourceReport> {
  const response = await httpClient.get<ResourceReport>(
    `${USAGE_REPORTS_PATH}?resourceId=${resourceId}`,
  );
  return response.data;
}

export async function getUserReport(userId: string): Promise<UserReport> {
  const response = await httpClient.get<UserReport>(
    `${USER_REPORTS_PATH}?userId=${userId}`,
  );
  return response.data;
}

export async function getDemandReport(
  filters?: DemandFilters,
): Promise<DemandReport> {
  const response = await httpClient.get<DemandReport>(DEMAND_REPORTS_PATH, {
    params: filters,
  });
  return response.data;
}

export async function getKPIs(period?: string): Promise<KPIs> {
  const response = await httpClient.get<KPIs>(
    `${USAGE_REPORTS_PATH}/generate`,
    {
      params: { period },
    },
  );
  return response.data;
}

export async function exportReport(
  reportId: string,
  format: "csv" | "excel" | "pdf",
): Promise<Blob> {
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
