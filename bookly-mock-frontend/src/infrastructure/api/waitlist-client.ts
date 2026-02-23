/**
 * Cliente HTTP Type-Safe para Waitlist (Lista de Espera)
 *
 * Integración con backend Bookly Availability Service via API Gateway
 * Endpoint base: /api/v1/waiting-lists
 *
 * @example
 * ```typescript
 * // Obtener lista de espera por recurso
 * const { data } = await WaitlistClient.getByResource('resource-123');
 *
 * // Obtener todas las entradas de lista de espera
 * const all = await WaitlistClient.getAll();
 * ```
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import type { WaitlistEntry, WaitlistStats } from "@/types/entities/waitlist";
import { AVAILABILITY_ENDPOINTS, buildUrl } from "./endpoints";

/**
 * Respuesta cruda del backend para una entrada de waiting-list
 * Mapea los campos del WaitingListEntity del backend
 */
export interface BackendWaitingListEntry {
  id: string;
  _id?: string;
  resourceId: string;
  userId: string;
  requestedStartDate: string;
  requestedEndDate: string;
  priority: number;
  purpose?: string;
  isActive: boolean;
  notifiedAt?: string;
  expiresAt?: string;
  convertedToReservationId?: string;
  createdAt: string;
  updatedAt: string;
  audit?: {
    createdBy: string;
    updatedBy?: string;
    cancelledBy?: string;
    cancelledAt?: string;
  };
  // Campos poblados (si el backend hace populate)
  resource?: { id: string; name: string; code?: string };
  user?: { id: string; name: string; email: string };
}

/**
 * Filtros de búsqueda para lista de espera
 */
export interface WaitlistSearchFilters {
  resourceId?: string;
  userId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Mapea la prioridad numérica del backend a la prioridad string del frontend
 */
function mapPriorityFromBackend(priority: number): WaitlistEntry["priority"] {
  if (priority >= 10) return "URGENT";
  if (priority >= 7) return "HIGH";
  if (priority >= 3) return "NORMAL";
  return "LOW";
}

/**
 * Deriva el status del frontend a partir de los campos del backend
 */
function deriveStatus(entry: BackendWaitingListEntry): WaitlistEntry["status"] {
  if (!entry.isActive && entry.audit?.cancelledBy) return "CANCELLED";
  if (entry.convertedToReservationId) return "ASSIGNED";
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) return "EXPIRED";
  if (entry.notifiedAt) return "NOTIFIED";
  return "WAITING";
}

/**
 * Mapea una entrada del backend al tipo WaitlistEntry del frontend
 */
function mapToWaitlistEntry(
  entry: BackendWaitingListEntry,
  position: number,
): WaitlistEntry {
  const startDate = new Date(entry.requestedStartDate);
  const endDate = new Date(entry.requestedEndDate);

  return {
    id: entry.id || entry._id || "",
    userId: entry.userId,
    userName: entry.user?.name || entry.userId,
    userEmail: entry.user?.email || "",
    resourceId: entry.resourceId,
    resourceName: entry.resource?.name || entry.resourceId,
    desiredDate: startDate.toISOString().split("T")[0],
    startTime: startDate.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    endTime: endDate.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    priority: mapPriorityFromBackend(entry.priority),
    status: deriveStatus(entry),
    position,
    reason: entry.purpose,
    notificationSent: !!entry.notifiedAt,
    notificationSentAt: entry.notifiedAt,
    assignedReservationId: entry.convertedToReservationId,
    expiresAt: entry.expiresAt,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

/**
 * Calcula estadísticas a partir de las entradas mapeadas
 */
function computeStats(entries: WaitlistEntry[]): WaitlistStats {
  const totalWaiting = entries.filter((e) => e.status === "WAITING").length;
  const totalNotified = entries.filter((e) => e.status === "NOTIFIED").length;
  const totalAssigned = entries.filter((e) => e.status === "ASSIGNED").length;
  const totalExpired = entries.filter((e) => e.status === "EXPIRED").length;

  const waitingEntries = entries.filter((e) => e.status === "WAITING");
  const avgWaitDays =
    waitingEntries.length > 0
      ? waitingEntries.reduce((sum, e) => {
          const days =
            (Date.now() - new Date(e.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / waitingEntries.length
      : 0;

  return {
    totalWaiting,
    totalNotified,
    totalAssigned,
    totalExpired,
    averageWaitTime: Math.round(avgWaitDays * 10) / 10,
    byPriority: {
      low: entries.filter((e) => e.priority === "LOW").length,
      normal: entries.filter((e) => e.priority === "NORMAL").length,
      high: entries.filter((e) => e.priority === "HIGH").length,
      urgent: entries.filter((e) => e.priority === "URGENT").length,
    },
  };
}

/**
 * Cliente HTTP para operaciones de lista de espera
 */
export class WaitlistClient {
  /**
   * Obtener lista de espera por recurso
   */
  static async getByResource(
    resourceId: string,
    filters?: { page?: number; limit?: number },
  ): Promise<ApiResponse<{ entries: WaitlistEntry[]; stats: WaitlistStats }>> {
    try {
      const url = buildUrl(
        `${AVAILABILITY_ENDPOINTS.WAITLIST}/resource/${resourceId}`,
        filters,
      );
      const response = await httpClient.get(url);
      const raw = response.data;

      // El backend retorna { data: { waitingLists: [...], meta: {...} } }
      // o { data: [...] } dependiendo del resultado
      const rawEntries: BackendWaitingListEntry[] =
        raw?.waitingLists || raw?.data || raw?.items || (Array.isArray(raw) ? raw : []);

      const entries = rawEntries.map((entry, idx) =>
        mapToWaitlistEntry(entry, idx + 1),
      );
      const stats = computeStats(entries);

      return {
        success: true,
        data: { entries, stats },
        meta: raw?.meta,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: { entries: [], stats: computeStats([]) },
        message:
          err?.response?.data?.message ||
          "Error al cargar lista de espera del recurso",
      };
    }
  }

  /**
   * Obtener todas las entradas de lista de espera (sin filtro de recurso)
   * Usa el endpoint base GET /waiting-lists con query params
   */
  static async getAll(
    filters?: WaitlistSearchFilters,
  ): Promise<ApiResponse<{ entries: WaitlistEntry[]; stats: WaitlistStats }>> {
    try {
      const params: Record<string, unknown> | undefined = filters
        ? { ...filters }
        : undefined;
      const url = buildUrl(AVAILABILITY_ENDPOINTS.WAITLIST, params);
      const response = await httpClient.get(url);
      const raw = response.data;

      const rawEntries: BackendWaitingListEntry[] =
        raw?.waitingLists || raw?.data || raw?.items || (Array.isArray(raw) ? raw : []);

      const entries = rawEntries.map((entry, idx) =>
        mapToWaitlistEntry(entry, idx + 1),
      );
      const stats = computeStats(entries);

      return {
        success: true,
        data: { entries, stats },
        meta: raw?.meta,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: { entries: [], stats: computeStats([]) },
        message:
          err?.response?.data?.message ||
          "Error al cargar lista de espera",
      };
    }
  }

  /**
   * Obtener una entrada específica por ID
   */
  static async getById(
    id: string,
  ): Promise<ApiResponse<WaitlistEntry | null>> {
    try {
      const response = await httpClient.get(
        AVAILABILITY_ENDPOINTS.WAITLIST_BY_ID(id),
      );
      const raw = response.data;

      if (!raw) {
        return { success: true, data: null };
      }

      const entry = mapToWaitlistEntry(raw, 0);
      return { success: true, data: entry };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: null,
        message:
          err?.response?.data?.message ||
          "Error al cargar entrada de lista de espera",
      };
    }
  }
}
