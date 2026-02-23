# Dominio de Gestión de Recursos

## Análisis para Tesis de Grado — resources-service

---

## 1. Contexto del Dominio

El módulo de recursos (`resources-service`) gestiona el ciclo de vida completo de los espacios físicos e infraestructura institucional: salas, auditorios, laboratorios, equipos audiovisuales y demás activos reservables de la universidad.

**Puerto**: 3002
**Responsabilidades**: CRUD de recursos, categorización, atributos clave, importación masiva CSV, reglas de disponibilidad, gestión de mantenimiento, asociación a facultades/departamentos/programas.

---

## 2. Requerimientos Funcionales Implementados

| RF | Nombre | Estado | Descripción |
|----|--------|--------|-------------|
| RF-01 | CRUD de recursos | ✅ | Crear, editar, eliminar y restaurar recursos con soft-delete |
| RF-02 | Asociar recursos a categoría y programas | ✅ | Taxonomía multi-nivel: facultad → departamento → programa |
| RF-03 | Definir atributos clave del recurso | ✅ | Capacidad, ubicación, equipamiento, características dinámicas |
| RF-04 | Importación masiva de recursos | ✅ | Carga vía CSV con validación, template descargable |
| RF-05 | Configuración de reglas de disponibilidad | ✅ | Horarios, bloqueos, excepciones por recurso |
| RF-06 | Mantenimiento de recursos | ✅ | Programación, seguimiento de estado, notificaciones |

## 3. Historias de Usuario Cubiertas

- **HU-01**: Crear Recurso
- **HU-02**: Editar Recurso
- **HU-03**: Eliminar o Deshabilitar Recurso
- **HU-04**: Definir Atributos Clave del Recurso
- **HU-05**: Configuración de Reglas de Disponibilidad
- **HU-06**: Asociar Recurso a Categoría y Programa Académico
- **HU-07**: Importación Masiva de Recursos
- **HU-08**: Gestión de Mantenimiento de Recursos

## 4. Casos de Uso

- **CU-008**: Registrar un nuevo recurso
- **CU-009**: Modificar información de un recurso
- **CU-010**: Eliminar o deshabilitar un recurso

---

## 5. Arquitectura Técnica

### 5.1 Clean Architecture + CQRS

El servicio sigue la arquitectura hexagonal con separación estricta:

```
src/
├── domain/          # Entidades, Value Objects, interfaces de repositorio
├── application/     # Commands, Queries, Handlers, DTOs
├── infrastructure/  # Controllers, Repositorios Mongoose, Adaptadores
└── config/          # Configuración del microservicio
```

### 5.2 Modelo de Datos

**Entidad principal**: `Resource`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Nombre del recurso |
| `type` | enum | Tipo: sala, laboratorio, auditorio, equipo |
| `capacity` | number | Capacidad máxima |
| `location` | object | Edificio, piso, número |
| `status` | enum | Disponible, en uso, mantenimiento, deshabilitado |
| `categoryId` | ObjectId | Referencia a categoría |
| `attributes` | Map | Atributos dinámicos (proyector, WiFi, aire acondicionado) |
| `availabilityRules` | array | Reglas de disponibilidad configurables |
| `maintenanceStatus` | enum | Estado de mantenimiento |
| `tenantId` | string | Índice para multi-tenancy |

### 5.3 Importación Masiva CSV

Proceso implementado:

1. **Upload**: Recepción del archivo CSV vía multipart
2. **Validación**: Verificación de headers, tipos, rangos y referencias
3. **Procesamiento batch**: Inserción en lotes con manejo transaccional
4. **Reporte**: Resumen de creados/actualizados/errores por fila
5. **Template**: CSV descargable con columnas y formatos esperados

### 5.4 Cache con Métricas

- **TTL**: 10 min para recursos, 5 min para categorías
- **Hit rate objetivo**: 75-85%
- **Impacto medido**: -60% queries a MongoDB
- **Métricas Prometheus**: `bookly_cache_hits_total`, `bookly_cache_misses_total`, `bookly_cache_hit_rate`

### 5.5 API Endpoints

| Grupo | Endpoints Principales |
|-------|----------------------|
| **Resources** | `GET/POST /resources`, `PATCH/DELETE /resources/:id`, `POST /resources/:id/restore` |
| **Categories** | `GET/POST /categories`, `PATCH/DELETE /categories/:id` |
| **Maintenance** | `POST /maintenance`, `GET /maintenance/:id`, `PATCH /maintenance/:id` |
| **Attributes** | `GET/POST /resource-attributes` |
| **Import** | `POST /resources/import` |

### 5.6 Eventos Asincrónicos

14 canales documentados en `resources-events.asyncapi.yaml`:

- `resource.created`, `resource.updated`, `resource.deleted`
- `resource.status.changed`, `resource.restored`
- `category.created`, `category.updated`
- `maintenance.scheduled`, `maintenance.started`, `maintenance.completed`
- `import.started`, `import.completed`, `import.failed`
- `availability.rules.updated`

### 5.7 Protección con Guards

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('resources')
export class ResourcesController {
  @Post()
  @RequirePermissions('resources:create')

  @Patch(':id')
  @RequirePermissions('resources:update')

  @Delete(':id')
  @RequirePermissions('resources:delete')
}
```

---

## 6. Requerimientos No Funcionales

| RNF | Requisito | Implementación |
|-----|-----------|---------------|
| RNF-01 | Registro de auditoría estructurado | Winston JSON + OpenTelemetry spans |
| RNF-02 | Validaciones de datos obligatorios | DTOs con class-validator, validación en dominio |
| RNF-03 | Edición sin afectar reservas activas | Verificación de reservas vinculadas antes de deshabilitar |

---

## 7. KPIs Operativos del Dominio

| KPI | Fuente | Umbral de Alerta |
|-----|--------|-----------------|
| Resources created per day | Event Store | Informacional |
| Import success rate | resources-service | < 90% |
| Resources under maintenance | BD | > 20% del total |

---

## 8. Aspectos Destacables para Tesis

### 8.1 Innovación Técnica

- **Importación masiva inteligente**: Validación por fila con reporte detallado, sin interrumpir el procesamiento por errores parciales. Template CSV descargable facilita la adopción.
- **Atributos dinámicos**: El modelo soporta características arbitrarias (`Map<string, any>`) sin cambios de schema, permitiendo que cada institución defina sus propios atributos.
- **Soft-delete con restauración**: Los recursos nunca se pierden; se deshabilitan y pueden restaurarse preservando historial de reservas.

### 8.2 Contribución Académica

- **Taxonomía institucional flexible**: Modelo jerárquico facultad → departamento → programa refleja la estructura real de universidades colombianas.
- **Gestión de mantenimiento preventivo**: Integración del ciclo de mantenimiento con la disponibilidad de reservas, evitando conflictos de programación.
- **Modelo de eventos de dominio**: Cada cambio de estado genera eventos que alimentan otros servicios (disponibilidad, reportes, notificaciones).

### 8.3 Impacto Institucional

- **Digitalización del inventario**: Centraliza la información de todos los recursos físicos de la universidad en un solo sistema consultable.
- **Importación masiva**: Permite migrar inventarios existentes (Excel/papel) al sistema digital sin ingreso manual recurso por recurso.
- **Trazabilidad de cambios**: Cada modificación queda registrada para auditoría institucional.

---

## 9. Skills y Rules Aplicadas

- **Skills**: `backend`, `gestion-datos-calidad`, `gobierno-de-arquitectura-diseno`
- **Rules**: `bookly-resources-rf01-crud`, `bookly-resources-rf04-importacion-masiva`, `bookly-resources-rf06-mantenimiento`

---

**Dominio**: Gestión de Recursos
**Servicio**: resources-service (Puerto 3002)
**Swagger**: 8 controllers documentados
**AsyncAPI**: 14 canales de eventos
