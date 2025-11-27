# RF-44: Auditoría de Accesos y Acciones

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Octubre 30, 2025

---

## 📋 Descripción

Implementar un sistema completo de auditoría que registre todos los accesos, cambios de roles, intentos fallidos y acciones importantes realizadas en el sistema.

---

## ✅ Criterios de Aceptación

- [x] Registro de todos los logins exitosos y fallidos
- [x] Registro de cambios en roles y permisos
- [x] Registro de intentos de acceso no autorizados
- [x] Captura de contexto (IP, user agent, timestamp)
- [x] API para consultar logs de auditoría
- [x] Exportación de logs a CSV/JSON
- [x] Retención de logs por 90 días mínimo
- [x] Búsqueda y filtrado avanzado de logs

---

## 🏗️ Implementación

### Componentes Desarrollados

**Service**:

- `AuditService` - Lógica de registro de auditoría

**Repository**:

- `PrismaAuditLogRepository` - Persistencia de logs

**Controller**:

- `AuditController` - Endpoints de consulta

**Commands**:

- `CreateAuditLogCommand`

**Queries**:

- `GetAuditLogsQuery`
- `GetUserAuditLogsQuery`
- `ExportAuditLogsQuery`

---

### Endpoints de Auditoría

```http
GET /api/audit                    # Listar logs
GET /api/audit/user/:userId       # Logs de un usuario
GET /api/audit/export?format=csv  # Exportar logs
```

---

### Eventos Auditados

**Autenticación**:

- Login exitoso
- Login fallido
- Logout
- Refresh token
- Password reset solicitado
- Password cambiado

**Autorización**:

- Rol asignado
- Rol removido
- Permiso asignado a rol
- Intento de acceso no autorizado

**Gestión**:

- Usuario creado
- Usuario actualizado
- Usuario desactivado
- Rol creado/editado/eliminado

---

### Estructura de Log

```typescript
interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ip: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  success: boolean;
  errorCode?: string;
  errorMsg?: string;
  timestamp: Date;
}
```

**Ejemplo**:

```json
{
  "id": "507f1f77bcf86cd799439050",
  "userId": "507f1f77bcf86cd799439011",
  "action": "login",
  "resource": null,
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "twoFactorUsed": false,
    "device": "desktop"
  },
  "success": true,
  "timestamp": "2025-11-06T20:00:00.000Z"
}
```

---

### Uso en Código

```typescript
// En AuthService.login()
try {
  const user = await this.validateCredentials(email, password);
  const tokens = await this.generateTokens(user);

  // Registrar login exitoso
  await this.auditService.log({
    userId: user.id,
    action: "login",
    ip: this.requestContext.getIp(),
    userAgent: this.requestContext.getUserAgent(),
    success: true,
  });

  return { user, tokens };
} catch (error) {
  // Registrar login fallido
  await this.auditService.log({
    userId: null,
    action: "login_failed",
    ip: this.requestContext.getIp(),
    metadata: { email },
    success: false,
    errorMsg: error.message,
  });

  throw error;
}
```

---

## 🗄️ Base de Datos

### Índices Optimizados

```javascript
// MongoDB indexes
db.auditlogs.createIndex({ userId: 1, timestamp: -1 });
db.auditlogs.createIndex({ action: 1 });
db.auditlogs.createIndex({ timestamp: -1 });
db.auditlogs.createIndex({ success: 1 });
```

### Retención de Datos

```typescript
// Job diario para limpiar logs antiguos
@Cron("0 2 * * *") // 2 AM todos los días
async cleanOldLogs(): Promise<void> {
  const retentionDays = 90;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  await this.auditLogRepository.deleteOlderThan(cutoffDate);
}
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- audit.service.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- audit.e2e-spec.ts
```

### Cobertura

- **Líneas**: 96%
- **Funciones**: 100%
- **Ramas**: 93%

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#métricas-y-observabilidad)
- [Base de Datos](../DATABASE.md#4-auditlog-registro-de-auditoría)
- [Endpoints](../ENDPOINTS.md#auditoría)

---

## 🔄 Changelog

| Fecha      | Cambio                                  | Autor |
| ---------- | --------------------------------------- | ----- |
| 2025-10-30 | Implementación inicial                  | Team  |
| 2025-11-01 | Agregada exportación a CSV              | Team  |
| 2025-11-03 | Implementado job de limpieza automática | Team  |

---

**Mantenedor**: Bookly Development Team
