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

const REPORTS_PATH = "/api/v1/reports";

export async function getUsageReport(
  filters?: UsageFilters
): Promise<UsageReport> {
  const response = await httpClient.get<UsageReport>(`${REPORTS_PATH}/usage`, {
    params: filters,
  });
  return response.data;
}

export async function getResourceReport(
  resourceId: string
): Promise<ResourceReport> {
  const response = await httpClient.get<ResourceReport>(
    `${REPORTS_PATH}/resources/${resourceId}`
  );
  return response.data;
}

export async function getUserReport(userId: string): Promise<UserReport> {
  const response = await httpClient.get<UserReport>(
    `${REPORTS_PATH}/users/${userId}`
  );
  return response.data;
}

export async function getDemandReport(
  filters?: DemandFilters
): Promise<DemandReport> {
  const response = await httpClient.get<DemandReport>(
    `${REPORTS_PATH}/demand`,
    { params: filters }
  );
  return response.data;
}

export async function getKPIs(period?: string): Promise<KPIs> {
  const response = await httpClient.get<KPIs>(`${REPORTS_PATH}/kpis`, {
    params: { period },
  });
  return response.data;
}

export async function exportReport(
  reportId: string,
  format: "csv" | "excel" | "pdf"
): Promise<Blob> {
  const response = await httpClient.post<Blob>(
    `${REPORTS_PATH}/export`,
    { reportId, format },
    { responseType: "blob" }
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
