# Plan de Implementación - RF-41: Seeds + CQRS Roles/Permisos

**Fecha Inicio**: 2025-11-04  
**Sprint**: Fase 1 - Sprint 1  
**Esfuerzo Estimado**: 24 horas  
**Prioridad**: 🔴 CRÍTICA

---

## 📋 Contexto

### Hallazgos de la Auditoría

**Archivo de Auditoría**: `docs/results/AUDITORIA_AUTH_SERVICE.md`

#### Estado Actual (RF-41)

- ✅ Entidades Role y Permission **EXISTEN** en `domain/entities/`
- ✅ Schemas Role y Permission **EXISTEN** en `infrastructure/schemas/`
- ❌ Seeds para Role y Permission **NO IMPLEMENTADOS**
- ❌ CQRS Commands/Queries/Handlers **NO IMPLEMENTADOS**
- ❌ Services para Role/Permission **NO IMPLEMENTADOS**
- ❌ Controllers para Role/Permission **NO IMPLEMENTADOS**

#### Impacto

- 🔴 **Bloquea producción**: Sin sistema de roles/permisos funcional
- 🔴 **Seguridad comprometida**: Usuarios con permisos hardcodeados
- 🔴 **No escalable**: Imposible gestionar permisos dinámicamente

---

## 🎯 Objetivos de la Implementación

### Funcionalidad a Entregar

1. **Seeds de Roles y Permisos**:
   - 6 roles predefinidos (admin, program_admin, teacher, student, security, staff)
   - ~30 permisos granulares por módulo
   - Relación roles-permisos correctamente vinculada

2. **CQRS Completo para Roles**:
   - CreateRoleCommand/Handler
   - UpdateRoleCommand/Handler
   - DeleteRoleCommand/Handler
   - GetRolesQuery/Handler
   - GetRoleByIdQuery/Handler
   - RoleService

3. **CQRS Completo para Permisos**:
   - CreatePermissionCommand/Handler
   - UpdatePermissionCommand/Handler
   - DeletePermissionCommand/Handler
   - GetPermissionsQuery/Handler
   - GetPermissionByIdQuery/Handler
   - PermissionService

4. **Controllers REST**:
   - RoleController con endpoints CRUD
   - PermissionController con endpoints CRUD
   - Documentación Swagger completa

---

## 📝 Checklist de Implementación

### Paso 1: Seeds de Roles y Permisos (6h)

#### 1.1 Definir Permisos por Módulo

- [ ] **Auth Module** (6 permisos):
  - `auth:users:read`, `auth:users:write`, `auth:users:delete`
  - `auth:roles:read`, `auth:roles:write`, `auth:roles:delete`

- [ ] **Resources Module** (6 permisos):
  - `resources:read`, `resources:write`, `resources:delete`
  - `resources:categories:read`, `resources:categories:write`, `resources:categories:delete`

- [ ] **Availability Module** (9 permisos):
  - `availability:read`, `availability:write`, `availability:delete`
  - `availability:reservations:read`, `availability:reservations:write`, `availability:reservations:cancel`
  - `availability:approve`, `availability:reassign`, `availability:override`

- [ ] **Stockpile Module** (6 permisos):
  - `stockpile:read`, `stockpile:write`, `stockpile:delete`
  - `stockpile:approve`, `stockpile:reject`, `stockpile:validate`

- [ ] **Reports Module** (3 permisos):
  - `reports:read`, `reports:write`, `reports:export`

#### 1.2 Definir Roles con Permisos Asociados

- [ ] **Admin**: Todos los permisos (\*)
- [ ] **Program Admin**: Gestión completa de recursos y disponibilidad
- [ ] **Teacher**: Crear reservas, ver disponibilidad, aprobar solicitudes de estudiantes
- [ ] **Student**: Ver disponibilidad, crear reservas (con aprobación)
- [ ] **Security**: Validar check-in/check-out, ver aprobaciones
- [ ] **Staff**: Lectura de recursos, disponibilidad, reportes

#### 1.3 Actualizar Seed File

- [ ] Crear función `seedPermissions()`
- [ ] Crear función `seedRoles()`
- [ ] Actualizar función `seedUsers()` para vincular roles por ID
- [ ] Integrar todas las funciones en seed principal

**Archivos**:

- `apps/auth-service/src/database/seed.ts`

---

### Paso 2: CQRS para Roles (8h)

#### 2.1 Commands

- [ ] `CreateRoleCommand` + DTO

  ```typescript
  // apps/auth-service/src/application/commands/roles/create-role.command.ts
  export class CreateRoleCommand {
    constructor(
      public readonly name: string,
      public readonly description: string,
      public readonly permissionIds: string[],
      public readonly isSystem: boolean = false
    ) {}
  }
  ```

- [ ] `CreateRoleHandler`
  - Validar nombre único
  - Validar permisos existen
  - Crear rol con permisos asociados
  - Emitir evento `RoleCreatedEvent`

- [ ] `UpdateRoleCommand` + Handler
- [ ] `DeleteRoleCommand` + Handler

#### 2.2 Queries

- [ ] `GetRolesQuery` + Handler (con paginación)
- [ ] `GetRoleByIdQuery` + Handler
- [ ] `GetActiveRolesQuery` + Handler
- [ ] `GetSystemRolesQuery` + Handler

#### 2.3 Services

- [ ] `RoleService`
  - `createRole(dto): Promise<RoleEntity>`
  - `updateRole(id, dto): Promise<RoleEntity>`
  - `deleteRole(id): Promise<void>`
  - `getRoles(filters): Promise<RoleEntity[]>`
  - `getRoleById(id): Promise<RoleEntity>`
  - `assignPermissions(roleId, permissionIds): Promise<void>`
  - `removePermissions(roleId, permissionIds): Promise<void>`

**Archivos**:

- `apps/auth-service/src/application/commands/roles/`
- `apps/auth-service/src/application/queries/roles/`
- `apps/auth-service/src/application/services/role.service.ts`

---

### Paso 3: CQRS para Permisos (6h)

#### 3.1 Commands

- [ ] `CreatePermissionCommand` + Handler
- [ ] `UpdatePermissionCommand` + Handler
- [ ] `DeletePermissionCommand` + Handler

#### 3.2 Queries

- [ ] `GetPermissionsQuery` + Handler
- [ ] `GetPermissionByIdQuery` + Handler
- [ ] `GetPermissionsByModuleQuery` + Handler

#### 3.3 Services

- [ ] `PermissionService`
  - `createPermission(dto): Promise<PermissionEntity>`
  - `updatePermission(id, dto): Promise<PermissionEntity>`
  - `deletePermission(id): Promise<void>`
  - `getPermissions(filters): Promise<PermissionEntity[]>`
  - `getPermissionById(id): Promise<PermissionEntity>`
  - `getPermissionsByModule(module): Promise<PermissionEntity[]>`

**Archivos**:

- `apps/auth-service/src/application/commands/permissions/`
- `apps/auth-service/src/application/queries/permissions/`
- `apps/auth-service/src/application/services/permission.service.ts`

---

### Paso 4: Controllers REST (4h)

#### 4.1 RoleController

- [ ] Endpoints:
  - `POST /api/v1/auth/roles` - Crear rol
  - `GET /api/v1/auth/roles` - Listar roles (paginado)
  - `GET /api/v1/auth/roles/:id` - Obtener rol
  - `PUT /api/v1/auth/roles/:id` - Actualizar rol
  - `DELETE /api/v1/auth/roles/:id` - Eliminar rol
  - `POST /api/v1/auth/roles/:id/permissions` - Asignar permisos
  - `DELETE /api/v1/auth/roles/:id/permissions` - Remover permisos

- [ ] Guards: `@UseGuards(JwtAuthGuard, RolesGuard)`
- [ ] Permisos requeridos: `@RequirePermissions('auth:roles:write')`
- [ ] Swagger: Decoradores completos

#### 4.2 PermissionController

- [ ] Endpoints:
  - `POST /api/v1/auth/permissions` - Crear permiso
  - `GET /api/v1/auth/permissions` - Listar permisos
  - `GET /api/v1/auth/permissions/:id` - Obtener permiso
  - `PUT /api/v1/auth/permissions/:id` - Actualizar permiso
  - `DELETE /api/v1/auth/permissions/:id` - Eliminar permiso

- [ ] Guards y permisos configurados
- [ ] Swagger documentado

**Archivos**:

- `apps/auth-service/src/infrastructure/controllers/role.controller.ts`
- `apps/auth-service/src/infrastructure/controllers/permission.controller.ts`

---

## 🔧 Consideraciones Técnicas

### Arquitectura

1. **Separación de Responsabilidades**:
   - Controllers → CommandBus/QueryBus
   - Handlers → Services
   - Services → Repositories
   - NO ciclos entre capas

2. **Event-Driven**:
   - Emitir eventos en commands: `RoleCreatedEvent`, `RoleUpdatedEvent`, etc.
   - Handlers escuchan eventos para auditoría

3. **Validaciones**:
   - DTOs con class-validator
   - Business rules en Services
   - Guards para autorización

### Datos de Prueba

**Permisos Totales**: ~30 permisos  
**Roles Totales**: 6 roles sistema + capacidad para personalizados  
**Usuarios**: 6 usuarios vinculados a roles

---

## 📊 Criterios de Aceptación

### Funcional

- [ ] Seeds ejecutan correctamente sin errores
- [ ] 30 permisos creados en BD
- [ ] 6 roles creados con permisos asociados
- [ ] 6 usuarios vinculados a roles correctos
- [ ] CRUD completo de roles funciona (crear, leer, actualizar, eliminar)
- [ ] CRUD completo de permisos funciona
- [ ] Asignación/remoción de permisos a roles funciona
- [ ] Endpoints REST responden correctamente
- [ ] Swagger documenta todos los endpoints

### Técnico

- [ ] Zero errores de compilación TypeScript
- [ ] Código cumple estándares Bookly (Clean Architecture, CQRS)
- [ ] Imports usan alias (`@apps/`, `@libs/`)
- [ ] Handlers NO tienen lógica de negocio (solo delegan a Services)
- [ ] Services contienen toda la lógica
- [ ] Eventos emitidos correctamente
- [ ] Guards y decoradores aplicados
- [ ] DTOs con validaciones completas

### Testing (Opcional para Sprint 1)

- [ ] Unit tests para Services (>80% cobertura)
- [ ] Integration tests para Commands/Queries
- [ ] E2E tests para Controllers

---

## 🚀 Plan de Ejecución

### Orden de Implementación

1. **Día 1 (8h)**: Seeds de permisos y roles
   - Definir permisos
   - Definir roles
   - Actualizar seed.ts
   - Probar seed

2. **Día 2 (8h)**: CQRS Roles
   - Commands + Handlers
   - Queries + Handlers
   - RoleService

3. **Día 3 (6h)**: CQRS Permisos + Controllers
   - Commands/Queries/Handlers permisos
   - PermissionService
   - RoleController
   - PermissionController

4. **Día 4 (2h)**: Integración y Pruebas
   - Registrar handlers en módulo
   - Probar endpoints
   - Documentar Swagger
   - Validar criterios de aceptación

**Total**: 24 horas

---

## 📁 Estructura de Archivos Resultante

```
apps/auth-service/src/
├── application/
│   ├── commands/
│   │   ├── roles/
│   │   │   ├── create-role.command.ts
│   │   │   ├── create-role.handler.ts
│   │   │   ├── update-role.command.ts
│   │   │   ├── update-role.handler.ts
│   │   │   ├── delete-role.command.ts
│   │   │   └── delete-role.handler.ts
│   │   └── permissions/
│   │       ├── create-permission.command.ts
│   │       ├── create-permission.handler.ts
│   │       └── ...
│   ├── queries/
│   │   ├── roles/
│   │   │   ├── get-roles.query.ts
│   │   │   ├── get-roles.handler.ts
│   │   │   └── ...
│   │   └── permissions/
│   │       ├── get-permissions.query.ts
│   │       └── ...
│   └── services/
│       ├── role.service.ts
│       └── permission.service.ts
├── domain/
│   └── entities/
│       ├── role.entity.ts ✅ (ya existe)
│       ├── permission.entity.ts ✅ (ya existe)
│       └── user.entity.ts ✅ (ya existe)
├── infrastructure/
│   ├── controllers/
│   │   ├── role.controller.ts (NUEVO)
│   │   └── permission.controller.ts (NUEVO)
│   └── schemas/
│       ├── role.schema.ts ✅ (ya existe)
│       ├── permission.schema.ts ✅ (ya existe)
│       └── user.schema.ts ✅ (ya existe)
└── database/
    └── seed.ts (ACTUALIZAR)
```

---

## 📝 Registro de Progreso

### Sesión 1 (2025-11-04)

- [x] Creación del plan de implementación
- [ ] Inicio de implementación

**Próximo paso**: Implementar seeds de permisos y roles

---

**Estado**: ⏳ EN PROGRESO  
**Fecha Actualización**: 2025-11-04  
**Responsable**: Equipo de Desarrollo Bookly
