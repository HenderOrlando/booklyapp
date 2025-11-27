import { AuditStatus } from "@libs/common/enums";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { AuditService } from "../../application/services/audit.service";
import {
  AUDIT_ACTION_KEY,
  AuditMetadata,
} from "../decorators/audit-action.decorator";

/**
 * Interceptor para auditoría automática
 * Se ejecuta en endpoints marcados con @AuditAction()
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Obtener metadata de auditoría
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_ACTION_KEY,
      context.getHandler()
    );

    // Si no hay metadata, continuar sin auditoría
    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, method, url, ip, body } = request;
    const startTime = Date.now();

    // Si no hay usuario autenticado, continuar sin auditoría
    if (!user || !user.id) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // Registrar acción exitosa
        this.auditService.log({
          userId: user.id,
          action: auditMetadata.action,
          resource: auditMetadata.resource,
          method,
          url,
          ip: ip || request.connection?.remoteAddress || "unknown",
          userAgent: request.headers["user-agent"],
          status: AuditStatus.SUCCESS,
          executionTime: Date.now() - startTime,
          changes: body,
        });
      }),
      catchError((error) => {
        // Registrar acción fallida
        this.auditService.log({
          userId: user.id,
          action: auditMetadata.action,
          resource: auditMetadata.resource,
          method,
          url,
          ip: ip || request.connection?.remoteAddress || "unknown",
          userAgent: request.headers["user-agent"],
          status: AuditStatus.FAILED,
          error: error.message || "Unknown error",
          executionTime: Date.now() - startTime,
        });

        return throwError(() => error);
      })
    );
  }
}
