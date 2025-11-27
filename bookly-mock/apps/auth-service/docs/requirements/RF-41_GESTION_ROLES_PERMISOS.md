# RF-41: Gestión de Roles y Permisos

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Octubre 25, 2025

---

## 📋 Descripción

Implementar un sistema completo de gestión de roles y permisos que permita asignar diferentes niveles de acceso a los usuarios del sistema, con granularidad a nivel de recurso y acción.

---

## ✅ Criterios de Aceptación

- [x] Crear, editar y eliminar roles personalizados
- [x] Asignar y remover permisos a roles
- [x] Asignar y remover roles a usuarios
- [x] 6 roles predefinidos inmutables (student, teacher, admin, coordinator, vigilant, administrative)
- [x] Permisos granulares con estructura `resource:action` (ej: `reservations:create`)
- [x] Validación de permisos en cada endpoint protegido
- [x] Auditoría de todas las asignaciones/remociones
- [x] API REST completa para gestión de roles y permisos

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `RolesController` - CRUD de roles
- `PermissionsController` - CRUD de permisos
- `UsersController.assignRole()` - Asignación de roles a usuarios

**Services**:

- `RoleService` - Lógica de negocio de roles
- `PermissionService` - Lógica de negocio de permisos
- `AuthorizationService` - Validación de permisos

**Repositories**:

- `PrismaRoleRepository` - Persistencia de roles
- `PrismaPermissionRepository` - Persistencia de permisos

**Commands**:

- `CreateRoleCommand`
- `UpdateRoleCommand`
- `DeleteRoleCommand`
- `AssignRoleToUserCommand`
- `RemoveRoleFromUserCommand`
- `CreatePermissionCommand`
- `AssignPermissionToRoleCommand`
- `RemovePermissionFromRoleCommand`

**Queries**:

- `GetRolesQuery`
- `GetRoleByIdQuery`
- `GetUserRolesQuery`
- `GetPermissionsQuery`
- `GetRolePermissionsQuery`
- `CheckUserPermissionQuery`

---

### Endpoints Creados

```http
# Roles
GET    /api/roles
POST   /api/roles
GET    /api/roles/:id
PATCH  /api/roles/:id
DELETE /api/roles/:id

# Permisos
GET    /api/permissions
POST   /api/permissions
POST   /api/permissions/check

# Asignación
POST   /api/users/:id/roles
DELETE /api/users/:id/roles/:roleId
```

---

### Eventos Publicados

- `RoleAssignedEvent` - Cuando se asigna un rol a un usuario
- `RoleRemovedEvent` - Cuando se remueve un rol de un usuario
- `RoleCreatedEvent` - Cuando se crea un nuevo rol
- `PermissionCreatedEvent` - Cuando se crea un nuevo permiso

---

## 🗄️ Base de Datos

### Entidades

**Role**:

```prisma
model Role {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String   @unique
  description   String?
  isActive      Boolean  @default(true)
  isSystem      Boolean  @default(false)

  permissionIds String[] @db.ObjectId
  permissions   Permission[] @relation(fields: [permissionIds], references: [id])

  userIds       String[] @db.ObjectId
  users         User[]   @relation(fields: [userIds], references: [id])
}
```

**Permission**:

```prisma
model Permission {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   @unique
  resource    String
  action      String
  description String?

  roleIds     String[] @db.ObjectId
  roles       Role[]   @relation(fields: [roleIds], references: [id])
}
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- role.service.spec.ts
npm run test -- permission.service.spec.ts
npm run test -- authorization.service.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- roles.e2e-spec.ts
npm run test:e2e -- permissions.e2e-spec.ts
```

### Cobertura

- **Líneas**: 95%
- **Funciones**: 100%
- **Ramas**: 92%

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#patrones-implementados)
- [Base de Datos](../DATABASE.md#2-role-rol)
- [Endpoints](../ENDPOINTS.md#gestión-de-roles)
- [Event Bus](../EVENT_BUS.md#4-roleassignedevent)

---

## 🔄 Changelog

| Fecha      | Cambio                                       | Autor |
| ---------- | -------------------------------------------- | ----- |
| 2025-10-25 | Implementación inicial completa              | Team  |
| 2025-10-28 | Agregado soporte para permisos condicionales | Team  |
| 2025-11-01 | Implementación de roles del sistema          | Team  |

---

**Mantenedor**: Bookly Development Team
