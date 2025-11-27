import type {
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
