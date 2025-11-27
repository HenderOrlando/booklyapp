import { createLogger } from "@libs/common";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

/**
 * JWT Extractor Middleware
 * Extrae información del JWT sin validarlo (los microservicios lo validan)
 * Solo decodifica el payload para obtener userId y roles
 *
 * IMPORTANTE: El API Gateway NO valida tokens, solo los extrae
 */
@Injectable()
export class JwtExtractorMiddleware implements NestMiddleware {
  private readonly logger = createLogger("JwtExtractor");

  use(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7); // Remover "Bearer "

      try {
        // Decodificar JWT sin validar (solo extraer payload)
        const payload = this.decodeJwt(token);

        if (payload) {
          // Agregar usuario al request
          (req as any).user = {
            id: payload.sub || payload.userId || payload.id,
            email: payload.email,
            username: payload.username,
            roles: payload.roles || [],
            permissions: payload.permissions || [],
          };

          this.logger.debug(
            `JWT extracted for user: ${(req as any).user.id || "unknown"}`
          );
        }
      } catch (error) {
        // No fallar si hay error, solo loguear
        this.logger.warn(`Failed to decode JWT: ${error.message}`);
      }
    }

    next();
  }

  /**
   * Decodificar JWT sin validar firma
   * Solo extrae el payload (segunda parte del token)
   */
  private decodeJwt(token: string): any | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      // Decodificar payload (segunda parte)
      const payload = Buffer.from(parts[1], "base64").toString("utf8");
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
}
