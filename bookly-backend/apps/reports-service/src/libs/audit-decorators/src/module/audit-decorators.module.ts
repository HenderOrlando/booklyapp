import { Global, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { CqrsModule } from "@nestjs/cqrs";
import { AuditEventInterceptor } from "../interceptors/audit-event.interceptor";
import { AuditHttpInterceptor } from "../interceptors/audit-http.interceptor";
import { AuditWebSocketInterceptor } from "../interceptors/audit-websocket.interceptor";

/**
 * Módulo global de decoradores de auditoría
 *
 * Proporciona:
 * - Decoradores: @Audit(), @AuditWebSocket(), @AuditEvent()
 * - Interceptores automáticos que emiten eventos de auditoría
 * - Integración con EventBus de CQRS
 *
 * NO incluye lógica de persistencia, solo emite eventos que serán
 * escuchados por el reports-service
 *
 * @example
 * ```typescript
 * // En cada microservicio
 * @Module({
 *   imports: [
 *     AuditDecoratorsModule,
 *     // otros módulos
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({
  imports: [CqrsModule],
  providers: [
    // Registrar interceptores globalmente
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditHttpInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditWebSocketInterceptor,
    },
    // AuditEventInterceptor se usa de forma diferente (wrapper manual)
    AuditEventInterceptor,
  ],
  exports: [AuditEventInterceptor],
})
export class AuditDecoratorsModule {}
