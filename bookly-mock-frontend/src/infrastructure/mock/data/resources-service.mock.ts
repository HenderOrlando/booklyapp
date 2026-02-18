/**
 * Datos Mock para Resources Service
 * Alineados con bookly-mock/apps/resources-service
 */

import {
  AcademicProgram,
  Category,
  Maintenance,
  Resource,
  ResourceStatus,
  ResourceType,
} from "@/types/entities/resource";

// ============================================
// CATEGORIES
// ============================================

export const mockCategories: Category[] = [
  {
    id: "cat_001",
    code: "CLASSROOM",
    name: "Salones de Clase",
    description: "Aulas para clases magistrales y seminarios",
    color: "#3B82F6",
    icon: "classroom",
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "cat_002",
    code: "LABORATORY",
    name: "Laboratorios",
    description: "Laboratorios especializados para prácticas",
    color: "#10B981",
    icon: "science",
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "cat_003",
    code: "AUDITORIUM",
    name: "Auditorios",
    description: "Espacios para eventos masivos",
    color: "#8B5CF6",
    icon: "theater",
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "cat_004",
    code: "CONFERENCE",
    name: "Salas de Conferencias",
    description: "Salas para reuniones y videoconferencias",
    color: "#F59E0B",
    icon: "meeting_room",
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "cat_005",
    code: "SPORTS",
    name: "Instalaciones Deportivas",
    description: "Canchas y espacios deportivos",
    color: "#EF4444",
    icon: "sports",
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
];

// ============================================
// RESOURCES
// ============================================

export const mockResources: Resource[] = [
  {
    id: "res_001",
    code: "AULA-101",
    name: "Aula 101",
    description: "Salón de clases con capacidad para 40 estudiantes",
    type: ResourceType.CLASSROOM,
    categoryId: "cat_001",
    capacity: 40,
    location: "Edificio A - Piso 1",
    floor: "1",
    building: "Edificio A",
    attributes: {
      hasProjector: true,
      hasAirConditioning: true,
      hasWhiteboard: true,
      hasComputers: false,
    },
    programIds: ["prog_001", "prog_002", "prog_003", "prog_004", "prog_005"],
    status: ResourceStatus.AVAILABLE,
    isActive: true,
    availabilityRules: {
      requiresApproval: false,
      maxAdvanceBookingDays: 30,
      minBookingDurationMinutes: 60,
      maxBookingDurationMinutes: 240,
      bufferTimeBetweenReservationsMinutes: 15,
      allowRecurring: true,
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "res_002",
    code: "LAB-SIS-201",
    name: "Laboratorio de Sistemas 201",
    description: "Laboratorio equipado con 30 computadores de alto rendimiento",
    type: ResourceType.LABORATORY,
    categoryId: "cat_002",
    capacity: 30,
    location: "Edificio B - Piso 2",
    floor: "2",
    building: "Edificio B",
    attributes: {
      hasProjector: true,
      hasAirConditioning: true,
      hasWhiteboard: true,
      hasComputers: true,
      computerCount: 30,
      software: ["VS Code", "IntelliJ", "Docker", "MySQL"],
    },
    programIds: ["prog_001", "prog_003", "prog_005"],
    status: ResourceStatus.AVAILABLE,
    isActive: true,
    availabilityRules: {
      requiresApproval: true,
      maxAdvanceBookingDays: 60,
      minBookingDurationMinutes: 120,
      maxBookingDurationMinutes: 480,
      bufferTimeBetweenReservationsMinutes: 15,
      allowRecurring: true,
    },
    maintenanceSchedule: {
      nextMaintenanceDate: "2024-12-15T08:00:00Z",
      lastMaintenanceDate: "2024-11-15T08:00:00Z",
      maintenanceFrequencyDays: 30,
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "res_003",
    code: "AUD-PRINCIPAL",
    name: "Auditorio Principal",
    description: "Auditorio principal con capacidad para 500 personas",
    type: ResourceType.AUDITORIUM,
    categoryId: "cat_003",
    capacity: 500,
    location: "Edificio Central - Planta Baja",
    floor: "PB",
    building: "Edificio Central",
    attributes: {
      hasProjector: true,
      hasAirConditioning: true,
      hasSoundSystem: true,
      hasStage: true,
      hasRecordingEquipment: true,
    },
    programIds: ["prog_004"],
    status: ResourceStatus.AVAILABLE,
    isActive: true,
    availabilityRules: {
      requiresApproval: true,
      maxAdvanceBookingDays: 90,
      minBookingDurationMinutes: 120,
      maxBookingDurationMinutes: 480,
      bufferTimeBetweenReservationsMinutes: 30,
      allowRecurring: false,
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "res_004",
    code: "SALA-CONF-A",
    name: "Sala de Conferencias A",
    description: "Sala para videoconferencias con capacidad para 20 personas",
    type: ResourceType.CONFERENCE_ROOM,
    categoryId: "cat_004",
    capacity: 20,
    location: "Edificio Administrativo - Piso 3",
    floor: "3",
    building: "Edificio Administrativo",
    attributes: {
      hasProjector: true,
      hasAirConditioning: true,
      hasWhiteboard: true,
      hasVideoConference: true,
      hasRecordingEquipment: false,
    },
    programIds: [],
    status: ResourceStatus.AVAILABLE,
    isActive: true,
    availabilityRules: {
      requiresApproval: false,
      maxAdvanceBookingDays: 15,
      minBookingDurationMinutes: 60,
      maxBookingDurationMinutes: 240,
      bufferTimeBetweenReservationsMinutes: 10,
      allowRecurring: true,
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "res_005",
    code: "CANCHA-FUTBOL",
    name: "Cancha de Fútbol",
    description: "Cancha de fútbol sintético",
    type: ResourceType.SPORTS_FIELD,
    categoryId: "cat_005",
    capacity: 22,
    location: "Zona Deportiva",
    floor: "Exterior",
    building: "N/A",
    attributes: {
      surfaceType: "synthetic",
      hasLighting: true,
      hasBleachers: true,
      hasLocker: true,
    },
    programIds: [],
    status: ResourceStatus.AVAILABLE,
    isActive: true,
    availabilityRules: {
      requiresApproval: true,
      maxAdvanceBookingDays: 7,
      minBookingDurationMinutes: 90,
      maxBookingDurationMinutes: 180,
      bufferTimeBetweenReservationsMinutes: 15,
      allowRecurring: true,
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "res_006",
    code: "LAB-FISICA",
    name: "Laboratorio de Física",
    description: "Laboratorio para experimentos de física",
    type: ResourceType.LABORATORY,
    categoryId: "cat_002",
    capacity: 25,
    location: "Edificio C - Piso 1",
    floor: "1",
    building: "Edificio C",
    attributes: {
      hasProjector: false,
      hasAirConditioning: true,
      hasWhiteboard: true,
      hasComputers: false,
      equipment: ["Osciloscopio", "Multímetro", "Balanza analítica"],
    },
    programIds: ["prog_001", "prog_002"],
    status: ResourceStatus.MAINTENANCE,
    isActive: true,
    maintenanceSchedule: {
      nextMaintenanceDate: "2024-12-01T08:00:00Z",
      lastMaintenanceDate: "2024-11-20T08:00:00Z",
      maintenanceFrequencyDays: 15,
    },
    availabilityRules: {
      requiresApproval: true,
      maxAdvanceBookingDays: 45,
      minBookingDurationMinutes: 120,
      maxBookingDurationMinutes: 360,
      bufferTimeBetweenReservationsMinutes: 20,
      allowRecurring: true,
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
  },
  {
    id: "res_007",
    code: "AULA-202",
    name: "Aula 202",
    description: "Salón de clases estándar",
    type: ResourceType.CLASSROOM,
    categoryId: "cat_001",
    capacity: 35,
    location: "Edificio A - Piso 2",
    floor: "2",
    building: "Edificio A",
    attributes: {
      hasProjector: true,
      hasAirConditioning: false,
      hasWhiteboard: true,
      hasComputers: false,
    },
    programIds: ["prog_001"],
    status: ResourceStatus.RESERVED,
    isActive: true,
    availabilityRules: {
      requiresApproval: false,
      maxAdvanceBookingDays: 30,
      minBookingDurationMinutes: 60,
      maxBookingDurationMinutes: 240,
      bufferTimeBetweenReservationsMinutes: 15,
      allowRecurring: true,
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "res_008",
    code: "SALA-CONF-B",
    name: "Sala de Conferencias B",
    description: "Sala pequeña para reuniones",
    type: ResourceType.CONFERENCE_ROOM,
    categoryId: "cat_004",
    capacity: 10,
    location: "Edificio Administrativo - Piso 2",
    floor: "2",
    building: "Edificio Administrativo",
    attributes: {
      hasProjector: false,
      hasAirConditioning: true,
      hasWhiteboard: true,
      hasVideoConference: false,
    },
    programIds: ["prog_002"],
    status: ResourceStatus.UNAVAILABLE,
    isActive: false,
    availabilityRules: {
      requiresApproval: false,
      maxAdvanceBookingDays: 15,
      minBookingDurationMinutes: 30,
      maxBookingDurationMinutes: 180,
      bufferTimeBetweenReservationsMinutes: 10,
      allowRecurring: false,
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-11-18T10:00:00Z",
  },
];

// ============================================
// MAINTENANCES
// ============================================

export const mockMaintenances: Maintenance[] = [
  {
    id: "maint_001",
    resourceId: "res_002",
    scheduledDate: "2024-12-15T08:00:00Z",
    type: "PREVENTIVE",
    status: "SCHEDULED",
    description: "Mantenimiento preventivo de equipos de cómputo",
    technician: "Juan Pérez",
    cost: 500000,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "maint_002",
    resourceId: "res_006",
    scheduledDate: "2024-11-20T08:00:00Z",
    completedDate: "2024-11-20T14:00:00Z",
    type: "CORRECTIVE",
    status: "COMPLETED",
    description: "Reparación de equipo de laboratorio dañado",
    technician: "María García",
    cost: 350000,
    notes: "Se reemplazó el osciloscopio defectuoso",
    createdAt: "2024-11-18T10:00:00Z",
    updatedAt: "2024-11-20T14:00:00Z",
  },
  {
    id: "maint_003",
    resourceId: "res_003",
    scheduledDate: "2024-12-01T09:00:00Z",
    type: "PREVENTIVE",
    status: "SCHEDULED",
    description: "Revisión sistema de sonido y proyección",
    technician: "Carlos Rodríguez",
    createdAt: "2024-11-15T10:00:00Z",
    updatedAt: "2024-11-15T10:00:00Z",
  },
];

// ============================================
// ACADEMIC PROGRAMS
// ============================================

export const mockAcademicPrograms: AcademicProgram[] = [
  {
    id: "prog_001",
    code: "ING-SIST",
    name: "Ingeniería de Sistemas",
    description: "Programa de pregrado en Ingeniería de Sistemas",
    faculty: "Facultad de Ingeniería",
    department: "Departamento de Sistemas e Informática",
    isActive: true,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "prog_002",
    code: "ING-ELEC",
    name: "Ingeniería Electrónica",
    description: "Programa de pregrado en Ingeniería Electrónica",
    faculty: "Facultad de Ingeniería",
    department: "Departamento de Electricidad y Electrónica",
    isActive: true,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "prog_003",
    code: "ING-CIVIL",
    name: "Ingeniería Civil",
    description: "Programa de pregrado en Ingeniería Civil",
    faculty: "Facultad de Ingeniería",
    department: "Departamento de Construcción",
    isActive: true,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "prog_004",
    code: "ADM-EMP",
    name: "Administración de Empresas",
    description: "Programa de pregrado en Administración",
    faculty: "Facultad de Ciencias Empresariales",
    department: "Departamento de Administración",
    isActive: true,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "prog_005",
    code: "CONT-PUB",
    name: "Contaduría Pública",
    description: "Programa de pregrado en Contaduría",
    faculty: "Facultad de Ciencias Empresariales",
    department: "Departamento de Contabilidad",
    isActive: true,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "prog_006",
    code: "DERECHO",
    name: "Derecho",
    description: "Programa de pregrado en Derecho",
    faculty: "Facultad de Ciencias Jurídicas",
    department: "Departamento de Derecho Público",
    isActive: true,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
];

// ============================================
// PROGRAM-RESOURCE ASSOCIATIONS
// ============================================

export interface ProgramResourceAssociation {
  programId: string;
  resourceId: string;
  priority: number; // 1-5, siendo 5 la más alta
  notes?: string;
  createdAt: string;
}

export const mockProgramResourceAssociations: ProgramResourceAssociation[] = [
  // Ingeniería de Sistemas
  {
    programId: "prog_001",
    resourceId: "res_006",
    priority: 5,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    programId: "prog_001",
    resourceId: "res_007",
    priority: 5,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    programId: "prog_001",
    resourceId: "res_001",
    priority: 4,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    programId: "prog_001",
    resourceId: "res_002",
    priority: 3,
    createdAt: "2024-01-15T10:00:00Z",
  },

  // Ingeniería Electrónica
  {
    programId: "prog_002",
    resourceId: "res_006",
    priority: 5,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    programId: "prog_002",
    resourceId: "res_008",
    priority: 5,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    programId: "prog_002",
    resourceId: "res_001",
    priority: 3,
    createdAt: "2024-01-15T10:00:00Z",
  },

  // Ingeniería Civil
  {
    programId: "prog_003",
    resourceId: "res_001",
    priority: 4,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    programId: "prog_003",
    resourceId: "res_002",
    priority: 4,
    createdAt: "2024-01-15T10:00:00Z",
  },

  // Administración
  {
    programId: "prog_004",
    resourceId: "res_001",
    priority: 5,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    programId: "prog_004",
    resourceId: "res_003",
    priority: 4,
    createdAt: "2024-01-15T10:00:00Z",
  },

  // Contaduría
  {
    programId: "prog_005",
    resourceId: "res_001",
    priority: 4,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    programId: "prog_005",
    resourceId: "res_002",
    priority: 3,
    createdAt: "2024-01-15T10:00:00Z",
  },
];

// ============================================
// PROGRAM-USER ASSOCIATIONS
// ============================================

export interface ProgramUserAssociation {
  programId: string;
  userId: string;
  role: "STUDENT" | "PROFESSOR" | "COORDINATOR";
  enrollmentDate: string;
}

export const mockProgramUserAssociations: ProgramUserAssociation[] = [
  // Ingeniería de Sistemas
  {
    programId: "prog_001",
    userId: "user_001",
    role: "COORDINATOR",
    enrollmentDate: "2024-01-01T00:00:00Z",
  },
  {
    programId: "prog_001",
    userId: "user_002",
    role: "PROFESSOR",
    enrollmentDate: "2024-01-01T00:00:00Z",
  },
  {
    programId: "prog_001",
    userId: "user_003",
    role: "PROFESSOR",
    enrollmentDate: "2024-01-01T00:00:00Z",
  },
  {
    programId: "prog_001",
    userId: "user_004",
    role: "STUDENT",
    enrollmentDate: "2024-02-01T00:00:00Z",
  },
  {
    programId: "prog_001",
    userId: "user_005",
    role: "STUDENT",
    enrollmentDate: "2024-02-01T00:00:00Z",
  },

  // Ingeniería Electrónica
  {
    programId: "prog_002",
    userId: "user_006",
    role: "COORDINATOR",
    enrollmentDate: "2024-01-01T00:00:00Z",
  },
  {
    programId: "prog_002",
    userId: "user_007",
    role: "PROFESSOR",
    enrollmentDate: "2024-01-01T00:00:00Z",
  },
  {
    programId: "prog_002",
    userId: "user_008",
    role: "STUDENT",
    enrollmentDate: "2024-02-01T00:00:00Z",
  },
];

// ============================================
// MOCK USERS (Simple)
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const mockUsers: User[] = [
  {
    id: "user_001",
    name: "Dr. Carlos Rodríguez",
    email: "carlos.rodriguez@ufps.edu.co",
    role: "Coordinador",
  },
  {
    id: "user_002",
    name: "Dra. María González",
    email: "maria.gonzalez@ufps.edu.co",
    role: "Profesor",
  },
  {
    id: "user_003",
    name: "Ing. Juan Pérez",
    email: "juan.perez@ufps.edu.co",
    role: "Profesor",
  },
  {
    id: "user_004",
    name: "Ana Martínez",
    email: "ana.martinez@est.ufps.edu.co",
    role: "Estudiante",
  },
  {
    id: "user_005",
    name: "Luis Hernández",
    email: "luis.hernandez@est.ufps.edu.co",
    role: "Estudiante",
  },
  {
    id: "user_006",
    name: "Dr. Pedro Sánchez",
    email: "pedro.sanchez@ufps.edu.co",
    role: "Coordinador",
  },
  {
    id: "user_007",
    name: "Ing. Laura Torres",
    email: "laura.torres@ufps.edu.co",
    role: "Profesor",
  },
  {
    id: "user_008",
    name: "Diego Ramírez",
    email: "diego.ramirez@est.ufps.edu.co",
    role: "Estudiante",
  },
  {
    id: "user_009",
    name: "Sofía López",
    email: "sofia.lopez@est.ufps.edu.co",
    role: "Estudiante",
  },
  {
    id: "user_010",
    name: "Miguel Ángel Castro",
    email: "miguel.castro@ufps.edu.co",
    role: "Profesor",
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const mockDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));
