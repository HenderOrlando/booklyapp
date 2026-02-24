import type {
  DashboardAggregatedResponse,
  DashboardData,
  DemandReport,
  KPIs,
  ResourceReport,
  ResourceUtilization,
  UsageReport,
  UserReport,
} from "@/types/entities/report";

export const mockUsageReport: UsageReport = {
  id: "usage-001",
  type: "USAGE",
  period: "MONTH",
  startDate: "2024-11-01",
  endDate: "2024-11-30",
  totalReservations: 1234,
  totalHours: 5678,
  mostUsedResources: [
    {
      resourceId: "r1",
      resourceName: "Laboratorio A",
      usageCount: 45,
      totalHours: 180,
    },
    {
      resourceId: "r2",
      resourceName: "Sala de Juntas",
      usageCount: 38,
      totalHours: 152,
    },
    {
      resourceId: "r3",
      resourceName: "Auditorio",
      usageCount: 22,
      totalHours: 132,
    },
  ],
  usageByDay: Array.from({ length: 30 }, (_, i) => ({
    date: `2024-11-${String(i + 1).padStart(2, "0")}`,
    reservations: Math.floor(Math.random() * 50) + 20,
    hours: Math.floor(Math.random() * 200) + 100,
  })),
  createdAt: new Date().toISOString(),
};

export const mockResourceReport: ResourceReport = {
  id: "resource-001",
  type: "RESOURCE",
  resourceId: "r1",
  resourceName: "Laboratorio A",
  period: "MONTH",
  startDate: "2024-11-01",
  endDate: "2024-11-30",
  totalReservations: 45,
  totalHours: 180,
  occupancyRate: 75.5,
  averageSessionDuration: 240,
  peakUsageHours: [
    { hour: 9, count: 12 },
    { hour: 14, count: 15 },
    { hour: 16, count: 10 },
  ],
  topUsers: [
    { userId: "u1", userName: "Juan Pérez", reservationCount: 8 },
    { userId: "u2", userName: "María García", reservationCount: 6 },
    { userId: "u3", userName: "Carlos López", reservationCount: 5 },
  ],
  createdAt: new Date().toISOString(),
};

export const mockUserReports: UserReport[] = [
  {
    id: "user-001",
    type: "USER",
    userId: "u1",
    userName: "Juan Pérez",
    period: "MONTH",
    startDate: "2024-11-01",
    endDate: "2024-11-30",
    totalReservations: 8,
    totalHours: 32,
    cancelledReservations: 1,
    noShowCount: 0,
    favoriteResources: [
      { resourceId: "r1", resourceName: "Laboratorio A", usageCount: 5 },
      { resourceId: "r2", resourceName: "Sala de Juntas", usageCount: 3 },
    ],
    reservationsByStatus: {
      pending: 0,
      confirmed: 2,
      completed: 6,
      cancelled: 1,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-002",
    type: "USER",
    userId: "u2",
    userName: "María García",
    period: "MONTH",
    startDate: "2024-11-01",
    endDate: "2024-11-30",
    totalReservations: 12,
    totalHours: 48,
    cancelledReservations: 2,
    noShowCount: 1,
    favoriteResources: [
      { resourceId: "r3", resourceName: "Auditorio", usageCount: 7 },
      { resourceId: "r1", resourceName: "Laboratorio A", usageCount: 5 },
    ],
    reservationsByStatus: {
      pending: 1,
      confirmed: 3,
      completed: 8,
      cancelled: 2,
    },
    createdAt: new Date().toISOString(),
  },
];

export const mockDemandReport: DemandReport = {
  id: "demand-001",
  type: "DEMAND",
  period: "MONTH",
  startDate: "2024-11-01",
  endDate: "2024-11-30",
  totalRequests: 1500,
  satisfiedRequests: 1234,
  unsatisfiedRequests: 266,
  satisfactionRate: 82.3,
  highDemandResources: [
    {
      resourceId: "r1",
      resourceName: "Laboratorio A",
      requestCount: 120,
      availabilityRate: 65,
    },
    {
      resourceId: "r2",
      resourceName: "Sala de Juntas",
      requestCount: 98,
      availabilityRate: 72,
    },
    {
      resourceId: "r3",
      resourceName: "Auditorio",
      requestCount: 85,
      availabilityRate: 58,
    },
  ],
  peakDemandTimes: [
    { dayOfWeek: "Lunes", hour: 9, requestCount: 45 },
    { dayOfWeek: "Martes", hour: 14, requestCount: 52 },
    { dayOfWeek: "Miércoles", hour: 10, requestCount: 48 },
  ],
  createdAt: new Date().toISOString(),
};

export const mockKPIs: KPIs = {
  totalReservations: 1234,
  activeUsers: 456,
  totalResources: 78,
  averageOccupancy: 68.5,
  satisfactionRate: 92.3,
  cancelRate: 5.2,
  noShowRate: 2.1,
  period: "MONTH",
  comparedToPrevious: {
    reservations: 12.5,
    users: 8.3,
    occupancy: 3.2,
  },
};

// Alias para compatibilidad con dashboard
export const mockKPIsWithTotalUsers = {
  totalReservations: mockKPIs.totalReservations,
  totalUsers: mockKPIs.activeUsers,
  totalResources: mockKPIs.totalResources,
  averageOccupancy: mockKPIs.averageOccupancy,
  satisfactionRate: mockKPIs.satisfactionRate,
};

export const mockDashboardData: DashboardData = {
  period: "MONTH",
  startDate: "2024-11-01",
  endDate: "2024-11-30",
  kpis: mockKPIsWithTotalUsers,
  trends: {
    reservationsChange: 12.5,
    usersChange: 8.3,
    occupancyChange: 3.2,
  },
  topResources: [
    { id: "r1", name: "Laboratorio A", reservations: 45 },
    { id: "r2", name: "Sala de Juntas", reservations: 38 },
    { id: "r3", name: "Auditorio", reservations: 22 },
  ],
  recentActivity: [
    {
      id: "1",
      type: "Reserva",
      description: "Juan Pérez reservó Laboratorio A",
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      type: "Cancelación",
      description: "María García canceló Sala de Juntas",
      timestamp: new Date().toISOString(),
    },
    {
      id: "3",
      type: "Aprobación",
      description: "Se aprobó reserva de Auditorio",
      timestamp: new Date().toISOString(),
    },
  ],
};

export const mockDashboardAggregatedResponse: DashboardAggregatedResponse = {
  generatedAt: new Date().toISOString(),
  filters: {
    from: "2024-11-01T00:00:00.000Z",
    to: "2024-11-30T23:59:59.999Z",
    period: "month",
    tz: "America/Bogota",
    include: [
      "kpis",
      "summary",
      "trend",
      "activity",
      "recentReservations",
      "topResources",
    ],
  },
  refresh: {
    intervalSeconds: 15,
    websocketEvent: "dashboard:metrics:updated",
  },
  kpis: {
    totalReservations: mockKPIs.totalReservations,
    activeReservations: 198,
    pendingApprovals: 24,
    totalResources: mockKPIs.totalResources,
    availableResources: 42,
    utilizationRate: mockKPIs.averageOccupancy,
    satisfactionRate: mockKPIs.satisfactionRate,
    delta: {
      totalReservationsPct: mockKPIs.comparedToPrevious.reservations,
      activeReservationsPct: 7.5,
      pendingApprovalsPct: -4.2,
      utilizationRatePct: mockKPIs.comparedToPrevious.occupancy,
      satisfactionRatePct: 2.1,
    },
  },
  reservationSummary: {
    total: mockKPIs.totalReservations,
    pending: 24,
    confirmed: 362,
    cancelled: 64,
    completed: 784,
  },
  trend: Array.from({ length: 30 }, (_, index) => ({
    date: `2024-11-${String(index + 1).padStart(2, "0")}`,
    reservations: Math.max(12, Math.round(20 + Math.sin(index / 4) * 10)),
    utilizationRate: Number((55 + Math.cos(index / 5) * 12).toFixed(2)),
  })),
  recentActivity: [
    {
      id: "activity-1",
      type: "reservation.confirmed",
      title: "Reserva confirmada",
      description: "Juan Pérez reservó Laboratorio A",
      at: new Date().toISOString(),
      source: "availability-service",
      metadata: {
        reservationId: "res-001",
        userName: "Juan Pérez",
        resourceName: "Laboratorio A",
      },
    },
    {
      id: "activity-2",
      type: "reservation.cancelled",
      title: "Reserva cancelada",
      description: "María García canceló Sala de Juntas",
      at: new Date(Date.now() - 3600000).toISOString(),
      source: "availability-service",
      metadata: {
        reservationId: "res-002",
        userName: "María García",
        resourceName: "Sala de Juntas",
      },
    },
  ],
  recentReservations: [
    {
      id: "reservation-1",
      reservationId: "reservation-1",
      resourceId: "r1",
      resourceName: "Laboratorio A",
      userId: "u1",
      status: "CONFIRMED",
      startAt: "2024-11-30T10:00:00.000Z",
      endAt: "2024-11-30T12:00:00.000Z",
      createdAt: "2024-11-29T08:00:00.000Z",
    },
    {
      id: "reservation-2",
      reservationId: "reservation-2",
      resourceId: "r2",
      resourceName: "Sala de Juntas",
      userId: "u2",
      status: "PENDING",
      startAt: "2024-11-30T14:00:00.000Z",
      endAt: "2024-11-30T15:00:00.000Z",
      createdAt: "2024-11-29T09:00:00.000Z",
    },
  ],
  topResources: [
    {
      resourceId: "r1",
      name: "Laboratorio A",
      type: "LABORATORY",
      reservations: 45,
      utilizationRate: 84.2,
      hoursUsed: 180,
      share: 36.4,
    },
    {
      resourceId: "r2",
      name: "Sala de Juntas",
      type: "ROOM",
      reservations: 38,
      utilizationRate: 71.8,
      hoursUsed: 152,
      share: 30.8,
    },
  ],
  access: {
    canViewFullOccupancy: true,
    maskedSections: [],
  },
};

export const mockResourceUtilization: ResourceUtilization[] = [
  {
    resourceId: "r1",
    resourceName: "Laboratorio A",
    resourceType: "Laboratorio",
    totalCapacity: 240,
    usedCapacity: 180,
    occupancyRate: 75,
    totalRequests: 120,
    approvedRequests: 90,
    rejectedRequests: 20,
    cancelledRequests: 10,
    peakUsageTime: "morning",
  },
  {
    resourceId: "r2",
    resourceName: "Sala de Juntas",
    resourceType: "Sala",
    totalCapacity: 200,
    usedCapacity: 152,
    occupancyRate: 76,
    totalRequests: 98,
    approvedRequests: 75,
    rejectedRequests: 15,
    cancelledRequests: 8,
    peakUsageTime: "afternoon",
  },
];

export const mockDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));
