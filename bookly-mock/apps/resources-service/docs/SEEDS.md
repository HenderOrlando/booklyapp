# 🌱 Resources Service - Seeds

**Fecha**: Noviembre 23, 2025  
**Versión**: 2.0

---

## 📋 Índice

- [Descripción](#-descripción)
- [Ejecución de Seeds](#-ejecución-de-seeds)
- [Seeds Disponibles](#-seeds-disponibles)
- [Orden de Ejecución](#-orden-de-ejecución)
- [Seeds por Entorno](#-seeds-por-entorno)

---

## 📖 Descripción

Los seeds del Resources Service permiten poblar la base de datos con datos iniciales necesarios para la gestión de recursos físicos:

- **Categorías de recursos**: Salas, laboratorios, auditorios, equipos audiovisuales
- **Recursos con reglas de disponibilidad**: 4 recursos de ejemplo con configuraciones variadas
- **Mantenimientos**: Programados, en progreso, completados y cancelados

---

## 🚀 Ejecución de Seeds

### Comando Principal

```bash
# Ejecutar seed de Resources Service
npm run seed:resources

# Ejecutar con limpieza previa de la base de datos (destructivo)
npm run seed:resources -- --clean

# Ejecutar todos los seeds del monorepo
npm run seed:all
```

### Comportamiento por Entorno

- **Sin flag `--clean`**: El seed es **idempotente**. Usa `findOneAndUpdate` con `upsert: true` para actualizar registros existentes o crearlos si no existen. Seguro para producción.
- **Con flag `--clean`**: **Destructivo**. Limpia todas las colecciones antes de sembrar. Solo recomendado en desarrollo.

### Variables de Entorno

```bash
# Conexión a base de datos
DATABASE_URL="mongodb://localhost:27017/bookly-resources"

# Entorno (development, staging, production)
NODE_ENV=development
```

---

## 🌾 Seeds Disponibles

### 1. Categories Seed

**Descripción**: Crea las categorías base para clasificar recursos. Usa `findOneAndUpdate` con `upsert: true` para garantizar idempotencia.

**Entidades Afectadas**:

- `Category`

**Datos Creados**: 4 categorías

| Código           | Nombre                | Descripción                              | Tipo                       |
| ---------------- | --------------------- | ---------------------------------------- | -------------------------- |
| CAT-CONF-ROOMS   | Salas de Conferencia  | Salas para conferencias y presentaciones | CategoryType.RESOURCE_TYPE |
| CAT-LABS         | Laboratorios          | Laboratorios de computación y prácticas  | CategoryType.RESOURCE_TYPE |
| CAT-AUDITORIUMS  | Auditorios            | Auditorios para eventos masivos          | CategoryType.RESOURCE_TYPE |
| CAT-AV-EQUIPMENT | Equipos Audiovisuales | Proyectores, parlantes, micrófonos       | CategoryType.RESOURCE_TYPE |

**Implementación**:

```typescript
const categories = [
  {
    code: "CAT-CONF-ROOMS",
    name: "Salas de Conferencia",
    description: "Salas para conferencias y presentaciones",
    type: CategoryType.RESOURCE_TYPE,
    isActive: true,
    audit: {
      createdBy: "system",
      updatedBy: "system",
    },
  },
  // ... más categorías
];

// Idempotente: crea o actualiza
for (const cat of categories) {
  await categoryModel.findOneAndUpdate({ code: cat.code }, cat, {
    upsert: true,
    new: true,
  });
}
```

---

### 2. Resources Seed

**Descripción**: Crea recursos de ejemplo con reglas de disponibilidad configuradas. Usa `findOneAndUpdate` con `upsert: true` para garantizar idempotencia.

**Entidades Afectadas**:

- `Resource`

**Recursos Creados**: 4 recursos

| Código            | Nombre                    | Tipo                              | Capacidad | Ubicación                        |
| ----------------- | ------------------------- | --------------------------------- | --------- | -------------------------------- |
| RES-AUD-PRINCIPAL | Auditorio Principal       | ResourceType.AUDITORIUM           | 500       | Edificio Principal - Piso 1      |
| RES-LAB-SIS-1     | Laboratorio de Sistemas 1 | ResourceType.LABORATORY           | 30        | Edificio de Ingenierías - Piso 3 |
| RES-CONF-A        | Sala de Conferencias A    | ResourceType.MEETING_ROOM         | 20        | Edificio Principal - Piso 2      |
| RES-PROJ-PORT-1   | Proyector Portátil 1      | ResourceType.MULTIMEDIA_EQUIPMENT | 1         | Almacén de Equipos               |

**Implementación (ejemplo)**:

```typescript
const resources = [
  {
    code: "RES-AUD-PRINCIPAL",
    name: "Auditorio Principal",
    description: "Auditorio principal con capacidad para 500 personas",
    type: ResourceType.AUDITORIUM,
    categoryId: catMap.get("Auditorios"),
    capacity: 500,
    location: "Edificio Principal - Piso 1",
    floor: "1",
    building: "Edificio Principal",
    attributes: {
      features: ["Proyector", "Sistema de sonido", "Aire acondicionado"],
    },
    programIds: [],
    status: ResourceStatus.AVAILABLE,
    availabilityRules: {
      requiresApproval: true,
      maxAdvanceBookingDays: 90,
      minBookingDurationMinutes: 60,
      maxBookingDurationMinutes: 480,
      allowRecurring: true,
    },
    audit: {
      createdBy: "system",
      updatedBy: "system",
    },
  },
  // ... más recursos
];

// Idempotente: crea o actualiza
for (const res of resources) {
  await resourceModel.findOneAndUpdate({ code: res.code }, res, {
    upsert: true,
    new: true,
  });
}
```

### 3. Maintenances Seed

**Descripción**: Crea registros de mantenimiento en diferentes estados.

**Entidades Afectadas**:

- `Maintenance`

**Mantenimientos Creados**: 5 registros

| Título                                       | Tipo       | Estado      | Recurso              | Fecha          |
| -------------------------------------------- | ---------- | ----------- | -------------------- | -------------- |
| Mantenimiento preventivo anual del auditorio | PREVENTIVE | SCHEDULED   | Auditorio Principal  | Próximo mes    |
| Actualización de software del laboratorio    | CORRECTIVE | IN_PROGRESS | Lab Sistemas 1       | Ayer - Hoy     |
| Limpieza y calibración de equipos            | PREVENTIVE | COMPLETED   | Sala Conferencias A  | Mes pasado     |
| Actualización de firmware del proyector      | UPGRADE    | SCHEDULED   | Proyector Portátil 1 | Próxima semana |
| Inspección de seguridad cancelada            | INSPECTION | CANCELLED   | Auditorio Principal  | En 2 semanas   |

**Tipos de Mantenimiento**:

- `PREVENTIVE`: Mantenimiento preventivo programado
- `CORRECTIVE`: Corrección de problemas detectados
- `UPGRADE`: Actualizaciones y mejoras
- `INSPECTION`: Inspecciones rutinarias

**Estados**:

- `SCHEDULED`: Programado para el futuro
- `IN_PROGRESS`: En ejecución actualmente
- `COMPLETED`: Finalizado exitosamente
- `CANCELLED`: Cancelado o pospuesto

**Implementación**:

```typescript
const maintenances = [
  {
    resourceId: auditorio._id,
    type: MaintenanceType.PREVENTIVE,
    title: "Mantenimiento preventivo anual del auditorio",
    description:
      "Revisión completa del sistema de sonido, proyector y aire acondicionado",
    scheduledStartDate: nextMonth,
    scheduledEndDate: new Date(nextMonth.getTime() + 4 * 60 * 60 * 1000),
    status: MaintenanceStatus.SCHEDULED,
    performedBy: "Equipo de Mantenimiento",
    affectsAvailability: true,
    audit: {
      createdBy: "system",
    },
  },
  // ... más mantenimientos
];

// Idempotente: crea o actualiza
for (const maint of maintenances) {
  await maintenanceModel.findOneAndUpdate(
    {
      resourceId: maint.resourceId,
      title: maint.title,
    },
    maint,
    { upsert: true, new: true }
  );
}
```

---

## 🔄 Orden de Ejecución

Los seeds deben ejecutarse en el siguiente orden para respetar dependencias:

1. **Categorías** (sin dependencias)
   - Se crean primero las categorías de recursos
   - Retorna: Array de categorías insertadas con sus IDs

2. **Recursos** (depende de Categorías)
   - Asigna categoryId a cada recurso
   - Retorna: Array de recursos insertados con sus IDs

3. **Mantenimientos** (depende de Recursos)
   - Asigna resourceId a cada mantenimiento
   - Calcula fechas relativas (ayer, hoy, próxima semana, etc.)

**Archivo Principal** (`src/database/seed.ts`):

```typescript
async function seed() {
  try {
    logger.info("🌱 Iniciando seed de Resources Service...");

    const app = await NestFactory.createApplicationContext(ResourcesModule);

    // Obtener modelos usando Schemas (no Entidades)
    const resourceModel = app.get<Model<Resource>>(
      getModelToken(Resource.name)
    );
    const categoryModel = app.get<Model<Category>>(
      getModelToken(Category.name)
    );
    const maintenanceModel = app.get<Model<Maintenance>>(
      getModelToken(Maintenance.name)
    );

    // Limpiar solo con flag --clean (destructivo)
    if (process.argv.includes("--clean")) {
      logger.warn("🧹 LIMPIEZA DESTRUCTIVA ACTIVADA");
      await resourceModel.deleteMany({});
      await categoryModel.deleteMany({});
      await maintenanceModel.deleteMany({});
    } else if (process.env.NODE_ENV === "development") {
      logger.info("ℹ️ Modo desarrollo. Usar --clean para limpiar DB.");
    }

    // Ejecutar seeds en orden (idempotente con upsert)
    // 1. Categorías
    for (const cat of categories) {
      await categoryModel.findOneAndUpdate({ code: cat.code }, cat, {
        upsert: true,
        new: true,
      });
    }

    // 2. Recursos
    for (const res of resources) {
      await resourceModel.findOneAndUpdate({ code: res.code }, res, {
        upsert: true,
        new: true,
      });
    }

    // 3. Mantenimientos
    for (const maint of maintenances) {
      await maintenanceModel.findOneAndUpdate(
        { resourceId: maint.resourceId, title: maint.title },
        maint,
        { upsert: true, new: true }
      );
    }

    logger.info("✅ Seed completado exitosamente");
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error en seed:", error);
    process.exit(1);
  }
}
```

---

## 🌍 Seeds por Entorno

### Comportamiento Idempotente (Predeterminado)

Por defecto, los seeds son **idempotentes** y seguros para cualquier entorno:

```typescript
// Sin flag --clean, usa upsert para actualizar o crear
for (const cat of categories) {
  await categoryModel.findOneAndUpdate({ code: cat.code }, cat, {
    upsert: true,
    new: true,
  });
}
```

**Características**:

- ✅ Seguro ejecutar múltiples veces
- ✅ No pierde datos existentes
- ✅ Actualiza registros si hay cambios
- ✅ Crea nuevos registros si no existen
- ✅ Usa campos únicos (`code`) como identificadores

### Modo Limpieza (Con flag --clean)

Con el flag `--clean`, los seeds **limpian destructivamente** antes de insertar:

```bash
npm run seed:resources -- --clean
```

**Características**:

- ⚠️ **DESTRUCTIVO**: Elimina todos los datos
- ✅ Útil para resetear entorno de desarrollo
- ❌ **NO usar en producción**
- ✅ Recomendado solo para testing o desarrollo inicial

---

## 🧪 Testing con Seeds

### Setup para Tests

Los tests pueden usar los seeds para preparar datos:

```typescript
import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Category, Resource } from "../infrastructure/schemas";
import { CategoryType, ResourceType, ResourceStatus } from "@libs/common/enums";

describe("ResourceService", () => {
  let resourceModel: Model<Resource>;
  let categoryModel: Model<Category>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ResourcesModule],
    }).compile();

    // Usar Schemas (no Entidades) para getModelToken
    resourceModel = module.get(getModelToken(Resource.name));
    categoryModel = module.get(getModelToken(Category.name));

    // Ejecutar seeds de test con estructura correcta
    const category = await categoryModel.create({
      code: "CAT-TEST",
      name: "Test Category",
      description: "Categoría de prueba",
      type: CategoryType.RESOURCE_TYPE,
      isActive: true,
      audit: { createdBy: "test" },
    });

    await resourceModel.create({
      code: "RES-TEST-1",
      name: "Test Resource",
      description: "Recurso de prueba",
      categoryId: category._id,
      capacity: 10,
      type: ResourceType.CLASSROOM,
      location: "Test Location",
      status: ResourceStatus.AVAILABLE,
      isActive: true,
      audit: { createdBy: "test" },
    });
  });

  afterAll(async () => {
    await resourceModel.deleteMany({});
    await categoryModel.deleteMany({});
  });

  it("should find resources", async () => {
    const count = await resourceModel.countDocuments();
    expect(count).toBeGreaterThan(0);
  });
});
```

---

## 🔧 Utilidades

### Verificar Seeds Ejecutados

```typescript
import { Model } from "mongoose";
import { Resource, Category } from "../infrastructure/schemas";

export async function verifySeedsExecuted(
  resourceModel: Model<Resource>,
  categoryModel: Model<Category>
): Promise<boolean> {
  const categoryCount = await categoryModel.countDocuments();
  const resourceCount = await resourceModel.countDocuments();

  console.log(`Categorías: ${categoryCount}`);
  console.log(`Recursos: ${resourceCount}`);

  return categoryCount >= 4 && resourceCount >= 4;
}
```

### Actualizar Recursos

Si se agregan nuevos recursos al seed:

```bash
# 1. Agregar nuevos recursos en seed.ts con código único
# 2. Ejecutar seed (idempotente - solo agregará los nuevos)
npm run seed:resources

# 3. Para resetear completamente y recrear
npm run seed:resources -- --clean
```

---

## 📝 Configuración en package.json

```json
{
  "scripts": {
    "seed": "ts-node src/database/seed.ts",
    "seed:fresh": "npm run db:reset && npm run seed",
    "db:reset": "echo 'Cleaning database...' && npm run seed"
  }
}
```

---

## 📊 Resumen de Datos

### Categorías por Tipo

| Categoría             | Tipo          | Descripción               |
| --------------------- | ------------- | ------------------------- |
| Salas de Conferencia  | resource_type | Salas pequeñas y medianas |
| Laboratorios          | resource_type | Labs de computación       |
| Auditorios            | resource_type | Espacios masivos          |
| Equipos Audiovisuales | resource_type | Equipos portátiles        |

### Recursos por Tipo

| Tipo        | Cantidad | Requiere Aprobación | Programa      |
| ----------- | -------- | ------------------- | ------------- |
| Auditorio   | 1        | Sí                  | General       |
| Laboratorio | 1        | No                  | Ing. Sistemas |
| Sala        | 1        | No                  | General       |
| Equipo      | 1        | Sí                  | General       |

### Mantenimientos por Estado

| Estado      | Cantidad | Afecta Disponibilidad |
| ----------- | -------- | --------------------- |
| SCHEDULED   | 2        | 1 Sí, 1 No            |
| IN_PROGRESS | 1        | Sí                    |
| COMPLETED   | 1        | Sí (pasado)           |
| CANCELLED   | 1        | No (cancelado)        |

---

## ⚠️ Notas Importantes

1. **Idempotencia por Defecto**: Los seeds usan `findOneAndUpdate` con `upsert: true`, permitiendo ejecuciones múltiples sin errores
2. **Campos Únicos Requeridos**: Categorías usan `code`, Recursos usan `code`, Mantenimientos usan combinación `resourceId + title`
3. **Flag --clean**: Solo usar en desarrollo para limpieza destructiva completa de la base de datos
4. **Schemas vs Entidades**: El seed usa clases Schema (`Resource`, `Category`, `Maintenance`) para `getModelToken`, no entidades de dominio
5. **Estructura de Audit**: Usa objeto anidado `audit: { createdBy, updatedBy }` en lugar de campos planos
6. **Enums Tipados**: Usa `CategoryType.RESOURCE_TYPE`, `ResourceType.AUDITORIUM`, `MaintenanceType.PREVENTIVE`, etc.
7. **Fechas Relativas**: Mantenimientos usan fechas calculadas dinámicamente (ayer, hoy, próxima semana)

---

## 🔒 Seguridad

### Producción

En producción, **NUNCA** usar el flag `--clean`:

```bash
# ❌ NO HACER ESTO EN PRODUCCIÓN (destruye todos los datos)
npm run seed:resources -- --clean

# ✅ SEGURO - Idempotente (actualiza o crea sin destruir)
npm run seed:resources
```

### Validaciones de Schema

MongoDB valida automáticamente los datos según los schemas:

- **`code`**: Único, requerido, uppercase, trim
- **`type`**: Debe ser valor enum válido (`CategoryType`, `ResourceType`, `MaintenanceType`)
- **`categoryId`**: Debe ser ObjectId válido
- **`capacity`**: Número >= 1
- **`status`**: Debe ser valor enum válido (`ResourceStatus`, `MaintenanceStatus`)
- **`audit`**: Objeto con `createdBy` requerido

---

## 📚 Referencias

- [README del Resources Service](../README.md)
- [Schema de Category](../src/infrastructure/schemas/category.schema.ts)
- [Schema de Resource](../src/infrastructure/schemas/resource.schema.ts)
- [Schema de Maintenance](../src/infrastructure/schemas/maintenance.schema.ts)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 23, 2025
