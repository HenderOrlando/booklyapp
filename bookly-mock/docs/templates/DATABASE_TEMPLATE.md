# 🗄️ [Service Name] - Base de Datos

**Fecha**: [Fecha]  
**Versión**: 1.0

---

## 📋 Índice

- [Esquema de Datos](#esquema-de-datos)
- [Entidades Principales](#entidades-principales)
- [Relaciones](#relaciones)
- [Índices](#índices)
- [Migraciones](#migraciones)
- [Seeds](#seeds)
- [Optimizaciones](#optimizaciones)

---

## 📊 Esquema de Datos

### Vista General

El [Service Name] gestiona [N] colecciones principales en MongoDB:

1. **[collection1]** - [Descripción]
2. **[collection2]** - [Descripción]
3. **[collection3]** - [Descripción]

---

## 🔷 Entidades Principales

### 1. Entity1

```prisma
model Entity1 {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  field1      String
  field2      Int
  field3      Boolean  @default(true)

  // Relaciones
  relatedIds  String[] @db.ObjectId
  related     Entity2[] @relation(fields: [relatedIds], references: [id])

  // Metadatos
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("entity1_collection")
  @@index([field1])
  @@index([field2])
}
```

**Descripción**: [Descripción de la entidad]

**Campos principales**:

- `field1`: [Descripción]
- `field2`: [Descripción]
- `field3`: [Descripción]

---

### 2. Entity2

```prisma
model Entity2 {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?

  // Relaciones
  entity1Ids  String[] @db.ObjectId
  entity1s    Entity1[] @relation(fields: [entity1Ids], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("entity2_collection")
  @@index([name])
}
```

**Descripción**: [Descripción de la entidad]

---

## 🔗 Relaciones

### Diagrama de Relaciones

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│ Entity1  │ *───* │ Entity2  │ 1───* │ Entity3  │
└──────────┘       └──────────┘       └──────────┘
```

### Relación Many-to-Many: Entity1 ↔ Entity2

```typescript
// Asignar relación
await prisma.entity1.update({
  where: { id: entity1Id },
  data: {
    relatedIds: { push: entity2Id },
  },
});

// Obtener con relaciones
const entity = await prisma.entity1.findUnique({
  where: { id },
  include: { related: true },
});
```

---

## 🔍 Índices

### Índices Implementados

| Colección | Índice   | Tipo   | Uso                 |
| --------- | -------- | ------ | ------------------- |
| entity1   | field1_1 | Single | Búsqueda por field1 |
| entity1   | field2_1 | Single | Ordenamiento        |
| entity2   | name_1   | Unique | Búsqueda por nombre |

### Creación Manual de Índices

```javascript
// MongoDB shell
use bookly-[service];

// Índice compuesto
db.entity1.createIndex({ field1: 1, field2: -1 });

// Índice de texto
db.entity1.createIndex({
  field1: "text",
  field3: "text"
});
```

---

## 🔄 Migraciones

### Ejecutar Migraciones

```bash
# Generar migración
npx prisma migrate dev --name migration_name

# Aplicar en producción
npx prisma migrate deploy

# Ver estado
npx prisma migrate status
```

### Historial de Migraciones

| Fecha   | Migración | Descripción         |
| ------- | --------- | ------------------- |
| [Fecha] | init      | Esquema inicial     |
| [Fecha] | add_field | Agregar campo nuevo |

---

## 🌱 Seeds

### Ejecutar Seeds

```bash
npm run seed
```

### Datos Iniciales

#### 1. [Datos Tipo 1]

```typescript
const data1 = [
  { field1: "value1", field2: 10 },
  { field1: "value2", field2: 20 },
];
```

#### 2. [Datos Tipo 2]

```typescript
const data2 = [
  { name: "Item 1", description: "Desc 1" },
  { name: "Item 2", description: "Desc 2" },
];
```

---

## ⚡ Optimizaciones

### 1. Query Optimization

```typescript
// ❌ Trae todo
const entity = await prisma.entity1.findUnique({
  where: { id },
  include: { related: true },
});

// ✅ Solo campos necesarios
const entity = await prisma.entity1.findUnique({
  where: { id },
  select: {
    id: true,
    field1: true,
    related: {
      select: { id: true, name: true },
    },
  },
});
```

### 2. Connection Pooling

```typescript
// prisma/schema.prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
  connection_limit = 10
}
```

### 3. Bulk Operations

```typescript
// ✅ Bulk insert
await prisma.entity1.createMany({
  data: items,
  skipDuplicates: true,
});
```

---

## 📈 Estadísticas

### Tamaño Estimado

| Colección | Documentos | Tamaño Promedio | Total   |
| --------- | ---------- | --------------- | ------- |
| entity1   | [N]        | [size] bytes    | [total] |
| entity2   | [N]        | [size] bytes    | [total] |

---

## 🔒 Seguridad

### 1. Nunca Exponer Datos Sensibles

```typescript
// ✅ Excluir campos sensibles
const entity = await prisma.entity1.findUnique({
  where: { id },
  select: {
    id: true,
    field1: true,
    // NO incluir campos sensibles
  },
});
```

### 2. Validación de Inputs

```typescript
import { IsString, IsInt, Min } from "class-validator";

export class CreateDto {
  @IsString()
  field1: string;

  @IsInt()
  @Min(0)
  field2: number;
}
```

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints](ENDPOINTS.md)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: [Fecha]
