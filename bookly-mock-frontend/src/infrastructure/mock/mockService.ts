/**
 * Servicio Mock que intercepta llamadas HTTP y devuelve datos mockeados
 * Se activa automáticamente cuando DATA_MODE=mock
 */

import { isMockMode } from "@/lib/config";
import { ApiResponse } from "@/types/api/response";
import type { ApprovalRequest } from "@/types/entities/approval";
import type {
  CreateReservationDto,
  Reservation,
  UpdateReservationDto,
} from "@/types/entities/reservation";
import type {
  AcademicProgram,
  Category,
  CreateAcademicProgramDto,
  CreateResourceDto,
  Maintenance,
  Resource,
  UpdateAcademicProgramDto,
  UpdateResourceDto,
} from "@/types/entities/resource";
import {
  getApprovalHistory,
  getApprovalRequestById,
  getMockLoginResponse,
  mockApprovalRequests,
  mockApprovalStats,
  mockAuditLogs,
  mockCredentials,
  mockDelay,
  mockPermissions,
  mockRoles,
  mockUsers,
} from "./data";
import { mockReservations } from "./data/reservations-service.mock";
import type {
  ProgramResourceAssociation,
  ProgramUserAssociation,
  User as ResourceUser,
} from "./data/resources-service.mock";
import {
  mockAcademicPrograms,
  mockCategories,
  mockMaintenances,
  mockProgramResourceAssociations,
  mockProgramUserAssociations,
  mockResources,
  mockUsers as mockResourceUsers,
} from "./data/resources-service.mock";

type RequestPayload = Record<string, unknown>;

interface LoginPayload {
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface ProgramResourceAssociationInput {
  programId: string;
  resourceId: string;
  priority?: number;
}

interface ProgramUserAssociationInput {
  programId: string;
  userId: string;
  role?: ProgramUserAssociation["role"];
}

interface ApprovalRequestInput {
  reservationId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  resourceId?: string;
  resourceName?: string;
  resourceType?: string;
  categoryName?: string;
  startDate?: string;
  endDate?: string;
  purpose?: string;
  attendees?: number;
  priority?: ApprovalRequest["priority"];
  currentLevel?: ApprovalRequest["currentLevel"];
  maxLevel?: ApprovalRequest["maxLevel"];
}

interface ApprovalActionInput {
  comment?: string;
  reason?: string;
}

export class MockService {
  // Copias mutables de los datos mock
  private static resourcesData: Resource[] = [...mockResources];
  private static categoriesData: Category[] = [...mockCategories];
  private static maintenancesData: Maintenance[] = [...mockMaintenances];
  private static academicProgramsData: AcademicProgram[] = [
    ...mockAcademicPrograms,
  ];
  private static programResourceAssociationsData: ProgramResourceAssociation[] =
    [...mockProgramResourceAssociations];
  private static programUserAssociationsData: ProgramUserAssociation[] = [
    ...mockProgramUserAssociations,
  ];
  private static resourceUsersData: ResourceUser[] = [...mockResourceUsers];
  private static reservationsData: Reservation[] = [...mockReservations];

  private static castResponse<T>(
    response: ApiResponse<unknown>,
  ): ApiResponse<T> {
    return response as ApiResponse<T>;
  }

  /**
   * Simula una llamada HTTP con datos mock
   */
  static async mockRequest<T>(
    endpoint: string,
    method: string = "GET",
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    // Simular delay de red
    await mockDelay(300);

    const payload = data as unknown;

    // Simular diferentes endpoints
    if (endpoint.includes("/auth/login") && method === "POST") {
      return this.castResponse<T>(this.mockLogin(payload as LoginPayload));
    }

    if (endpoint.includes("/auth/register") && method === "POST") {
      return this.castResponse<T>(this.mockRegister(payload as RequestPayload));
    }

    if (endpoint.includes("/auth/forgot-password") && method === "POST") {
      return this.castResponse<T>(
        this.mockForgotPassword(payload as ForgotPasswordPayload),
      );
    }

    if (endpoint.includes("/auth/reset-password") && method === "POST") {
      return this.castResponse<T>(
        this.mockResetPassword(payload as ResetPasswordPayload),
      );
    }

    if (endpoint.includes("/auth/me") && method === "GET") {
      return this.castResponse<T>(this.mockGetCurrentUser());
    }

    if (endpoint.includes("/auth/profile") && method === "GET") {
      return this.castResponse<T>(this.mockGetCurrentUser());
    }

    if (endpoint.includes("/users/me") && method === "GET") {
      return this.castResponse<T>(this.mockGetCurrentUser());
    }

    if (endpoint.includes("/users/me") && method === "PUT") {
      return this.castResponse<T>(
        this.mockUpdateProfile(payload as RequestPayload),
      );
    }

    if (endpoint.includes("/auth/profile") && method === "PUT") {
      return this.castResponse<T>(
        this.mockUpdateProfile(payload as RequestPayload),
      );
    }

    if (endpoint.includes("/auth/change-password") && method === "POST") {
      return this.castResponse<T>(
        this.mockChangePassword(payload as ChangePasswordPayload),
      );
    }

    if (endpoint.includes("/users") && method === "GET") {
      return this.castResponse<T>(this.mockGetUsers());
    }

    if (endpoint.includes("/roles") && method === "GET") {
      return this.castResponse<T>(this.mockGetRoles());
    }

    if (endpoint.includes("/permissions") && method === "GET") {
      return this.castResponse<T>(this.mockGetPermissions());
    }

    if (endpoint.includes("/audit/logs") && method === "GET") {
      return this.castResponse<T>(this.mockGetAuditLogs());
    }

    // ============================================
    // RESOURCES SERVICE ENDPOINTS
    // ============================================

    if (endpoint.includes("/resources") && method === "GET") {
      // Verificar si es un ID específico
      const idMatch = endpoint.match(/\/resources\/([^/]+)$/);
      if (idMatch && idMatch[1] !== "search") {
        return this.castResponse<T>(this.mockGetResourceById(idMatch[1]));
      }

      // Extraer query params sin usar URL externa
      const queryString = endpoint.split("?")[1] || "";
      const params = new URLSearchParams(queryString);
      const page = parseInt(params.get("page") || "1");
      const limit = parseInt(params.get("limit") || "20");
      const programId = params.get("programId") || undefined;

      return this.castResponse<T>(
        this.mockGetResources(page, limit, programId),
      );
    }

    if (endpoint.includes("/resources") && method === "POST") {
      return this.castResponse<T>(
        this.mockCreateResource(payload as CreateResourceDto),
      );
    }

    if (endpoint.includes("/resources") && method === "PATCH") {
      const idMatch = endpoint.match(/\/resources\/([^/]+)$/);
      if (idMatch) {
        return this.castResponse<T>(
          this.mockUpdateResource(idMatch[1], payload as UpdateResourceDto),
        );
      }
    }

    if (endpoint.includes("/resources") && method === "DELETE") {
      const idMatch = endpoint.match(/\/resources\/([^/]+)$/);
      if (idMatch) {
        return this.castResponse<T>(this.mockDeleteResource(idMatch[1]));
      }
    }

    if (endpoint.includes("/categories") && method === "GET") {
      return this.castResponse<T>(this.mockGetCategories());
    }

    if (endpoint.includes("/maintenances") && method === "GET") {
      return this.castResponse<T>(this.mockGetMaintenances());
    }

    if (
      (endpoint.includes("/programs") ||
        endpoint.includes("/academic-programs")) &&
      method === "GET"
    ) {
      const idMatch = endpoint.match(
        /\/(?:programs|academic-programs)\/([^/?]+)$/,
      );
      if (idMatch) {
        return this.castResponse<T>(
          this.mockGetAcademicProgramById(idMatch[1]),
        );
      }
      return this.castResponse<T>(this.mockGetAcademicPrograms());
    }

    if (
      (endpoint.includes("/programs") ||
        endpoint.includes("/academic-programs")) &&
      method === "POST"
    ) {
      return this.castResponse<T>(
        this.mockCreateAcademicProgram(payload as CreateAcademicProgramDto),
      );
    }

    if (
      (endpoint.includes("/programs") ||
        endpoint.includes("/academic-programs")) &&
      method === "PUT"
    ) {
      const idMatch = endpoint.match(
        /\/(?:programs|academic-programs)\/([^/?]+)$/,
      );
      if (idMatch) {
        return this.castResponse<T>(
          this.mockUpdateAcademicProgram(
            idMatch[1],
            payload as UpdateAcademicProgramDto,
          ),
        );
      }
    }

    if (endpoint.includes("/program-resources") && method === "GET") {
      const programIdMatch = endpoint.match(/programId=([^&]+)/);
      if (programIdMatch) {
        return this.castResponse<T>(
          this.mockGetProgramResources(programIdMatch[1]),
        );
      }
      return this.castResponse<T>(this.mockGetProgramResourceAssociations());
    }

    if (endpoint.includes("/program-resources") && method === "POST") {
      return this.castResponse<T>(
        this.mockAddResourceToProgram(
          payload as ProgramResourceAssociationInput,
        ),
      );
    }

    if (endpoint.includes("/program-resources") && method === "DELETE") {
      const match = endpoint.match(/programId=([^&]+)&resourceId=([^&]+)/);
      if (match) {
        return this.castResponse<T>(
          this.mockRemoveResourceFromProgram(match[1], match[2]),
        );
      }
    }

    if (endpoint.includes("/program-users") && method === "GET") {
      const programIdMatch = endpoint.match(/programId=([^&]+)/);
      if (programIdMatch) {
        return this.castResponse<T>(
          this.mockGetProgramUsers(programIdMatch[1]),
        );
      }
      return this.castResponse<T>(this.mockGetProgramUserAssociations());
    }

    if (endpoint.includes("/program-users") && method === "POST") {
      return this.castResponse<T>(
        this.mockAddUserToProgram(payload as ProgramUserAssociationInput),
      );
    }

    if (endpoint.includes("/program-users") && method === "DELETE") {
      const match = endpoint.match(/programId=([^&]+)&userId=([^&]+)/);
      if (match) {
        return this.castResponse<T>(
          this.mockRemoveUserFromProgram(match[1], match[2]),
        );
      }
    }

    // ============================================
    // STOCKPILE SERVICE ENDPOINTS
    // ============================================

    if (
      endpoint.includes("/approval-requests/statistics") &&
      method === "GET"
    ) {
      return this.castResponse<T>(this.mockGetApprovalStatistics());
    }

    if (
      endpoint.includes("/approval-requests/active-today") &&
      method === "GET"
    ) {
      return this.castResponse<T>(this.mockGetApprovalRequests());
    }

    if (endpoint.includes("/approval-requests") && method === "GET") {
      const idMatch = endpoint.match(/\/approval-requests\/([^/?]+)$/);
      if (idMatch && !["active-today", "statistics"].includes(idMatch[1])) {
        return this.castResponse<T>(
          this.mockGetApprovalRequestById(idMatch[1]),
        );
      }
      return this.castResponse<T>(this.mockGetApprovalRequests());
    }

    if (endpoint.includes("/approval-requests") && method === "POST") {
      const approveMatch = endpoint.match(
        /\/approval-requests\/([^/]+)\/approve$/,
      );
      if (approveMatch) {
        return this.castResponse<T>(
          this.mockApproveApprovalRequest(
            approveMatch[1],
            payload as ApprovalActionInput,
          ),
        );
      }

      const rejectMatch = endpoint.match(
        /\/approval-requests\/([^/]+)\/reject$/,
      );
      if (rejectMatch) {
        return this.castResponse<T>(
          this.mockRejectApprovalRequest(
            rejectMatch[1],
            payload as ApprovalActionInput,
          ),
        );
      }

      const cancelMatch = endpoint.match(
        /\/approval-requests\/([^/]+)\/cancel$/,
      );
      if (cancelMatch) {
        return this.castResponse<T>(
          this.mockCancelApprovalRequest(
            cancelMatch[1],
            payload as ApprovalActionInput,
          ),
        );
      }

      return this.castResponse<T>(
        this.mockCreateApprovalRequest(payload as ApprovalRequestInput),
      );
    }

    // ============================================
    // RESERVATIONS SERVICE ENDPOINTS
    // ============================================

    if (endpoint.includes("/reports/dashboard") && method === "GET") {
      return this.castResponse<T>(this.mockGetAggregatedDashboard(endpoint));
    }

    if (endpoint.includes("/dashboard/kpis") && method === "GET") {
      return this.castResponse<T>(this.mockGetDashboardKPIs());
    }

    if (endpoint.includes("/dashboard/overview") && method === "GET") {
      return this.castResponse<T>(this.mockGetDashboardOverview());
    }

    if (endpoint.includes("/dashboard/occupancy") && method === "GET") {
      return this.castResponse<T>(this.mockGetDashboardOccupancy());
    }

    if (endpoint.includes("/dashboard/trends") && method === "GET") {
      return this.castResponse<T>(this.mockGetDashboardTrends());
    }

    if (endpoint.includes("/user-reports") && method === "GET") {
      const queryString = endpoint.split("?")[1] || "";
      const params = new URLSearchParams(queryString);
      const userId = params.get("userId") || undefined;
      return this.castResponse<T>(this.mockGetUserReportSummary(userId));
    }

    if (endpoint.includes("/reservations") && method === "GET") {
      // Verificar si es un ID específico
      const idMatch = endpoint.match(/\/reservations\/([^/]+)$/);
      if (idMatch) {
        return this.castResponse<T>(this.mockGetReservationById(idMatch[1]));
      }

      const queryString = endpoint.split("?")[1] || "";
      const params = new URLSearchParams(queryString);
      const status = params.get("status") || undefined;
      const limit = Number.parseInt(params.get("limit") || "50", 10);

      return this.castResponse<T>(
        this.mockGetReservations({
          status,
          limit: Number.isFinite(limit) ? limit : 50,
        }),
      );
    }

    if (endpoint.includes("/reservations") && method === "POST") {
      return this.castResponse<T>(
        this.mockCreateReservation(payload as CreateReservationDto),
      );
    }

    if (endpoint.includes("/reservations") && method === "PATCH") {
      const idMatch = endpoint.match(/\/reservations\/([^/]+)$/);
      if (idMatch) {
        return this.castResponse<T>(
          this.mockUpdateReservation(
            idMatch[1],
            payload as UpdateReservationDto,
          ),
        );
      }
    }

    if (endpoint.includes("/reservations") && method === "DELETE") {
      const idMatch = endpoint.match(/\/reservations\/([^/]+)$/);
      if (idMatch) {
        return this.castResponse<T>(this.mockCancelReservation(idMatch[1]));
      }
    }

    // Endpoint no implementado en mock
    throw new Error(`Mock no implementado para: ${method} ${endpoint}`);
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  private static mockLogin(credentials: {
    email: string;
    password: string;
  }): ApiResponse<unknown> {
    const result = getMockLoginResponse(
      credentials.email,
      credentials.password,
    );

    if (!result) {
      throw {
        response: {
          status: 401,
          data: {
            success: false,
            code: "AUTH-0001",
            message: "Credenciales inválidas",
            type: "error",
            http_code: 401,
          },
        },
      };
    }

    return {
      success: true,
      data: result,
      message: "Login exitoso",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockRegister(userData: RequestPayload): ApiResponse<unknown> {
    // Simular registro exitoso
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      status: "ACTIVE",
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
      roles: [],
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: {
        user: newUser,
        accessToken: `mock-token-${newUser.id}-${Date.now()}`,
        refreshToken: `mock-refresh-${newUser.id}-${Date.now()}`,
        expiresIn: 86400,
      },
      message: "Usuario registrado exitosamente",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockForgotPassword(data: {
    email: string;
  }): ApiResponse<unknown> {
    const { email } = data;

    // Validar email
    if (!email) {
      return {
        success: false,
        data: null,
        message: "Email es requerido",
        timestamp: new Date().toISOString(),
      };
    }

    // Buscar usuario por email
    const userExists = Object.keys(mockCredentials).includes(email);

    if (!userExists) {
      // Por seguridad, siempre retornamos success aunque el email no exista
      return {
        success: true,
        data: {
          message: "Si el correo existe, recibirás un enlace de recuperación",
          email,
        },
        message: "Correo de recuperación enviado",
        timestamp: new Date().toISOString(),
      };
    }

    // Simular generación de token
    const resetToken = `mock-reset-token-${Date.now()}`;

    // En un sistema real, aquí se enviaría el email
    console.log(
      `[MOCK] Enlace de recuperación: /reset-password?token=${resetToken}`,
    );

    return {
      success: true,
      data: {
        message: "Enlace de recuperación enviado al correo",
        email,
        // En desarrollo, incluimos el token (esto NO debe hacerse en producción)
        _dev_resetToken: resetToken,
        _dev_resetLink: `/reset-password?token=${resetToken}`,
      },
      message: "Correo de recuperación enviado exitosamente",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockResetPassword(data: {
    token: string;
    newPassword: string;
  }): ApiResponse<unknown> {
    const { token, newPassword } = data;

    // Validaciones
    if (!token) {
      return {
        success: false,
        data: null,
        message: "Token es requerido",
        timestamp: new Date().toISOString(),
      };
    }

    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        data: null,
        message: "La contraseña debe tener al menos 8 caracteres",
        timestamp: new Date().toISOString(),
      };
    }

    // Validar token mock (en este caso, aceptamos cualquier token que empiece con "mock-reset-token-")
    if (!token.startsWith("mock-reset-token-")) {
      return {
        success: false,
        data: null,
        message: "Token inválido o expirado",
        timestamp: new Date().toISOString(),
      };
    }

    // Simular actualización de contraseña exitosa
    return {
      success: true,
      data: {
        message: "Contraseña actualizada exitosamente",
      },
      message: "Contraseña restablecida correctamente",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetCurrentUser(): ApiResponse<unknown> {
    return {
      success: true,
      data: mockUsers[0], // Admin por defecto
      timestamp: new Date().toISOString(),
    };
  }

  private static mockUpdateProfile(data: RequestPayload): ApiResponse<unknown> {
    // Simular actualización de perfil exitosa
    const updatedUser = {
      ...mockUsers[0],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: {
        user: updatedUser,
        message: "Perfil actualizado exitosamente",
      },
      message: "Perfil actualizado correctamente",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockChangePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): ApiResponse<unknown> {
    const { currentPassword, newPassword } = data;

    // Validaciones
    if (!currentPassword || !newPassword) {
      return {
        success: false,
        data: null,
        message: "Todos los campos son obligatorios",
        timestamp: new Date().toISOString(),
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        data: null,
        message: "La contraseña debe tener al menos 8 caracteres",
        timestamp: new Date().toISOString(),
      };
    }

    // En un sistema real, aquí se verificaría la contraseña actual
    // Para el mock, simplemente aceptamos cualquier contraseña actual

    return {
      success: true,
      data: {
        message: "Contraseña actualizada exitosamente",
      },
      message: "Contraseña cambiada correctamente",
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // USERS ENDPOINTS
  // ============================================

  private static mockGetUsers(): ApiResponse<unknown> {
    // Extender usuarios con roles como strings para UI de admin
    const usersExtended = mockUsers.map((user) => ({
      ...user,
      roles: user.roles.map((r) => r.name),
    }));

    return {
      success: true,
      data: {
        items: usersExtended,
        meta: {
          total: usersExtended.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // ROLES ENDPOINTS
  // ============================================

  private static mockGetRoles(): ApiResponse<unknown> {
    // Extender roles con usersCount para UI de admin
    const rolesExtended = mockRoles.map((role, index) => ({
      ...role,
      usersCount: index === 0 ? 1 : index === 1 ? 5 : index === 2 ? 25 : 150,
    }));

    return {
      success: true,
      data: {
        items: rolesExtended,
        meta: {
          total: rolesExtended.length,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // PERMISSIONS ENDPOINTS
  // ============================================

  private static mockGetPermissions(): ApiResponse<unknown> {
    return {
      success: true,
      data: {
        items: mockPermissions,
        meta: {
          total: mockPermissions.length,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // AUDIT ENDPOINTS
  // ============================================

  private static mockGetAuditLogs(): ApiResponse<unknown> {
    // Usar logs de auditoría importados desde ./data/audit.mock.ts
    return {
      success: true,
      data: {
        items: mockAuditLogs,
        meta: {
          total: mockAuditLogs.length,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // RESOURCES SERVICE ENDPOINTS
  // ============================================

  private static mockGetResources(
    page: number = 1,
    limit: number = 20,
    programId?: string,
  ): ApiResponse<unknown> {
    const normalizedProgramId = programId?.trim().toLowerCase();
    const filteredResources = normalizedProgramId
      ? this.resourcesData.filter(
          (resource) =>
            Array.isArray(resource.programIds) &&
            resource.programIds.some(
              (resourceProgramId) =>
                String(resourceProgramId).toLowerCase() === normalizedProgramId,
            ),
        )
      : this.resourcesData;

    const total = filteredResources.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredResources.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        items: paginatedItems,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      message: "Resources retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetResourceById(id: string): ApiResponse<unknown> {
    const resource = this.resourcesData.find(
      (resourceItem) => resourceItem.id === id,
    );

    if (!resource) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "RSRC-0301",
            message: `Resource with ID ${id} not found`,
            type: "error",
            http_code: 404,
          },
        },
      };
    }

    return {
      success: true,
      data: resource,
      message: "Resource retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockCreateResource(
    data: CreateResourceDto,
  ): ApiResponse<unknown> {
    const newResource = {
      id: `res_${Date.now()}`,
      ...data,
      status: "AVAILABLE",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.resourcesData.push(newResource as Resource);

    return {
      success: true,
      data: newResource,
      message: "Resource created successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockUpdateResource(
    id: string,
    data: UpdateResourceDto,
  ): ApiResponse<unknown> {
    const index = this.resourcesData.findIndex(
      (resourceItem) => resourceItem.id === id,
    );

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "RSRC-0301",
            message: `Resource with ID ${id} not found`,
            type: "error",
            http_code: 404,
          },
        },
      };
    }

    this.resourcesData[index] = {
      ...this.resourcesData[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: this.resourcesData[index],
      message: "Resource updated successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockDeleteResource(id: string): ApiResponse<unknown> {
    const index = this.resourcesData.findIndex(
      (resourceItem) => resourceItem.id === id,
    );

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "RSRC-0301",
            message: `Resource with ID ${id} not found`,
            type: "error",
            http_code: 404,
          },
        },
      };
    }

    this.resourcesData.splice(index, 1);

    return {
      success: true,
      data: { deleted: true },
      message: "Resource deleted successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetCategories(): ApiResponse<unknown> {
    return {
      success: true,
      data: {
        items: this.categoriesData,
        meta: {
          total: this.categoriesData.length,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      message: "Categories retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetMaintenances(): ApiResponse<unknown> {
    return {
      success: true,
      data: {
        items: this.maintenancesData,
        meta: {
          total: this.maintenancesData.length,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      message: "Maintenances retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // ACADEMIC PROGRAMS ENDPOINTS
  // ============================================

  private static mockGetAcademicPrograms(): ApiResponse<unknown> {
    return {
      success: true,
      data: {
        items: this.academicProgramsData,
        meta: {
          total: this.academicProgramsData.length,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      message: "Academic programs retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetAcademicProgramById(id: string): ApiResponse<unknown> {
    const program = this.academicProgramsData.find(
      (academicProgram) => academicProgram.id === id,
    );

    if (!program) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            message: `Academic program with ID ${id} not found`,
          },
        },
      };
    }

    return {
      success: true,
      data: program,
      message: "Academic program retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockCreateAcademicProgram(
    data: CreateAcademicProgramDto,
  ): ApiResponse<unknown> {
    const newProgram: AcademicProgram = {
      id: `prog_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    this.academicProgramsData.push(newProgram);

    return {
      success: true,
      data: newProgram,
      message: "Academic program created successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockUpdateAcademicProgram(
    id: string,
    data: UpdateAcademicProgramDto,
  ): ApiResponse<unknown> {
    const index = this.academicProgramsData.findIndex(
      (academicProgram) => academicProgram.id === id,
    );

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            message: `Academic program with ID ${id} not found`,
          },
        },
      };
    }

    this.academicProgramsData[index] = {
      ...this.academicProgramsData[index],
      ...data,
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    return {
      success: true,
      data: this.academicProgramsData[index],
      message: "Academic program updated successfully",
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // PROGRAM-RESOURCE ASSOCIATIONS
  // ============================================

  private static mockGetProgramResourceAssociations(): ApiResponse<unknown> {
    return {
      success: true,
      data: {
        items: this.programResourceAssociationsData,
      },
      message: "Program-resource associations retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetProgramResources(
    programId: string,
  ): ApiResponse<unknown> {
    const associations = this.programResourceAssociationsData.filter(
      (association) => association.programId === programId,
    );

    const resources = associations.flatMap((association) => {
      const resource = this.resourcesData.find(
        (resourceItem) => resourceItem.id === association.resourceId,
      );

      if (!resource) {
        return [];
      }

      return [{ ...resource, priority: association.priority }];
    });

    return {
      success: true,
      data: {
        items: resources,
      },
      message: "Program resources retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockAddResourceToProgram(
    data: ProgramResourceAssociationInput,
  ): ApiResponse<unknown> {
    const newAssociation: ProgramResourceAssociation = {
      programId: data.programId,
      resourceId: data.resourceId,
      priority: data.priority || 3,
      createdAt: new Date().toISOString(),
    };

    this.programResourceAssociationsData.push(newAssociation);

    return {
      success: true,
      data: newAssociation,
      message: "Resource added to program successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockRemoveResourceFromProgram(
    programId: string,
    resourceId: string,
  ): ApiResponse<unknown> {
    const index = this.programResourceAssociationsData.findIndex(
      (association) =>
        association.programId === programId &&
        association.resourceId === resourceId,
    );

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            message: "Association not found",
          },
        },
      };
    }

    this.programResourceAssociationsData.splice(index, 1);

    return {
      success: true,
      data: { deleted: true },
      message: "Resource removed from program successfully",
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // PROGRAM-USER ASSOCIATIONS
  // ============================================

  private static mockGetProgramUserAssociations(): ApiResponse<unknown> {
    return {
      success: true,
      data: {
        items: this.programUserAssociationsData,
      },
      message: "Program-user associations retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetProgramUsers(programId: string): ApiResponse<unknown> {
    const associations = this.programUserAssociationsData.filter(
      (association) => association.programId === programId,
    );

    const users = associations.flatMap((association) => {
      const user = this.resourceUsersData.find(
        (resourceUser) => resourceUser.id === association.userId,
      );

      if (!user) {
        return [];
      }

      return [
        {
          ...user,
          programRole: association.role,
          enrollmentDate: association.enrollmentDate,
        },
      ];
    });

    return {
      success: true,
      data: {
        items: users,
      },
      message: "Program users retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockAddUserToProgram(
    data: ProgramUserAssociationInput,
  ): ApiResponse<unknown> {
    const newAssociation: ProgramUserAssociation = {
      programId: data.programId,
      userId: data.userId,
      role: data.role || "STUDENT",
      enrollmentDate: new Date().toISOString(),
    };

    this.programUserAssociationsData.push(newAssociation);

    return {
      success: true,
      data: newAssociation,
      message: "User added to program successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockRemoveUserFromProgram(
    programId: string,
    userId: string,
  ): ApiResponse<unknown> {
    const index = this.programUserAssociationsData.findIndex(
      (association) =>
        association.programId === programId && association.userId === userId,
    );

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            message: "Association not found",
          },
        },
      };
    }

    this.programUserAssociationsData.splice(index, 1);

    return {
      success: true,
      data: { deleted: true },
      message: "User removed from program successfully",
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // STOCKPILE SERVICE ENDPOINTS
  // ============================================

  private static mockGetApprovalRequests(): ApiResponse<unknown> {
    const items = mockApprovalRequests.map((request) => ({
      ...request,
      history: getApprovalHistory(request.id),
    }));

    return {
      success: true,
      data: {
        items,
        meta: {
          total: items.length,
          page: 1,
          limit: items.length || 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      message: "Approval requests retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetApprovalStatistics(): ApiResponse<unknown> {
    return {
      success: true,
      data: mockApprovalStats,
      message: "Approval statistics retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetApprovalRequestById(id: string): ApiResponse<unknown> {
    const request = getApprovalRequestById(id);

    if (!request) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "STCK-0001",
            message: `Approval request with ID ${id} not found`,
            type: "error",
            http_code: 404,
          },
        },
      };
    }

    return {
      success: true,
      data: {
        ...request,
        history: getApprovalHistory(id),
      },
      message: "Approval request retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockCreateApprovalRequest(
    data: ApprovalRequestInput,
  ): ApiResponse<unknown> {
    const now = new Date().toISOString();

    const newRequest: ApprovalRequest = {
      id: `apr_${Date.now()}`,
      reservationId: data?.reservationId || "res_unknown",
      userId: data?.userId || "user_1",
      userName: data?.userName || "Usuario Mock",
      userEmail: data?.userEmail || "mock@ufps.edu.co",
      userRole: data?.userRole || "Profesor",
      resourceId: data?.resourceId || "res_001",
      resourceName: data?.resourceName || "Recurso Mock",
      resourceType: data?.resourceType || "Aula",
      categoryName: data?.categoryName || "General",
      startDate: data?.startDate || now,
      endDate: data?.endDate || now,
      purpose: data?.purpose || "Solicitud generada en mock",
      attendees: data?.attendees || 1,
      status: "PENDING",
      priority: data?.priority || "NORMAL",
      currentLevel: data?.currentLevel || "FIRST_LEVEL",
      maxLevel: data?.maxLevel || "FIRST_LEVEL",
      requestedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    mockApprovalRequests.unshift(newRequest);

    return {
      success: true,
      data: newRequest,
      message: "Approval request created successfully",
      timestamp: now,
    };
  }

  private static mockApproveApprovalRequest(
    id: string,
    data: ApprovalActionInput,
  ): ApiResponse<unknown> {
    const request = getApprovalRequestById(id);

    if (!request) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "STCK-0001",
            message: `Approval request with ID ${id} not found`,
            type: "error",
            http_code: 404,
          },
        },
      };
    }

    const now = new Date().toISOString();
    request.status = "APPROVED";
    request.reviewedAt = now;
    request.reviewerName = "Admin Sistema";
    request.comments = data?.comment || "Aprobado";
    request.updatedAt = now;

    return {
      success: true,
      data: request,
      message: "Approval request approved successfully",
      timestamp: now,
    };
  }

  private static mockRejectApprovalRequest(
    id: string,
    data: ApprovalActionInput,
  ): ApiResponse<unknown> {
    const request = getApprovalRequestById(id);

    if (!request) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "STCK-0001",
            message: `Approval request with ID ${id} not found`,
            type: "error",
            http_code: 404,
          },
        },
      };
    }

    const now = new Date().toISOString();
    request.status = "REJECTED";
    request.reviewedAt = now;
    request.reviewerName = "Admin Sistema";
    request.rejectionReason = data?.comment || "Rechazado";
    request.updatedAt = now;

    return {
      success: true,
      data: request,
      message: "Approval request rejected successfully",
      timestamp: now,
    };
  }

  private static mockCancelApprovalRequest(
    id: string,
    data: ApprovalActionInput,
  ): ApiResponse<unknown> {
    const request = getApprovalRequestById(id);

    if (!request) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "STCK-0001",
            message: `Approval request with ID ${id} not found`,
            type: "error",
            http_code: 404,
          },
        },
      };
    }

    const now = new Date().toISOString();
    request.status = "CANCELLED";
    request.rejectionReason = data?.reason || "Cancelado";
    request.updatedAt = now;

    return {
      success: true,
      data: request,
      message: "Approval request cancelled successfully",
      timestamp: now,
    };
  }

  // ============================================
  // REPORTS SERVICE ENDPOINTS
  // ============================================

  private static mockGetAggregatedDashboard(
    endpoint: string,
  ): ApiResponse<unknown> {
    const queryString = endpoint.split("?")[1] || "";
    const params = new URLSearchParams(queryString);

    const includeValues = params.getAll("include");
    const normalizedInclude = (
      includeValues.length > 0
        ? includeValues
        : ["kpis,summary,trend,activity,recentReservations,topResources"]
    )
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);

    const includeSet = new Set(normalizedInclude);
    const period = (params.get("period") || "last30").toLowerCase();
    const tz = params.get("tz") || "America/Bogota";
    const resourceTypeId = params.get("resourceTypeId") || undefined;
    const locationId = params.get("locationId") || undefined;
    const programId = params.get("programId") || undefined;

    const parseDate = (value: string | null): Date | null => {
      if (!value) {
        return null;
      }

      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    let from = parseDate(params.get("from"));
    let to = parseDate(params.get("to"));

    if (!from || !to || from > to) {
      to = now;

      if (period === "today") {
        from = startOfToday;
      } else if (period === "week") {
        from = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === "month") {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        from = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    const hasResourceFilters = Boolean(
      resourceTypeId || locationId || programId,
    );
    const normalizedResourceType = resourceTypeId?.toLowerCase();
    const normalizedLocation = locationId?.toLowerCase();
    const normalizedProgram = programId?.toLowerCase();

    const filteredResources = this.resourcesData.filter((resource) => {
      const matchesType =
        !normalizedResourceType ||
        String(resource.type || "").toLowerCase() === normalizedResourceType;

      const matchesLocation =
        !normalizedLocation ||
        String(resource.location || "")
          .toLowerCase()
          .includes(normalizedLocation);

      const matchesProgram =
        !normalizedProgram ||
        (Array.isArray(resource.programIds) &&
          resource.programIds.some(
            (program) => String(program).toLowerCase() === normalizedProgram,
          ));

      return matchesType && matchesLocation && matchesProgram;
    });

    const allowedResourceIds = new Set(
      filteredResources.map((resource) => resource.id),
    );

    const fromMs = from.getTime();
    const toMs = to.getTime();

    const filteredReservations = this.reservationsData.filter((reservation) => {
      const reservationDate = new Date(
        reservation.startDate || reservation.createdAt || now.toISOString(),
      );
      const reservationTime = reservationDate.getTime();

      if (
        Number.isNaN(reservationTime) ||
        reservationTime < fromMs ||
        reservationTime > toMs
      ) {
        return false;
      }

      if (
        hasResourceFilters &&
        reservation.resourceId &&
        !allowedResourceIds.has(reservation.resourceId)
      ) {
        return false;
      }

      return true;
    });

    const buildSummary = (items: Reservation[]) => {
      return items.reduce(
        (acc, reservation) => {
          const status = String(reservation.status || "").toUpperCase();

          if (status === "PENDING") {
            acc.pending += 1;
          }

          if (status === "CONFIRMED") {
            acc.confirmed += 1;
          }

          if (status === "CANCELLED") {
            acc.cancelled += 1;
          }

          if (status === "COMPLETED") {
            acc.completed += 1;
          }

          if (status === "IN_PROGRESS") {
            acc.inProgress += 1;
          }

          return acc;
        },
        {
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          inProgress: 0,
        },
      );
    };

    const currentSummary = buildSummary(filteredReservations);

    const periodMs = Math.max(toMs - fromMs, 24 * 60 * 60 * 1000);
    const previousTo = new Date(fromMs - 1);
    const previousFrom = new Date(previousTo.getTime() - periodMs);

    const previousReservations = this.reservationsData.filter((reservation) => {
      const reservationDate = new Date(
        reservation.startDate || reservation.createdAt || now.toISOString(),
      );
      const reservationTime = reservationDate.getTime();

      if (
        Number.isNaN(reservationTime) ||
        reservationTime < previousFrom.getTime() ||
        reservationTime > previousTo.getTime()
      ) {
        return false;
      }

      if (
        hasResourceFilters &&
        reservation.resourceId &&
        !allowedResourceIds.has(reservation.resourceId)
      ) {
        return false;
      }

      return true;
    });

    const previousSummary = buildSummary(previousReservations);

    const toPct = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }

      return Number((((current - previous) / previous) * 100).toFixed(2));
    };

    const resourcesInScope = hasResourceFilters
      ? filteredResources
      : this.resourcesData;
    const totalResources = resourcesInScope.length;

    const activeStatuses = new Set(["PENDING", "CONFIRMED", "IN_PROGRESS"]);

    const activeReservations = filteredReservations.filter((reservation) =>
      activeStatuses.has(String(reservation.status || "").toUpperCase()),
    );

    const activeResourceIds = new Set(
      activeReservations
        .map((reservation) => reservation.resourceId)
        .filter((resourceId): resourceId is string => Boolean(resourceId)),
    );

    const availableResources = Math.max(
      totalResources - activeResourceIds.size,
      0,
    );
    const utilizationRate =
      totalResources > 0
        ? Number(((activeResourceIds.size / totalResources) * 100).toFixed(2))
        : 0;

    const satisfactionRate =
      filteredReservations.length > 0
        ? Number(
            (
              ((currentSummary.confirmed + currentSummary.completed) /
                filteredReservations.length) *
              100
            ).toFixed(2),
          )
        : 0;

    const pendingApprovals = mockApprovalRequests.filter((request) =>
      ["PENDING", "IN_REVIEW"].includes(
        String(request.status || "").toUpperCase(),
      ),
    ).length;

    const summaryPayload = {
      total: filteredReservations.length,
      pending: currentSummary.pending,
      confirmed: currentSummary.confirmed,
      cancelled: currentSummary.cancelled,
      completed: currentSummary.completed,
    };

    const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

    const trendDays = Math.min(
      Math.max(Math.ceil(periodMs / (24 * 60 * 60 * 1000)), 1),
      30,
    );
    const trendStart = new Date(toMs - (trendDays - 1) * 24 * 60 * 60 * 1000);

    const reservationsByDate = filteredReservations.reduce<
      Record<string, number>
    >((acc, reservation) => {
      const reservationDate = new Date(
        reservation.startDate || reservation.createdAt || now.toISOString(),
      );
      const key = toIsoDate(reservationDate);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const trend = Array.from({ length: trendDays }, (_, index) => {
      const day = new Date(trendStart.getTime() + index * 24 * 60 * 60 * 1000);
      const date = toIsoDate(day);
      const reservations = reservationsByDate[date] || 0;

      return {
        date,
        reservations,
        utilizationRate:
          totalResources > 0
            ? Number(
                Math.min(100, (reservations / totalResources) * 100).toFixed(2),
              )
            : null,
      };
    });

    const recentActivity = filteredReservations
      .slice()
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 10)
      .map((reservation) => ({
        id: `activity-${reservation.id}`,
        type: `reservation.${String(reservation.status || "").toLowerCase()}`,
        title: reservation.title || "Reserva actualizada",
        description: `${reservation.userName || reservation.userId || "Usuario"} en ${reservation.resourceName || "Recurso"}`,
        at:
          reservation.updatedAt ||
          reservation.createdAt ||
          new Date().toISOString(),
        source: "availability-service",
        metadata: {
          reservationId: reservation.id,
          userName: reservation.userName,
          resourceId: reservation.resourceId,
          resourceName: reservation.resourceName,
        },
      }));

    const recentReservations = filteredReservations
      .slice()
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 10)
      .map((reservation) => ({
        id: reservation.id,
        reservationId: reservation.id,
        resourceId: reservation.resourceId,
        resourceName: reservation.resourceName || "Recurso",
        userId: reservation.userId,
        status: String(reservation.status || "PENDING"),
        startAt: reservation.startDate,
        endAt: reservation.endDate,
        createdAt: reservation.createdAt,
      }));

    const usageByResource = filteredReservations.reduce<
      Record<string, { reservations: number; hoursUsed: number }>
    >((acc, reservation) => {
      if (!reservation.resourceId) {
        return acc;
      }

      const startAt = new Date(reservation.startDate).getTime();
      const endAt = new Date(reservation.endDate).getTime();
      const durationHours =
        Number.isFinite(startAt) && Number.isFinite(endAt) && endAt > startAt
          ? (endAt - startAt) / (1000 * 60 * 60)
          : 0;

      const current = acc[reservation.resourceId] || {
        reservations: 0,
        hoursUsed: 0,
      };

      current.reservations += 1;
      current.hoursUsed += durationHours;
      acc[reservation.resourceId] = current;

      return acc;
    }, {});

    const topResources = Object.entries(usageByResource)
      .map(([resourceId, usage]) => {
        const resource = this.resourcesData.find(
          (item) => item.id === resourceId,
        );

        return {
          resourceId,
          name: resource?.name || "Recurso",
          type: String(resource?.type || "UNKNOWN"),
          reservations: usage.reservations,
          utilizationRate:
            filteredReservations.length > 0
              ? Number(
                  (
                    (usage.reservations / filteredReservations.length) *
                    100
                  ).toFixed(2),
                )
              : null,
          hoursUsed: Number(usage.hoursUsed.toFixed(2)),
          share:
            filteredReservations.length > 0
              ? Number(
                  (
                    (usage.reservations / filteredReservations.length) *
                    100
                  ).toFixed(2),
                )
              : 0,
        };
      })
      .sort((a, b) => b.reservations - a.reservations)
      .slice(0, 10);

    const isIncluded = (section: string): boolean => includeSet.has(section);

    return {
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        filters: {
          from: from.toISOString(),
          to: to.toISOString(),
          period,
          tz,
          include: normalizedInclude,
          resourceTypeId,
          locationId,
          programId,
        },
        refresh: {
          intervalSeconds: 15,
          websocketEvent: "dashboard:metrics:updated",
        },
        kpis: isIncluded("kpis")
          ? {
              totalReservations: filteredReservations.length,
              activeReservations:
                currentSummary.pending +
                currentSummary.confirmed +
                currentSummary.inProgress,
              pendingApprovals,
              totalResources,
              availableResources,
              utilizationRate,
              satisfactionRate,
              delta: {
                totalReservationsPct: toPct(
                  filteredReservations.length,
                  previousReservations.length,
                ),
                activeReservationsPct: toPct(
                  currentSummary.pending +
                    currentSummary.confirmed +
                    currentSummary.inProgress,
                  previousSummary.pending +
                    previousSummary.confirmed +
                    previousSummary.inProgress,
                ),
                pendingApprovalsPct: 0,
                utilizationRatePct: toPct(
                  utilizationRate,
                  totalResources > 0
                    ? Number(
                        (
                          ((previousSummary.pending +
                            previousSummary.confirmed +
                            previousSummary.inProgress) /
                            totalResources) *
                          100
                        ).toFixed(2),
                      )
                    : 0,
                ),
                satisfactionRatePct: toPct(
                  satisfactionRate,
                  previousReservations.length > 0
                    ? Number(
                        (
                          ((previousSummary.confirmed +
                            previousSummary.completed) /
                            previousReservations.length) *
                          100
                        ).toFixed(2),
                      )
                    : 0,
                ),
              },
            }
          : null,
        reservationSummary: isIncluded("summary") ? summaryPayload : null,
        trend: isIncluded("trend") ? trend : [],
        recentActivity: isIncluded("activity") ? recentActivity : [],
        recentReservations: isIncluded("recentReservations")
          ? recentReservations
          : [],
        topResources: isIncluded("topResources") ? topResources : [],
        access: {
          canViewFullOccupancy: true,
          maskedSections: [],
        },
      },
      message: "Dashboard data retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetDashboardKPIs(): ApiResponse<unknown> {
    const totalResources = this.resourcesData.length;
    const maintenanceResources = this.resourcesData.filter((resource) =>
      ["MAINTENANCE", "IN_MAINTENANCE"].includes(
        String(resource.status || "").toUpperCase(),
      ),
    ).length;

    const activeReservations = this.reservationsData.filter((reservation) =>
      ["CONFIRMED", "PENDING", "IN_PROGRESS"].includes(
        String(reservation.status || "").toUpperCase(),
      ),
    );

    const usedResourceIds = new Set(
      activeReservations
        .map((reservation) => reservation.resourceId)
        .filter((resourceId): resourceId is string => Boolean(resourceId)),
    );

    const resourcesInUse = usedResourceIds.size;
    const availableResources = Math.max(
      0,
      totalResources - resourcesInUse - maintenanceResources,
    );

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const getReservationDate = (reservation: Reservation): Date | null => {
      if (!reservation.startDate) {
        return null;
      }

      const parsed = new Date(reservation.startDate);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const todayReservations = this.reservationsData.filter((reservation) => {
      const reservationDate = getReservationDate(reservation);
      return reservationDate ? reservationDate >= todayStart : false;
    }).length;

    const weekReservations = this.reservationsData.filter((reservation) => {
      const reservationDate = getReservationDate(reservation);
      return reservationDate ? reservationDate >= weekStart : false;
    }).length;

    const monthReservations = this.reservationsData.filter((reservation) => {
      const reservationDate = getReservationDate(reservation);
      return reservationDate ? reservationDate >= monthStart : false;
    }).length;

    const usageMap = new Map<
      string,
      { resourceId: string; name: string; usageCount: number }
    >();

    this.reservationsData.forEach((reservation) => {
      if (!reservation.resourceId) {
        return;
      }

      const current = usageMap.get(reservation.resourceId);
      const resourceName =
        reservation.resourceName ||
        this.resourcesData.find(
          (resource) => resource.id === reservation.resourceId,
        )?.name ||
        "Recurso";

      if (!current) {
        usageMap.set(reservation.resourceId, {
          resourceId: reservation.resourceId,
          name: resourceName,
          usageCount: 1,
        });
        return;
      }

      current.usageCount += 1;
    });

    const mostUsedResources = Array.from(usageMap.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
      .map((item) => ({
        id: item.resourceId,
        name: item.name,
        usageCount: item.usageCount,
      }));

    const recentActivity = this.reservationsData
      .slice()
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((reservation) => ({
        id: reservation.id,
        type: "reservation",
        title: reservation.title || reservation.resourceName || "Reserva",
        timestamp:
          reservation.updatedAt ||
          reservation.createdAt ||
          new Date().toISOString(),
        user: reservation.userName || reservation.userId || "Usuario",
      }));

    return {
      success: true,
      data: {
        totalResources,
        availableResources,
        resourcesInUse,
        resourcesInMaintenance: maintenanceResources,
        todayReservations,
        weekReservations,
        monthReservations,
        utilizationRate:
          totalResources > 0
            ? Number(((resourcesInUse / totalResources) * 100).toFixed(2))
            : 0,
        mostUsedResources,
        recentActivity,
      },
      message: "Dashboard KPIs retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetDashboardOverview(): ApiResponse<unknown> {
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    this.resourcesData.forEach((resource) => {
      const category =
        resource.category?.name ||
        this.categoriesData.find(
          (categoryItem) => categoryItem.id === resource.categoryId,
        )?.name ||
        "Sin categoría";
      byCategory[category] = (byCategory[category] || 0) + 1;

      const status = String(resource.status || "UNKNOWN").toUpperCase();
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    const usageMap = new Map<string, number>();
    this.reservationsData.forEach((reservation) => {
      if (!reservation.resourceId) {
        return;
      }

      usageMap.set(
        reservation.resourceId,
        (usageMap.get(reservation.resourceId) || 0) + 1,
      );
    });

    const maxUsage = Math.max(1, ...Array.from(usageMap.values()));
    const utilizationByResource = Array.from(usageMap.entries()).map(
      ([resourceId, count]) => ({
        resourceId,
        resourceName:
          this.resourcesData.find((resource) => resource.id === resourceId)
            ?.name || "Recurso",
        utilizationRate: Number(((count / maxUsage) * 100).toFixed(2)),
      }),
    );

    return {
      success: true,
      data: {
        byCategory,
        byStatus,
        utilizationByResource,
      },
      message: "Dashboard overview retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetDashboardOccupancy(): ApiResponse<unknown> {
    return {
      success: true,
      data: {
        byStatus: this.reservationsData.reduce<Record<string, number>>(
          (acc, reservation) => {
            const status = String(
              reservation.status || "UNKNOWN",
            ).toUpperCase();
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          },
          {},
        ),
        byProgram: {},
        peakHours: [],
        averageDuration: 0,
      },
      message: "Dashboard occupancy retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetDashboardTrends(): ApiResponse<unknown> {
    return {
      success: true,
      data: {
        items: [],
      },
      message: "Dashboard trends retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetUserReportSummary(
    userId?: string,
  ): ApiResponse<unknown> {
    const userReservations = userId
      ? this.reservationsData.filter(
          (reservation) => reservation.userId === userId,
        )
      : this.reservationsData;

    const totalReservations = userReservations.length;
    const activeReservations = userReservations.filter((reservation) =>
      ["CONFIRMED", "PENDING", "IN_PROGRESS"].includes(
        String(reservation.status || "").toUpperCase(),
      ),
    ).length;
    const canceledReservations = userReservations.filter(
      (reservation) =>
        String(reservation.status || "").toUpperCase() === "CANCELLED",
    ).length;

    const totalHours = userReservations.reduce((acc, reservation) => {
      const start = reservation.startDate;
      const end = reservation.endDate;

      if (!start || !end) {
        return acc;
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        endDate <= startDate
      ) {
        return acc;
      }

      return acc + (endDate.getTime() - startDate.getTime()) / 3600000;
    }, 0);

    const favoriteResourceSet = new Set<string>();
    userReservations.forEach((reservation) => {
      if (reservation.resourceName) {
        favoriteResourceSet.add(reservation.resourceName);
      }
    });

    return {
      success: true,
      data: {
        totalReservations,
        activeReservations,
        canceledReservations,
        pendingApprovals: Math.max(
          0,
          activeReservations - canceledReservations,
        ),
        hoursBooked: Number(totalHours.toFixed(2)),
        favoriteResources: Array.from(favoriteResourceSet).slice(0, 5),
      },
      message: "User report summary retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // RESERVATIONS SERVICE ENDPOINTS
  // ============================================

  private static mockGetReservations(filters?: {
    status?: string;
    limit?: number;
  }): ApiResponse<unknown> {
    const normalizedStatus = filters?.status?.toLowerCase();
    const now = new Date();

    let items = [...this.reservationsData];

    if (normalizedStatus) {
      items = items.filter((reservation) => {
        const status = String(reservation.status || "").toLowerCase();

        if (normalizedStatus === "upcoming") {
          const startDate = reservation.startDate
            ? new Date(reservation.startDate)
            : null;

          return (
            !!startDate &&
            !Number.isNaN(startDate.getTime()) &&
            startDate >= now &&
            status !== "cancelled"
          );
        }

        return status === normalizedStatus;
      });
    }

    if (filters?.limit && filters.limit > 0) {
      items = items.slice(0, filters.limit);
    }

    return {
      success: true,
      data: {
        items,
        meta: {
          total: items.length,
          page: 1,
          limit: filters?.limit || 50,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      message: "Reservations retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetReservationById(id: string): ApiResponse<unknown> {
    const reservation = this.reservationsData.find(
      (reservationItem) => reservationItem.id === id,
    );

    if (!reservation) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "AVAIL-0001",
            message: `Reservation with ID ${id} not found`,
            type: "error",
            http_code: 404,
          },
        },
      };
    }

    return {
      success: true,
      data: reservation,
      message: "Reservation retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockCreateReservation(
    data: CreateReservationDto,
  ): ApiResponse<unknown> {
    const now = new Date().toISOString();
    const newReservation: Reservation = {
      id: `rsv_${Date.now()}`,
      resourceId: data.resourceId,
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      recurrenceType: data.recurrenceType,
      recurrenceEndDate: data.recurrenceEndDate,
      attendees: data.attendees,
      notes: data.notes,
      userId: "user_1",
      userName: "Usuario Mock",
      userEmail: "mock@ufps.edu.co",
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    };

    this.reservationsData.push(newReservation);

    return {
      success: true,
      data: newReservation,
      message: "Reservation created successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockUpdateReservation(
    id: string,
    data: UpdateReservationDto,
  ): ApiResponse<unknown> {
    const index = this.reservationsData.findIndex(
      (reservationItem) => reservationItem.id === id,
    );

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "AVAIL-0001",
            message: `Reservation with ID ${id} not found`,
            type: "error",
            http_code: 404,
          },
        },
      };
    }

    this.reservationsData[index] = {
      ...this.reservationsData[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: this.reservationsData[index],
      message: "Reservation updated successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockCancelReservation(id: string): ApiResponse<unknown> {
    const index = this.reservationsData.findIndex(
      (reservationItem) => reservationItem.id === id,
    );

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "AVAIL-0001",
            message: `Reservation with ID ${id} not found`,
            type: "error",
            http_code: 404,
          },
        },
      };
    }

    this.reservationsData[index] = {
      ...this.reservationsData[index],
      status: "CANCELLED",
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: this.reservationsData[index],
      message: "Reservation cancelled successfully",
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // HELPER: Verificar si debe usar mock
  // ============================================

  static shouldUseMock(): boolean {
    return isMockMode();
  }

  // ============================================
  // HELPER: Simular error de red (backend caído)
  // ============================================

  static simulateNetworkError(
    message: string = "No se pudo conectar con el backend",
  ): never {
    throw {
      code: "NETWORK_ERROR",
      message,
      statusCode: 0,
    };
  }
}
