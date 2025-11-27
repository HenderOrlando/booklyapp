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
} from "@/types/entities/auth";
import type { Permission, Role, UpdateUserDto } from "@/types/entities/user";
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
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
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
    credentials: LoginCredentials
  ): Promise<ApiResponse<LoginResponse>> {
    return httpClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
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
    return httpClient.post<User>(AUTH_ENDPOINTS.REGISTER, data);
  }

  /**
   * Solicita recuperación de contraseña
   *
   * @param email - Email del usuario
   * @returns Confirmación de envío
   */
  static async forgotPassword(
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    return httpClient.post<{ message: string }>(
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      { email }
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
    newPassword: string
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
    refreshToken: string
  ): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    return httpClient.post<{ token: string; expiresIn: number }>(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      { refreshToken }
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
    return httpClient.get<User>(AUTH_ENDPOINTS.PROFILE);
  }

  /**
   * Actualiza el perfil del usuario actual
   *
   * @param data - Campos a actualizar
   * @returns Perfil actualizado
   */
  static async updateProfile(
    data: UpdateProfileDto
  ): Promise<ApiResponse<User>> {
    return httpClient.patch<User>(AUTH_ENDPOINTS.PROFILE, data);
  }

  /**
   * Cambia la contraseña del usuario actual
   *
   * @param data - Contraseña actual y nueva
   * @returns Confirmación
   */
  static async changePassword(
    data: ChangePasswordDto
  ): Promise<ApiResponse<{ message: string }>> {
    return httpClient.post<{ message: string }>(
      AUTH_ENDPOINTS.CHANGE_PASSWORD,
      data
    );
  }

  // ============================================
  // GESTIÓN DE USUARIOS (USER MANAGEMENT)
  // ============================================

  /**
   * Obtiene todos los usuarios (Admin)
   *
   * @returns Lista paginada de usuarios
   */
  static async getUsers(): Promise<ApiResponse<PaginatedResponse<User>>> {
    return httpClient.get<PaginatedResponse<User>>(AUTH_ENDPOINTS.USERS);
  }

  /**
   * Obtiene un usuario por ID (Admin)
   *
   * @param id - ID del usuario
   * @returns Usuario encontrado
   */
  static async getUserById(id: string): Promise<ApiResponse<User>> {
    return httpClient.get<User>(AUTH_ENDPOINTS.USER_BY_ID(id));
  }

  /**
   * Crea un nuevo usuario (Admin)
   *
   * @param data - Datos del usuario
   * @returns Usuario creado
   */
  static async createUser(data: RegisterDto): Promise<ApiResponse<User>> {
    return httpClient.post<User>(AUTH_ENDPOINTS.USERS, data);
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
    data: Partial<UpdateUserDto>
  ): Promise<ApiResponse<User>> {
    return httpClient.patch<User>(AUTH_ENDPOINTS.USER_BY_ID(id), data);
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
    data: UpdateRoleDto
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
    permissionIds: string[]
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
    permissionIds: string[]
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
    resource: string
  ): Promise<ApiResponse<Permission[]>> {
    return httpClient.get<Permission[]>(
      AUTH_ENDPOINTS.PERMISSIONS_BY_MODULE(resource)
    );
  }

  /**
   * Crea un permiso
   */
  static async createPermission(
    data: CreatePermissionDto
  ): Promise<ApiResponse<Permission>> {
    return httpClient.post<Permission>(AUTH_ENDPOINTS.PERMISSIONS, data);
  }

  /**
   * Actualiza un permiso
   */
  static async updatePermission(
    id: string,
    data: UpdatePermissionDto
  ): Promise<ApiResponse<Permission>> {
    return httpClient.put<Permission>(
      AUTH_ENDPOINTS.PERMISSION_BY_ID(id),
      data
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
    roleId: string
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
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    return httpClient.get<PaginatedResponse<any>>(
      `${AUTH_ENDPOINTS.PROFILE.replace("/profile", "")}/audit-logs?${queryParams.toString()}`
    );
  }
}
