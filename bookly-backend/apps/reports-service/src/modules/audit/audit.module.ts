import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditRecordRequestedHandler } from "./handlers/audit-record-requested.handler";
import { AuditRepository } from "./repositories/audit.repository";
import { AuditRecord, AuditRecordSchema } from "./schemas/audit-record.schema";
import { AuditService } from "./services/audit.service";

/**
 * Módulo de auditoría en reports-service
 *
 * Responsabilidades:
 * - Escuchar eventos AuditRecordRequestedEvent desde todos los microservicios
 * - Persistir registros de auditoría en MongoDB
 * - Proveer APIs para consultar historial de auditoría
 *
 * Este módulo es el ÚNICO responsable de persistir auditorías en Bookly.
 * Los demás microservicios solo emiten eventos usando @reports/audit-decorators
 */
@Module({
  imports: [
    // CQRS para event handlers
    CqrsModule,

    // MongoDB schema
    MongooseModule.forFeature([
      { name: AuditRecord.name, schema: AuditRecordSchema },
    ]),
  ],
  providers: [
    // Repositorio
    AuditRepository,

    // Servicio
    AuditService,

    // Event Handlers
    AuditRecordRequestedHandler,
  ],
  exports: [
    // Exportar servicio para uso en controllers
    AuditService,
    // Exportar MongooseModule para que el modelo esté disponible en ReportsModule
    MongooseModule,
  ],
})
export class AuditModule {}
