/**
 * Mock Data - Auth Service
 *
 * Datos mock para el microservicio de autenticación
 * Incluye: users, roles, permissions, credentials
 */

import { LoginResponse } from "@/types/entities/auth";
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
    name: "admin",
    description: "Administrador del sistema con acceso total",
    permissions: mockPermissions,
    isSystem: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "role_2",
    name: "coordinador",
    description: "Coordinador de programa académico",
    permissions: mockPermissions.filter((p) =>
      ["resources", "reservations", "approvals", "reports"].includes(p.resource)
    ),
    isSystem: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "role_3",
    name: "profesor",
    description: "Profesor universitario",
    permissions: mockPermissions
      .filter(
        (p) =>
          ["resources", "reservations"].includes(p.resource) &&
          p.action === "read"
      )
      .concat(
        mockPermissions.filter(
          (p) =>
            p.resource === "reservations" &&
            ["create", "update", "delete"].includes(p.action)
        )
      ),
    isSystem: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "role_4",
    name: "estudiante",
    description: "Estudiante de la universidad",
    permissions: mockPermissions.filter(
      (p) =>
        ["resources", "reservations"].includes(p.resource) &&
        ["read", "create"].includes(p.action)
    ),
    isSystem: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

// ============================================
// ROLES EXTENDIDOS PARA ADMIN UI
// ============================================
export const mockRolesExtended = mockRoles.map((role) => ({
  ...role,
  usersCount:
    mockRoles.indexOf(role) === 0
      ? 1
      : mockRoles.indexOf(role) === 1
        ? 5
        : mockRoles.indexOf(role) === 2
          ? 25
          : 150,
}));

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
];

// ============================================
// USUARIOS EXTENDIDOS PARA ADMIN UI
// ============================================
export const mockUsersExtended = mockUsers.map((user) => ({
  ...user,
  roles: user.roles.map((r) => r.name),
}));

// ============================================
// CREDENCIALES MOCK VÁLIDAS
// ============================================
export const mockCredentials = {
  "admin@ufps.edu.co": { password: "admin123", user: mockUsers[0] },
  "coordinador@ufps.edu.co": { password: "coord123", user: mockUsers[1] },
  "profesor@ufps.edu.co": { password: "prof123", user: mockUsers[2] },
  "estudiante@ufps.edu.co": { password: "est123", user: mockUsers[3] },
};

// ============================================
// RESPUESTAS MOCK DE LOGIN
// ============================================
export function getMockLoginResponse(
  email: string,
  password: string
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
// USUARIO ACTUAL (para testing)
// ============================================
export const currentMockUser = mockUsers[0]; // Por defecto admin
