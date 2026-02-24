/**
 * Datos mock para desarrollo UI/UX sin backend
 * Simula respuestas del API Gateway
 */

import { LoginResponse } from "@/types/entities/auth";
import { Template } from "@/types/entities/template";
import { Permission, Role, User, UserStatus } from "@/types/entities/user";

// ============================================
// PERMISOS MOCK
// ============================================
export const mockPermissions: Permission[] = [
  {
    id: "perm_1",
    resource: "users",
    action: "read",
    description: "Ver usuarios",
    isSystem: true,
  },
  {
    id: "perm_2",
    resource: "users",
    action: "create",
    description: "Crear usuarios",
    isSystem: true,
  },
  {
    id: "perm_3",
    resource: "users",
    action: "update",
    description: "Actualizar usuarios",
    isSystem: true,
  },
  {
    id: "perm_4",
    resource: "users",
    action: "delete",
    description: "Eliminar usuarios",
    isSystem: true,
  },
  {
    id: "perm_5",
    resource: "resources",
    action: "read",
    description: "Ver recursos",
    isSystem: true,
  },
  {
    id: "perm_6",
    resource: "resources",
    action: "create",
    description: "Crear recursos",
    isSystem: true,
  },
  {
    id: "perm_7",
    resource: "resources",
    action: "update",
    description: "Actualizar recursos",
    isSystem: true,
  },
  {
    id: "perm_8",
    resource: "resources",
    action: "delete",
    description: "Eliminar recursos",
    isSystem: true,
  },
  {
    id: "perm_9",
    resource: "reservations",
    action: "read",
    description: "Ver reservas",
    isSystem: true,
  },
  {
    id: "perm_10",
    resource: "reservations",
    action: "create",
    description: "Crear reservas",
    isSystem: true,
  },
  {
    id: "perm_11",
    resource: "reservations",
    action: "update",
    description: "Actualizar reservas",
    isSystem: true,
  },
  {
    id: "perm_12",
    resource: "reservations",
    action: "delete",
    description: "Eliminar reservas",
    isSystem: true,
  },
  {
    id: "perm_13",
    resource: "approvals",
    action: "manage",
    description: "Gestionar aprobaciones",
    isSystem: true,
  },
  {
    id: "perm_14",
    resource: "reports",
    action: "read",
    description: "Ver reportes",
    isSystem: true,
  },
  {
    id: "perm_15",
    resource: "reports",
    action: "export",
    description: "Exportar reportes",
    isSystem: true,
  },
];

// ============================================
// ROLES MOCK
// ============================================
export const mockRoles: Role[] = [
  {
    id: "role_1",
    name: "ADMIN",
    description: "Administrador del sistema",
    permissions: mockPermissions,
    isSystem: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "role_2",
    name: "COORDINATOR",
    description: "Coordinador de programa",
    permissions: mockPermissions.filter((p) =>
      ["resources", "reservations", "approvals", "reports"].includes(
        p.resource,
      ),
    ),
    isSystem: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "role_3",
    name: "PROFESSOR",
    description: "Profesor",
    permissions: mockPermissions
      .filter(
        (p) =>
          ["resources", "reservations"].includes(p.resource) &&
          p.action === "read",
      )
      .concat(
        mockPermissions.filter(
          (p) =>
            p.resource === "reservations" &&
            ["create", "update", "delete"].includes(p.action),
        ),
      ),
    isSystem: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "role_4",
    name: "STUDENT",
    description: "Estudiante",
    permissions: mockPermissions.filter(
      (p) =>
        ["resources", "reservations"].includes(p.resource) &&
        ["read", "create"].includes(p.action),
    ),
    isSystem: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "role_5",
    name: "VIGILANCIA",
    description: "Personal de vigilancia y control de acceso",
    permissions: mockPermissions.filter(
      (p) =>
        (p.resource === "reservations" && p.action === "read") ||
        (p.resource === "resources" && p.action === "read"),
    ),
    isSystem: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

// ============================================
// USUARIOS MOCK
// ============================================
export const mockUsers: User[] = [
  {
    id: "user_1",
    email: "admin@ufps.edu.co",
    username: "admin",
    firstName: "Admin",
    lastName: "Sistema",
    fullName: "Admin Sistema",
    phoneNumber: "+57 300 123 4567",
    documentType: "CC",
    documentNumber: "1234567890",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    status: UserStatus.ACTIVE,
    emailVerified: true,
    phoneVerified: true,
    twoFactorEnabled: false,
    roles: [mockRoles[0]],
    permissions: mockPermissions,
    preferences: {
      language: "es",
      theme: "light",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      timezone: "America/Bogota",
    },
    lastLoginAt: new Date().toISOString(),
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user_2",
    email: "coordinador@ufps.edu.co",
    username: "coordinador",
    firstName: "María",
    lastName: "González",
    fullName: "María González",
    phoneNumber: "+57 301 234 5678",
    documentType: "CC",
    documentNumber: "0987654321",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    status: UserStatus.ACTIVE,
    emailVerified: true,
    phoneVerified: true,
    twoFactorEnabled: false,
    roles: [mockRoles[1]],
    permissions: mockRoles[1].permissions,
    preferences: {
      language: "es",
      theme: "system",
      notifications: {
        email: true,
        push: true,
        sms: true,
      },
      timezone: "America/Bogota",
    },
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user_3",
    email: "profesor@ufps.edu.co",
    username: "profesor",
    firstName: "Carlos",
    lastName: "Ramírez",
    fullName: "Carlos Ramírez",
    phoneNumber: "+57 302 345 6789",
    documentType: "CC",
    documentNumber: "1122334455",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
    status: UserStatus.ACTIVE,
    emailVerified: true,
    phoneVerified: false,
    twoFactorEnabled: false,
    roles: [mockRoles[2]],
    permissions: mockRoles[2].permissions,
    preferences: {
      language: "es",
      theme: "dark",
      notifications: {
        email: true,
        push: false,
        sms: false,
      },
      timezone: "America/Bogota",
    },
    lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user_4",
    email: "estudiante@ufps.edu.co",
    username: "estudiante",
    firstName: "Ana",
    lastName: "Martínez",
    fullName: "Ana Martínez",
    phoneNumber: "+57 303 456 7890",
    documentType: "TI",
    documentNumber: "5566778899",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
    status: UserStatus.ACTIVE,
    emailVerified: true,
    phoneVerified: false,
    twoFactorEnabled: false,
    roles: [mockRoles[3]],
    permissions: mockRoles[3].permissions,
    preferences: {
      language: "es",
      theme: "light",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      timezone: "America/Bogota",
    },
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user_5",
    email: "vigilante@ufps.edu.co",
    username: "vigilante",
    firstName: "Pedro",
    lastName: "López",
    fullName: "Pedro López",
    phoneNumber: "+57 304 567 8901",
    documentType: "CC",
    documentNumber: "6677889900",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=pedro",
    status: UserStatus.ACTIVE,
    emailVerified: true,
    phoneVerified: true,
    twoFactorEnabled: false,
    roles: [mockRoles[4]],
    permissions: mockRoles[4].permissions,
    preferences: {
      language: "es",
      theme: "light",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      timezone: "America/Bogota",
    },
    lastLoginAt: new Date(Date.now() - 43200000).toISOString(),
    createdAt: "2024-04-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
];

// ============================================
// CREDENCIALES MOCK VÁLIDAS
// ============================================
export const mockCredentials = {
  "admin@ufps.edu.co": { password: "admin123", user: mockUsers[0] },
  "coordinador@ufps.edu.co": { password: "coord123", user: mockUsers[1] },
  "profesor@ufps.edu.co": { password: "prof123", user: mockUsers[2] },
  "estudiante@ufps.edu.co": { password: "est123", user: mockUsers[3] },
  "vigilante@ufps.edu.co": { password: "vig123", user: mockUsers[4] },
};

// ============================================
// RESPUESTAS MOCK DE LOGIN
// ============================================
export function getMockLoginResponse(
  email: string,
  password: string,
): LoginResponse | null {
  const credential = mockCredentials[email as keyof typeof mockCredentials];

  if (!credential || credential.password !== password) {
    return null;
  }

  return {
    requiresTwoFactor: false,
    user: credential.user,
    tokens: {
      accessToken: `mock-token-${credential.user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-${credential.user.id}-${Date.now()}`,
    },
  };
}

// ============================================
// HELPER PARA SIMULAR DELAY DE RED
// ============================================
export async function mockDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// EXPORTAR USUARIO ACTUAL (para testing)
// ============================================
export const currentMockUser = mockUsers[0]; // Por defecto admin

// ============================================
// PLANTILLAS MOCK
// ============================================
export const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Aprobación de Solicitud",
    type: "APPROVAL",
    category: "APPROVAL",
    subject: "Solicitud Aprobada",
    body: "Hola {{userName}},\n\nTu solicitud para {{resourceName}} el {{date}} a las {{time}} ha sido aprobada.\n\nSaludos,\nEquipo Bookly",
    variables: [
      {
        key: "userName",
        label: "Nombre Usuario",
        required: true,
        example: "Juan Pérez",
      },
      {
        key: "resourceName",
        label: "Nombre Recurso",
        required: true,
        example: "Laboratorio A",
      },
      { key: "date", label: "Fecha", required: true, example: "2024-12-01" },
      { key: "time", label: "Hora", required: true, example: "10:00" },
    ],
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "2",
    name: "Rechazo de Solicitud",
    type: "REJECTION",
    category: "APPROVAL",
    subject: "Solicitud Rechazada",
    body: "Hola {{userName}},\n\nLamentamos informarte que tu solicitud para {{resourceName}} ha sido rechazada.\n\nMotivo: {{reason}}\n\nPuedes realizar una nueva solicitud.\n\nSaludos,\nEquipo Bookly",
    variables: [
      {
        key: "userName",
        label: "Nombre Usuario",
        required: true,
        example: "María García",
      },
      {
        key: "resourceName",
        label: "Nombre Recurso",
        required: true,
        example: "Sala de Juntas",
      },
      {
        key: "reason",
        label: "Motivo",
        required: true,
        example: "Recurso no disponible",
      },
    ],
    isActive: true,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "3",
    name: "Notificación de Disponibilidad",
    type: "NOTIFICATION",
    category: "RESERVATION",
    subject: "Recurso Disponible",
    body: "Hola {{firstname}},\n\nEl recurso {{resource_name}} ahora se encuentra {{resource_availability}}.\n\nPuedes proceder a realizar tu reserva.\n\nSaludos,\nEquipo Bookly",
    variables: [
      { key: "firstname", label: "Nombre", required: true, example: "Juan" },
      {
        key: "resource_name",
        label: "Recurso",
        required: true,
        example: "Sala A",
      },
    ],
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "4",
    name: "Carta de Aprobación (PDF)",
    type: "DOCUMENT",
    category: "APPROVAL",
    subject: "Carta de Aprobación",
    body: "CARTA DE APROBACIÓN\n\nPor medio de la presente se certifica que la solicitud {{reservation_id}} realizada por {{firstname}} {{lastname}} ha sido APROBADA.\n\nRecurso: {{resource_name}}\nPrograma: {{resource_program}}\nFecha: {{date}} {{time}}\n\nAtentamente,\nDirección de Recursos",
    variables: [
      { key: "reservation_id", label: "ID Reserva", required: true },
      { key: "firstname", label: "Nombre", required: true },
      { key: "lastname", label: "Apellido", required: true },
    ],
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
  {
    id: "5",
    name: "Recordatorio de Reserva",
    type: "EMAIL",
    category: "RESERVATION",
    subject: "Recordatorio: Reserva Próxima",
    body: "Hola {{firstname}},\n\nTe recordamos que tienes una reserva para {{resource_name}} programada para el {{date}} a las {{time}}.\n\nEstado: {{reservation_status}}\n\nNo olvides hacer check-in.",
    variables: [],
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin",
  },
];
