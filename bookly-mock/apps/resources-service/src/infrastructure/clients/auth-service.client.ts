import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  IAuthServiceClient,
} from "../../application/services/schedule-import.service";

/**
 * Auth Service HTTP Client
 * Comunica con auth-service para resolución y creación de usuarios docentes
 */
@Injectable()
export class AuthServiceClient implements IAuthServiceClient {
  private readonly logger = createLogger("AuthServiceClient");
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>("AUTH_SERVICE_URL") ||
      "http://localhost:3001";
  }

  /**
   * Buscar o crear un usuario docente
   * Si no existe, lo crea con el rol especificado y sin password (SSO-ready)
   */
  async findOrCreateTeacher(params: {
    fullName: string;
    email: string;
    role: string;
    tenantId: string;
    createdBy: string;
  }): Promise<{ userId: string; created: boolean }> {
    this.logger.info("Finding or creating teacher", {
      email: params.email,
      fullName: params.fullName,
    });

    try {
      // Intentar buscar por email primero
      const searchUrl = `${this.baseUrl}/api/v1/users/search?email=${encodeURIComponent(params.email)}`;
      const searchResponse = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Service": "resources-service",
          "X-Tenant-Id": params.tenantId,
        },
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const users = searchData?.data?.data || searchData?.data || [];

        if (Array.isArray(users) && users.length > 0) {
          const existingUser = users[0];
          this.logger.info("Teacher found", {
            userId: existingUser._id || existingUser.id,
            email: params.email,
          });
          return {
            userId: existingUser._id || existingUser.id,
            created: false,
          };
        }
      }

      // No existe, crear
      const nameParts = this.parseFullName(params.fullName);
      const createUrl = `${this.baseUrl}/api/v1/users`;
      const createResponse = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Service": "resources-service",
          "X-Tenant-Id": params.tenantId,
        },
        body: JSON.stringify({
          email: params.email,
          firstName: nameParts.firstName,
          lastName: nameParts.lastName,
          roles: [params.role],
          tenantId: params.tenantId,
          isActive: true,
          isEmailVerified: false,
          // Sin password: usuario puede autenticarse por SSO o solicitar clave
          audit: {
            createdBy: params.createdBy,
          },
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        this.logger.warn("Failed to create teacher via HTTP, using fallback", {
          status: createResponse.status,
          error: errorText,
        });

        // Fallback: retornar ID ficticio basado en email para no bloquear importación
        return {
          userId: `pending-${Buffer.from(params.email).toString("base64").substring(0, 24)}`,
          created: false,
        };
      }

      const createData = await createResponse.json();
      const newUser = createData?.data?.data || createData?.data || createData;
      const userId = newUser._id || newUser.id;

      this.logger.info("Teacher created", {
        userId,
        email: params.email,
      });

      return { userId, created: true };
    } catch (error) {
      this.logger.warn("Auth service communication failed, using fallback", {
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // Fallback resiliente: no bloquear importación si auth-service no responde
      return {
        userId: `pending-${Buffer.from(params.email).toString("base64").substring(0, 24)}`,
        created: false,
      };
    }
  }

  /**
   * Parsear nombre completo en formato UFPS (APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2)
   */
  private parseFullName(fullName: string): {
    firstName: string;
    lastName: string;
  } {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);

    if (parts.length >= 4) {
      // APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2
      return {
        firstName: parts.slice(2).join(" "),
        lastName: parts.slice(0, 2).join(" "),
      };
    } else if (parts.length === 3) {
      // APELLIDO1 APELLIDO2 NOMBRE1
      return {
        firstName: parts[2],
        lastName: parts.slice(0, 2).join(" "),
      };
    } else if (parts.length === 2) {
      return {
        firstName: parts[1],
        lastName: parts[0],
      };
    }

    return {
      firstName: fullName,
      lastName: "",
    };
  }
}
