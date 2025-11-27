# RF-XX: [Nombre del Requerimiento]

**Estado**: ✅ Completado / 🔄 En Desarrollo / ⏳ Pendiente

**Prioridad**: Alta / Media / Baja

**Fecha de Implementación**: [Fecha]

---

## 📋 Descripción

[Descripción detallada del requerimiento funcional, explicando qué problema resuelve y su importancia en el sistema.]

---

## ✅ Criterios de Aceptación

- [ ] Criterio 1: [Descripción]
- [ ] Criterio 2: [Descripción]
- [ ] Criterio 3: [Descripción]
- [ ] Criterio N: [Descripción]

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `[NombreController]` - [Descripción breve]

**Services**:

- `[NombreService]` - [Descripción breve]

**Repositories**:

- `[NombreRepository]` - [Descripción breve]

**Commands** (CQRS):

- `[NombreCommand]` - [Descripción]

**Queries** (CQRS):

- `[NombreQuery]` - [Descripción]

**Guards/Decorators** (opcional):

- `[NombreGuard]` - [Descripción]

---

### Endpoints Creados

```http
GET    /api/[recurso]           # Listar
POST   /api/[recurso]           # Crear
GET    /api/[recurso]/:id       # Obtener por ID
PATCH  /api/[recurso]/:id       # Actualizar
DELETE /api/[recurso]/:id       # Eliminar
```

**Permisos Requeridos**:

- `[recurso]:read` - Lectura
- `[recurso]:create` - Creación
- `[recurso]:update` - Actualización
- `[recurso]:delete` - Eliminación

---

### Eventos Publicados

- `[NombreEvent]` - [Descripción del evento y cuándo se dispara]
- `[NombreEvent2]` - [Descripción]

**Routing Keys**:

- `[servicio].[recurso].[accion]`

---

## 🗄️ Base de Datos

### Entidades

**[NombreEntidad]**:

```prisma
model [NombreEntidad] {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  campo1      String
  campo2      DateTime

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([campo1])
  @@map("[nombre_coleccion]")
}
```

### Índices

```javascript
db.[coleccion].createIndex({ campo1: 1 });
db.[coleccion].createIndex({ campo2: -1 });
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- [nombre].service.spec.ts
npm run test -- [nombre].handler.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- [nombre].e2e-spec.ts
```

### Cobertura

- **Líneas**: [XX]%
- **Funciones**: [XX]%
- **Ramas**: [XX]%

---

## 🔒 Seguridad

- [Consideraciones de seguridad específicas del requerimiento]
- [Validaciones implementadas]
- [Control de acceso]

---

## ⚡ Performance

- [Optimizaciones implementadas]
- [Cache utilizado]
- [Índices de base de datos]

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#seccion-relevante)
- [Base de Datos](../DATABASE.md#entidad-relevante)
- [Endpoints](../ENDPOINTS.md#seccion-relevante)
- [Event Bus](../EVENT_BUS.md#evento-relevante)

---

## 🔄 Changelog

| Fecha      | Cambio                   | Autor |
| ---------- | ------------------------ | ----- |
| YYYY-MM-DD | [Descripción del cambio] | Team  |

---

## 📝 Notas Adicionales

[Cualquier información adicional relevante, decisiones de diseño, limitaciones conocidas, etc.]

---

**Mantenedor**: Bookly Development Team
