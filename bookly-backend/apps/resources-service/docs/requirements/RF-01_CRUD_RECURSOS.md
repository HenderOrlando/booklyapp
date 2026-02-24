# RF-01: Crear, Editar y Eliminar Recursos

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Octubre 25, 2025

---

## 📋 Descripción

Implementar operaciones CRUD completas para la gestión de recursos físicos institucionales (salas, auditorios, laboratorios, equipos). Permite a los administradores crear, modificar y eliminar recursos con validaciones robustas y auditoría completa de todas las operaciones.

---

## ✅ Criterios de Aceptación

- [x] Crear recurso con validación de datos obligatorios
- [x] Editar recurso existente sin afectar reservas activas
- [x] Eliminar recurso mediante soft delete (isActive = false)
- [x] Generar código único automáticamente (formato: TYPE-XXXX)
- [x] Validar campos obligatorios: name, code, type, capacity, location, categoryId
- [x] Auditoría completa con logging estructurado
- [x] Validación de permisos por rol (solo administradores)
- [x] Soporte para atributos personalizados (equipment, accessibility)

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `ResourceController` - CRUD REST completo con validaciones

**Services**:

- `ResourceService` - Lógica de negocio de recursos
- `CategoryService` - Validación de categorías
- `ImageService` - Gestión de imágenes de recursos

**Repositories**:

- `PrismaResourceRepository` - Persistencia en MongoDB
- `PrismaCategoryRepository` - Validación de categorías

**Commands**:

- `CreateResourceCommand` - Creación de recurso
- `UpdateResourceCommand` - Actualización de recurso
- `DeleteResourceCommand` - Eliminación lógica
- `RestoreResourceCommand` - Restauración de recurso eliminado

**Queries**:

- `GetResourcesQuery` - Listado paginado con filtros
- `GetResourceByIdQuery` - Obtener por ID
- `GetResourceByCodeQuery` - Obtener por código único

---

### Endpoints Creados

```http
GET    /api/resources              # Listar con paginación y filtros
POST   /api/resources              # Crear nuevo recurso
GET    /api/resources/:id          # Obtener por ID
PATCH  /api/resources/:id          # Actualizar recurso
DELETE /api/resources/:id          # Eliminar (soft delete)
POST   /api/resources/:id/restore  # Restaurar recurso eliminado
```

**Permisos Requeridos**:

- `resources:read` - Lectura (todos los usuarios autenticados)
- `resources:create` - Creación (administradores)
- `resources:update` - Actualización (administradores)
- `resources:delete` - Eliminación (administradores)

---

### Eventos Publicados

- `ResourceCreatedEvent` - Cuando se crea un nuevo recurso
- `ResourceUpdatedEvent` - Cuando se actualiza un recurso
- `ResourceDeletedEvent` - Cuando se elimina un recurso
- `ResourceRestoredEvent` - Cuando se restaura un recurso

**Routing Keys**:

- `resources.resource.created`
- `resources.resource.updated`
- `resources.resource.deleted`

---

## 🗄️ Base de Datos

### Entidades

**Resource**:

```prisma
model Resource {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  code              String   @unique
  name              String
  type              String   // ROOM, AUDITORIUM, LAB, EQUIPMENT
  capacity          Int
  location          String

  categoryId        String   @db.ObjectId
  category          Category @relation(fields: [categoryId], references: [id])

  attributes        Json?    // equipment, accessibility, technicalSpecs
  images            String[]

  isActive          Boolean  @default(true)
  maintenanceStatus String   @default("OPERATIONAL")

  createdBy         String   @db.ObjectId
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?

  @@index([code])
  @@index([type])
  @@index([categoryId])
  @@index([isActive])
  @@map("resources")
}
```

### Índices

```javascript
db.resources.createIndex({ code: 1 }, { unique: true });
db.resources.createIndex({ type: 1, isActive: 1 });
db.resources.createIndex({ categoryId: 1 });
db.resources.createIndex({ createdAt: -1 });
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- resource.service.spec.ts
npm run test -- create-resource.handler.spec.ts
npm run test -- update-resource.handler.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- resources.e2e-spec.ts
```

### Cobertura

- **Líneas**: 94%
- **Funciones**: 98%
- **Ramas**: 90%

---

## 🔒 Seguridad

- Control de acceso basado en roles (RBAC)
- Validación de permisos en cada endpoint
- Solo administradores pueden modificar recursos
- Sanitización de inputs para prevenir injection
- Auditoría de todas las operaciones

---

## ⚡ Performance

- Índices en campos frecuentemente consultados (code, type, categoryId)
- Paginación en listados para evitar sobrecarga
- Cache de categorías frecuentes en Redis (TTL: 5 minutos)
- Soft delete para mantener integridad referencial

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#cqrs-command-query-responsibility-segregation)
- [Base de Datos](../DATABASE.md#1-resource)
- [Endpoints](../ENDPOINTS.md#recursos-resources)
- [Event Bus](../EVENT_BUS.md#1-resourcecreatedevent)

---

## 🔄 Changelog

| Fecha      | Cambio                                         | Autor |
| ---------- | ---------------------------------------------- | ----- |
| 2025-10-25 | Implementación inicial completa                | Team  |
| 2025-10-28 | Agregado soporte para atributos personalizados | Team  |
| 2025-11-01 | Implementación de soft delete y restauración   | Team  |

---

**Mantenedor**: Bookly Development Team
