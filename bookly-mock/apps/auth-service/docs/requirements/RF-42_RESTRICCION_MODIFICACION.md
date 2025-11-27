# RF-42: Restricción de Modificación

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Octubre 26, 2025

---

## 📋 Descripción

Implementar restricciones que impidan modificar o eliminar roles del sistema y que validen que solo usuarios con permisos específicos puedan realizar ciertas operaciones.

---

## ✅ Criterios de Aceptación

- [x] Roles del sistema (`isSystem: true`) no se pueden eliminar
- [x] Roles del sistema no se pueden renombrar
- [x] Solo usuarios con permiso `roles:manage` pueden crear/editar roles
- [x] Solo usuarios con permiso `users:manage` pueden asignar roles
- [x] Validación en capa de servicio y guards
- [x] Mensajes de error descriptivos
- [x] Auditoría de intentos de modificación no autorizados

---

## 🏗️ Implementación

### Componentes Desarrollados

**Guards**:

- `PermissionsGuard` - Validación de permisos en endpoints
- `RolesGuard` - Validación de roles requeridos

**Services**:

- `RoleService.canDelete()` - Validación de eliminación de roles
- `RoleService.canUpdate()` - Validación de actualización de roles

**Decorators**:

- `@Permissions(...)` - Especifica permisos requeridos
- `@Roles(...)` - Especifica roles requeridos

---

### Validaciones Implementadas

```typescript
// En RoleService
async delete(id: string): Promise<void> {
  const role = await this.findById(id);

  if (role.isSystem) {
    throw new BadRequestException("Cannot delete system roles");
  }

  await this.roleRepository.delete(id);
}

async update(id: string, dto: UpdateRoleDto): Promise<Role> {
  const role = await this.findById(id);

  if (role.isSystem && dto.name) {
    throw new BadRequestException("Cannot rename system roles");
  }

  return this.roleRepository.update(id, dto);
}
```

---

### Guards en Endpoints

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('roles:manage')
@Post('roles')
async createRole(@Body() dto: CreateRoleDto) {
  return this.commandBus.execute(new CreateRoleCommand(dto));
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('users:manage')
@Post('users/:id/roles')
async assignRole(@Param('id') userId: string, @Body() dto: AssignRoleDto) {
  return this.commandBus.execute(new AssignRoleToUserCommand(userId, dto.roleId));
}
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- permissions.guard.spec.ts
npm run test -- roles.guard.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- role-restrictions.e2e-spec.ts
```

### Cobertura

- **Líneas**: 98%
- **Funciones**: 100%
- **Ramas**: 95%

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#decorator-pattern)
- [Endpoints](../ENDPOINTS.md#gestión-de-roles)

---

## 🔄 Changelog

| Fecha      | Cambio                                | Autor |
| ---------- | ------------------------------------- | ----- |
| 2025-10-26 | Implementación inicial                | Team  |
| 2025-10-28 | Agregados guards para todas las rutas | Team  |

---

**Mantenedor**: Bookly Development Team
