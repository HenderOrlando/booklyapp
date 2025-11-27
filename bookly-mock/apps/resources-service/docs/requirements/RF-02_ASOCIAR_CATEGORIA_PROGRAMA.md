# RF-02: Asociar Recursos a Categoría y Programas

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Octubre 25, 2025

---

## 📋 Descripción

Permitir la asociación de recursos físicos con categorías de clasificación y programas académicos específicos, facilitando la búsqueda, filtrado y gestión de permisos de acceso a recursos por parte de estudiantes y docentes de diferentes programas.

---

## ✅ Criterios de Aceptación

- [x] Asociar recurso a categoría obligatoria al momento de creación
- [x] Asociar recurso a múltiples programas académicos (opcional)
- [x] Filtrar recursos por categoryId en búsquedas
- [x] Filtrar recursos por programId en búsquedas
- [x] Validar existencia y estado activo de categoría antes de asignar
- [x] Permitir actualización de categoría y programas de recurso existente
- [x] Restringir acceso a recursos según programa del usuario

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `ResourceController` - Endpoints con filtros por categoría/programa

**Services**:

- `ResourceService` - Lógica de asociación y validación
- `CategoryService` - Validación de categorías

**Repositories**:

- `PrismaResourceRepository` - Queries con relaciones
- `PrismaCategoryRepository` - Validación de existencia

**Queries**:

- `GetResourcesByCategoryQuery` - Filtrado por categoría
- `GetResourcesByProgramQuery` - Filtrado por programa
- `GetResourceCategoryQuery` - Obtener categoría de recurso

---

### Endpoints Creados

```http
GET /api/resources?categoryId=:categoryId  # Filtrar por categoría
GET /api/resources?programId=:programId    # Filtrar por programa
GET /api/resources/:id/category            # Obtener categoría del recurso
```

**Permisos Requeridos**:

- `resources:read` - Lectura de recursos

---

### Eventos Publicados

- `ResourceCategoryChangedEvent` - Cuando cambia la categoría de un recurso

**Routing Keys**:

- `resources.resource.category_changed`

---

## 🗄️ Base de Datos

### Campos en Resource

```prisma
model Resource {
  categoryId       String    @db.ObjectId
  category         Category  @relation(fields: [categoryId], references: [id])
  allowedProgramIds String[]  @db.ObjectId
  
  @@index([categoryId])
  @@index([allowedProgramIds])
}
```

### Índices

```javascript
db.resources.createIndex({ categoryId: 1 });
db.resources.createIndex({ allowedProgramIds: 1 });
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- resource-category.service.spec.ts
```

### Cobertura

- **Líneas**: 92%
- **Funciones**: 95%
- **Ramas**: 88%

---

## 🔒 Seguridad

- Validación de existencia de categoría antes de asignar
- Control de acceso por programa académico
- Solo administradores pueden cambiar categoría de recursos

---

## ⚡ Performance

- Índices en categoryId y allowedProgramIds para queries rápidas
- Cache de relaciones recurso-categoría (TTL: 10 minutos)

---

## 📚 Documentación Relacionada

- [Base de Datos](../DATABASE.md#1-resource)
- [Endpoints](../ENDPOINTS.md#listar-recursos)

---

**Mantenedor**: Bookly Development Team
