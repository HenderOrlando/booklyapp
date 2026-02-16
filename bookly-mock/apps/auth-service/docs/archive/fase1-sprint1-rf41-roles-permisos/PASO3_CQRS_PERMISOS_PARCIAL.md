# Paso 3: CQRS para Permisos (EN PROGRESO)

**Fecha**: 2025-11-04  
**Tiempo Invertido**: ~2 horas (parcial)  
**Estado**: 🔄 EN PROGRESO (50%)

---

## 📋 Resumen de Implementación

Implementación parcial de CQRS para gestión de permisos. Se completaron los DTOs, Commands y Queries. Pendiente: Service, Handlers y Controller.

### Archivos Creados (9/16 archivos - 56%)

#### ✅ DTOs Completados (3/3)

1. **`create-permission.dto.ts`** (91 líneas)
   - Validaciones: code, name, description, resource, action, isActive
   - Swagger documentation
   - class-validator decorators

2. **`update-permission.dto.ts`** (47 líneas)
   - Campos opcionales: name, description, isActive
   - Validaciones idénticas a CreatePermissionDto

3. **`permission-response.dto.ts`** (65 líneas)
   - DTO de respuesta con todos los campos
   - Constructor para transformación

#### ✅ Commands Completados (3/3)

4. **`create-permission.command.ts`**
   - Parámetros: code, name, description, resource, action, isActive, createdBy

5. **`update-permission.command.ts`**
   - Parámetros: permissionId, name?, description?, isActive?, updatedBy

6. **`delete-permission.command.ts`**
   - Parámetros: permissionId, deletedBy

#### ✅ Queries Completados (3/3)

7. **`get-permissions.query.ts`**
   - Filtros: resource, action, isActive, search
   - Paginación opcional

8. **`get-permission-by-id.query.ts`**
   - Parámetro: permissionId

9. **`get-permissions-by-module.query.ts`**
   - Parámetros: resource, pagination

---

## ⏳ Pendientes de Implementación

### Service (1 archivo - 250 líneas)

**`permission.service.ts`** - Lógica de negocio completa:

**Métodos requeridos**:

- ✅ `createPermission(dto, createdBy)` - Validar code único, crear
- ✅ `updatePermission(id, dto, updatedBy)` - Update parcial
- ✅ `deletePermission(id)` - Eliminar si no está en uso
- ✅ `getPermissions(filters)` - Listar con filtros
- ✅ `getPermissionById(id)` - Por ID
- ✅ `getPermissionsByModule(resource)` - Filtrar por módulo
- ✅ `toResponseDto(permission)` - Transformación

**Validaciones**:

- Code único (resource:action)
- No eliminar si está asignado a roles
- Búsqueda por resource, action, search

### Command Handlers (3 archivos)

**Handlers que delegan al Service**:

- `CreatePermissionHandler`
- `UpdatePermissionHandler`
- `DeletePermissionHandler`

### Query Handlers (3 archivos)

**Handlers que delegan al Service**:

- `GetPermissionsHandler`
- `GetPermissionByIdHandler`
- `GetPermissionsByModuleHandler`

### Controller (1 archivo - 220 líneas)

**`permission.controller.ts`** - Endpoints REST:

- `POST /permissions` - Crear
- `GET /permissions` - Listar con filtros
- `GET /permissions/:id` - Por ID
- `GET /permissions/module/:resource` - Por módulo
- `PUT /permissions/:id` - Actualizar
- `DELETE /permissions/:id` - Eliminar

---

## 🎯 Arquitectura Planeada

### Flujo CQRS (igual que Roles)

```
Controller → CommandBus/QueryBus → Handler → Service → Repository
```

### Business Rules

1. **Crear Permiso**:
   - Validar code único (resource:action)
   - Validar formato resource:action
   - Crear con audit info

2. **Actualizar Permiso**:
   - NO permitir cambiar code (inmutable)
   - Solo name, description, isActive

3. **Eliminar Permiso**:
   - Validar que no esté asignado a roles
   - Prevenir eliminación de permisos en uso

4. **Búsqueda**:
   - Por resource (ej: "resources")
   - Por action (ej: "read")
   - Search en name, description, code

---

## 📊 Progreso del Paso 3

| Componente       | Archivos | Estado | Progreso |
| ---------------- | -------- | ------ | -------- |
| DTOs             | 3/3      | ✅     | 100%     |
| Commands         | 3/3      | ✅     | 100%     |
| Queries          | 3/3      | ✅     | 100%     |
| Service          | 0/1      | ⏳     | 0%       |
| Command Handlers | 0/3      | ⏳     | 0%       |
| Query Handlers   | 0/3      | ⏳     | 0%       |
| Controller       | 0/1      | ⏳     | 0%       |
| **TOTAL**        | **9/16** | 🔄     | **56%**  |

---

## 📈 Progreso Global RF-41

| Paso | Tarea                                 | Estado | Horas |
| ---- | ------------------------------------- | ------ | ----- |
| 1    | ✅ Seeds de permisos y roles          | 100%   | 2h    |
| 2    | ✅ CQRS para Roles                    | 100%   | 3h    |
| 3    | 🔄 CQRS para Permisos (9/16 archivos) | 56%    | 2h    |
| 4    | ⏳ Registrar en AuthModule            | 0%     | -     |

**Progreso RF-41**: 62% | **Tiempo invertido**: 7h / 24h estimadas

---

## 🔄 Opciones para Continuar

### Opción A: Completar Paso 3 Ahora

**Crear los 7 archivos restantes**:

- PermissionService (~250 líneas)
- 3 Command Handlers (~20 líneas c/u)
- 3 Query Handlers (~15 líneas c/u)
- PermissionController (~220 líneas)

**Tiempo estimado**: 2-3 horas más

### Opción B: Registrar en AuthModule Primero

**Registrar lo que ya tenemos**:

- RoleService, RoleController (Paso 2 completo)
- DTOs, Commands, Queries de Permissions (Paso 3 parcial)
- Schemas en MongooseModule
- Handlers en CQRS
- Controllers en módulo

**Beneficio**: Ver funcionando lo implementado

### Opción C: Documentar y Pausar

**Actualizar documentación**:

- Plan de implementación
- README con progreso
- TODOs pendientes claros

**Beneficio**: Punto de checkpoint claro

---

## 📝 Archivos Creados

```
apps/auth-service/src/application/
├── dtos/
│   ├── permission/
│   │   ├── create-permission.dto.ts ✅
│   │   ├── update-permission.dto.ts ✅
│   │   └── permission-response.dto.ts ✅
│   └── role/ (completado en Paso 2)
├── commands/
│   ├── permissions/
│   │   ├── create-permission.command.ts ✅
│   │   ├── update-permission.command.ts ✅
│   │   └── delete-permission.command.ts ✅
│   └── roles/ (completado en Paso 2)
├── queries/
│   ├── permissions/
│   │   ├── get-permissions.query.ts ✅
│   │   ├── get-permission-by-id.query.ts ✅
│   │   └── get-permissions-by-module.query.ts ✅
│   └── roles/ (completado en Paso 2)
├── services/
│   ├── role.service.ts ✅ (Paso 2)
│   └── permission.service.ts ⏳ (PENDIENTE)
└── handlers/
    ├── roles/ ✅ (7 handlers - Paso 2)
    └── permissions/ ⏳ (PENDIENTE 6 handlers)
```

---

## 🎯 Siguiente Decisión Requerida

**¿Deseas que continúe con alguna de estas opciones?**

**A)** Completar Paso 3 (Service + Handlers + Controller de Permissions)  
**B)** Registrar componentes en AuthModule para probar  
**C)** Pausar y documentar progreso actual

O prefieres otra alternativa.

---

**Estado**: 🔄 EN PROGRESO (56%)  
**Fecha Actualización**: 2025-11-04  
**Próxima Acción**: PENDIENTE DE DECISIÓN
