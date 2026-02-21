/**
 * Types para Resources Service
 * Alineados con bookly-mock/apps/resources-service
 */

// Enums
export enum ResourceType {
  CLASSROOM = "CLASSROOM",
  LABORATORY = "LABORATORY",
  AUDITORIUM = "AUDITORIUM",
  MULTIMEDIA_EQUIPMENT = "MULTIMEDIA_EQUIPMENT",
  SPORTS_FACILITY = "SPORTS_FACILITY",
  MEETING_ROOM = "MEETING_ROOM",
  VEHICLE = "VEHICLE",
  OTHER = "OTHER",
}

export enum ResourceStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  MAINTENANCE = "MAINTENANCE",
  UNAVAILABLE = "UNAVAILABLE",
}

export enum ImportResourceMode {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  UPSERT = "UPSERT",
}

// Interfaces
export interface AvailabilityRules {
  requiresApproval: boolean;
  maxAdvanceBookingDays: number;
  minBookingDurationMinutes: number;
  maxBookingDurationMinutes: number;
  bufferTimeBetweenReservationsMinutes: number;
  allowRecurring: boolean;
}

export interface MaintenanceSchedule {
  nextMaintenanceDate?: string;
  lastMaintenanceDate?: string;
  maintenanceFrequencyDays?: number;
}

export interface Resource {
  id: string;
  code: string;
  name: string;
  description: string;
  type: ResourceType;
  categoryId: string;
  category?: Category;
  capacity: number;
  location: string;
  floor?: string;
  building?: string;
  attributes: Record<string, unknown>;
  programIds: string[];
  status: ResourceStatus;
  isActive: boolean;
  maintenanceSchedule?: MaintenanceSchedule;
  availabilityRules?: AvailabilityRules;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Maintenance {
  id: string;
  resourceId: string;
  resource?: Resource;
  scheduledDate: string;
  completedDate?: string;
  type: "PREVENTIVE" | "CORRECTIVE" | "EMERGENCY";
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  description: string;
  technician?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface CreateResourceDto {
  code: string;
  name: string;
  description: string;
  type: ResourceType;
  categoryId: string;
  capacity: number;
  location: string;
  floor?: string;
  building?: string;
  attributes?: Record<string, unknown>;
  programIds?: string[];
  availabilityRules?: AvailabilityRules;
}

export interface UpdateResourceDto {
  code?: string;
  name?: string;
  description?: string;
  type?: ResourceType;
  categoryId?: string;
  capacity?: number;
  location?: string;
  floor?: string;
  building?: string;
  attributes?: Record<string, unknown>;
  programIds?: string[];
  status?: ResourceStatus;
  isActive?: boolean;
  availabilityRules?: {
    requiresApproval?: boolean;
    maxAdvanceBookingDays?: number;
    minBookingDurationMinutes?: number;
    maxBookingDurationMinutes?: number;
    allowRecurring?: boolean;
  };
}

export interface SearchResourcesAdvancedDto {
  types?: ResourceType[];
  minCapacity?: number;
  maxCapacity?: number;
  categoryIds?: string[];
  programIds?: string[];
  hasEquipment?: string[];
  location?: string;
  building?: string;
  status?: ResourceStatus;
  availableOn?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ImportResourcesDto {
  csvContent: string;
  mode: ImportResourceMode;
  skipErrors: boolean;
}

export interface ImportResult {
  successCount: number;
  errorCount: number;
  updatedCount: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

export interface CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface UpdateCategoryDto {
  code?: string;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface ScheduleMaintenanceDto {
  resourceId: string;
  scheduledDate: string;
  type: "PREVENTIVE" | "CORRECTIVE" | "EMERGENCY";
  description: string;
  technician?: string;
  estimatedCost?: number;
}

// Enums para Mantenimiento
export enum MaintenanceType {
  PREVENTIVE = "PREVENTIVE",
  CORRECTIVE = "CORRECTIVE",
  EMERGENCY = "EMERGENCY",
}

export enum MaintenanceStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Programa Académico
export interface AcademicProgram {
  id: string;
  code: string;
  name: string;
  description?: string;
  faculty: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTOs para Programa Académico
export interface CreateAcademicProgramDto {
  code: string;
  name: string;
  description?: string;
  faculty: string;
  department?: string;
  isActive?: boolean;
}

export interface UpdateAcademicProgramDto {
  code?: string;
  name?: string;
  description?: string;
  faculty?: string;
  department?: string;
  isActive?: boolean;
}
