/**
 * Cliente HTTP Type-Safe para Disponibilidad (Availability Service)
 *
 * Cubre los controladores del backend:
 * - AvailabilitiesController (POST, GET, POST check, POST search, DELETE)
 * - AvailabilityExceptionsController (POST, GET, GET resource/:id, DELETE)
 * - CalendarViewController (GET view, GET month, GET week, GET day)
 * - HistoryController (GET reservation/:id, GET user/:userId, GET search, POST export, GET my-activity)
 * - MaintenanceBlocksController (POST, GET, GET resource/:id, GET active, PATCH complete, PATCH cancel)
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import { AVAILABILITY_ENDPOINTS, buildUrl } from "./endpoints";

// ============================================
// TYPES - Availabilities
// ============================================

export interface CreateAvailabilityDto {
  resourceId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
  maxConcurrentReservations?: number;
  effectiveFrom?: string;
  effectiveUntil?: string;
  notes?: string;
}

export interface AvailabilityRecord {
  id: string;
  resourceId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxConcurrentReservations: number;
  effectiveFrom?: string;
  effectiveUntil?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchAvailabilityDto {
  resourceId?: string;
  resourceTypeId?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  minCapacity?: number;
  features?: string[];
  programId?: string;
  locationId?: string;
}

export interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  resourceId: string;
  resourceName?: string;
  isAvailable: boolean;
}

// ============================================
// TYPES - Exceptions
// ============================================

export interface CreateAvailabilityExceptionDto {
  resourceId: string;
  exceptionDate: string;
  reason: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface AvailabilityException {
  id: string;
  resourceId: string;
  exceptionDate: string;
  reason: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// TYPES - Calendar View
// ============================================

export type CalendarViewType = "month" | "week" | "day";

export interface CalendarViewParams {
  view?: CalendarViewType;
  year?: number;
  month?: number;
  week?: number;
  date?: string;
  resourceId?: string;
}

export interface CalendarSlot {
  date: string;
  startTime: string;
  endTime: string;
  status: "available" | "reserved" | "pending" | "blocked" | "ownReservation";
  color: string;
  reservationId?: string;
  metadata?: Record<string, unknown>;
}

export interface CalendarViewResponse {
  view: CalendarViewType;
  period: { start: string; end: string };
  slots: CalendarSlot[];
  legend: Record<string, string>;
  resource?: { id: string };
  metadata?: {
    totalSlots: number;
    availableSlots: number;
    reservedSlots: number;
    blockedSlots: number;
    timezone: string;
    generatedAt: string;
  };
}

// ============================================
// TYPES - History
// ============================================

export interface HistoryEntry {
  id: string;
  reservationId?: string;
  userId: string;
  action: string;
  details?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface HistorySearchFilters {
  reservationId?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface HistoryExportDto {
  format: "csv" | "json";
  filters?: Omit<HistorySearchFilters, "page" | "limit">;
}

// ============================================
// TYPES - Maintenance Blocks
// ============================================

export interface CreateMaintenanceBlockDto {
  resourceId: string;
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
  notifyUsers?: boolean;
}

export interface MaintenanceBlock {
  id: string;
  resourceId: string;
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
  status: "active" | "completed" | "cancelled";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CLIENT
// ============================================

export class AvailabilityClient {
  // ──────────────────────────────────────────
  // Availabilities CRUD
  // ──────────────────────────────────────────

  static async create(data: CreateAvailabilityDto): Promise<ApiResponse<AvailabilityRecord>> {
    return httpClient.post<AvailabilityRecord>(
      AVAILABILITY_ENDPOINTS.AVAILABILITIES,
      data,
    );
  }

  static async getByResource(resourceId: string, page?: number, limit?: number): Promise<ApiResponse<AvailabilityRecord[]>> {
    return httpClient.get<AvailabilityRecord[]>(
      buildUrl(AVAILABILITY_ENDPOINTS.AVAILABILITIES_BY_RESOURCE(resourceId), { page, limit }),
    );
  }

  static async checkAvailability(resourceId: string, startDate: string, endDate: string): Promise<ApiResponse<{ available: boolean }>> {
    return httpClient.post<{ available: boolean }>(
      AVAILABILITY_ENDPOINTS.CHECK_AVAILABILITY,
      { resourceId, startDate, endDate },
    );
  }

  static async searchAvailability(filters: SearchAvailabilityDto): Promise<ApiResponse<AvailabilitySlot[]>> {
    return httpClient.post<AvailabilitySlot[]>(
      AVAILABILITY_ENDPOINTS.AVAILABILITIES_SEARCH,
      filters,
    );
  }

  static async delete(id: string): Promise<ApiResponse<{ id: string }>> {
    return httpClient.delete<{ id: string }>(
      `${AVAILABILITY_ENDPOINTS.AVAILABILITIES}/${id}`,
    );
  }

  // ──────────────────────────────────────────
  // Availability Exceptions
  // ──────────────────────────────────────────

  static async createException(data: CreateAvailabilityExceptionDto): Promise<ApiResponse<AvailabilityException>> {
    return httpClient.post<AvailabilityException>(
      AVAILABILITY_ENDPOINTS.AVAILABILITY_EXCEPTIONS,
      data,
    );
  }

  static async getExceptions(filters?: { resourceId?: string; page?: number; limit?: number }): Promise<ApiResponse<AvailabilityException[]>> {
    return httpClient.get<AvailabilityException[]>(
      buildUrl(AVAILABILITY_ENDPOINTS.AVAILABILITY_EXCEPTIONS, filters),
    );
  }

  static async getExceptionsByResource(resourceId: string): Promise<ApiResponse<AvailabilityException[]>> {
    return httpClient.get<AvailabilityException[]>(
      AVAILABILITY_ENDPOINTS.AVAILABILITY_EXCEPTIONS_BY_RESOURCE(resourceId),
    );
  }

  static async deleteException(id: string): Promise<ApiResponse<{ id: string }>> {
    return httpClient.delete<{ id: string }>(
      AVAILABILITY_ENDPOINTS.AVAILABILITY_EXCEPTION_BY_ID(id),
    );
  }

  // ──────────────────────────────────────────
  // Calendar View
  // ──────────────────────────────────────────

  static async getCalendarView(params: CalendarViewParams): Promise<ApiResponse<CalendarViewResponse>> {
    return httpClient.get<CalendarViewResponse>(
      buildUrl(AVAILABILITY_ENDPOINTS.CALENDAR_VIEW, params as Record<string, unknown>),
    );
  }

  static async getMonthView(year: number, month: number, resourceId?: string): Promise<ApiResponse<CalendarViewResponse>> {
    return httpClient.get<CalendarViewResponse>(
      buildUrl(AVAILABILITY_ENDPOINTS.CALENDAR_MONTH, { year, month, resourceId }),
    );
  }

  static async getWeekView(year: number, week: number, resourceId?: string): Promise<ApiResponse<CalendarViewResponse>> {
    return httpClient.get<CalendarViewResponse>(
      buildUrl(AVAILABILITY_ENDPOINTS.CALENDAR_WEEK, { year, week, resourceId }),
    );
  }

  static async getDayView(date: string, resourceId?: string): Promise<ApiResponse<CalendarViewResponse>> {
    return httpClient.get<CalendarViewResponse>(
      buildUrl(AVAILABILITY_ENDPOINTS.CALENDAR_DAY, { date, resourceId }),
    );
  }

  // ──────────────────────────────────────────
  // History
  // ──────────────────────────────────────────

  static async getReservationHistory(reservationId: string): Promise<ApiResponse<HistoryEntry[]>> {
    return httpClient.get<HistoryEntry[]>(
      AVAILABILITY_ENDPOINTS.HISTORY_BY_RESERVATION(reservationId),
    );
  }

  static async getUserActivity(userId: string): Promise<ApiResponse<HistoryEntry[]>> {
    return httpClient.get<HistoryEntry[]>(
      AVAILABILITY_ENDPOINTS.HISTORY_BY_USER(userId),
    );
  }

  static async searchHistory(filters: HistorySearchFilters): Promise<ApiResponse<HistoryEntry[]>> {
    return httpClient.get<HistoryEntry[]>(
      buildUrl(AVAILABILITY_ENDPOINTS.HISTORY_SEARCH, filters as Record<string, unknown>),
    );
  }

  static async exportHistory(data: HistoryExportDto): Promise<ApiResponse<{ url: string }>> {
    return httpClient.post<{ url: string }>(
      AVAILABILITY_ENDPOINTS.HISTORY_EXPORT,
      data,
    );
  }

  static async getMyActivity(): Promise<ApiResponse<HistoryEntry[]>> {
    return httpClient.get<HistoryEntry[]>(
      AVAILABILITY_ENDPOINTS.HISTORY_MY_ACTIVITY,
    );
  }

  // ──────────────────────────────────────────
  // Maintenance Blocks
  // ──────────────────────────────────────────

  static async createMaintenanceBlock(data: CreateMaintenanceBlockDto): Promise<ApiResponse<MaintenanceBlock>> {
    return httpClient.post<MaintenanceBlock>(
      AVAILABILITY_ENDPOINTS.MAINTENANCE_BLOCKS,
      data,
    );
  }

  static async getMaintenanceBlocks(filters?: { page?: number; limit?: number }): Promise<ApiResponse<MaintenanceBlock[]>> {
    return httpClient.get<MaintenanceBlock[]>(
      buildUrl(AVAILABILITY_ENDPOINTS.MAINTENANCE_BLOCKS, filters),
    );
  }

  static async getMaintenanceBlocksByResource(resourceId: string): Promise<ApiResponse<MaintenanceBlock[]>> {
    return httpClient.get<MaintenanceBlock[]>(
      AVAILABILITY_ENDPOINTS.MAINTENANCE_BLOCKS_BY_RESOURCE(resourceId),
    );
  }

  static async getActiveMaintenanceBlocks(): Promise<ApiResponse<MaintenanceBlock[]>> {
    return httpClient.get<MaintenanceBlock[]>(
      AVAILABILITY_ENDPOINTS.MAINTENANCE_BLOCKS_ACTIVE,
    );
  }

  static async completeMaintenanceBlock(id: string, notes?: string): Promise<ApiResponse<MaintenanceBlock>> {
    return httpClient.patch<MaintenanceBlock>(
      `${AVAILABILITY_ENDPOINTS.MAINTENANCE_BLOCK_BY_ID(id)}/complete`,
      { notes },
    );
  }

  static async cancelMaintenanceBlock(id: string, reason?: string): Promise<ApiResponse<MaintenanceBlock>> {
    return httpClient.patch<MaintenanceBlock>(
      `${AVAILABILITY_ENDPOINTS.MAINTENANCE_BLOCK_BY_ID(id)}/cancel`,
      { reason },
    );
  }
}
