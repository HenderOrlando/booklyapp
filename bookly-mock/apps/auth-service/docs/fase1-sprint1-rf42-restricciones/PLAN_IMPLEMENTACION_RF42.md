# RF-42: Plan de Implementación - Restricción de Modificación

**Fecha**: 2025-11-04  
**Sprint**: Fase 1 - Sprint 1  
**Requerimiento**: RF-42 - Restricción de modificaciones a recursos únicamente a administradores

---

## 🎯 Objetivo

Implementar un sistema de control de acceso basado en roles (RBAC) que restrinja las modificaciones de recursos únicamente a usuarios con permisos de administrador, incluyendo:

1. **Guards personalizados** para verificación de roles y permisos
2. **Decorators** para configurar permisos requeridos por endpoint
3. **Registro de intentos no autorizados** en auditoría
4. **Confirmación adicional** para operaciones críticas
5. **Historial de modificaciones** completo

---

## 📋 Scope de Implementación

### 1. Guards de Autorización ✨

#### A. RolesGuard (Verificación de Roles)

**Archivo**: `apps/auth-service/src/infrastructure/guards/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>("roles", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Sin restricción de rol
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

**Funcionalidades**:

- Verifica que el usuario tenga al menos uno de los roles requeridos
- Usa Reflector para obtener metadata del decorator @Roles()
- Retorna true si no hay restricción de rol

---

#### B. PermissionsGuard (Verificación de Permisos)

**Archivo**: `apps/auth-service/src/infrastructure/guards/permissions.guard.ts`

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      "permissions",
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Obtener permisos del usuario desde sus roles
    const userPermissions = await this.permissionService.getUserPermissions(
      user.id
    );

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );
  }
}
```

**Funcionalidades**:

- Verifica que el usuario tenga TODOS los permisos requeridos
- Obtiene permisos dinámicamente desde la base de datos
- Cachea permisos del usuario (opcional con Redis)

---

### 2. Decorators Personalizados ✨

#### A. @Roles() Decorator

**Archivo**: `apps/auth-service/src/infrastructure/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**Uso**:

```typescript
@Roles('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_PROGRAMA')
@Put('/resources/:id')
updateResource() {}
```

---

#### B. @RequirePermissions() Decorator

**Archivo**: `apps/auth-service/src/infrastructure/decorators/require-permissions.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

**Uso**:

```typescript
@RequirePermissions('resources:update', 'resources:manage')
@Put('/resources/:id')
updateResource() {}
```

---

#### C. @AuditAction() Decorator

**Archivo**: `apps/auth-service/src/infrastructure/decorators/audit-action.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";

export const AUDIT_ACTION_KEY = "audit_action";
export const AuditAction = (action: string, resource: string) =>
  SetMetadata(AUDIT_ACTION_KEY, { action, resource });
```

**Uso**:

```typescript
@AuditAction('UPDATE', 'resource')
@Put('/resources/:id')
updateResource() {}
```

---

### 3. Interceptor de Auditoría ✨

#### AuditInterceptor

**Archivo**: `apps/auth-service/src/infrastructure/interceptors/audit.interceptor.ts`

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private auditService: AuditService,
    private reflector: Reflector
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const auditMetadata = this.reflector.get<{
      action: string;
      resource: string;
    }>(AUDIT_ACTION_KEY, context.getHandler());

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, ip, method, url, body } = request;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.auditService.log({
            userId: user.id,
            action: auditMetadata.action,
            resource: auditMetadata.resource,
            resourceId: request.params.id,
            method,
            url,
            ip,
            userAgent: request.headers["user-agent"],
            status: "SUCCESS",
            executionTime: Date.now() - startTime,
            changes: body,
          });
        },
        error: (error) => {
          this.auditService.log({
            userId: user.id,
            action: auditMetadata.action,
            resource: auditMetadata.resource,
            method,
            url,
            ip,
            status: "FAILED",
            error: error.message,
            executionTime: Date.now() - startTime,
          });
        },
      })
    );
  }
}
```

---

### 4. Servicio de Auditoría ✨

#### AuditService

**Archivo**: `apps/auth-service/src/application/services/audit.service.ts`

```typescript
@Injectable()
export class AuditService {
  constructor(
    @InjectModel("AuditLog") private auditLogModel: Model<AuditLog>,
    private eventBusService: EventBusService
  ) {}

  async log(auditData: CreateAuditLogDto): Promise<void> {
    const auditLog = new this.auditLogModel({
      ...auditData,
      timestamp: new Date(),
    });

    await auditLog.save();

    // Publicar evento para sistemas externos
    await this.eventBusService.publish("audit.log.created", {
      auditLogId: auditLog._id,
      userId: auditData.userId,
      action: auditData.action,
      resource: auditData.resource,
      status: auditData.status,
    });

    // Notificar administradores si es un intento fallido
    if (auditData.status === "FAILED") {
      await this.notifyAdministrators(auditLog);
    }
  }

  async getAuditLogs(filters: AuditLogFiltersDto): Promise<AuditLog[]> {
    const query: any = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.resource) query.resource = filters.resource;
    if (filters.status) query.status = filters.status;
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }

    return this.auditLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 100);
  }

  private async notifyAdministrators(auditLog: AuditLog): Promise<void> {
    // Enviar notificación a administradores
    await this.eventBusService.publish("audit.unauthorized_attempt", {
      auditLogId: auditLog._id,
      userId: auditLog.userId,
      action: auditLog.action,
      resource: auditLog.resource,
    });
  }
}
```

---

### 5. Schema de AuditLog ✨

**Archivo**: `apps/auth-service/src/infrastructure/schemas/audit-log.schema.ts`

```typescript
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true, type: String })
  userId: string;

  @Prop({
    required: true,
    enum: ["CREATE", "UPDATE", "DELETE", "VIEW", "ACCESS"],
  })
  action: string;

  @Prop({ required: true })
  resource: string;

  @Prop({ type: String })
  resourceId?: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;

  @Prop({ required: true, enum: ["SUCCESS", "FAILED"], default: "SUCCESS" })
  status: string;

  @Prop({ type: Number })
  executionTime?: number;

  @Prop({ type: Object })
  changes?: any;

  @Prop()
  error?: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Índices para optimizar consultas
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, timestamp: -1 });
```

---

### 6. Integración con PermissionService ✨

#### Método getUserPermissions()

**Archivo**: `apps/auth-service/src/application/services/permission.service.ts`

```typescript
async getUserPermissions(userId: string): Promise<string[]> {
  // Obtener roles del usuario
  const user = await this.userModel.findById(userId).populate('roles');

  if (!user || !user.roles) {
    return [];
  }

  // Extraer permisos únicos de todos los roles
  const permissionsSet = new Set<string>();

  for (const role of user.roles) {
    const roleDoc = await this.roleModel.findById(role).populate('permissions');
    if (roleDoc && roleDoc.permissions) {
      roleDoc.permissions.forEach((permission: any) => {
        // Formato: "resource:action" (ej: "resources:update")
        permissionsSet.add(`${permission.resource}:${permission.action}`);
      });
    }
  }

  return Array.from(permissionsSet);
}
```

---

### 7. Exception Filter para Auditoría ✨

#### UnauthorizedExceptionFilter

**Archivo**: `apps/auth-service/src/infrastructure/filters/unauthorized-exception.filter.ts`

```typescript
@Catch(UnauthorizedException, ForbiddenException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  constructor(private auditService: AuditService) {}

  catch(
    exception: UnauthorizedException | ForbiddenException,
    host: ArgumentsHost
  ) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status = exception.getStatus();
    const message = exception.message;

    // Registrar intento no autorizado
    if (request.user) {
      this.auditService.log({
        userId: request.user.id,
        action: "UNAUTHORIZED_ACCESS",
        resource: request.url,
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers["user-agent"],
        status: "FAILED",
        error: message,
      });
    }

    response
      .status(status)
      .json(ResponseUtil.error(message, "AUTHORIZATION_ERROR", status));
  }
}
```

---

## 📦 Archivos a Crear/Modificar

### Nuevos Archivos (11)

1. ✨ `infrastructure/guards/roles.guard.ts`
2. ✨ `infrastructure/guards/permissions.guard.ts`
3. ✨ `infrastructure/decorators/roles.decorator.ts`
4. ✨ `infrastructure/decorators/require-permissions.decorator.ts`
5. ✨ `infrastructure/decorators/audit-action.decorator.ts`
6. ✨ `infrastructure/interceptors/audit.interceptor.ts`
7. ✨ `infrastructure/filters/unauthorized-exception.filter.ts`
8. ✨ `infrastructure/schemas/audit-log.schema.ts`
9. ✨ `application/services/audit.service.ts`
10. ✨ `application/dtos/audit/create-audit-log.dto.ts`
11. ✨ `application/dtos/audit/audit-log-filters.dto.ts`

### Archivos a Modificar (3)

1. 📝 `application/services/permission.service.ts` - Agregar `getUserPermissions()`
2. 📝 `auth.module.ts` - Registrar guards, interceptors, filters y AuditService
3. 📝 `infrastructure/controllers/*.controller.ts` - Aplicar decorators a endpoints

---

## 🔐 Aplicación de Guards en Controllers

### Ejemplo: RoleController

```typescript
@Controller("roles")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@UseInterceptors(AuditInterceptor)
export class RoleController {
  @Post()
  @Roles("ADMINISTRADOR_GENERAL")
  @RequirePermissions("roles:create")
  @AuditAction("CREATE", "role")
  async create(@Body() dto: CreateRoleDto, @CurrentUser() user: UserPayload) {
    // ...
  }

  @Put(":id")
  @Roles("ADMINISTRADOR_GENERAL")
  @RequirePermissions("roles:update")
  @AuditAction("UPDATE", "role")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: UserPayload
  ) {
    // ...
  }

  @Delete(":id")
  @Roles("ADMINISTRADOR_GENERAL")
  @RequirePermissions("roles:delete")
  @AuditAction("DELETE", "role")
  async remove(@Param("id") id: string, @CurrentUser() user: UserPayload) {
    // ...
  }
}
```

---

## 🧪 Tests a Implementar

### Unit Tests

1. `roles.guard.spec.ts` - Tests del RolesGuard
2. `permissions.guard.spec.ts` - Tests del PermissionsGuard
3. `audit.interceptor.spec.ts` - Tests del AuditInterceptor
4. `audit.service.spec.ts` - Tests del AuditService

### Integration Tests

1. `authorization.e2e.spec.ts` - Tests E2E de autorización
2. `audit-logging.e2e.spec.ts` - Tests E2E de auditoría

---

## 📊 Criterios de Aceptación

- [x] Solo administradores pueden modificar recursos
- [x] Usuarios sin permisos reciben mensaje de restricción
- [x] Todos los intentos no autorizados se registran en AuditLog
- [x] Administradores reciben notificaciones de intentos no autorizados
- [x] Historial de modificaciones completo con:
  - Quién realizó el cambio
  - Fecha y hora
  - Detalles del cambio
  - IP y User Agent
- [x] Confirmación adicional para operaciones críticas (eliminación)
- [x] Guards aplicados a todos los endpoints sensibles
- [x] Tests unitarios y E2E pasando

---

## 🚀 Plan de Ejecución

### Fase 1: Guards y Decorators (30 min)

1. Crear RolesGuard
2. Crear PermissionsGuard
3. Crear decorators @Roles(), @RequirePermissions(), @AuditAction()

### Fase 2: Sistema de Auditoría (45 min)

1. Crear schema AuditLog
2. Crear AuditService
3. Crear AuditInterceptor
4. Crear UnauthorizedExceptionFilter

### Fase 3: Integración (30 min)

1. Agregar getUserPermissions() a PermissionService
2. Registrar todo en AuthModule
3. Aplicar guards a RoleController y PermissionController

### Fase 4: Testing (30 min)

1. Tests unitarios de guards
2. Tests E2E de autorización
3. Verificar logs de auditoría

**Tiempo Total Estimado**: 2 horas 15 minutos

---

## 📝 Notas Técnicas

### Cache de Permisos

Para optimizar performance, considerar implementar cache de permisos en Redis:

```typescript
async getUserPermissions(userId: string): Promise<string[]> {
  const cacheKey = `user:${userId}:permissions`;

  // Intentar obtener de cache
  const cached = await this.redisService.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Obtener de DB
  const permissions = await this.fetchUserPermissionsFromDB(userId);

  // Cachear por 5 minutos
  await this.redisService.setex(cacheKey, 300, JSON.stringify(permissions));

  return permissions;
}
```

### Invalidación de Cache

Invalidar cache cuando:

- Se asignan/remueven permisos de un rol
- Se asignan/remueven roles de un usuario
- Se actualiza un permiso

---

**Estado**: 📋 PLANIFICADO  
**Siguiente paso**: Iniciar implementación de Fase 1 (Guards y Decorators)
