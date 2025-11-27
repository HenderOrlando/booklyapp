# 📖 Guía de Uso - Decoradores de Auditoría

**Versión**: 1.0  
**Fecha**: 19 de noviembre de 2025  
**Para**: Equipo de Desarrollo Bookly

---

## 🎯 Introducción

Esta guía explica cómo usar los nuevos decoradores de auditoría en Bookly. Los decoradores permiten auditar acciones de forma automática y centralizada sin escribir código de persistencia.

---

## 🚀 Quick Start

### **1. Importar el decorador**

```typescript
import { Audit } from "@libs/audit-decorators";
```

### **2. Aplicar en un endpoint**

```typescript
@Post('login')
@Audit({
  entityType: 'USER',
  action: 'LOGIN'
})
async login(@Body() dto: LoginDto, @CurrentUser() user: IUserPayload) {
  return this.authService.login(dto);
}
```

### **3. ¡Listo!**

El evento de auditoría se emite automáticamente y se persiste en `reports-service` sin código adicional.

---

## 📋 Decoradores Disponibles

### **@Audit() - Endpoints HTTP**

**Uso**: Para auditar endpoints REST (GET, POST, PUT, DELETE, etc.)

```typescript
import { Audit } from "@libs/audit-decorators";

@Controller("resources")
export class ResourcesController {
  @Post()
  @Audit({
    entityType: "RESOURCE",
    action: "CREATE",
  })
  async create(
    @Body() dto: CreateResourceDto,
    @CurrentUser() user: IUserPayload
  ) {
    return this.resourcesService.create(dto);
  }

  @Put(":id")
  @Audit({
    entityType: "RESOURCE",
    action: "UPDATE",
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateResourceDto,
    @CurrentUser() user: IUserPayload
  ) {
    return this.resourcesService.update(id, dto);
  }

  @Delete(":id")
  @Audit({
    entityType: "RESOURCE",
    action: "DELETE",
  })
  async delete(@Param("id") id: string, @CurrentUser() user: IUserPayload) {
    return this.resourcesService.delete(id);
  }
}
```

### **@AuditWebSocket() - Eventos WebSocket**

**Uso**: Para auditar eventos de WebSocket/Gateway

```typescript
import { AuditWebSocket } from "@libs/audit-decorators";

@WebSocketGateway()
export class ReservationsGateway {
  @SubscribeMessage("reservation:create")
  @AuditWebSocket({
    entityType: "RESERVATION",
    action: "CREATE_VIA_WS",
  })
  async handleCreateReservation(
    @MessageBody() data: CreateReservationDto,
    @ConnectedSocket() client: Socket
  ) {
    return this.reservationsService.create(data);
  }
}
```

### **@AuditEvent() - Eventos de Dominio**

**Uso**: Para auditar eventos CQRS (Commands/Events)

```typescript
import { AuditEvent } from "@libs/audit-decorators";

@EventsHandler(ReservationCreatedEvent)
export class ReservationCreatedHandler
  implements IEventHandler<ReservationCreatedEvent>
{
  @AuditEvent({
    entityType: "RESERVATION",
    action: "CREATED",
  })
  async handle(event: ReservationCreatedEvent) {
    // La auditoría se registra automáticamente
    await this.notificationService.notifyReservationCreated(event);
  }
}
```

---

## 🎨 Opciones del Decorador

### **Configuración Completa**

```typescript
@Audit({
  entityType: 'RESOURCE',           // Tipo de entidad (obligatorio)
  action: 'UPDATE',                 // Acción realizada (obligatorio)
  includeRequest: true,             // Incluir datos del request (default: true)
  includeResponse: true,            // Incluir datos del response (default: true)
  includeUser: true,                // Incluir info del usuario (default: true)
  captureBeforeData: true,          // Capturar estado anterior (default: false)
  captureAfterData: true,           // Capturar estado nuevo (default: true)
  metadata: {                       // Metadata adicional (opcional)
    module: 'resources-service',
    feature: 'resource-management'
  }
})
```

### **Opciones Detalladas**

| Opción              | Tipo      | Default       | Descripción                                                  |
| ------------------- | --------- | ------------- | ------------------------------------------------------------ |
| `entityType`        | `string`  | **requerido** | Tipo de entidad afectada (USER, RESOURCE, RESERVATION, etc.) |
| `action`            | `string`  | **requerido** | Acción realizada (CREATE, UPDATE, DELETE, LOGIN, etc.)       |
| `includeRequest`    | `boolean` | `true`        | Incluir datos del request en la auditoría                    |
| `includeResponse`   | `boolean` | `true`        | Incluir datos del response en la auditoría                   |
| `includeUser`       | `boolean` | `true`        | Incluir información del usuario autenticado                  |
| `captureBeforeData` | `boolean` | `false`       | Capturar estado anterior de la entidad                       |
| `captureAfterData`  | `boolean` | `true`        | Capturar estado nuevo de la entidad                          |
| `metadata`          | `object`  | `{}`          | Metadata adicional personalizada                             |

---

## 📊 Datos Capturados Automáticamente

El decorador captura automáticamente:

### **Del Request**:

- ✅ IP del cliente
- ✅ User Agent
- ✅ Headers relevantes
- ✅ Parámetros de query
- ✅ Parámetros de ruta
- ✅ Body del request (si `includeRequest: true`)

### **Del Usuario**:

- ✅ ID del usuario (`@CurrentUser()`)
- ✅ Email
- ✅ Roles
- ✅ Permisos (si aplica)

### **Del Response**:

- ✅ Status code
- ✅ Body del response (si `includeResponse: true`)
- ✅ Tiempo de ejecución

### **Metadata Adicional**:

- ✅ Timestamp
- ✅ Nombre del servicio
- ✅ Nombre del endpoint/handler
- ✅ Método HTTP

---

## 🎯 Ejemplos por Servicio

### **auth-service**

```typescript
import { Audit } from "@libs/audit-decorators";

@Controller("auth")
export class AuthController {
  @Post("register")
  @Audit({
    entityType: "USER",
    action: "REGISTER",
    includeResponse: false, // No incluir password en response
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @Audit({
    entityType: "USER",
    action: "LOGIN",
    metadata: { authType: "local" },
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("logout")
  @Audit({
    entityType: "USER",
    action: "LOGOUT",
  })
  async logout(@CurrentUser() user: IUserPayload) {
    return this.authService.logout(user.id);
  }

  @Post("forgot-password")
  @Audit({
    entityType: "USER",
    action: "FORGOT_PASSWORD",
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }
}
```

### **resources-service**

```typescript
import { Audit } from "@libs/audit-decorators";

@Controller("resources")
export class ResourcesController {
  @Post()
  @Audit({
    entityType: "RESOURCE",
    action: "CREATE",
    captureAfterData: true,
  })
  async create(
    @Body() dto: CreateResourceDto,
    @CurrentUser() user: IUserPayload
  ) {
    return this.resourcesService.create(dto, user.id);
  }

  @Put(":id")
  @Audit({
    entityType: "RESOURCE",
    action: "UPDATE",
    captureBeforeData: true, // Captura estado anterior
    captureAfterData: true, // Captura estado nuevo
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateResourceDto,
    @CurrentUser() user: IUserPayload
  ) {
    return this.resourcesService.update(id, dto, user.id);
  }

  @Delete(":id")
  @Audit({
    entityType: "RESOURCE",
    action: "DELETE",
    captureBeforeData: true,
  })
  async delete(@Param("id") id: string, @CurrentUser() user: IUserPayload) {
    return this.resourcesService.delete(id, user.id);
  }

  @Put(":id/disable")
  @Audit({
    entityType: "RESOURCE",
    action: "DISABLE",
    metadata: { reason: "maintenance" },
  })
  async disable(@Param("id") id: string, @CurrentUser() user: IUserPayload) {
    return this.resourcesService.disable(id, user.id);
  }
}
```

### **stockpile-service (Aprobaciones)**

```typescript
import { Audit } from "@libs/audit-decorators";

@Controller("reservations")
export class ReservationApprovalController {
  @Post(":id/approve")
  @Audit({
    entityType: "RESERVATION",
    action: "APPROVE",
    captureBeforeData: true,
    metadata: { approvalType: "manual" },
  })
  async approve(
    @Param("id") id: string,
    @Body() dto: ApproveReservationDto,
    @CurrentUser() user: IUserPayload
  ) {
    return this.approvalService.approve(id, dto, user.id);
  }

  @Post(":id/reject")
  @Audit({
    entityType: "RESERVATION",
    action: "REJECT",
    captureBeforeData: true,
    metadata: { approvalType: "manual" },
  })
  async reject(
    @Param("id") id: string,
    @Body() dto: RejectReservationDto,
    @CurrentUser() user: IUserPayload
  ) {
    return this.approvalService.reject(id, dto.reason, user.id);
  }

  @Put(":id/assign-reviewer")
  @Audit({
    entityType: "RESERVATION",
    action: "ASSIGN_REVIEWER",
  })
  async assignReviewer(
    @Param("id") id: string,
    @Body() dto: AssignReviewerDto,
    @CurrentUser() user: IUserPayload
  ) {
    return this.approvalService.assignReviewer(id, dto.reviewerId, user.id);
  }
}
```

### **availability-service**

```typescript
import { Audit } from "@libs/audit-decorators";

@Controller("reservations")
export class ReservationsController {
  @Post()
  @Audit({
    entityType: "RESERVATION",
    action: "CREATE",
  })
  async create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: IUserPayload
  ) {
    return this.reservationService.create(dto, user.id);
  }

  @Put(":id/cancel")
  @Audit({
    entityType: "RESERVATION",
    action: "CANCEL",
    captureBeforeData: true,
  })
  async cancel(
    @Param("id") id: string,
    @Body() dto: CancelReservationDto,
    @CurrentUser() user: IUserPayload
  ) {
    return this.reservationService.cancel(id, dto.reason, user.id);
  }

  @Put(":id/check-in")
  @Audit({
    entityType: "RESERVATION",
    action: "CHECK_IN",
  })
  async checkIn(@Param("id") id: string, @CurrentUser() user: IUserPayload) {
    return this.reservationService.checkIn(id, user.id);
  }

  @Put(":id/check-out")
  @Audit({
    entityType: "RESERVATION",
    action: "CHECK_OUT",
  })
  async checkOut(@Param("id") id: string, @CurrentUser() user: IUserPayload) {
    return this.reservationService.checkOut(id, user.id);
  }
}
```

---

## 🔍 Consultar Registros de Auditoría

Los registros se almacenan en `reports-service` y se pueden consultar via API:

### **Obtener historial de una entidad**

```bash
GET /api/v1/audit/entity/{entityType}/{entityId}
```

**Ejemplo**:

```bash
curl -X GET "http://localhost:3005/api/v1/audit/entity/RESOURCE/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer {token}"
```

### **Obtener actividad de un usuario**

```bash
GET /api/v1/audit/user/{userId}?startDate=2025-01-01&endDate=2025-01-31
```

**Ejemplo**:

```bash
curl -X GET "http://localhost:3005/api/v1/audit/user/507f1f77bcf86cd799439011?startDate=2025-11-01" \
  -H "Authorization: Bearer {token}"
```

### **Buscar por acción**

```bash
GET /api/v1/audit?action=DELETE&entityType=RESOURCE
```

---

## ⚠️ Consideraciones Importantes

### **Seguridad**

1. **No incluir datos sensibles en metadata**:

```typescript
// ❌ MAL
@Audit({
  metadata: { password: user.password } // NUNCA hacer esto
})

// ✅ BIEN
@Audit({
  metadata: { passwordChanged: true }
})
```

2. **Usar `includeResponse: false` para datos sensibles**:

```typescript
@Post('login')
@Audit({
  entityType: 'USER',
  action: 'LOGIN',
  includeResponse: false // No incluir token en auditoría
})
```

### **Rendimiento**

1. **Los eventos son async**: No bloquean el response
2. **Usar `captureBeforeData` solo cuando sea necesario**: Requiere query adicional
3. **Evitar metadata muy grande**: Límite recomendado 1KB

### **Naming Conventions**

**EntityType** (UPPER_SNAKE_CASE):

- `USER`
- `RESOURCE`
- `RESERVATION`
- `WAITING_LIST`
- `APPROVAL`

**Action** (UPPER_SNAKE_CASE):

- `CREATE`, `UPDATE`, `DELETE`
- `LOGIN`, `LOGOUT`, `REGISTER`
- `APPROVE`, `REJECT`
- `CHECK_IN`, `CHECK_OUT`
- `ASSIGN`, `REASSIGN`

---

## 🐛 Troubleshooting

### **El decorador no registra eventos**

**Verificar**:

1. ✅ `AuditDecoratorsModule` está importado en el módulo
2. ✅ `EventBusModule` está configurado correctamente
3. ✅ `reports-service` está ejecutándose
4. ✅ RabbitMQ/Kafka está funcionando

```typescript
// apps/{service}/src/{service}.module.ts
import { AuditDecoratorsModule } from "@libs/audit-decorators";

@Module({
  imports: [
    // ...
    AuditDecoratorsModule, // ✅ Debe estar importado
  ],
})
```

### **No se captura el usuario**

**Verificar**:

1. ✅ `@CurrentUser()` está en los parámetros del método
2. ✅ `JwtAuthGuard` está aplicado
3. ✅ Token JWT es válido

```typescript
@Post()
@UseGuards(JwtAuthGuard) // ✅ Guard debe estar aplicado
@Audit({ entityType: 'RESOURCE', action: 'CREATE' })
async create(
  @Body() dto: CreateResourceDto,
  @CurrentUser() user: IUserPayload // ✅ Debe estar presente
) {
  // ...
}
```

### **Eventos no se persisten en MongoDB**

**Verificar en reports-service**:

```bash
# Ver logs del handler
docker logs bookly-reports-service | grep "AuditRecordRequestedHandler"

# Verificar MongoDB
docker exec -it bookly-mongodb-primary mongosh -u bookly -p bookly123
use bookly-reports
db.audit_logs.find().limit(5).pretty()
```

---

## 📚 Referencias

- [README de audit-decorators](../libs/audit-decorators/README.md)
- [Ejemplos de uso](../libs/audit-decorators/EXAMPLE_USAGE.md)
- [Refactor completo](./REFACTOR_FINAL_COMPLETO.md)
- [Arquitectura event-driven](./REFACTOR_EVENT_DRIVEN.md)

---

## 🤝 Soporte

Para dudas o problemas:

1. Revisar esta guía
2. Consultar ejemplos en otros servicios
3. Revisar logs de `reports-service`
4. Contactar al equipo de arquitectura

---

**Última actualización**: 19 de noviembre de 2025  
**Versión**: 1.0  
**Mantenido por**: Equipo Bookly
