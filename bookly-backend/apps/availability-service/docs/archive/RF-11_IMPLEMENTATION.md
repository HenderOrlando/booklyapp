# RF-11: Historial de Uso - Implementación Completa

**Fecha de Implementación**: Noviembre 8, 2025  
**Estado**: ✅ Completado  
**Prioridad**: Alta (Compliance/Auditoría)

---

## 📋 Resumen

Sistema completo de auditoría que registra automáticamente todas las acciones sobre reservas con datos before/after, usuario, IP, timestamps y metadatos HTTP. Implementado con arquitectura reutilizable en `@libs/audit` para uso en todos los microservicios.

---

## 🎯 Características Implementadas

### ✅ Infraestructura Reutilizable (@libs/audit)

**Componentes Creados**:

- ✅ `IAuditRepository` - Interfaz base para repositorios de auditoría
- ✅ `IAuditRecord` - Interfaz estándar de registro de auditoría
- ✅ `AuditAction` - Enum de acciones auditables
- ✅ `@Audit()` - Decorador para marcar métodos auditables
- ✅ `AuditInterceptor` - Interceptor HTTP que captura contexto automáticamente
- ✅ `AuditService` - Servicio base con integración Event-Driven
- ✅ `AuditModule` - Módulo configurable para cualquier microservicio

**Ubicación**: `/libs/audit/`

### ✅ Implementación en Availability Service

**Schema MongoDB**:

- ✅ `ReservationHistory` - Colección con índices optimizados
- ✅ Índices compuestos: `{reservationId, timestamp}`, `{userId, timestamp}`, `{action, timestamp}`

**Repositorio**:

- ✅ `ReservationHistoryRepository` - Implementa `IAuditRepository`
- ✅ Métodos: `save()`, `findByEntityId()`, `findByUserId()`, `findWithFilters()`, `exportToCsv()`

**Queries & Handlers CQRS**:

- ✅ `GetReservationHistoryQuery` + Handler
- ✅ `GetUserActivityQuery` + Handler

**Controller REST**:

- ✅ `HistoryController` con 5 endpoints:
  - `GET /history/reservation/:id` - Historial de reserva
  - `GET /history/user/:userId` - Actividad de usuario
  - `GET /history/search` - Búsqueda con filtros
  - `POST /history/export` - Exportar CSV/JSON
  - `GET /history/my-activity` - Actividad personal

**DTOs**:

- ✅ `HistoryQueryDto` - Filtros de consulta con paginación
- ✅ `ExportHistoryDto` - Opciones de exportación

**Integración con Módulo**:

- ✅ `AuditModule.forRoot()` configurado en `AvailabilityModule`
- ✅ Interceptor global habilitado
- ✅ Event Bus integrado para publicar eventos de auditoría

---

## 🏗️ Arquitectura

### Flujo de Auditoría Automática

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario hace petición HTTP (ej: POST /reservations)      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. JwtAuthGuard extrae usuario del token                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. AuditInterceptor captura:                                │
│    - Usuario (id)                                           │
│    - IP (X-Forwarded-For o connection.remoteAddress)        │
│    - User-Agent                                             │
│    - Timestamp                                              │
│    - Metadata (method, url, controller, handler)            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Método decorado con @Audit() ejecuta lógica              │
│    Ejemplo: createReservation(dto)                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Interceptor construye IAuditRecord:                      │
│    - entityId: resultado.id                                 │
│    - action: CREATED                                        │
│    - afterData: resultado (sanitizado)                      │
│    - beforeData: opcional                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. AuditService.record()                                    │
│    ├─ Guarda en MongoDB                                     │
│    └─ Publica evento al Event Bus                           │
│       (audit.reservation.created)                           │
└─────────────────────────────────────────────────────────────┘
```

### Comunicación Event-Driven

```
availability-service                    reports-service
      │                                       │
      │  1. Guarda historial local            │
      │     (ReservationHistory)              │
      │                                       │
      │  2. Publica evento                    │
      ├──────────────────────────────────────>│
      │  audit.reservation.created            │
      │                                       │  3. Consume evento
      │                                       │  4. Agrega a analytics
      │                                       │
```

**Eventos Publicados**:

- `audit.reservation.created`
- `audit.reservation.updated`
- `audit.reservation.cancelled`
- `audit.reservation.checked_in`
- `audit.reservation.checked_out`
- `audit.reservation.no_show`

---

## 🔧 Uso

### 1. Auditoría Automática con Decorador

```typescript
import { Audit, AuditAction } from "@libs/audit";

@Injectable()
export class ReservationService {
  @Audit({
    entityType: "RESERVATION",
    action: AuditAction.CREATED,
    captureBeforeData: false,
  })
  async createReservation(dto: CreateReservationDto) {
    // La auditoría se registra automáticamente al finalizar
    const reservation = await this.repository.create(dto);
    return reservation;
  }

  @Audit({
    entityType: "RESERVATION",
    action: AuditAction.UPDATED,
    captureBeforeData: true, // Captura estado anterior
    excludeFields: ["internalNotes"], // Excluye campos sensibles
  })
  async updateReservation(id: string, dto: UpdateReservationDto) {
    return await this.repository.update(id, dto);
  }
}
```

### 2. Consulta de Historial

```bash
# Obtener historial de una reserva
GET /api/history/reservation/507f1f77bcf86cd799439011
  ?page=1&limit=20
  &startDate=2025-01-01T00:00:00Z
  &endDate=2025-12-31T23:59:59Z

# Obtener actividad de un usuario
GET /api/history/user/507f1f77bcf86cd799439012
  ?action=CREATED
  ?page=1&limit=20

# Búsqueda avanzada
GET /api/history/search
  ?reservationId=507f1f77bcf86cd799439011
  &userId=507f1f77bcf86cd799439012
  &action=UPDATED
  &startDate=2025-01-01T00:00:00Z

# Mi actividad personal
GET /api/history/my-activity?page=1&limit=20
```

### 3. Exportación

```bash
# Exportar a CSV
POST /api/history/export?format=csv
Content-Type: application/json
{
  "reservationId": "507f1f77bcf86cd799439011",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z"
}

# Exportar a JSON
POST /api/history/export?format=json
```

---

## 📊 Schema MongoDB

```javascript
{
  _id: ObjectId("..."),
  reservationId: ObjectId("507f1f77bcf86cd799439011"),
  action: "CREATED",
  beforeData: null,
  afterData: {
    resourceId: "507f1f77bcf86cd799439013",
    userId: "507f1f77bcf86cd799439014",
    startDate: ISODate("2025-11-10T09:00:00Z"),
    endDate: ISODate("2025-11-10T11:00:00Z"),
    status: "PENDING",
    purpose: "Clase de programación"
  },
  userId: ObjectId("507f1f77bcf86cd799439014"),
  ip: "192.168.1.100",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  location: null,
  timestamp: ISODate("2025-11-08T10:30:00Z"),
  metadata: {
    method: "POST",
    url: "/api/reservations",
    controller: "ReservationsController",
    handler: "create"
  }
}
```

---

## 🔒 Seguridad

### Sanitización Automática

Campos excluidos por defecto del registro:

- `password`
- `token`
- `secret`
- `apiKey`

### Permisos Requeridos

- `history:read` - Leer historial
- `history:export` - Exportar historial
- Los usuarios pueden ver su propia actividad sin permisos especiales

### Validación de Acceso

- Admins pueden ver actividad de cualquier usuario
- Usuarios normales solo ven su propia actividad
- Historial de reservas solo accesible por dueño o admin

---

## 🧪 Testing

### Tests Unitarios

```typescript
describe("AuditService", () => {
  it("debe registrar auditoría correctamente", async () => {
    const record: IAuditRecord = {
      entityId: "123",
      entityType: "RESERVATION",
      action: AuditAction.CREATED,
      afterData: { status: "PENDING" },
      userId: "user-456",
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0...",
      timestamp: new Date(),
    };

    await auditService.record(record);

    expect(repository.save).toHaveBeenCalledWith(record);
    expect(eventBus.publish).toHaveBeenCalledWith(
      "audit.reservation.created",
      expect.any(Object)
    );
  });
});
```

### Tests de Integración

```typescript
describe("HistoryController (e2e)", () => {
  it("GET /history/reservation/:id debe retornar historial", async () => {
    const response = await request(app.getHttpServer())
      .get("/history/reservation/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.records).toHaveLength(5);
    expect(response.body.total).toBe(5);
    expect(response.body.page).toBe(1);
  });
});
```

---

## 📈 Performance

### Índices MongoDB

```javascript
// Índices creados automáticamente
db.reservation_history.createIndex({ reservationId: 1, timestamp: -1 });
db.reservation_history.createIndex({ userId: 1, timestamp: -1 });
db.reservation_history.createIndex({ action: 1, timestamp: -1 });
```

### Métricas

- **Escritura asíncrona**: No bloquea respuesta al usuario
- **Límite de exportación**: 10,000 registros por seguridad
- **Paginación**: 20 registros por defecto (máx. 100)

---

## 🔗 Integración con Otros Servicios

### Reports Service

Consume eventos de auditoría para generar:

- Reportes de uso por recurso
- Reportes de actividad por usuario
- Analytics de patrones de uso

### API Gateway

Expone endpoints consolidados:

```
/api/v1/availability/history/reservation/:id
/api/v1/availability/history/user/:userId
/api/v1/availability/history/export
```

---

## 📚 Documentación Adicional

- [Librería @libs/audit README](/libs/audit/README.md)
- [RF-11: Requisitos](./requirements/RF-11_HISTORIAL_USO.md)
- [PENDING_FEATURES_PLAN.md](./PENDING_FEATURES_PLAN.md)

---

## ✅ Criterios de Aceptación Cumplidos

- [x] Registro automático de todas las acciones sobre reservas
- [x] Captura de datos before/after
- [x] Captura de contexto HTTP (usuario, IP, User-Agent)
- [x] Timestamps precisos
- [x] Consulta de historial por reserva
- [x] Consulta de historial por usuario
- [x] Búsqueda con múltiples filtros
- [x] Exportación a CSV y JSON
- [x] Paginación de resultados
- [x] Integración con Event-Driven Architecture
- [x] Permisos granulares
- [x] Sanitización de campos sensibles
- [x] Índices optimizados para consultas
- [x] Documentación Swagger completa
- [x] Arquitectura reutilizable en libs/

---

**Última Actualización**: Noviembre 8, 2025  
**Implementado por**: Bookly Development Team  
**Estado**: ✅ Production Ready
