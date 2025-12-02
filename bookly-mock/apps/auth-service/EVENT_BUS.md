# 🔄 Event Bus - Auth Service

## 📋 Información General

**Servicio**: `auth-service`  
**Responsabilidad**: Autenticación, autorización y gestión de usuarios  
**Versión**: 1.0.0

---

## 📤 Eventos Publicados

Este servicio publica los siguientes eventos cuando ocurren cambios en el dominio de autenticación:

### 1. USER_REGISTERED

**Cuándo se publica**: Cuando un nuevo usuario se registra exitosamente en el sistema.

**Payload**:
```typescript
interface UserRegisteredPayload {
  userId: string;
  email: string;
  name: string;
  roles: string[];
}
```

**Ejemplo de uso**:
```typescript
const event = UserRegisteredEvent.create({
  userId: user.id,
  email: user.email,
  name: user.name,
  roles: user.roles,
});
await this.eventBus.publish(EventType.USER_REGISTERED, event);
```

**Consumidores potenciales**:
- `reports-service`: Para registrar actividad de nuevos usuarios
- `availability-service`: Para crear perfil de reservas del usuario
- `stockpile-service`: Para inicializar permisos de aprobación

---

### 2. USER_LOGGED_IN

**Cuándo se publica**: Cuando un usuario inicia sesión exitosamente.

**Payload**:
```typescript
interface UserLoggedInPayload {
  userId: string;
  email: string;
  ip?: string;
  userAgent?: string;
}
```

**Ejemplo de uso**:
```typescript
const event = UserLoggedInEvent.create({
  userId: user.id,
  email: user.email,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
});
await this.eventBus.publish(EventType.USER_LOGGED_IN, event);
```

**Consumidores potenciales**:
- `reports-service`: Para auditoría de accesos
- Sistema de notificaciones: Para alertas de inicio de sesión

---

### 3. USER_LOGGED_OUT

**Cuándo se publica**: Cuando un usuario cierra sesión.

**Payload**:
```typescript
interface UserLoggedOutPayload {
  userId: string;
  email: string;
}
```

**Ejemplo de uso**:
```typescript
const event = UserLoggedOutEvent.create({
  userId: user.id,
  email: user.email,
});
await this.eventBus.publish(EventType.USER_LOGGED_OUT, event);
```

**Consumidores potenciales**:
- `reports-service`: Para auditoría de sesiones

---

### 4. PASSWORD_CHANGED

**Cuándo se publica**: Cuando un usuario cambia su contraseña.

**Payload**:
```typescript
interface PasswordChangedPayload {
  userId: string;
  email: string;
  changedBy: string;
}
```

**Ejemplo de uso**:
```typescript
const event = PasswordChangedEvent.create({
  userId: user.id,
  email: user.email,
  changedBy: currentUser.id,
});
await this.eventBus.publish(EventType.PASSWORD_CHANGED, event);
```

**Consumidores potenciales**:
- Sistema de notificaciones: Para enviar confirmación por email
- `reports-service`: Para auditoría de seguridad

---

### 5. PASSWORD_RESET_REQUESTED

**Cuándo se publica**: Cuando un usuario solicita restablecer su contraseña.

**Payload**:
```typescript
interface PasswordResetRequestedPayload {
  userId: string;
  email: string;
  resetToken: string;
  expiresAt: Date;
}
```

**Ejemplo de uso**:
```typescript
const event = PasswordResetRequestedEvent.create({
  userId: user.id,
  email: user.email,
  resetToken: token,
  expiresAt: expirationDate,
});
await this.eventBus.publish(EventType.PASSWORD_RESET_REQUESTED, event);
```

**Consumidores potenciales**:
- Sistema de notificaciones: Para enviar email con link de reseteo
- `reports-service`: Para auditoría de seguridad

---

### 6. ROLE_ASSIGNED

**Cuándo se publica**: Cuando se asigna un rol a un usuario.

**Payload**:
```typescript
interface RoleAssignedPayload {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
  assignedBy: string;
}
```

**Ejemplo de uso**:
```typescript
const event = RoleAssignedEvent.create({
  userId: user.id,
  email: user.email,
  roleId: role.id,
  roleName: role.name,
  assignedBy: admin.id,
});
await this.eventBus.publish(EventType.ROLE_ASSIGNED, event);
```

**Consumidores potenciales**:
- `availability-service`: Para actualizar permisos de reserva
- `stockpile-service`: Para actualizar permisos de aprobación
- `reports-service`: Para auditoría de cambios de roles

---

### 7. PERMISSION_GRANTED

**Cuándo se publica**: Cuando se otorga un permiso a un usuario o rol.

**Payload**:
```typescript
interface PermissionGrantedPayload {
  targetId: string; // userId or roleId
  targetType: 'user' | 'role';
  permissionId: string;
  permissionName: string;
  grantedBy: string;
}
```

**Ejemplo de uso**:
```typescript
const event = PermissionGrantedEvent.create({
  targetId: user.id,
  targetType: 'user',
  permissionId: permission.id,
  permissionName: permission.name,
  grantedBy: admin.id,
});
await this.eventBus.publish(EventType.PERMISSION_GRANTED, event);
```

**Consumidores potenciales**:
- Todos los servicios: Para actualizar cache de permisos
- `reports-service`: Para auditoría de permisos

---

### 8. TWO_FACTOR_ENABLED

**Cuándo se publica**: Cuando un usuario habilita autenticación de dos factores.

**Payload**:
```typescript
interface TwoFactorEnabledPayload {
  userId: string;
  email: string;
}
```

**Ejemplo de uso**:
```typescript
const event = TwoFactorEnabledEvent.create({
  userId: user.id,
  email: user.email,
});
await this.eventBus.publish(EventType.TWO_FACTOR_ENABLED, event);
```

**Consumidores potenciales**:
- Sistema de notificaciones: Para confirmar activación
- `reports-service`: Para auditoría de seguridad

---

### 9. TWO_FACTOR_DISABLED

**Cuándo se publica**: Cuando un usuario deshabilita autenticación de dos factores.

**Payload**:
```typescript
interface TwoFactorDisabledPayload {
  userId: string;
  email: string;
}
```

**Ejemplo de uso**:
```typescript
const event = TwoFactorDisabledEvent.create({
  userId: user.id,
  email: user.email,
});
await this.eventBus.publish(EventType.TWO_FACTOR_DISABLED, event);
```

**Consumidores potenciales**:
- Sistema de notificaciones: Para alertar desactivación
- `reports-service`: Para auditoría de seguridad

---

### 10. TWO_FACTOR_VERIFICATION_FAILED

**Cuándo se publica**: Cuando falla la verificación de dos factores.

**Payload**:
```typescript
interface TwoFactorVerificationFailedPayload {
  userId: string;
  email: string;
  reason: 'invalid_code' | 'expired_token' | 'invalid_backup_code';
  ip?: string;
}
```

**Ejemplo de uso**:
```typescript
const event = TwoFactorVerificationFailedEvent.create({
  userId: user.id,
  email: user.email,
  reason: 'invalid_code',
  ip: request.ip,
});
await this.eventBus.publish(EventType.TWO_FACTOR_VERIFICATION_FAILED, event);
```

**Consumidores potenciales**:
- Sistema de notificaciones: Para alertar intentos fallidos
- `reports-service`: Para auditoría de seguridad y detección de ataques

---

## 📥 Eventos Consumidos

Este servicio NO consume eventos de otros servicios actualmente. Es un servicio base que solo publica eventos.

---

## 🔧 Configuración del Event Bus

**Conexión**: RabbitMQ  
**Exchange**: `bookly.events`  
**Exchange Type**: `topic`  
**Prefijo de routing keys**: `auth.*`

### Routing Keys Publicadas

| Evento | Routing Key |
|--------|-------------|
| USER_REGISTERED | `auth.user.registered` |
| USER_LOGGED_IN | `auth.user.logged_in` |
| USER_LOGGED_OUT | `auth.user.logged_out` |
| PASSWORD_CHANGED | `auth.password.changed` |
| PASSWORD_RESET_REQUESTED | `auth.password.reset_requested` |
| ROLE_ASSIGNED | `auth.role.assigned` |
| PERMISSION_GRANTED | `auth.permission.granted` |
| TWO_FACTOR_ENABLED | `auth.2fa.enabled` |
| TWO_FACTOR_DISABLED | `auth.2fa.disabled` |
| TWO_FACTOR_VERIFICATION_FAILED | `auth.2fa.verification_failed` |

---

## 📊 Métricas y Monitoreo

### Eventos a Monitorear

- **TWO_FACTOR_VERIFICATION_FAILED**: Múltiples fallos pueden indicar un ataque
- **PASSWORD_RESET_REQUESTED**: Picos inusuales pueden indicar abuso
- **USER_LOGGED_IN**: Para análisis de patrones de uso

### Alertas Recomendadas

- ⚠️ Más de 5 `TWO_FACTOR_VERIFICATION_FAILED` del mismo usuario en 5 minutos
- ⚠️ Más de 10 `PASSWORD_RESET_REQUESTED` en 1 hora
- ⚠️ `USER_LOGGED_IN` desde IPs sospechosas o ubicaciones inusuales

---

## 🧪 Testing

### Ejemplo de Test Unitario

```typescript
describe('UserRegisteredEvent', () => {
  it('should create event with correct structure', () => {
    const payload: UserRegisteredPayload = {
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      roles: ['student'],
    };

    const event = UserRegisteredEvent.create(payload);

    expect(event.eventType).toBe(EventType.USER_REGISTERED);
    expect(event.service).toBe('auth-service');
    expect(event.data).toEqual(payload);
    expect(event.metadata.aggregateType).toBe('User');
    expect(event.metadata.aggregateId).toBe('user-123');
  });
});
```

---

## 📚 Referencias

- [Event Bus Library](../../libs/event-bus/README.md)
- [EventType Enum](../../libs/common/src/enums/index.ts)
- [Event Payload Interface](../../libs/common/src/interfaces/index.ts)
- [Auth Service Domain Events](./src/domain/events/index.ts)

---

**Última actualización**: 1 de diciembre de 2024  
**Mantenedor**: Equipo de Auth Service
