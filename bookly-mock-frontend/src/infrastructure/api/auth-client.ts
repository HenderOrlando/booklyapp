/**
 * Cliente HTTP Type-Safe para Auth Service
 *
 * Integración con backend Bookly Auth Service via API Gateway
 *
 * @example
 * ```typescript
 * // Login
 * const { data } = await AuthClient.login({ email, password });
 *
 * // Obtener perfil
 * const { data: user } = await AuthClient.getProfile();
 * ```
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import type {
  LoginDto,
  LoginResponse,
  RegisterDto,
  User,
  UserPreferences,
} from "@/types/entities/auth";
import {
  UserStatus,
  type Permission,
  type Role,
  type UpdateUserDto,
} from "@/types/entities/user";
import { AUTH_ENDPOINTS } from "./endpoints";
import type { PaginatedResponse } from "./types";

/**
 * Credenciales de login (alias para LoginDto)
 */
export type LoginCredentials = LoginDto;

/**
 * DTO para actualizar perfil
 */
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  preferences?: Partial<UserPreferences>;
}

interface BackendMyProfileResponse {
  personal?: {
    userId?: string;
    nombreCompleto?: string;
    correo?: string;
    usuario?: string;
    estadoCuenta?: "ACTIVE" | "INACTIVE";
    tenantId?: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
  };
  roles?: Array<{ code?: string; name?: string }>;
  verificaciones?: {
    emailVerificado?: boolean;
    telefonoVerificado?: boolean;
    twoFactor?: { habilitada?: boolean };
  };
  cuenta?: {
    fechaCreacion?: string | null;
    ultimaActualizacion?: string | null;
  };
  preferences?: {
    language?: string;
    theme?: "light" | "dark" | "system";
    timezone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: "es",
  theme: "system",
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  timezone: "America/Bogota",
};

function normalizeProfilePreferences(
  preferences: BackendMyProfileResponse["preferences"],
): UserPreferences {
  const notifications = preferences?.notifications;

  return {
    language: preferences?.language ?? DEFAULT_USER_PREFERENCES.language,
    theme: preferences?.theme ?? DEFAULT_USER_PREFERENCES.theme,
    timezone: preferences?.timezone ?? DEFAULT_USER_PREFERENCES.timezone,
    notifications: {
      email:
        notifications?.email ?? DEFAULT_USER_PREFERENCES.notifications.email,
      push: notifications?.push ?? DEFAULT_USER_PREFERENCES.notifications.push,
      sms: notifications?.sms ?? DEFAULT_USER_PREFERENCES.notifications.sms,
    },
  };
}

function mapRegisterPayload(data: RegisterDto): Record<string, unknown> {
  return {
    email: data.email,
    username: data.username,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone ?? data.phoneNumber,
    documentType: data.documentType,
    documentNumber: data.documentNumber,
    tenantId: data.tenantId,
  };
}

const ROLE_DISPLAY_BY_CODE: Record<string, string> = {
  GENERAL_ADMIN: "Administrador General",
  PROGRAM_ADMIN: "Administrador de Programa",
  TEACHER: "Docente",
  STUDENT: "Estudiante",
  SECURITY: "Vigilante",
  ADMINISTRATIVE_STAFF: "Administrativo General",
};

const ACTION_SUFFIXES = new Set([
  "create",
  "read",
  "update",
  "delete",
  "manage",
  "export",
  "approve",
  "reject",
  "write",
  "list",
]);

function toIsoString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  return undefined;
}

function parsePermissionCode(code: string): {
  resource: string;
  action: string;
} {
  if (code.includes(":")) {
    const [resource, action] = code.split(":");
    return {
      resource: resource.toLowerCase(),
      action: (action || "read").toLowerCase(),
    };
  }

  const normalized = code.toLowerCase();
  const parts = normalized.split("_").filter(Boolean);

  if (parts.length > 1) {
    const actionCandidate = parts[parts.length - 1];
    if (ACTION_SUFFIXES.has(actionCandidate)) {
      return {
        resource: parts.slice(0, -1).join("_") || "general",
        action: actionCandidate,
      };
    }
  }

  return {
    resource: normalized,
    action: "read",
  };
}

function mapPermission(permission: unknown): Permission {
  if (typeof permission === "string") {
    const parsed = parsePermissionCode(permission);
    return {
      id: permission,
      code: permission,
      name: permission,
      resource: parsed.resource,
      action: parsed.action,
      isSystem: true,
    };
  }

  if (typeof permission === "object" && permission !== null) {
    const source = permission as Partial<Permission> & {
      id?: string;
      code?: string;
      resource?: string;
      action?: string;
      name?: string;
    };
    const fallbackCode = source.code || source.id || "UNKNOWN_PERMISSION";
    const parsed = parsePermissionCode(fallbackCode);

    return {
      id: source.id || fallbackCode,
      code: source.code || fallbackCode,
      name: source.name || source.code || source.id || fallbackCode,
      resource: source.resource || parsed.resource,
      action: source.action || parsed.action,
      description: source.description,
      isSystem: source.isSystem ?? true,
    };
  }

  return {
    id: "UNKNOWN_PERMISSION",
    code: "UNKNOWN_PERMISSION",
    name: "UNKNOWN_PERMISSION",
    resource: "general",
    action: "read",
    isSystem: true,
  };
}

function mapRole(role: unknown): Role {
  const now = new Date().toISOString();

  if (typeof role === "string") {
    return {
      id: role,
      code: role,
      name: ROLE_DISPLAY_BY_CODE[role] || role,
      displayName: ROLE_DISPLAY_BY_CODE[role] || role,
      permissions: [],
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  if (typeof role === "object" && role !== null) {
    const source = role as Partial<Role> & {
      id?: string;
      code?: string;
      name?: string;
      displayName?: string;
      permissions?: unknown[];
      createdAt?: string;
      updatedAt?: string;
    };

    const roleCode = source.code || source.id || source.name || "UNKNOWN_ROLE";
    const roleName =
      source.displayName ||
      source.name ||
      ROLE_DISPLAY_BY_CODE[roleCode] ||
      roleCode;

    return {
      id: source.id || roleCode,
      code: roleCode,
      name: roleName,
      displayName: source.displayName || roleName,
      description: source.description,
      permissions: Array.isArray(source.permissions)
        ? source.permissions.map((permission) => mapPermission(permission))
        : [],
      isSystem: source.isSystem ?? true,
      createdAt: toIsoString(source.createdAt) || now,
      updatedAt: toIsoString(source.updatedAt) || now,
    };
  }

  return {
    id: "UNKNOWN_ROLE",
    code: "UNKNOWN_ROLE",
    name: "UNKNOWN_ROLE",
    permissions: [],
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeUser(raw: unknown): User {
  const source = (raw || {}) as Record<string, unknown>;
  const now = new Date().toISOString();

  const email =
    typeof source.email === "string" && source.email.length > 0
      ? source.email
      : "";
  const firstName =
    typeof source.firstName === "string" ? source.firstName : "";
  const lastName = typeof source.lastName === "string" ? source.lastName : "";
  const username =
    typeof source.username === "string" && source.username.length > 0
      ? source.username
      : email.includes("@")
        ? email.split("@")[0]
        : "usuario";

  const isActive =
    typeof source.isActive === "boolean"
      ? source.isActive
      : source.status === UserStatus.ACTIVE || source.status === "ACTIVE";

  const emailVerified =
    typeof source.emailVerified === "boolean"
      ? source.emailVerified
      : Boolean(source.isEmailVerified);

  const phoneVerified =
    typeof source.phoneVerified === "boolean"
      ? source.phoneVerified
      : Boolean(source.isPhoneVerified);

  const phoneValue =
    typeof source.phone === "string"
      ? source.phone
      : typeof source.phoneNumber === "string"
        ? source.phoneNumber
        : undefined;

  const rawRoles = Array.isArray(source.roles) ? source.roles : [];
  const rawPermissions = Array.isArray(source.permissions)
    ? source.permissions
    : [];

  return {
    id:
      typeof source.id === "string"
        ? source.id
        : typeof source._id === "string"
          ? source._id
          : "",
    email,
    username,
    tenantId: typeof source.tenantId === "string" ? source.tenantId : undefined,
    firstName,
    lastName,
    fullName:
      typeof source.fullName === "string"
        ? source.fullName
        : `${firstName} ${lastName}`.trim(),
    phoneNumber: phoneValue,
    phone: phoneValue,
    documentType:
      typeof source.documentType === "string" ? source.documentType : undefined,
    documentNumber:
      typeof source.documentNumber === "string"
        ? source.documentNumber
        : undefined,
    profilePicture:
      typeof source.profilePicture === "string"
        ? source.profilePicture
        : undefined,
    status:
      source.status === UserStatus.ACTIVE ||
      source.status === UserStatus.INACTIVE
        ? (source.status as UserStatus)
        : isActive
          ? UserStatus.ACTIVE
          : UserStatus.INACTIVE,
    isActive,
    emailVerified,
    isEmailVerified: emailVerified,
    phoneVerified,
    isPhoneVerified: phoneVerified,
    twoFactorEnabled: Boolean(source.twoFactorEnabled),
    roles: rawRoles.map((role) => mapRole(role)),
    permissions: rawPermissions.map((permission) => mapPermission(permission)),
    preferences:
      typeof source.preferences === "object" && source.preferences !== null
        ? (source.preferences as User["preferences"])
        : undefined,
    lastLoginAt:
      toIsoString(source.lastLoginAt) || toIsoString(source.lastLogin),
    createdAt: toIsoString(source.createdAt) || now,
    updatedAt: toIsoString(source.updatedAt) || now,
  };
}

function isBackendMyProfileResponse(
  value: unknown,
): value is BackendMyProfileResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "personal" in value &&
    "verificaciones" in value
  );
}

function normalizeDetailedProfile(profile: BackendMyProfileResponse): User {
  const fullName = profile.personal?.nombreCompleto || "";
  const [firstName = "", ...lastNameParts] = fullName.split(" ");
  const lastName = lastNameParts.join(" ").trim();

  return {
    id: profile.personal?.userId || "",
    email: profile.personal?.correo || "",
    username:
      profile.personal?.usuario ||
      profile.personal?.correo?.split("@")[0] ||
      "usuario",
    tenantId: profile.personal?.tenantId,
    firstName,
    lastName,
    fullName,
    phoneNumber: profile.personal?.phone,
    phone: profile.personal?.phone,
    documentType: profile.personal?.documentType,
    documentNumber: profile.personal?.documentNumber,
    status:
      profile.personal?.estadoCuenta === "INACTIVE"
        ? UserStatus.INACTIVE
        : UserStatus.ACTIVE,
    isActive: profile.personal?.estadoCuenta !== "INACTIVE",
    emailVerified: Boolean(profile.verificaciones?.emailVerificado),
    isEmailVerified: Boolean(profile.verificaciones?.emailVerificado),
    phoneVerified: Boolean(profile.verificaciones?.telefonoVerificado),
    isPhoneVerified: Boolean(profile.verificaciones?.telefonoVerificado),
    twoFactorEnabled: Boolean(profile.verificaciones?.twoFactor?.habilitada),
    roles: (profile.roles || []).map((role) =>
      mapRole({
        id: role.code || role.name || "UNKNOWN_ROLE",
        code: role.code,
        name: role.name || role.code || "UNKNOWN_ROLE",
      }),
    ),
    permissions: [],
    preferences: normalizeProfilePreferences(profile.preferences),
    createdAt:
      profile.cuenta?.fechaCreacion ||
      profile.cuenta?.ultimaActualizacion ||
      new Date().toISOString(),
    updatedAt:
      profile.cuenta?.ultimaActualizacion ||
      profile.cuenta?.fechaCreacion ||
      new Date().toISOString(),
  };
}

function normalizeUsersResponse(data: unknown): PaginatedResponse<User> {
  const payload = (data || {}) as {
    items?: unknown[];
    users?: unknown[];
    meta?: {
      total?: number;
      page?: number;
      limit?: number;
    };
  };

  const usersSource = payload.items || payload.users || [];
  const items = usersSource.map((user) => normalizeUser(user));
  const total = payload.meta?.total ?? items.length;
  const page = payload.meta?.page ?? 1;
  const limit = payload.meta?.limit ?? (items.length || 10);

  return {
    items,
    meta: {
      total,
      page,
      limit,
    },
  };
}

/**
 * DTO para cambiar contraseña
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateRoleDto {
  name: string;
  displayName: string;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}

export interface AssignPermissionsDto {
  permissionIds: string[];
}

export interface CreatePermissionDto {
  code: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  isActive?: boolean;
}

export interface UpdatePermissionDto extends Partial<CreatePermissionDto> {}

/**
 * Cliente HTTP para operaciones de autenticación
 */
export class AuthClient {
  // ============================================
  // AUTENTICACIÓN (AUTHENTICATION)
  // ============================================

  /**
   * Inicia sesión con credenciales
   *
   * @param credentials - Email y contraseña
   * @returns Usuario autenticado y token
   * @example
   * ```typescript
   * const { data, success } = await AuthClient.login({
   *   email: 'usuario@example.com',
   *   password: 'password123'
   * });
   *
   * if (success) {
   *   localStorage.setItem('token', data.token);
   *   console.log('Bienvenido', data.user.name);
   * }
   * ```
   */
  static async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await httpClient.post<LoginResponse>(
      AUTH_ENDPOINTS.LOGIN,
      credentials,
    );

    if (!response.success || !response.data?.user) {
      return response;
    }

    return {
      ...response,
      data: {
        ...response.data,
        user: normalizeUser(response.data.user),
      },
    };
  }

  /**
   * Cierra la sesión del usuario actual
   *
   * @returns Confirmación de logout
   * @example
   * ```typescript
   * await AuthClient.logout();
   * localStorage.removeItem('token');
   * router.push('/login');
   * ```
   */
  static async logout(): Promise<ApiResponse<{ message: string }>> {
    return httpClient.post<{ message: string }>(AUTH_ENDPOINTS.LOGOUT);
  }

  /**
   * Registra un nuevo usuario
   *
   * @param data - Datos de registro
   * @returns Usuario registrado
   * @example
   * ```typescript
   * const { data } = await AuthClient.register({
   *   name: 'Juan Pérez',
   *   email: 'juan@example.com',
   *   password: 'password123'
   * });
   * ```
   */
  static async register(data: RegisterDto): Promise<ApiResponse<User>> {
    const response = await httpClient.post<unknown>(
      AUTH_ENDPOINTS.REGISTER,
      mapRegisterPayload(data),
    );

    if (!response.success || !response.data) {
      return response as ApiResponse<User>;
    }

    return {
      ...response,
      data: normalizeUser(response.data),
    };
  }

  /**
   * Solicita recuperación de contraseña
   *
   * @param email - Email del usuario
   * @returns Confirmación de envío
   */
  static async forgotPassword(
    email: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return httpClient.post<{ message: string }>(
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      { email },
    );
  }

  /**
   * Restablece la contraseña con token
   *
   * @param token - Token de recuperación
   * @param newPassword - Nueva contraseña
   * @returns Confirmación
   */
  static async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return httpClient.post<{ message: string }>(AUTH_ENDPOINTS.RESET_PASSWORD, {
      token,
      newPassword,
    });
  }

  /**
   * Refresca el token de autenticación
   *
   * @param refreshToken - Token de refresco
   * @returns Nuevo token
   */
  static async refreshToken(
    refreshToken: string,
  ): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    return httpClient.post<{ token: string; expiresIn: number }>(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      { refreshToken },
    );
  }

  // ============================================
  // PERFIL DE USUARIO (USER PROFILE)
  // ============================================

  /**
   * Obtiene el perfil del usuario actual
   *
   * @returns Datos del usuario autenticado
   * @example
   * ```typescript
   * const { data: user } = await AuthClient.getProfile();
   * console.log('Usuario:', user.name, user.role);
   * ```
   */
  static async getProfile(): Promise<ApiResponse<User>> {
    const response = await httpClient.get<unknown>(
      AUTH_ENDPOINTS.PROFILE_DETAILS,
    );

    if (!response.success || !response.data) {
      return response as ApiResponse<User>;
    }

    if (isBackendMyProfileResponse(response.data)) {
      return {
        ...response,
        data: normalizeDetailedProfile(response.data),
      };
    }

    return {
      ...response,
      data: normalizeUser(response.data),
    };
  }

  /**
   * Actualiza el perfil del usuario actual
   *
   * @param data - Campos a actualizar
   * @returns Perfil actualizado
   */
  static async updateProfile(
    data: UpdateProfileDto,
  ): Promise<ApiResponse<User>> {
    const response = await httpClient.patch<unknown>(
      AUTH_ENDPOINTS.PROFILE_UPDATE,
      data,
    );

    if (!response.success || !response.data) {
      return response as ApiResponse<User>;
    }

    if (isBackendMyProfileResponse(response.data)) {
      return {
        ...response,
        data: normalizeDetailedProfile(response.data),
      };
    }

    if (
      typeof response.data === "object" &&
      response.data !== null &&
      "user" in response.data
    ) {
      return {
        ...response,
        data: normalizeUser((response.data as { user: unknown }).user),
      };
    }

    return {
      ...response,
      data: normalizeUser(response.data),
    };
  }

  /**
   * Cambia la contraseña del usuario actual
   *
   * @param data - Contraseña actual y nueva
   * @returns Confirmación
   */
  static async changePassword(
    data: ChangePasswordDto,
  ): Promise<ApiResponse<{ message: string }>> {
    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    return httpClient.post<{ message: string }>(
      AUTH_ENDPOINTS.CHANGE_PASSWORD,
      payload,
    );
  }

  /**
   * Sube una foto de perfil
   *
   * @param file - Archivo de imagen
   * @returns Usuario actualizado con nueva foto
   */
  static async uploadProfilePhoto(file: File): Promise<ApiResponse<User>> {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await httpClient.post<unknown>(
      AUTH_ENDPOINTS.PROFILE_PHOTO,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (!response.success || !response.data) {
      return response as ApiResponse<User>;
    }

    return {
      ...response,
      data: normalizeUser(response.data),
    };
  }

  /**
   * Actualiza las preferencias del usuario
   *
   * @param preferences - Preferencias a actualizar
   * @returns Usuario actualizado
   */
  static async updatePreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<ApiResponse<User>> {
    return this.updateProfile({ preferences });
  }

  //
  // ============================================
  // GESTIÓN DE USUARIOS (USER MANAGEMENT)
  // ============================================

  /**
   * Obtiene todos los usuarios (Admin)
   *
   * @returns Lista paginada de usuarios
   */
  static async getUsers(): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await httpClient.get<unknown>(AUTH_ENDPOINTS.USERS);

    if (!response.success || !response.data) {
      return response as ApiResponse<PaginatedResponse<User>>;
    }

    return {
      ...response,
      data: normalizeUsersResponse(response.data),
    };
  }

  /**
   * Obtiene un usuario por ID (Admin)
   *
   * @param id - ID del usuario
   * @returns Usuario encontrado
   */
  static async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await httpClient.get<unknown>(
      AUTH_ENDPOINTS.USER_BY_ID(id),
    );

    if (!response.success || !response.data) {
      return response as ApiResponse<User>;
    }

    return {
      ...response,
      data: normalizeUser(response.data),
    };
  }

  /**
   * Crea un nuevo usuario (Admin)
   *
   * @param data - Datos del usuario
   * @returns Usuario creado
   */
  static async createUser(data: RegisterDto): Promise<ApiResponse<User>> {
    const response = await httpClient.post<unknown>(
      AUTH_ENDPOINTS.USERS,
      mapRegisterPayload(data),
    );

    if (!response.success || !response.data) {
      return response as ApiResponse<User>;
    }

    return {
      ...response,
      data: normalizeUser(response.data),
    };
  }

  /**
   * Actualiza datos de un usuario (ADMIN)
   *
   * @param id - ID del usuario
   * @param data - Campos a actualizar
   * @returns Usuario actualizado
   */
  static async updateUser(
    id: string,
    data: Partial<UpdateUserDto>,
  ): Promise<ApiResponse<User>> {
    const payload: Record<string, unknown> = {};

    if (data.firstName !== undefined) payload.firstName = data.firstName;
    if (data.lastName !== undefined) payload.lastName = data.lastName;

    const phone = data.phone ?? data.phoneNumber;
    if (phone !== undefined) payload.phone = phone;

    if (data.documentType !== undefined) {
      payload.documentType = data.documentType;
    }

    if (data.documentNumber !== undefined) {
      payload.documentNumber = data.documentNumber;
    }

    if (data.isActive !== undefined) {
      payload.isActive = data.isActive;
    } else if (data.status !== undefined) {
      payload.isActive = data.status === UserStatus.ACTIVE;
    }

    if (data.isEmailVerified !== undefined) {
      payload.isEmailVerified = data.isEmailVerified;
    }

    if (data.isPhoneVerified !== undefined) {
      payload.isPhoneVerified = data.isPhoneVerified;
    }

    if (Array.isArray(data.roles)) {
      payload.roles = data.roles
        .map((role): string | null => {
          if (typeof role === "string") {
            return role;
          }

          const roleObject = role as {
            code?: string;
            id?: string;
            name?: string;
          };

          return roleObject.code || roleObject.id || roleObject.name || null;
        })
        .filter((role): role is string => Boolean(role));
    }

    const response = await httpClient.patch<unknown>(
      AUTH_ENDPOINTS.USER_BY_ID(id),
      payload,
    );

    if (!response.success || !response.data) {
      return response as ApiResponse<User>;
    }

    return {
      ...response,
      data: normalizeUser(response.data),
    };
  }

  /**
   * Elimina un usuario (Admin)
   *
   * @param id - ID del usuario
   * @returns Confirmación
   */
  static async deleteUser(id: string): Promise<ApiResponse<User>> {
    return httpClient.delete<User>(AUTH_ENDPOINTS.USER_BY_ID(id));
  }

  // ============================================
  // ROLES Y PERMISOS (ROLES & PERMISSIONS)
  // ============================================

  /**
   * Obtiene todos los roles disponibles
   */
  static async getRoles(filters?: {
    name?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<ApiResponse<Role[]>> {
    return httpClient.get<Role[]>(AUTH_ENDPOINTS.ROLES, { params: filters });
  }

  /**
   * Obtiene un rol por ID
   */
  static async getRoleById(id: string): Promise<ApiResponse<Role>> {
    return httpClient.get<Role>(AUTH_ENDPOINTS.ROLE_BY_ID(id));
  }

  /**
   * Crea un nuevo rol
   */
  static async createRole(data: CreateRoleDto): Promise<ApiResponse<Role>> {
    return httpClient.post<Role>(AUTH_ENDPOINTS.ROLES, data);
  }

  /**
   * Actualiza un rol
   */
  static async updateRole(
    id: string,
    data: UpdateRoleDto,
  ): Promise<ApiResponse<Role>> {
    return httpClient.put<Role>(AUTH_ENDPOINTS.ROLE_BY_ID(id), data);
  }

  /**
   * Elimina un rol
   */
  static async deleteRole(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(AUTH_ENDPOINTS.ROLE_BY_ID(id));
  }

  /**
   * Asigna permisos a un rol
   */
  static async assignPermissionsToRole(
    id: string,
    permissionIds: string[],
  ): Promise<ApiResponse<Role>> {
    return httpClient.post<Role>(AUTH_ENDPOINTS.ROLE_ASSIGN_PERMISSIONS(id), {
      permissionIds,
    });
  }

  /**
   * Remueve permisos de un rol
   */
  static async removePermissionsFromRole(
    id: string,
    permissionIds: string[],
  ): Promise<ApiResponse<Role>> {
    // Nota: El controlador usa DELETE pero con body. Axios soporta data en config.
    return httpClient.delete<Role>(AUTH_ENDPOINTS.ROLE_REMOVE_PERMISSIONS(id), {
      data: { permissionIds },
    });
  }

  /**
   * Obtiene todos los permisos disponibles
   */
  static async getPermissions(filters?: {
    resource?: string;
    action?: string;
    search?: string;
  }): Promise<ApiResponse<Permission[]>> {
    return httpClient.get<Permission[]>(AUTH_ENDPOINTS.PERMISSIONS, {
      params: filters,
    });
  }

  /**
   * Obtiene permisos por módulo
   */
  static async getPermissionsByModule(
    resource: string,
  ): Promise<ApiResponse<Permission[]>> {
    return httpClient.get<Permission[]>(
      AUTH_ENDPOINTS.PERMISSIONS_BY_MODULE(resource),
    );
  }

  /**
   * Crea un permiso
   */
  static async createPermission(
    data: CreatePermissionDto,
  ): Promise<ApiResponse<Permission>> {
    return httpClient.post<Permission>(AUTH_ENDPOINTS.PERMISSIONS, data);
  }

  /**
   * Actualiza un permiso
   */
  static async updatePermission(
    id: string,
    data: UpdatePermissionDto,
  ): Promise<ApiResponse<Permission>> {
    return httpClient.put<Permission>(
      AUTH_ENDPOINTS.PERMISSION_BY_ID(id),
      data,
    );
  }

  /**
   * Elimina un permiso
   */
  static async deletePermission(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(AUTH_ENDPOINTS.PERMISSION_BY_ID(id));
  }

  /**
   * Asigna un rol a un usuario (Admin)
   */
  static async assignRole(
    userId: string,
    roleId: string,
  ): Promise<ApiResponse<User>> {
    return httpClient.post<User>(AUTH_ENDPOINTS.USER_ASSIGN_ROLE(userId), {
      roleId,
    });
  }

  // ============================================
  // AUDITORÍA (AUDIT LOGS)
  // ============================================

  /**
   * Obtiene logs de auditoría (Admin)
   *
   * @param filters - Filtros opcionales
   * @returns Logs de auditoría
   * @future Implementar cuando backend esté disponible
   */
  static async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<unknown>>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    return httpClient.get<PaginatedResponse<unknown>>(
      `${AUTH_ENDPOINTS.PROFILE.replace("/profile", "")}/audit-logs?${queryParams.toString()}`,
    );
  }
}
