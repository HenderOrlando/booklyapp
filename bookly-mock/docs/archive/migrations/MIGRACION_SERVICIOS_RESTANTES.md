# 🔄 Plan de Migración - Servicios Restantes

**Objetivo**: Aplicar decoradores de auditoría en servicios que aún no los tienen  
**Estado**: ✅ Listo para iniciar  
**Prioridad**: Media  
**Esfuerzo estimado**: 2-3 horas

---

## 📊 Estado Actual

| Servicio                 | Audit Decorators           | OAuth Migrado              | Estado   |
| ------------------------ | -------------------------- | -------------------------- | -------- |
| **reports-service**      | ✅ Implementa persistencia | N/A                        | Completo |
| **auth-service**         | ⏳ Preparado, sin aplicar  | ✅ Módulo interno          | 80%      |
| **availability-service** | ✅ Módulo importado        | ✅ Usa @auth/modules/oauth | 90%      |
| **resources-service**    | ⏸️ Pendiente               | N/A                        | 0%       |
| **stockpile-service**    | ⏸️ Pendiente               | N/A                        | 0%       |
| **api-gateway**          | ⏸️ Opcional                | N/A                        | 0%       |

---

## 🎯 Servicios Prioritarios

### **1. auth-service** (Alta prioridad)

**Endpoints a auditar**:

- ✅ `/auth/register` - Registro de usuarios
- ✅ `/auth/login` - Inicio de sesión
- ✅ `/auth/logout` - Cierre de sesión
- ✅ `/auth/forgot-password` - Recuperación de contraseña
- ✅ `/auth/reset-password` - Cambio de contraseña
- ✅ `/auth/change-password` - Cambio de contraseña autenticado
- ✅ `/auth/enable-2fa` - Habilitar 2FA
- ✅ `/auth/disable-2fa` - Deshabilitar 2FA

**Controllers a modificar**:

```typescript
apps/auth-service/src/infrastructure/controllers/
├── auth.controller.ts          # ⭐ Prioridad ALTA
├── users.controller.ts         # ⭐ Prioridad ALTA
├── role.controller.ts          # Prioridad MEDIA
├── permission.controller.ts    # Prioridad BAJA
└── oauth.controller.ts         # Prioridad MEDIA
```

**Checklist**:

- [ ] Importar `@Audit` en cada controller
- [ ] Aplicar decorador en endpoints críticos
- [ ] Configurar `includeResponse: false` para login (no exponer tokens)
- [ ] Agregar metadata relevante (`authType`, `2faEnabled`, etc.)
- [ ] Probar que eventos se emiten correctamente
- [ ] Verificar persistencia en reports-service

**Ejemplo de implementación**:

```typescript
// apps/auth-service/src/infrastructure/controllers/auth.controller.ts
import { Audit } from "@libs/audit-decorators";

@Controller("auth")
export class AuthController {
  @Post("login")
  @Audit({
    entityType: "USER",
    action: "LOGIN",
    includeResponse: false, // No incluir token en auditoría
    metadata: { authType: "local" },
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("register")
  @Audit({
    entityType: "USER",
    action: "REGISTER",
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("logout")
  @Audit({
    entityType: "USER",
    action: "LOGOUT",
  })
  async logout(@CurrentUser() user: IUserPayload) {
    return this.authService.logout(user.id);
  }
}
```

**Tiempo estimado**: 1 hora

---

### **2. resources-service** (Alta prioridad)

**Endpoints a auditar**:

- ✅ `POST /resources` - Crear recurso
- ✅ `PUT /resources/:id` - Actualizar recurso
- ✅ `DELETE /resources/:id` - Eliminar recurso
- ✅ `PUT /resources/:id/disable` - Deshabilitar recurso
- ✅ `PUT /resources/:id/enable` - Habilitar recurso
- ✅ `POST /resources/import` - Importación masiva
- ✅ `PUT /resources/:id/maintenance` - Mantenimiento

**Controllers a modificar**:

```typescript
apps/resources-service/src/infrastructure/controllers/
├── resources.controller.ts           # ⭐ Prioridad ALTA
├── categories.controller.ts          # Prioridad MEDIA
├── resource-attributes.controller.ts # Prioridad BAJA
└── maintenance.controller.ts         # Prioridad ALTA
```

**Checklist**:

- [ ] Habilitar `AuditDecoratorsModule` en `resources.module.ts`
- [ ] Importar `@Audit` en controllers
- [ ] Aplicar decorador con `captureBeforeData` para UPDATE/DELETE
- [ ] Configurar metadata (categoría, programa, etc.)
- [ ] Auditar importación masiva con metadata de cantidad
- [ ] Probar eventos

**Ejemplo de implementación**:

```typescript
// apps/resources-service/src/infrastructure/controllers/resources.controller.ts
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
    captureBeforeData: true,
    captureAfterData: true,
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
    return this.resourcesService.softDelete(id, user.id);
  }

  @Post("import")
  @Audit({
    entityType: "RESOURCE",
    action: "BULK_IMPORT",
    metadata: { importType: "csv" },
  })
  async import(
    @Body() dto: ImportResourcesDto,
    @CurrentUser() user: IUserPayload
  ) {
    const result = await this.resourcesService.bulkImport(dto, user.id);
    return {
      ...result,
      metadata: { totalImported: result.imported.length },
    };
  }
}
```

**Tiempo estimado**: 1 hora

---

### **3. stockpile-service** (Alta prioridad)

**Endpoints a auditar**:

- ✅ `POST /reservations/:id/approve` - Aprobar reserva
- ✅ `POST /reservations/:id/reject` - Rechazar reserva
- ✅ `PUT /reservations/:id/assign-reviewer` - Asignar revisor
- ✅ `POST /reservations/:id/request-changes` - Solicitar cambios
- ✅ `PUT /reservations/:id/validation` - Validar solicitud

**Controllers a modificar**:

```typescript
apps/stockpile-service/src/infrastructure/controllers/
├── approval.controller.ts        # ⭐ Prioridad ALTA
├── validation.controller.ts      # ⭐ Prioridad ALTA
└── workflow.controller.ts        # Prioridad MEDIA
```

**Checklist**:

- [ ] Habilitar `AuditDecoratorsModule` en `stockpile.module.ts`
- [ ] Importar `@Audit` en controllers
- [ ] Aplicar decorador con `captureBeforeData` para aprobaciones
- [ ] Agregar metadata de razón de rechazo
- [ ] Auditar asignación de revisores
- [ ] Probar eventos

**Ejemplo de implementación**:

```typescript
// apps/stockpile-service/src/infrastructure/controllers/approval.controller.ts
import { Audit } from "@libs/audit-decorators";

@Controller("reservations")
export class ApprovalController {
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

**Tiempo estimado**: 1 hora

---

## 📋 Checklist General de Migración

### **Preparación**

- [x] ✅ `@libs/audit-decorators` creada y funcional
- [x] ✅ `reports-service` con módulo de auditoría
- [x] ✅ EventBus configurado en todos los servicios
- [x] ✅ MongoDB schema de auditoría creado

### **Por cada servicio**

- [ ] Importar `AuditDecoratorsModule` en módulo principal
- [ ] Importar `@Audit` en controllers relevantes
- [ ] Aplicar decoradores en endpoints críticos
- [ ] Configurar opciones según necesidad (captureBeforeData, metadata, etc.)
- [ ] Compilar y verificar errores
- [ ] Ejecutar servicio y probar endpoints
- [ ] Verificar que eventos se emiten
- [ ] Consultar registros en reports-service
- [ ] Documentar cambios

---

## 🔧 Pasos de Implementación

### **1. Habilitar módulo en servicio**

```typescript
// apps/{service}/src/{service}.module.ts
import { AuditDecoratorsModule } from "@libs/audit-decorators";

@Module({
  imports: [
    // ... otros imports
    AuditDecoratorsModule,
  ],
})
export class ServiceModule {}
```

### **2. Aplicar decoradores en controllers**

```typescript
import { Audit } from "@libs/audit-decorators";

@Controller("resource")
export class ResourceController {
  @Post()
  @Audit({ entityType: "RESOURCE", action: "CREATE" })
  async create(@Body() dto: any, @CurrentUser() user: any) {
    // ...
  }
}
```

### **3. Probar funcionamiento**

```bash
# 1. Ejecutar servicios
npm run start:dev:auth       # o el servicio correspondiente

# 2. Hacer request al endpoint
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ufps.edu.co","password":"test123"}'

# 3. Verificar logs en reports-service
docker logs bookly-reports-service | grep "Audit record saved"

# 4. Consultar en MongoDB
docker exec -it bookly-mongodb-primary mongosh -u bookly -p bookly123
use bookly-reports
db.audit_logs.find({ entityType: "USER", action: "LOGIN" }).pretty()
```

---

## 📊 Prioridad de Endpoints

### **Prioridad ALTA** (Auditar primero)

**Seguridad**:

- Login, logout, registro
- Cambio de contraseña
- Habilitación/deshabilitación 2FA

**Operaciones críticas**:

- Creación/eliminación de recursos
- Aprobación/rechazo de reservas
- Importación masiva

### **Prioridad MEDIA**

**Operaciones importantes**:

- Actualización de recursos
- Asignación de roles/permisos
- Check-in/check-out
- Cancelación de reservas

### **Prioridad BAJA**

**Operaciones de consulta**:

- Listados (GET)
- Búsquedas
- Visualización de calendario

---

## 🚨 Consideraciones Especiales

### **auth-service**

- ✅ NO incluir tokens en response (`includeResponse: false`)
- ✅ NO incluir passwords en auditoría
- ✅ Agregar metadata de tipo de autenticación (local, Google, Microsoft)
- ✅ Auditar intentos fallidos de login

### **resources-service**

- ✅ Usar `captureBeforeData: true` para UPDATE/DELETE
- ✅ Agregar metadata de categoría y programa académico
- ✅ Importaciones masivas con conteo en metadata

### **stockpile-service**

- ✅ Siempre capturar estado anterior en aprobaciones
- ✅ Incluir razón de rechazo en metadata
- ✅ Auditar cambios de estado del workflow

---

## 📈 Métricas de Éxito

Una vez completada la migración:

- ✅ 100% de endpoints críticos auditados
- ✅ Eventos fluyendo hacia reports-service
- ✅ Registros persistidos en MongoDB
- ✅ Dashboard de auditoría funcional
- ✅ Queries de auditoría optimizadas

---

## 🎯 Resultado Esperado

Al finalizar esta migración:

```
✅ auth-service: 8+ endpoints auditados
✅ resources-service: 10+ endpoints auditados
✅ stockpile-service: 6+ endpoints auditados
✅ availability-service: Ya completado
✅ reports-service: Implementa persistencia

Total: ~30 endpoints auditados
Event-driven audit: 100% funcional
Trazabilidad completa: ✅
```

---

## 📚 Referencias

- [Guía de uso de decoradores](./GUIA_USO_AUDIT_DECORATORS.md)
- [Refactor completo](./REFACTOR_FINAL_COMPLETO.md)
- [Ejemplos de uso](../libs/audit-decorators/EXAMPLE_USAGE.md)

---

**Estado**: ✅ Listo para iniciar  
**Próximo paso**: Comenzar con auth-service  
**Tiempo estimado total**: 2-3 horas  
**Fecha creación**: 19 de noviembre de 2025
