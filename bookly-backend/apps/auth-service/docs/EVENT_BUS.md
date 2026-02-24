# 🔄 Auth Service - Event Bus

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Eventos Publicados](#eventos-publicados)
- [Configuración](#configuración)
- [Patrones de Implementación](#patrones-de-implementación)

---

## 🎯 Visión General

El **Auth Service** publica eventos para notificar a otros servicios sobre cambios en autenticación y autorización. **NO consume eventos** de otros servicios, siendo completamente autónomo.

### Características

- **Event-Driven Architecture**: Publicación asíncrona de eventos
- **RabbitMQ**: Message broker para distribución
- **Desacoplamiento**: Otros servicios reaccionan sin dependencia directa
- **Auditoría**: Todos los eventos se registran

---

## 📤 Eventos Publicados

### 1. UserRegisteredEvent

**Routing Key**: `auth.user.registered`

**Descripción**: Se publica cuando un nuevo usuario se registra exitosamente.

**Payload**:

```typescript
interface UserRegisteredEvent {
  eventId: string;
  timestamp: Date;
  data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  metadata: {
    ip: string;
    userAgent: string;
    correlationId: string;
  };
}
```

**Ejemplo**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-11-06T20:00:00.000Z",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "juan.perez@ufps.edu.co",
    "firstName": "Juan",
    "lastName": "Pérez",
    "roles": ["student"]
  },
  "metadata": {
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "correlationId": "req-123456"
  }
}
```

**Servicios que Escuchan**:

- **Notification Service**: Envía email de bienvenida
- **Reports Service**: Actualiza estadísticas de usuarios
- **Stockpile Service**: Crea perfil de usuario para aprobaciones

---

### 2. UserLoggedInEvent

**Routing Key**: `auth.user.logged_in`

**Descripción**: Se publica cada vez que un usuario inicia sesión exitosamente.

**Payload**:

```typescript
interface UserLoggedInEvent {
  eventId: string;
  timestamp: Date;
  data: {
    userId: string;
    email: string;
    sessionId: string;
    twoFactorUsed: boolean;
  };
  metadata: {
    ip: string;
    userAgent: string;
    device: string;
    location?: {
      country: string;
      city: string;
    };
  };
}
```

**Ejemplo**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440001",
  "timestamp": "2025-11-06T20:05:00.000Z",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "juan.perez@ufps.edu.co",
    "sessionId": "sess-123456",
    "twoFactorUsed": false
  },
  "metadata": {
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "device": "desktop",
    "location": {
      "country": "Colombia",
      "city": "Cúcuta"
    }
  }
}
```

**Servicios que Escuchan**:

- **Reports Service**: Estadísticas de acceso
- **Notification Service**: Notificación de login desde nuevo dispositivo (si aplica)

---

### 3. UserLoggedOutEvent

**Routing Key**: `auth.user.logged_out`

**Descripción**: Se publica cuando un usuario cierra sesión.

**Payload**:

```typescript
interface UserLoggedOutEvent {
  eventId: string;
  timestamp: Date;
  data: {
    userId: string;
    sessionId: string;
    sessionDuration: number; // Segundos
  };
}
```

**Ejemplo**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440002",
  "timestamp": "2025-11-06T21:00:00.000Z",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "sessionId": "sess-123456",
    "sessionDuration": 3300
  }
}
```

**Servicios que Escuchan**:

- **Reports Service**: Estadísticas de duración de sesiones

---

### 4. RoleAssignedEvent

**Routing Key**: `auth.role.assigned`

**Descripción**: Se publica cuando se asigna un rol a un usuario.

**Payload**:

```typescript
interface RoleAssignedEvent {
  eventId: string;
  timestamp: Date;
  data: {
    userId: string;
    roleId: string;
    roleName: string;
    assignedBy: string; // userId del admin
  };
  metadata: {
    reason?: string;
    correlationId: string;
  };
}
```

**Ejemplo**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440003",
  "timestamp": "2025-11-06T20:10:00.000Z",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "roleId": "507f1f77bcf86cd799439013",
    "roleName": "teacher",
    "assignedBy": "507f1f77bcf86cd799439001"
  },
  "metadata": {
    "reason": "Promoted to teacher position",
    "correlationId": "req-123457"
  }
}
```

**Servicios que Escuchan**:

- **Notification Service**: Notifica al usuario del cambio de rol
- **Availability Service**: Actualiza permisos de reserva
- **Resources Service**: Actualiza permisos de gestión

---

### 5. RoleRemovedEvent

**Routing Key**: `auth.role.removed`

**Descripción**: Se publica cuando se remueve un rol de un usuario.

**Payload**:

```typescript
interface RoleRemovedEvent {
  eventId: string;
  timestamp: Date;
  data: {
    userId: string;
    roleId: string;
    roleName: string;
    removedBy: string;
  };
  metadata: {
    reason?: string;
    correlationId: string;
  };
}
```

**Servicios que Escuchan**:

- **Notification Service**: Notifica al usuario
- **Todos los servicios**: Actualizan cache de permisos

---

### 6. UnauthorizedAccessAttemptEvent

**Routing Key**: `auth.security.unauthorized_attempt`

**Descripción**: Se publica cuando se detecta un intento de acceso no autorizado.

**Payload**:

```typescript
interface UnauthorizedAccessAttemptEvent {
  eventId: string;
  timestamp: Date;
  data: {
    userId?: string; // Puede ser null si es usuario anónimo
    resource: string;
    action: string;
    requiredPermission: string;
  };
  metadata: {
    ip: string;
    userAgent: string;
    reason: string; // "missing_permission", "invalid_token", etc.
  };
}
```

**Ejemplo**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440004",
  "timestamp": "2025-11-06T20:15:00.000Z",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "resource": "users",
    "action": "delete",
    "requiredPermission": "users:delete"
  },
  "metadata": {
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "reason": "missing_permission"
  }
}
```

**Servicios que Escuchan**:

- **Reports Service**: Estadísticas de seguridad
- **Notification Service**: Alertas de seguridad a administradores

---

### 7. PasswordResetRequestedEvent

**Routing Key**: `auth.password.reset_requested`

**Descripción**: Se publica cuando un usuario solicita resetear su contraseña.

**Payload**:

```typescript
interface PasswordResetRequestedEvent {
  eventId: string;
  timestamp: Date;
  data: {
    userId: string;
    email: string;
    resetToken: string;
    expiresAt: Date;
  };
  metadata: {
    ip: string;
  };
}
```

**Servicios que Escuchan**:

- **Notification Service**: Envía email con link de reset

---

### 8. PasswordChangedEvent

**Routing Key**: `auth.password.changed`

**Descripción**: Se publica cuando un usuario cambia su contraseña.

**Payload**:

```typescript
interface PasswordChangedEvent {
  eventId: string;
  timestamp: Date;
  data: {
    userId: string;
    email: string;
    changedBy: "user" | "admin" | "reset";
  };
  metadata: {
    ip: string;
  };
}
```

**Servicios que Escuchan**:

- **Notification Service**: Notifica al usuario por seguridad

---

### 9. TwoFactorEnabledEvent

**Routing Key**: `auth.2fa.enabled`

**Descripción**: Se publica cuando un usuario habilita 2FA.

**Payload**:

```typescript
interface TwoFactorEnabledEvent {
  eventId: string;
  timestamp: Date;
  data: {
    userId: string;
    email: string;
  };
}
```

**Servicios que Escuchan**:

- **Notification Service**: Confirma activación de 2FA

---

### 10. AccountLockedEvent

**Routing Key**: `auth.security.account_locked`

**Descripción**: Se publica cuando una cuenta se bloquea por intentos fallidos.

**Payload**:

```typescript
interface AccountLockedEvent {
  eventId: string;
  timestamp: Date;
  data: {
    userId: string;
    email: string;
    lockedUntil: Date;
    failedAttempts: number;
  };
  metadata: {
    ip: string;
  };
}
```

**Servicios que Escuchan**:

- **Notification Service**: Alerta al usuario y admins
- **Reports Service**: Estadísticas de seguridad

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=bookly-events
RABBITMQ_QUEUE=auth-service-queue

# Retry Policy
EVENT_RETRY_ATTEMPTS=3
EVENT_RETRY_DELAY=1000
```

---

### Configuración en NestJS

```typescript
// auth.module.ts
import { EventBusModule } from "@bookly/event-bus";

@Module({
  imports: [
    EventBusModule.forRoot({
      exchange: "bookly-events",
      exchangeType: "topic",
      connectionOptions: {
        url: process.env.RABBITMQ_URL,
      },
    }),
  ],
})
export class AuthModule {}
```

---

## 🎨 Patrones de Implementación

### Publicación de Eventos

```typescript
import { Injectable } from "@nestjs/common";
import { EventBusService } from "@bookly/event-bus";
import { v4 as uuid } from "uuid";

@Injectable()
export class AuthService {
  constructor(private readonly eventBus: EventBusService) {}

  async register(dto: RegisterUserDto): Promise<User> {
    // 1. Crear usuario
    const user = await this.userRepository.create(dto);

    // 2. Publicar evento
    const event: UserRegisteredEvent = {
      eventId: uuid(),
      timestamp: new Date(),
      data: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((r) => r.name),
      },
      metadata: {
        ip: this.requestContext.getIp(),
        userAgent: this.requestContext.getUserAgent(),
        correlationId: this.requestContext.getCorrelationId(),
      },
    };

    await this.eventBus.publish("auth.user.registered", event);

    // 3. Registrar en auditoría
    await this.auditService.log({
      action: "user_registered",
      userId: user.id,
      success: true,
    });

    return user;
  }
}
```

---

### Manejo de Errores en Publicación

```typescript
async publishEvent(routingKey: string, event: any): Promise<void> {
  try {
    await this.eventBus.publish(routingKey, event);
    this.logger.log(`Event published: ${routingKey}`, { eventId: event.eventId });
  } catch (error) {
    this.logger.error(`Failed to publish event: ${routingKey}`, {
      eventId: event.eventId,
      error: error.message,
    });

    // Guardar en cola de reintentos o DLQ
    await this.saveToRetryQueue(routingKey, event);
  }
}
```

---

### Event Metadata Estándar

Todos los eventos incluyen metadata común:

```typescript
interface EventMetadata {
  ip: string;
  userAgent?: string;
  correlationId: string;
  timestamp: Date;
  service: "auth-service";
  version: "1.0";
}
```

---

## 📊 Métricas de Eventos

### Eventos Publicados por Tipo

```typescript
// Prometheus metrics
auth_events_published_total{event_type="user_registered"} 150
auth_events_published_total{event_type="user_logged_in"} 1250
auth_events_published_total{event_type="role_assigned"} 45
```

### Latencia de Publicación

```typescript
// Tiempo promedio de publicación
auth_event_publish_duration_seconds{event_type="user_registered"} 0.015
```

---

## 🔍 Debugging

### Ver Eventos Publicados

```bash
# En RabbitMQ Management
http://localhost:15672

# Consumir eventos manualmente
rabbitmqadmin get queue=auth-service-queue count=10
```

### Logs de Eventos

```typescript
// Todos los eventos se registran
[EventBus] Event published: auth.user.registered
  eventId: 550e8400-e29b-41d4-a716-446655440000
  userId: 507f1f77bcf86cd799439011
  timestamp: 2025-11-06T20:00:00.000Z
```

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints](ENDPOINTS.md)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
