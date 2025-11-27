# 🗄️ Resources Service - Base de Datos

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Esquema de Datos](#esquema-de-datos)
- [Entidades Principales](#entidades-principales)
- [Relaciones](#relaciones)
- [Índices](#índices)
- [Migraciones](#migraciones)
- [Seeds](#seeds)
- [Optimizaciones](#optimizaciones)

---

## 🎯 Visión General

El Resources Service utiliza **MongoDB** como base de datos NoSQL con **Prisma** como ORM. La estructura está diseñada para soportar alta concurrencia y búsquedas rápidas.

### Estadísticas

- **Colecciones**: 4 principales
- **Índices**: 12 optimizados
- **Relaciones**: Many-to-many con arrays
- **Volumen estimado**: 1,000-5,000 recursos

---

## 📊 Esquema de Datos

```prisma
// Recurso físico (sala, auditorio, equipo, etc.)
model Resource {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  name              String
  code              String   @unique
  type              String   // ROOM, AUDITORIUM, LAB, EQUIPMENT
  description       String?
  capacity          Int
  location          String
  floor             String?
  building          String?

  // Categoría
  categoryId        String   @db.ObjectId
  category          Category @relation(fields: [categoryId], references: [id])

  // Atributos personalizados
  attributes        Json?    // equipment[], accessibility[], technicalSpecs

  // Imágenes
  images            String[] // URLs de imágenes

  // Disponibilidad
  availabilityRules Json?    // Reglas de horarios

  // Mantenimiento
  maintenanceStatus String   @default("OPERATIONAL") // OPERATIONAL, MAINTENANCE, OUT_OF_SERVICE
  lastMaintenance   DateTime?
  nextMaintenance   DateTime?

  // Estado
  isActive          Boolean  @default(true)
  isPublic          Boolean  @default(true)
  requiresApproval  Boolean  @default(false)

  // Programas académicos permitidos
  allowedProgramIds String[] @db.ObjectId

  // Auditoría
  createdBy         String   @db.ObjectId
  createdAt         DateTime @default(now())
  updatedBy         String?  @db.ObjectId
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?

  // Relaciones
  maintenanceRecords MaintenanceRecord[]

  @@index([name])
  @@index([code])
  @@index([type])
  @@index([categoryId])
  @@index([isActive])
  @@index([maintenanceStatus])
  @@index([location])
  @@map("resources")
}

// Categoría de recurso
model Category {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  type        String    // RESOURCE_TYPE, MAINTENANCE_TYPE, etc.
  subtype     String?   // Subcategoría opcional
  name        String
  code        String    @unique
  description String?
  color       String?   // Color hex para UI
  icon        String?   // Icono para UI
  isActive    Boolean   @default(true)
  isDefault   Boolean   @default(false)
  sortOrder   Int       @default(0)
  service     String    // resources, availability, stockpile, etc.

  // Auditoría
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relaciones
  resources   Resource[]

  @@unique([type, code])
  @@index([type])
  @@index([service])
  @@index([isActive])
  @@map("categories")
}

// Registro de mantenimiento
model MaintenanceRecord {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId

  // Recurso
  resourceId     String   @db.ObjectId
  resource       Resource @relation(fields: [resourceId], references: [id])

  // Tipo de mantenimiento
  type           String   // PREVENTIVE, CORRECTIVE, EMERGENCY, CLEANING
  title          String
  description    String
  priority       String   @default("MEDIUM") // LOW, MEDIUM, HIGH, CRITICAL

  // Estado
  status         String   @default("SCHEDULED") // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

  // Fechas
  scheduledDate  DateTime
  startDate      DateTime?
  completedDate  DateTime?

  // Personal
  assignedTo     String?  @db.ObjectId
  performedBy    String?  @db.ObjectId

  // Costos
  estimatedCost  Float?
  actualCost     Float?

  // Observaciones
  notes          String?
  result         String?

  // Auditoría
  createdBy      String   @db.ObjectId
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([resourceId])
  @@index([status])
  @@index([scheduledDate])
  @@index([type])
  @@map("maintenance_records")
}

// Importación masiva de recursos
model ResourceImport {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  filename       String
  status         String   @default("PENDING") // PENDING, PROCESSING, COMPLETED, FAILED
  totalRows      Int
  processedRows  Int      @default(0)
  successCount   Int      @default(0)
  errorCount     Int      @default(0)
  errors         Json?    // Array de errores por fila

  // Auditoría
  importedBy     String   @db.ObjectId
  startedAt      DateTime @default(now())
  completedAt    DateTime?

  @@index([status])
  @@index([importedBy])
  @@map("resource_imports")
}
```

---

## 📦 Entidades Principales

### 1. Resource (Recurso)

Representa un recurso físico disponible para reserva.

**Campos Clave**:

- `code`: Código único autogenerado (ej: `SAL-A101`)
- `type`: Tipo de recurso (ROOM, AUDITORIUM, LAB, EQUIPMENT)
- `capacity`: Número de personas/unidades
- `attributes`: JSON con atributos personalizados:
  ```json
  {
    "equipment": ["projector", "whiteboard", "computers"],
    "accessibility": ["wheelchair_accessible", "elevator"],
    "technicalSpecs": {
      "area": "50m2",
      "voltage": "220V",
      "network": "gigabit"
    }
  }
  ```

**Ejemplo**:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Salón A-101",
  "code": "SAL-A101",
  "type": "ROOM",
  "description": "Salón de clases con capacidad para 40 estudiantes",
  "capacity": 40,
  "location": "Edificio A, Piso 1",
  "floor": "1",
  "building": "A",
  "categoryId": "507f1f77bcf86cd799439020",
  "attributes": {
    "equipment": ["projector", "whiteboard", "air_conditioning"],
    "accessibility": ["wheelchair_accessible"]
  },
  "images": [
    "https://cdn.bookly.com/resources/sal-a101-1.jpg",
    "https://cdn.bookly.com/resources/sal-a101-2.jpg"
  ],
  "maintenanceStatus": "OPERATIONAL",
  "isActive": true,
  "isPublic": true,
  "requiresApproval": false,
  "createdAt": "2025-11-01T10:00:00Z"
}
```

---

### 2. Category (Categoría)

Categoriza recursos para organización y filtrado.

**Tipos de Categoría**:

- `RESOURCE_TYPE`: Tipos de recursos (Salón, Auditorio, Laboratorio)
- `MAINTENANCE_TYPE`: Tipos de mantenimiento

**Ejemplo**:

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "type": "RESOURCE_TYPE",
  "subtype": null,
  "name": "Salón de Clases",
  "code": "ROOM",
  "description": "Espacios para actividades académicas regulares",
  "color": "#3B82F6",
  "icon": "classroom",
  "isActive": true,
  "isDefault": true,
  "sortOrder": 1,
  "service": "resources"
}
```

---

### 3. MaintenanceRecord (Registro de Mantenimiento)

Historial de mantenimientos realizados y programados.

**Estados**:

- `SCHEDULED`: Programado
- `IN_PROGRESS`: En ejecución
- `COMPLETED`: Completado
- `CANCELLED`: Cancelado

**Ejemplo**:

```json
{
  "_id": "507f1f77bcf86cd799439030",
  "resourceId": "507f1f77bcf86cd799439011",
  "type": "PREVENTIVE",
  "title": "Mantenimiento preventivo mensual",
  "description": "Revisión de equipos y limpieza profunda",
  "priority": "MEDIUM",
  "status": "COMPLETED",
  "scheduledDate": "2025-11-05T08:00:00Z",
  "startDate": "2025-11-05T08:15:00Z",
  "completedDate": "2025-11-05T10:30:00Z",
  "assignedTo": "507f1f77bcf86cd799439040",
  "performedBy": "507f1f77bcf86cd799439040",
  "estimatedCost": 150000,
  "actualCost": 135000,
  "notes": "Limpieza realizada, aire acondicionado revisado",
  "result": "Satisfactorio, recurso operacional"
}
```

---

### 4. ResourceImport (Importación Masiva)

Registro de importaciones masivas desde CSV/Excel.

**Flujo**:

1. Usuario sube archivo CSV
2. Sistema crea registro con status `PENDING`
3. Job procesa archivo fila por fila
4. Actualiza `processedRows`, `successCount`, `errorCount`
5. Al finalizar, cambia status a `COMPLETED` o `FAILED`

**Ejemplo**:

```json
{
  "_id": "507f1f77bcf86cd799439050",
  "filename": "recursos-edificio-a.csv",
  "status": "COMPLETED",
  "totalRows": 50,
  "processedRows": 50,
  "successCount": 48,
  "errorCount": 2,
  "errors": [
    { "row": 15, "error": "Código duplicado: SAL-A105" },
    { "row": 32, "error": "Capacidad inválida: -5" }
  ],
  "importedBy": "507f1f77bcf86cd799439001",
  "startedAt": "2025-11-06T14:00:00Z",
  "completedAt": "2025-11-06T14:02:35Z"
}
```

---

## 🔗 Relaciones

### Resource ↔ Category

- **Tipo**: Many-to-One
- **Implementación**: `categoryId` en Resource
- **Obligatorio**: Sí

```typescript
// Obtener recurso con categoría
const resource = await prisma.resource.findUnique({
  where: { id: resourceId },
  include: { category: true },
});
```

---

### Resource ↔ MaintenanceRecord

- **Tipo**: One-to-Many
- **Implementación**: `resourceId` en MaintenanceRecord
- **Cascada**: Al eliminar recurso, se mantienen los registros históricos

```typescript
// Obtener recurso con historial de mantenimiento
const resource = await prisma.resource.findUnique({
  where: { id: resourceId },
  include: {
    maintenanceRecords: {
      orderBy: { scheduledDate: "desc" },
      take: 10,
    },
  },
});
```

---

## 🔍 Índices

### Resource

```javascript
// Búsqueda por nombre
db.resources.createIndex({ name: 1 });

// Búsqueda por código único
db.resources.createIndex({ code: 1 }, { unique: true });

// Filtrado por tipo
db.resources.createIndex({ type: 1 });

// Filtrado por categoría
db.resources.createIndex({ categoryId: 1 });

// Filtrado por estado activo
db.resources.createIndex({ isActive: 1 });

// Filtrado por estado de mantenimiento
db.resources.createIndex({ maintenanceStatus: 1 });

// Búsqueda por ubicación
db.resources.createIndex({ location: 1 });

// Índice compuesto para búsquedas frecuentes
db.resources.createIndex({ isActive: 1, type: 1, categoryId: 1 });
```

---

### Category

```javascript
db.categories.createIndex({ type: 1 });
db.categories.createIndex({ service: 1 });
db.categories.createIndex({ isActive: 1 });
db.categories.createIndex({ code: 1 }, { unique: true });
db.categories.createIndex({ type: 1, code: 1 }, { unique: true });
```

---

### MaintenanceRecord

```javascript
db.maintenance_records.createIndex({ resourceId: 1 });
db.maintenance_records.createIndex({ status: 1 });
db.maintenance_records.createIndex({ scheduledDate: 1 });
db.maintenance_records.createIndex({ type: 1 });

// Índice compuesto para dashboard de mantenimiento
db.maintenance_records.createIndex({ status: 1, scheduledDate: 1 });
```

---

## 🔄 Migraciones

### Historial de Migraciones

| Fecha      | Versión | Descripción                                      |
| ---------- | ------- | ------------------------------------------------ |
| 2025-10-01 | 001     | Creación inicial de Resource y Category          |
| 2025-10-15 | 002     | Agregado MaintenanceRecord                       |
| 2025-10-20 | 003     | Agregado campo `attributes` JSON a Resource      |
| 2025-10-25 | 004     | Agregado ResourceImport para carga masiva        |
| 2025-11-01 | 005     | Agregados campos `floor` y `building` a Resource |
| 2025-11-05 | 006     | Unificación de Category model                    |

---

### Ejecutar Migraciones

```bash
# Generar migración
npx prisma migrate dev --name add_maintenance_records

# Aplicar migraciones en producción
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status
```

---

## 🌱 Seeds

### Seed de Categorías

```typescript
const categories = [
  {
    type: "RESOURCE_TYPE",
    name: "Salón de Clases",
    code: "ROOM",
    color: "#3B82F6",
    isDefault: true,
    sortOrder: 1,
    service: "resources",
  },
  {
    type: "RESOURCE_TYPE",
    name: "Auditorio",
    code: "AUDITORIUM",
    color: "#8B5CF6",
    isDefault: true,
    sortOrder: 2,
    service: "resources",
  },
  {
    type: "RESOURCE_TYPE",
    name: "Laboratorio",
    code: "LAB",
    color: "#10B981",
    isDefault: true,
    sortOrder: 3,
    service: "resources",
  },
  {
    type: "RESOURCE_TYPE",
    name: "Equipo Multimedia",
    code: "EQUIPMENT",
    color: "#F59E0B",
    isDefault: true,
    sortOrder: 4,
    service: "resources",
  },
];

await prisma.category.createMany({ data: categories });
```

---

### Seed de Recursos de Ejemplo

```typescript
const resources = [
  {
    name: "Salón A-101",
    code: "SAL-A101",
    type: "ROOM",
    capacity: 40,
    location: "Edificio A, Piso 1",
    floor: "1",
    building: "A",
    categoryId: categoryRoom.id,
    attributes: {
      equipment: ["projector", "whiteboard", "air_conditioning"],
      accessibility: ["wheelchair_accessible"],
    },
    maintenanceStatus: "OPERATIONAL",
    isActive: true,
    isPublic: true,
    createdBy: adminUser.id,
  },
  {
    name: "Auditorio Principal",
    code: "AUD-MAIN",
    type: "AUDITORIUM",
    capacity: 300,
    location: "Edificio Central, Piso 1",
    floor: "1",
    building: "Central",
    categoryId: categoryAuditorium.id,
    attributes: {
      equipment: ["sound_system", "projector", "stage", "microphones"],
      accessibility: ["wheelchair_accessible", "elevator", "ramps"],
    },
    maintenanceStatus: "OPERATIONAL",
    isActive: true,
    isPublic: false,
    requiresApproval: true,
    createdBy: adminUser.id,
  },
];

await prisma.resource.createMany({ data: resources });
```

---

### Ejecutar Seeds

```bash
# Ejecutar seed completo
npm run prisma:db:seed

# Seed simple (solo datos básicos)
npm run prisma:db:seed:simple
```

---

## ⚡ Optimizaciones

### 1. Consultas con Paginación

```typescript
async findAll(filters: ResourceFilters): Promise<PaginatedResult<Resource>> {
  const { page = 1, limit = 20, type, categoryId, isActive = true } = filters;

  const where: any = { isActive };
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;

  const [data, total] = await Promise.all([
    this.prisma.resource.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    }),
    this.prisma.resource.count({ where }),
  ]);

  return {
    data: data.map(ResourceMapper.toDomain),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

---

### 2. Búsqueda con Texto

```typescript
async searchByName(query: string): Promise<Resource[]> {
  const resources = await this.prisma.resource.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
      ],
      isActive: true,
    },
    include: { category: true },
    take: 50,
  });

  return resources.map(ResourceMapper.toDomain);
}
```

---

### 3. Operaciones en Bulk

```typescript
async createMany(resources: CreateResourceData[]): Promise<void> {
  await this.prisma.resource.createMany({
    data: resources,
    skipDuplicates: true,
  });
}

async updateMany(ids: string[], data: Partial<Resource>): Promise<void> {
  await this.prisma.resource.updateMany({
    where: { id: { in: ids } },
    data,
  });
}
```

---

### 4. Agregaciones

```typescript
async getStatsByCategory(): Promise<CategoryStats[]> {
  const stats = await this.prisma.resource.groupBy({
    by: ["categoryId"],
    where: { isActive: true },
    _count: { id: true },
    _sum: { capacity: true },
  });

  return stats.map((s) => ({
    categoryId: s.categoryId,
    count: s._count.id,
    totalCapacity: s._sum.capacity || 0,
  }));
}
```

---

## 🔒 Seguridad

### Soft Delete

```typescript
async delete(id: string): Promise<void> {
  await this.prisma.resource.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
}
```

---

### Connection Pooling

```typescript
// En prisma/schema.prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")

  // Pool de conexiones
  connectionLimit = 10
}
```

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints](ENDPOINTS.md)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
