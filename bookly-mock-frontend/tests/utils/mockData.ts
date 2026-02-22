import type { Resource, Category, Maintenance } from "@/types/entities/resource";
import type { Reservation } from "@/types/entities/reservation";

export const mockResource: Resource = {
  id: "res-001",
  code: "SALA-A101",
  name: "Sala A101",
  description: "Sala de conferencias principal",
  type: "CLASSROOM" as any,
  categoryId: "cat-001",
  capacity: 30,
  location: "Edificio A, Piso 1",
  floor: "1",
  building: "Edificio A",
  attributes: { hasProjector: true, hasWhiteboard: true },
  programIds: ["prog-001"],
  status: "AVAILABLE" as any,
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-15T00:00:00Z",
};

export const mockCategory: Category = {
  id: "cat-001",
  code: "AULAS",
  name: "Aulas de Clase",
  description: "Salones regulares",
  color: "#3B82F6",
  icon: "school",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

export const mockReservation: Reservation = {
  id: "rsv-001",
  resourceId: "res-001",
  resourceName: "Sala A101",
  userId: "user-001",
  userName: "Juan Pérez",
  userEmail: "juan@ufps.edu.co",
  title: "Reunión de equipo",
  description: "Reunión semanal",
  startDate: "2026-02-20T10:00:00Z",
  endDate: "2026-02-20T11:00:00Z",
  status: "CONFIRMED",
  attendees: 10,
  createdAt: "2026-02-15T00:00:00Z",
  updatedAt: "2026-02-15T00:00:00Z",
};

export const mockMaintenance: Maintenance = {
  id: "mnt-001",
  resourceId: "res-001",
  scheduledDate: "2026-03-01T08:00:00Z",
  type: "PREVENTIVE",
  status: "SCHEDULED",
  description: "Mantenimiento preventivo trimestral",
  technician: "Carlos Técnico",
  cost: 150000,
  createdAt: "2026-02-01T00:00:00Z",
  updatedAt: "2026-02-01T00:00:00Z",
};

export const mockUser = {
  id: "user-001",
  email: "admin@ufps.edu.co",
  name: "Admin UFPS",
  roles: [{ id: "role-001", name: "ADMIN" }],
};
