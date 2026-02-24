# Integración de Event Bus con Sistema de Auditoría

**Fecha**: 2025-11-04  
**Sprint**: Fase 1 - Sprint 1 - RF-42  
**Componente**: AuditService + KafkaService

---

## 🎯 Objetivo

Implementar la publicación de eventos de auditoría a través de Kafka para sistemas externos, completando el TODO pendiente en el `AuditService`.

---

## ✅ Componentes Integrados

### 1. **KafkaService Reutilizado**

- **Ubicación**: `libs/kafka/src/kafka.service.ts`
- **Método Principal**: `publish<T>(topic: string, event: EventPayload<T>): Promise<void>`
- **Características**:
  - Cliente Kafka con retry automático
  - Soporte para topics dinámicos
  - Headers con metadata del evento
  - Logging estructurado

### 2. **EventPayload Interface**

- **Ubicación**: `libs/common/src/interfaces/index.ts`
- **Estructura**:

  ```typescript
  interface EventPayload<T = any> {
    eventId: string; // UUID único del evento
    eventType: string; // Tipo de evento (e.g., "audit.log.created")
    timestamp: Date; // Marca de tiempo
    service: string; // Servicio origen (e.g., "auth-service")
    data: T; // Payload del evento
    metadata?: Record<string, any>; // Metadata adicional
  }
  ```

### 3. **AuditService Mejorado**

- **Ubicación**: `apps/auth-service/src/application/services/audit.service.ts`

#### Método Privado Agregado: `publishAuditEvent()`

```typescript
private async publishAuditEvent<T = any>(
  eventType: string,
  data: T
): Promise<void> {
  try {
    const event: EventPayload<T> = {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date(),
      service: "auth-service",
      data,
      metadata: {
        source: "AuditService",
        version: "1.0.0",
      },
    };

    await this.kafkaService.publish(eventType, event);

    this.logger.debug("Audit event published", {
      eventType,
      eventId: event.eventId,
    });
  } catch (error: any) {
    // No lanzar error para no interrumpir el flujo de auditoría
    this.logger.error("Failed to publish audit event", error, {
      eventType,
    });
  }
}
```

---

## 📋 Eventos Publicados

### 1. `audit.log.created`

- **Trigger**: Cada vez que se registra una acción en el log de auditoría
- **Payload**:

  ```typescript
  {
    auditLogId: string;
    userId: string;
    action: string; // CREATE, UPDATE, DELETE, VIEW, ACCESS
    resource: string;
    status: string; // SUCCESS, FAILED
    timestamp: Date;
  }
  ```

### 2. `audit.unauthorized_attempt`

- **Trigger**: Cuando se detecta un intento de acceso no autorizado (status === FAILED)
- **Payload**:

  ```typescript
  {
    auditLogId: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: Date;
    ip: string;
    error?: string;
  }
  ```

---

## 🔧 Configuración en AuthModule

### Imports Agregados

```typescript
import { KafkaModule } from "@libs/kafka/src";
import { AuditService } from "./application/services/audit.service";
import {
  AuditLog,
  AuditLogSchema,
} from "./infrastructure/schemas/audit-log.schema";
```

### Módulo Configurado

```typescript
@Module({
  imports: [
    // Event Bus
    KafkaModule.forRoot({
      clientId: "auth-service",
      groupId: "auth-service-group",
    }),

    // Database
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      // ... otros schemas
    ]),
  ],
  providers: [
    AuditService,
    // ... otros providers
  ],
})
export class AuthModule {}
```

---

## 🚀 Flujo de Eventos

```
┌─────────────────┐
│  Acción Usuario │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AuditService   │
│  .log()         │
└────────┬────────┘
         │
         ├──► Crear registro en MongoDB
         │
         ├──► publishAuditEvent("audit.log.created", {...})
         │    │
         │    ▼
         │    ┌─────────────────┐
         │    │  KafkaService   │
         │    │  .publish()     │
         │    └────────┬────────┘
         │             │
         │             ▼
         │    ┌─────────────────┐
         │    │  Kafka Topic    │
         │    │  "audit.log.    │
         │    │   created"      │
         │    └────────┬────────┘
         │             │
         │             ▼
         │    ┌─────────────────┐
         │    │  Consumers      │
         │    │  (Reports,      │
         │    │   Analytics)    │
         │    └─────────────────┘
         │
         └──► Si status === FAILED
              │
              ▼
              publishAuditEvent("audit.unauthorized_attempt", {...})
```

---

## ✅ Verificación

### Compilación

```bash
npm run build
# Exit code: 0 ✓
```

### Logs Esperados

```
[INFO] [AuditService] Audit log created
[DEBUG] [AuditService] Audit event published
[INFO] [KafkaService] Event published to topic: audit.log.created
```

### Logs de Fallo (sin interrumpir flujo principal)

```
[ERROR] [AuditService] Failed to publish audit event
[INFO] [AuditService] Audit log created (registro guardado a pesar del error de Kafka)
```

---

## 🔒 Características de Seguridad

1. **No-blocking**: Errores en Kafka no interrumpen el flujo de auditoría
2. **Idempotencia**: Cada evento tiene un `eventId` único (UUID)
3. **Trazabilidad**: Headers de Kafka con metadata del evento
4. **Retry**: KafkaService tiene retry automático configurado
5. **Logging**: Todos los eventos son loggeados para debugging

---

## 📊 Beneficios

1. **Desacoplamiento**: Sistemas externos pueden consumir eventos sin conocer AuditService
2. **Escalabilidad**: Kafka maneja miles de eventos por segundo
3. **Resiliencia**: Kafka persiste eventos incluso si consumers están caídos
4. **Análisis en Tiempo Real**: Reports y Analytics services pueden procesar eventos inmediatamente
5. **Arquitectura Event-Driven**: Cumple con principios de EDA de Bookly

---

## 🔄 Próximos Pasos

1. Implementar consumers en reports-service
2. Crear dashboards de auditoría en tiempo real
3. Implementar alertas automáticas para intentos no autorizados
4. Agregar eventos adicionales (e.g., `audit.log.deleted`, `audit.pattern.detected`)

---

## 📝 Referencias

- **EventPayload**: `/libs/common/src/interfaces/index.ts`
- **KafkaService**: `/libs/kafka/src/kafka.service.ts`
- **AuditService**: `/apps/auth-service/src/application/services/audit.service.ts`
- **AuthModule**: `/apps/auth-service/src/auth.module.ts`
