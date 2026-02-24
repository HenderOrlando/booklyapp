import { AuditAction, AuditStatus } from "@libs/common/enums";
import { createErrorResponse } from "@libs/common";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Response } from "express";
import { AuditService } from '@auth/application/services/audit.service';

/**
 * Exception Filter para capturar y auditar intentos de acceso no autorizado
 */
@Catch(UnauthorizedException, ForbiddenException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  constructor(private readonly auditService: AuditService) {}

  catch(
    exception: UnauthorizedException | ForbiddenException,
    host: ArgumentsHost
  ) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const message = exception.message || "Unauthorized access";

    // Registrar intento no autorizado si hay usuario en la request
    if (request.user) {
      this.auditService.log({
        userId: request.user.id,
        action: AuditAction.UNAUTHORIZED_ACCESS,
        resource: request.url,
        method: request.method,
        url: request.url,
        ip: request.ip || request.connection?.remoteAddress || "unknown",
        userAgent: request.headers["user-agent"],
        status: AuditStatus.FAILED,
        error: message,
      });
    }

    // Responder con error estándar
    response
      .status(status)
      .json(createErrorResponse(message, "AUTHORIZATION_ERROR"));
  }
}
