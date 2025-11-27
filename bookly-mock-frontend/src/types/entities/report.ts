/**
 * Tipos para Reports
 */

export type ReportType =
  | "USAGE"
  | "RESOURCE"
  | "USER"
  | "DEMAND"
  | "OCCUPANCY"
  | "ANALYTICS";

export type ReportFormat = "CSV" | "PDF" | "EXCEL" | "JSON";

export type TimePeriod =
  | "TODAY"
  | "WEEK"
  | "MONTH"
  | "QUARTER"
  | "YEAR"
  | "CUSTOM";

/**
 * Union type de todos los reportes
 */
export type Report =
  | UsageReport
  | ResourceReport
  | UserReport
  | DemandReport
  | OccupancyReport;

/**
 * Reporte de uso
 */
export interface UsageReport {
  id: string;
  type: "USAGE";
  period: TimePeriod;
  startDate: string;
  endDate: string;
  totalReservations: number;
  totalHours: number;
  mostUsedResources: Array<{
    resourceId: string;
    resourceName: string;
    usageCount: number;
    totalHours: number;
  }>;
  usageByDay: Array<{
    date: string;
    reservations: number;
    hours: number;
  }>;
  createdAt: string;
}

/**
 * Reporte de recurso
 */
export interface ResourceReport {
  id: string;
  type: "RESOURCE";
  resourceId: string;
  resourceName: string;
  period: TimePeriod;
  startDate: string;
  endDate: string;
  totalReservations: number;
  totalHours: number;
  occupancyRate: number; // Porcentaje 0-100
  averageSessionDuration: number; // Minutos
  peakUsageHours: Array<{
    hour: number;
    count: number;
  }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    reservationCount: number;
  }>;
  createdAt: string;
}

/**
 * Reporte de usuario
 */
export interface UserReport {
  id: string;
  type: "USER";
  userId: string;
  userName: string;
  period: TimePeriod;
  startDate: string;
  endDate: string;
  totalReservations: number;
  totalHours: number;
  cancelledReservations: number;
  noShowCount: number;
  favoriteResources: Array<{
    resourceId: string;
    resourceName: string;
    usageCount: number;
  }>;
  reservationsByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  createdAt: string;
}

/**
 * Reporte de demanda
 */
export interface DemandReport {
  id: string;
  type: "DEMAND";
  period: TimePeriod;
  startDate: string;
  endDate: string;
  totalRequests: number;
  satisfiedRequests: number;
  unsatisfiedRequests: number;
  satisfactionRate: number; // Porcentaje 0-100
  highDemandResources: Array<{
    resourceId: string;
    resourceName: string;
    requestCount: number;
    availabilityRate: number;
  }>;
  peakDemandTimes: Array<{
    dayOfWeek: string;
    hour: number;
    requestCount: number;
  }>;
  createdAt: string;
}

/**
 * Reporte de ocupación
 */
export interface OccupancyReport {
  id: string;
  type: "OCCUPANCY";
  period: TimePeriod;
  startDate: string;
  endDate: string;
  overallOccupancy: number; // Porcentaje 0-100
  resourceOccupancy: Array<{
    resourceId: string;
    resourceName: string;
    occupancyRate: number;
    totalHoursAvailable: number;
    totalHoursUsed: number;
  }>;
  occupancyByDay: Array<{
    date: string;
    occupancyRate: number;
  }>;
  createdAt: string;
}

/**
 * Dashboard Data
 */
export interface DashboardData {
  period: TimePeriod;
  startDate: string;
  endDate: string;
  kpis: {
    totalReservations: number;
    totalUsers: number;
    totalResources: number;
    averageOccupancy: number;
    satisfactionRate: number;
  };
  trends: {
    reservationsChange: number; // Porcentaje de cambio
    usersChange: number;
    occupancyChange: number;
  };
  topResources: Array<{
    id: string;
    name: string;
    reservations: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

/**
 * KPIs
 */
export interface KPIs {
  totalReservations: number;
  activeUsers: number;
  totalResources: number;
  averageOccupancy: number;
  satisfactionRate: number;
  cancelRate: number;
  noShowRate: number;
  period: TimePeriod;
  comparedToPrevious: {
    reservations: number; // % change
    users: number;
    occupancy: number;
  };
}

/**
 * Analytics
 */
export interface Analytics {
  period: string;
  metrics: {
    totalViews: number;
    totalReservations: number;
    conversionRate: number;
    averageSessionDuration: number;
  };
  userBehavior: {
    mostViewedResources: Array<{ id: string; name: string; views: number }>;
    mostReservedResources: Array<{
      id: string;
      name: string;
      reservations: number;
    }>;
    peakActivityHours: Array<{ hour: number; activity: number }>;
  };
  performance: {
    averageLoadTime: number;
    errorRate: number;
    apiResponseTime: number;
  };
}

/**
 * Filtros para reportes
 */
export interface UsageFilters {
  startDate?: string;
  endDate?: string;
  programId?: string;
  categoryId?: string;
}

export interface DemandFilters {
  startDate?: string;
  endDate?: string;
  resourceId?: string;
  categoryId?: string;
}

export interface OccupancyFilters {
  startDate?: string;
  endDate?: string;
  resourceId?: string;
  minOccupancy?: number;
  maxOccupancy?: number;
}

export interface ResourceUtilization {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  totalCapacity: number;
  usedCapacity: number;
  occupancyRate: number;
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  peakUsageTime: string;
}
