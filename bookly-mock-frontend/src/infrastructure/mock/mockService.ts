/**
 * Servicio Mock que intercepta llamadas HTTP y devuelve datos mockeados
 * Se activa automáticamente cuando DATA_MODE=mock
 */

import { isMockMode } from "@/lib/config";
import { ApiResponse } from "@/types/api/response";
import {
  getMockLoginResponse,
  mockAuditLogs,
  mockCredentials,
  mockDelay,
  mockPermissions,
  mockRoles,
  mockUsers,
} from "./data";
import { mockReservations } from "./data/reservations-service.mock";
import {
  mockAcademicPrograms,
  mockCategories,
  mockMaintenances,
  mockProgramResourceAssociations,
  mockProgramUserAssociations,
  mockResources,
  mockUsers as mockResourceUsers,
} from "./data/resources-service.mock";

export class MockService {
  // Copias mutables de los datos mock
  private static resourcesData = [...mockResources];
  private static categoriesData = [...mockCategories];
  private static maintenancesData = [...mockMaintenances];
  private static academicProgramsData = [...mockAcademicPrograms];
  private static programResourceAssociationsData = [
    ...mockProgramResourceAssociations,
  ];
  private static programUserAssociationsData = [...mockProgramUserAssociations];
  private static resourceUsersData = [...mockResourceUsers];
  private static reservationsData = [...mockReservations];

  /**
   * Simula una llamada HTTP con datos mock
   */
  static async mockRequest<T>(
    endpoint: string,
    method: string = "GET",
    data?: any
  ): Promise<ApiResponse<T>> {
    // Simular delay de red
    await mockDelay(300);

    // Simular diferentes endpoints
    if (endpoint.includes("/auth/login") && method === "POST") {
      return this.mockLogin(data) as any;
    }

    if (endpoint.includes("/auth/register") && method === "POST") {
      return this.mockRegister(data) as any;
    }

    if (endpoint.includes("/auth/forgot-password") && method === "POST") {
      return this.mockForgotPassword(data) as any;
    }

    if (endpoint.includes("/auth/reset-password") && method === "POST") {
      return this.mockResetPassword(data) as any;
    }

    if (endpoint.includes("/auth/me") && method === "GET") {
      return this.mockGetCurrentUser() as any;
    }

    if (endpoint.includes("/auth/profile") && method === "GET") {
      return this.mockGetCurrentUser() as any;
    }

    if (endpoint.includes("/auth/profile") && method === "PUT") {
      return this.mockUpdateProfile(data) as any;
    }

    if (endpoint.includes("/auth/change-password") && method === "POST") {
      return this.mockChangePassword(data) as any;
    }

    if (endpoint.includes("/users") && method === "GET") {
      return this.mockGetUsers() as any;
    }

    if (endpoint.includes("/roles") && method === "GET") {
      return this.mockGetRoles() as any;
    }

    if (endpoint.includes("/permissions") && method === "GET") {
      return this.mockGetPermissions() as any;
    }

    if (endpoint.includes("/audit/logs") && method === "GET") {
      return this.mockGetAuditLogs() as any;
    }

    // ============================================
    // RESOURCES SERVICE ENDPOINTS
    // ============================================

    if (endpoint.includes("/resources") && method === "GET") {
      // Verificar si es un ID específico
      const idMatch = endpoint.match(/\/resources\/([^/]+)$/);
      if (idMatch && idMatch[1] !== "search") {
        return this.mockGetResourceById(idMatch[1]) as any;
      }

      // Extraer query params sin usar URL externa
      const queryString = endpoint.split("?")[1] || "";
      const params = new URLSearchParams(queryString);
      const page = parseInt(params.get("page") || "1");
      const limit = parseInt(params.get("limit") || "20");

      return this.mockGetResources(page, limit) as any;
    }

    if (endpoint.includes("/resources") && method === "POST") {
      return this.mockCreateResource(data) as any;
    }

    if (endpoint.includes("/resources") && method === "PATCH") {
      const idMatch = endpoint.match(/\/resources\/([^/]+)$/);
      if (idMatch) {
        return this.mockUpdateResource(idMatch[1], data) as any;
      }
    }

    if (endpoint.includes("/resources") && method === "DELETE") {
      const idMatch = endpoint.match(/\/resources\/([^/]+)$/);
      if (idMatch) {
        return this.mockDeleteResource(idMatch[1]) as any;
      }
    }

    if (endpoint.includes("/categories") && method === "GET") {
      return this.mockGetCategories() as any;
    }

    if (endpoint.includes("/maintenances") && method === "GET") {
      return this.mockGetMaintenances() as any;
    }

    if (endpoint.includes("/academic-programs") && method === "GET") {
      const idMatch = endpoint.match(/\/academic-programs\/([^/]+)$/);
      if (idMatch) {
        return this.mockGetAcademicProgramById(idMatch[1]) as any;
      }
      return this.mockGetAcademicPrograms() as any;
    }

    if (endpoint.includes("/academic-programs") && method === "POST") {
      return this.mockCreateAcademicProgram(data) as any;
    }

    if (endpoint.includes("/academic-programs") && method === "PUT") {
      const idMatch = endpoint.match(/\/academic-programs\/([^/]+)$/);
      if (idMatch) {
        return this.mockUpdateAcademicProgram(idMatch[1], data) as any;
      }
    }

    if (endpoint.includes("/program-resources") && method === "GET") {
      const programIdMatch = endpoint.match(/programId=([^&]+)/);
      if (programIdMatch) {
        return this.mockGetProgramResources(programIdMatch[1]) as any;
      }
      return this.mockGetProgramResourceAssociations() as any;
    }

    if (endpoint.includes("/program-resources") && method === "POST") {
      return this.mockAddResourceToProgram(data) as any;
    }

    if (endpoint.includes("/program-resources") && method === "DELETE") {
      const match = endpoint.match(/programId=([^&]+)&resourceId=([^&]+)/);
      if (match) {
        return this.mockRemoveResourceFromProgram(match[1], match[2]) as any;
      }
    }

    if (endpoint.includes("/program-users") && method === "GET") {
      const programIdMatch = endpoint.match(/programId=([^&]+)/);
      if (programIdMatch) {
        return this.mockGetProgramUsers(programIdMatch[1]) as any;
      }
      return this.mockGetProgramUserAssociations() as any;
    }

    if (endpoint.includes("/program-users") && method === "POST") {
      return this.mockAddUserToProgram(data) as any;
    }

    if (endpoint.includes("/program-users") && method === "DELETE") {
      const match = endpoint.match(/programId=([^&]+)&userId=([^&]+)/);
      if (match) {
        return this.mockRemoveUserFromProgram(match[1], match[2]) as any;
      }
    }

    // ============================================
    // RESERVATIONS SERVICE ENDPOINTS
    // ============================================

    if (endpoint.includes("/reservations") && method === "GET") {
      // Verificar si es un ID específico
      const idMatch = endpoint.match(/\/reservations\/([^/]+)$/);
      if (idMatch) {
        return this.mockGetReservationById(idMatch[1]) as any;
      }
      return this.mockGetReservations() as any;
    }

    if (endpoint.includes("/reservations") && method === "POST") {
      return this.mockCreateReservation(data) as any;
    }

    if (endpoint.includes("/reservations") && method === "PATCH") {
      const idMatch = endpoint.match(/\/reservations\/([^/]+)$/);
      if (idMatch) {
        return this.mockUpdateReservation(idMatch[1], data) as any;
      }
    }

    if (endpoint.includes("/reservations") && method === "DELETE") {
      const idMatch = endpoint.match(/\/reservations\/([^/]+)$/);
      if (idMatch) {
        return this.mockCancelReservation(idMatch[1]) as any;
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
  }): ApiResponse<any> {
    const result = getMockLoginResponse(
      credentials.email,
      credentials.password
    );

    if (!result) {
      throw {
        response: {
          status: 401,
          data: {
            success: false,
            code: "AUTH-001",
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

  private static mockRegister(userData: any): ApiResponse<any> {
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

  private static mockForgotPassword(data: { email: string }): ApiResponse<any> {
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
      `[MOCK] Enlace de recuperación: /reset-password?token=${resetToken}`
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
  }): ApiResponse<any> {
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

  private static mockGetCurrentUser(): ApiResponse<any> {
    return {
      success: true,
      data: mockUsers[0], // Admin por defecto
      timestamp: new Date().toISOString(),
    };
  }

  private static mockUpdateProfile(data: any): ApiResponse<any> {
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
  }): ApiResponse<any> {
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

  private static mockGetUsers(): ApiResponse<any> {
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

  private static mockGetRoles(): ApiResponse<any> {
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

  private static mockGetPermissions(): ApiResponse<any> {
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

  private static mockGetAuditLogs(): ApiResponse<any> {
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
    limit: number = 20
  ): ApiResponse<any> {
    const total = this.resourcesData.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = this.resourcesData.slice(startIndex, endIndex);

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

  private static mockGetResourceById(id: string): ApiResponse<any> {
    const resource = this.resourcesData.find((r: any) => r.id === id);

    if (!resource) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "RSRC-001",
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

  private static mockCreateResource(data: any): ApiResponse<any> {
    const newResource = {
      id: `res_${Date.now()}`,
      ...data,
      status: "AVAILABLE",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.resourcesData.push(newResource);

    return {
      success: true,
      data: newResource,
      message: "Resource created successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockUpdateResource(id: string, data: any): ApiResponse<any> {
    const index = this.resourcesData.findIndex((r: any) => r.id === id);

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "RSRC-001",
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

  private static mockDeleteResource(id: string): ApiResponse<any> {
    const index = this.resourcesData.findIndex((r: any) => r.id === id);

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "RSRC-001",
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

  private static mockGetCategories(): ApiResponse<any> {
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

  private static mockGetMaintenances(): ApiResponse<any> {
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

  private static mockGetAcademicPrograms(): ApiResponse<any> {
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

  private static mockGetAcademicProgramById(id: string): ApiResponse<any> {
    const program = this.academicProgramsData.find((p: any) => p.id === id);

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

  private static mockCreateAcademicProgram(data: any): ApiResponse<any> {
    const newProgram = {
      id: `prog_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    data: any
  ): ApiResponse<any> {
    const index = this.academicProgramsData.findIndex((p: any) => p.id === id);

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

  private static mockGetProgramResourceAssociations(): ApiResponse<any> {
    return {
      success: true,
      data: {
        items: this.programResourceAssociationsData,
      },
      message: "Program-resource associations retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetProgramResources(programId: string): ApiResponse<any> {
    const associations = this.programResourceAssociationsData.filter(
      (a: any) => a.programId === programId
    );

    const resources = associations
      .map((assoc: any) => {
        const resource = this.resourcesData.find(
          (r: any) => r.id === assoc.resourceId
        );
        return resource ? { ...resource, priority: assoc.priority } : null;
      })
      .filter(Boolean);

    return {
      success: true,
      data: {
        items: resources,
      },
      message: "Program resources retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockAddResourceToProgram(data: any): ApiResponse<any> {
    const newAssociation = {
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
    resourceId: string
  ): ApiResponse<any> {
    const index = this.programResourceAssociationsData.findIndex(
      (a: any) => a.programId === programId && a.resourceId === resourceId
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

  private static mockGetProgramUserAssociations(): ApiResponse<any> {
    return {
      success: true,
      data: {
        items: this.programUserAssociationsData,
      },
      message: "Program-user associations retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetProgramUsers(programId: string): ApiResponse<any> {
    const associations = this.programUserAssociationsData.filter(
      (a: any) => a.programId === programId
    );

    const users = associations
      .map((assoc: any) => {
        const user = this.resourceUsersData.find(
          (u: any) => u.id === assoc.userId
        );
        return user
          ? {
              ...user,
              programRole: assoc.role,
              enrollmentDate: assoc.enrollmentDate,
            }
          : null;
      })
      .filter(Boolean);

    return {
      success: true,
      data: {
        items: users,
      },
      message: "Program users retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockAddUserToProgram(data: any): ApiResponse<any> {
    const newAssociation = {
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
    userId: string
  ): ApiResponse<any> {
    const index = this.programUserAssociationsData.findIndex(
      (a: any) => a.programId === programId && a.userId === userId
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
  // RESERVATIONS SERVICE ENDPOINTS
  // ============================================

  private static mockGetReservations(): ApiResponse<any> {
    return {
      success: true,
      data: {
        items: this.reservationsData,
        meta: {
          total: this.reservationsData.length,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      message: "Reservations retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  }

  private static mockGetReservationById(id: string): ApiResponse<any> {
    const reservation = this.reservationsData.find((r: any) => r.id === id);

    if (!reservation) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "RSVN-001",
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

  private static mockCreateReservation(data: any): ApiResponse<any> {
    const newReservation = {
      id: `rsv_${Date.now()}`,
      ...data,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    data: any
  ): ApiResponse<any> {
    const index = this.reservationsData.findIndex((r: any) => r.id === id);

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "RSVN-001",
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

  private static mockCancelReservation(id: string): ApiResponse<any> {
    const index = this.reservationsData.findIndex((r: any) => r.id === id);

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: {
            success: false,
            code: "RSVN-001",
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
    message: string = "No se pudo conectar con el backend"
  ): never {
    throw {
      code: "NETWORK_ERROR",
      message,
      statusCode: 0,
    };
  }
}
