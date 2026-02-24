/**
 * @reports/audit-decorators
 *
 * Decoradores e interceptores ligeros para auditoría event-driven
 *
 * Exporta:
 * - Decoradores: @Audit(), @AuditWebSocket(), @AuditEvent()
 * - Interceptores que emiten eventos de auditoría
 * - Interfaces y tipos compartidos
 * - Eventos para comunicación con reports-service
 * - AuditDecoratorsModule para importar en microservicios
 */

// Interfaces y tipos
export * from "./interfaces";

// Decoradores
export * from "./decorators";

// Interceptores
export * from "./interceptors";

// Eventos
export * from "./events";

// Módulo principal
export * from "./module/audit-decorators.module";
