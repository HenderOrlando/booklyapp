# Resources Service - Documentación Técnica

## 📋 Descripción General

El **Resources Service** es el microservicio responsable de la gestión integral de recursos institucionales (salas, auditorios, equipos, laboratorios, etc.) dentro del ecosistema Bookly. Incluye funcionalidades de CRUD, categorización, importación masiva, gestión de mantenimientos y configuración de reglas de disponibilidad.

**Puerto:** 3002  
**Base Path:** `/api/v1`  
**Documentación Swagger:** `http://localhost:3002/api/docs`

## 🏗️ Arquitectura

### Clean Architecture + CQRS + Event-Driven

```
┌─────────────────────────────────────────────────────────────┐
│                    Resources Service                         │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                        │
│  ├── Controllers (REST)                                      │
│  │   ├── ResourcesController                                │
│  │   ├── CategoriesController                               │
│  │   └── MaintenancesController                             │
│  ├── Repositories (MongoDB)                                  │
│  │   ├── ResourceRepository                                 │
│  │   ├── CategoryRepository                                 │
│  │   └── MaintenanceRepository                              │
│  ├── Schemas (Mongoose)                                      │
│  └── DTOs (Validation)                                       │
├─────────────────────────────────────────────────────────────┤
│  Application Layer                                           │
│  ├── Commands (Write Operations)                            │
│  ├── Queries (Read Operations)                              │
│  ├── Handlers (CQRS)                                         │
│  └── Services (Business Logic)                              │
│      ├── ResourceService                                    │
│      ├── CategoryService                                    │
│      └── MaintenanceService                                 │
├─────────────────────────────────────────────────────────────┤
│  Domain Layer                                                │
│  ├── Entities                                                │
│  │   ├── ResourceEntity                                     │
│  │   ├── CategoryEntity                                     │
│  │   └── MaintenanceEntity                                  │
│  └── Repository Interfaces                                   │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Modelos de Dominio

### ResourceEntity

Representa un recurso físico institucional.

**Campos principales:**

- `name`: Nombre del recurso
- `code`: Código único identificador
- `description`: Descripción detallada
- `type`: Tipo (ROOM, AUDITORIUM, LABORATORY, EQUIPMENT, SPORTS_FIELD)
- `location`: Ubicación física
- `capacity`: Capacidad máxima
- `status`: Estado (AVAILABLE, OCCUPIED, MAINTENANCE, DISABLED)
- `categoryId`: Categoría asociada
- `programIds`: Programas académicos con acceso
- `attributes`: Atributos técnicos (equipamiento, accesibilidad, condiciones especiales)
- `images`: URLs de imágenes
- `requiresApproval`: Si requiere aprobación para reserva
- `isActive`: Si está activo

**Tipos de Recursos:**

- **ROOM**: Salas de reuniones, aulas
- **AUDITORIUM**: Auditorios, salones de actos
- **LABORATORY**: Laboratorios especializados
- **EQUIPMENT**: Equipamiento portable (proyectores, laptops)
- **SPORTS_FIELD**: Canchas deportivas

### CategoryEntity

Agrupa recursos por categorías funcionales.

**Campos principales:**

- `name`: Nombre de la categoría
- `code`: Código único
- `description`: Descripción
- `type`: Tipo de categoría (RESOURCE, AUTH, etc.)
- `color`: Color para UI (#hexcode)
- `icon`: Icono asociado
- `parentCategoryId`: Categoría padre (jerarquía)
- `metadata`: Datos adicionales
- `isActive`: Estado activo/inactivo

**Ejemplo de jerarquía:**

```
Espacios Académicos (padre)
├── Aulas
├── Laboratorios
│   ├── Lab. Computación
│   └── Lab. Química
└── Auditorios
```

### MaintenanceEntity

Gestiona mantenimientos programados y realizados.

**Campos principales:**

- `resourceId`: Recurso en mantenimiento
- `type`: Tipo (PREVENTIVE, CORRECTIVE, EMERGENCY)
- `title`: Título del mantenimiento
- `description`: Descripción detallada
- `scheduledStartDate`, `scheduledEndDate`: Fechas programadas
- `actualStartDate`, `actualEndDate`: Fechas reales
- `status`: Estado (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
- `performedBy`: Quién realizó el mantenimiento
- `cost`: Costo del mantenimiento
- `notes`: Notas adicionales
- `affectsAvailability`: Si afecta disponibilidad del recurso

## 🔌 API Endpoints

### Resources Controller

#### POST `/api/v1/resources`

Crear un nuevo recurso.

**Request Body:**

```json
{
  "name": "Sala de Conferencias A-301",
  "code": "SALA-A301",
  "description": "Sala equipada con tecnología audiovisual",
  "type": "ROOM",
  "location": "Edificio A, Piso 3",
  "capacity": 50,
  "categoryId": "507f1f77bcf86cd799439011",
  "programIds": ["507f1f77bcf86cd799439012"],
  "attributes": {
    "equipment": ["projector", "whiteboard", "sound_system"],
    "accessibility": ["wheelchair_accessible", "hearing_loop"],
    "specialConditions": ["air_conditioned", "natural_light"]
  },
  "images": ["https://example.com/sala-a301.jpg"],
  "requiresApproval": true
}
```

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Sala de Conferencias A-301",
  "code": "SALA-A301",
  "type": "ROOM",
  "status": "AVAILABLE",
  "isActive": true,
  "createdAt": "2024-11-03T20:00:00.000Z"
}
```

#### GET `/api/v1/resources`

Listar recursos con filtros avanzados.

**Query Parameters:**

- `page`, `limit`: Paginación
- `type`: Filtrar por tipo
- `categoryId`: Por categoría
- `programId`: Por programa académico
- `status`: Por estado
- `location`: Por ubicación
- `minCapacity`: Capacidad mínima
- `search`: Búsqueda en nombre y descripción
- `isActive`: Solo activos/inactivos

**Response:**

```json
{
  "resources": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 125,
    "totalPages": 13
  }
}
```

#### GET `/api/v1/resources/:id`

Obtener recurso por ID.

#### PATCH `/api/v1/resources/:id`

Actualizar recurso.

**Request Body (parcial):**

```json
{
  "capacity": 60,
  "attributes": {
    "equipment": ["projector", "whiteboard", "sound_system", "video_conference"]
  }
}
```

#### DELETE `/api/v1/resources/:id`

Eliminar (soft delete) recurso.

#### POST `/api/v1/resources/:id/enable`

Habilitar recurso deshabilitado.

#### POST `/api/v1/resources/:id/disable`

Deshabilitar recurso temporalmente.

**Request Body:**

```json
{
  "reason": "Remodelación programada"
}
```

#### POST `/api/v1/resources/bulk`

Importación masiva de recursos desde CSV/JSON.

**Request Body:**

```json
{
  "resources": [
    {
      "name": "Sala A-101",
      "code": "SALA-A101",
      "type": "ROOM",
      "capacity": 30,
      ...
    },
    ...
  ]
}
```

**Response:**

```json
{
  "created": 45,
  "failed": 2,
  "errors": [
    {
      "row": 5,
      "code": "SALA-A105",
      "error": "Code already exists"
    }
  ]
}
```

#### GET `/api/v1/resources/search/advanced`

Búsqueda avanzada con múltiples criterios.

**Query Parameters:**

- `keywords`: Palabras clave
- `types[]`: Array de tipos
- `categoryIds[]`: Array de categorías
- `minCapacity`, `maxCapacity`: Rango de capacidad
- `hasEquipment[]`: Debe tener equipamiento específico
- `requiresApproval`: true/false
- `availableOn`: Fecha de disponibilidad

### Categories Controller

#### POST `/api/v1/categories`

Crear categoría.

**Request Body:**

```json
{
  "name": "Laboratorios de Computación",
  "code": "LAB-COMP",
  "description": "Laboratorios equipados con computadores",
  "type": "RESOURCE",
  "color": "#3B82F6",
  "icon": "computer",
  "parentCategoryId": "507f1f77bcf86cd799439011"
}
```

#### GET `/api/v1/categories`

Listar categorías.

**Query Parameters:**

- `page`, `limit`: Paginación
- `type`: Por tipo
- `parentCategoryId`: Por categoría padre
- `isActive`: Solo activas

#### GET `/api/v1/categories/:id`

Obtener categoría por ID.

#### PATCH `/api/v1/categories/:id`

Actualizar categoría.

#### DELETE `/api/v1/categories/:id`

Eliminar categoría (solo si no tiene recursos asociados).

#### GET `/api/v1/categories/:id/resources`

Obtener recursos de una categoría.

#### GET `/api/v1/categories/tree`

Obtener árbol jerárquico completo de categorías.

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Espacios Académicos",
  "children": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Laboratorios",
      "children": [...]
    }
  ]
}
```

### Maintenances Controller

#### POST `/api/v1/maintenances`

Programar mantenimiento.

**Request Body:**

```json
{
  "resourceId": "507f1f77bcf86cd799439011",
  "type": "PREVENTIVE",
  "title": "Mantenimiento preventivo aire acondicionado",
  "description": "Limpieza de filtros y revisión de compresor",
  "scheduledStartDate": "2024-11-15T08:00:00Z",
  "scheduledEndDate": "2024-11-15T12:00:00Z",
  "performedBy": "Departamento de Mantenimiento",
  "cost": 150000,
  "affectsAvailability": true
}
```

#### GET `/api/v1/maintenances`

Listar mantenimientos.

**Query Parameters:**

- `page`, `limit`: Paginación
- `resourceId`: Por recurso
- `type`: Por tipo
- `status`: Por estado
- `startDate`, `endDate`: Rango de fechas

#### GET `/api/v1/maintenances/:id`

Obtener mantenimiento por ID.

#### PATCH `/api/v1/maintenances/:id`

Actualizar mantenimiento.

#### POST `/api/v1/maintenances/:id/start`

Marcar mantenimiento como iniciado.

#### POST `/api/v1/maintenances/:id/complete`

Marcar mantenimiento como completado.

**Request Body:**

```json
{
  "actualEndDate": "2024-11-15T11:30:00Z",
  "notes": "Mantenimiento completado sin incidencias"
}
```

#### POST `/api/v1/maintenances/:id/cancel`

Cancelar mantenimiento.

**Request Body:**

```json
{
  "reason": "Postponed to next week"
}
```

## 🔄 Casos de Uso Principales

### 1. Crear Recurso con Validaciones

**Flujo:**

1. Usuario envía datos del recurso
2. Sistema valida unicidad de código
3. Sistema valida existencia de categoría
4. Sistema valida programas académicos
5. Sistema crea recurso con estado AVAILABLE
6. Sistema publica evento `ResourceCreated`
7. Sistema retorna recurso creado

**Validaciones:**

- Code único en el sistema
- Categoría existe y está activa
- Programas existen
- Capacidad > 0
- Tipo válido
- Atributos según tipo de recurso

### 2. Importación Masiva

**Flujo:**

1. Usuario carga archivo CSV/JSON
2. Sistema valida formato
3. Sistema procesa cada fila:
   - Valida datos
   - Verifica duplicados
   - Crea recurso o registra error
4. Sistema retorna resumen:
   - Total creados
   - Total fallidos
   - Detalle de errores

**Formato CSV esperado:**

```csv
code,name,type,capacity,location,categoryId,requiresApproval
SALA-A101,Sala A-101,ROOM,30,Edificio A Piso 1,507f...,true
```

### 3. Gestión de Mantenimientos

**Flujo:**

1. Administrador programa mantenimiento
2. Sistema valida que recurso existe
3. Sistema marca recurso con estado MAINTENANCE
4. Sistema bloquea reservas en período de mantenimiento
5. Durante mantenimiento:
   - Técnico marca como IN_PROGRESS
   - Sistema actualiza timestamps reales
6. Al completar:
   - Técnico marca como COMPLETED
   - Sistema libera recurso (AVAILABLE)
   - Sistema registra costos y notas

### 4. Búsqueda Avanzada

**Criterios combinables:**

- Tipo de recurso
- Capacidad mínima/máxima
- Equipamiento específico
- Accesibilidad
- Ubicación
- Disponibilidad en fecha específica
- Categoría
- Programa académico

**Ejemplo de consulta:**

```
Buscar: salas con capacidad 30-50 personas,
con proyector y acceso para silla de ruedas,
disponibles el 2024-11-15 de 09:00 a 11:00
```

## 🔧 Configuración

### Variables de Entorno

```bash
# MongoDB
MONGODB_URI_RESOURCES=mongodb://bookly:bookly123@localhost:27017/resources?replicaSet=bookly-rs

# JWT
JWT_SECRET=bookly-secret-key
JWT_EXPIRATION=24h

# Server
PORT=3002
CORS_ORIGIN=*

# Business Rules
MAX_RESOURCE_NAME_LENGTH=200
MAX_RESOURCE_CODE_LENGTH=50
DEFAULT_RESOURCE_STATUS=AVAILABLE
MAINTENANCE_BUFFER_HOURS=2
```

### Índices de MongoDB

**Resources Collection:**

- `{ code: 1 }` - Unique, búsqueda por código
- `{ type: 1, status: 1 }` - Filtrado común
- `{ categoryId: 1 }` - Recursos por categoría
- `{ programIds: 1 }` - Recursos por programa
- `{ location: 1, capacity: 1 }` - Búsqueda por ubicación y capacidad
- `{ name: "text", description: "text" }` - Búsqueda full-text

**Categories Collection:**

- `{ code: 1 }` - Unique
- `{ type: 1, isActive: 1 }` - Categorías activas por tipo
- `{ parentCategoryId: 1 }` - Navegación jerárquica

**Maintenances Collection:**

- `{ resourceId: 1, status: 1 }` - Mantenimientos por recurso
- `{ scheduledStartDate: 1, scheduledEndDate: 1 }` - Rango de fechas
- `{ status: 1, type: 1 }` - Por estado y tipo

## 📊 Eventos Publicados

- `ResourceCreated`: Nuevo recurso creado
- `ResourceUpdated`: Recurso actualizado
- `ResourceDeleted`: Recurso eliminado
- `ResourceEnabled`: Recurso habilitado
- `ResourceDisabled`: Recurso deshabilitado
- `MaintenanceScheduled`: Mantenimiento programado
- `MaintenanceStarted`: Mantenimiento iniciado
- `MaintenanceCompleted`: Mantenimiento completado
- `MaintenanceCancelled`: Mantenimiento cancelado

## 🧪 Ejemplos de Uso

### Crear Recurso Completo

```typescript
const resource = await fetch("http://localhost:3002/api/v1/resources", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer <token>",
  },
  body: JSON.stringify({
    name: "Auditorio Principal",
    code: "AUD-PRIN",
    description: "Auditorio con capacidad para 300 personas",
    type: "AUDITORIUM",
    location: "Edificio Central",
    capacity: 300,
    categoryId: "507f1f77bcf86cd799439011",
    programIds: ["507f1f77bcf86cd799439012"],
    attributes: {
      equipment: ["projector", "sound_system", "stage_lighting"],
      accessibility: ["wheelchair_accessible", "elevator_access"],
      specialConditions: ["air_conditioned", "acoustic_treatment"],
    },
    requiresApproval: true,
  }),
});
```

### Búsqueda Avanzada

```typescript
const results = await fetch(
  "http://localhost:3002/api/v1/resources/search/advanced?" +
    "types[]=ROOM&types[]=LABORATORY&" +
    "minCapacity=20&maxCapacity=50&" +
    "hasEquipment[]=projector&" +
    "availableOn=2024-11-15T09:00:00Z",
  {
    headers: { Authorization: "Bearer <token>" },
  }
);
```

### Programar Mantenimiento

```typescript
const maintenance = await fetch("http://localhost:3002/api/v1/maintenances", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer <token>",
  },
  body: JSON.stringify({
    resourceId: "507f1f77bcf86cd799439011",
    type: "PREVENTIVE",
    title: "Mantenimiento mensual",
    scheduledStartDate: "2024-11-15T08:00:00Z",
    scheduledEndDate: "2024-11-15T12:00:00Z",
    affectsAvailability: true,
  }),
});
```

## 🔒 Seguridad

- **JWT Authentication**: Protección de todos los endpoints
- **Role-Based Access Control**: Permisos según rol de usuario
- **Input Validation**: class-validator en todos los DTOs
- **Soft Delete**: Recursos eliminados mantienen histórico
- **Audit Trail**: Registro de todas las modificaciones

## 📈 Métricas y Monitoreo

- Logs estructurados por operación
- Tracking de recursos más utilizados
- Estadísticas de mantenimientos por tipo
- Alertas de recursos deshabilitados
- Reportes de ocupación por categoría

## 🚀 Despliegue

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Docker
docker-compose up resources-service
```

## 🔗 Dependencias con Otros Servicios

- **Availability Service**: Consulta disponibilidad de recursos
- **Stockpile Service**: Notifica cuando recursos requieren aprobación
- **Auth Service**: Valida permisos de usuario
- **Reports Service**: Provee datos de recursos para reportes

## 📋 Atributos Predefinidos

### Equipment (Equipamiento)

- projector, whiteboard, sound_system, video_conference
- computers, internet, printer, scanner

### Accessibility (Accesibilidad)

- wheelchair_accessible, elevator_access, hearing_loop
- braille_signage, visual_alarms

### Special Conditions (Condiciones Especiales)

- air_conditioned, natural_light, soundproof
- emergency_exit, fire_extinguisher, first_aid_kit

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2024  
**Mantenido por:** Equipo Bookly
