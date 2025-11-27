# 🌱 [Service Name] - Seeds

**Fecha**: [Fecha]  
**Versión**: 1.0

---

## 📋 Índice

- [Descripción](#descripción)
- [Ejecución de Seeds](#ejecución-de-seeds)
- [Seeds Disponibles](#seeds-disponibles)
- [Orden de Ejecución](#orden-de-ejecución)
- [Seeds por Entorno](#seeds-por-entorno)

---

## 📖 Descripción

Los seeds permiten poblar la base de datos con datos iniciales necesarios para el funcionamiento del servicio o para desarrollo/testing.

---

## 🚀 Ejecución de Seeds

### Comando Principal

```bash
# Ejecutar todos los seeds
npm run seed

# Ejecutar seed específico
npm run seed:specific [seed-name]

# Limpiar y re-seed
npm run seed:fresh
```

### Variables de Entorno

```bash
# Conexión a base de datos
DATABASE_URL="mongodb://localhost:27017/bookly-[service]"

# Entorno (development, staging, production)
NODE_ENV=development
```

---

## 🌾 Seeds Disponibles

### 1. [Seed Name 1] - `seed-1.ts`

**Descripción**: [Descripción de los datos que crea]

**Entidades Afectadas**:

- `Entity1`
- `Entity2`

**Datos Creados**:

```typescript
const data1 = [
  {
    id: "predefined-id-1",
    field1: "value1",
    field2: 100,
    field3: true,
  },
  {
    id: "predefined-id-2",
    field1: "value2",
    field2: 200,
    field3: false,
  },
];
```

**Ejemplo de Implementación**:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedEntity1() {
  console.log("Seeding Entity1...");

  const data = [
    { field1: "value1", field2: 100, field3: true },
    { field1: "value2", field2: 200, field3: false },
  ];

  await prisma.entity1.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Created ${data.length} Entity1 records`);
}
```

---

### 2. [Seed Name 2] - `seed-2.ts`

**Descripción**: [Descripción]

**Entidades Afectadas**:

- `Entity3`

**Datos Creados**:

```typescript
const entity3Data = [
  { name: "Item 1", description: "Description 1" },
  { name: "Item 2", description: "Description 2" },
];
```

---

### 3. [Seed Name 3] - Relaciones

**Descripción**: Crea relaciones entre entidades seedeadas.

**Ejemplo**:

```typescript
export async function seedRelations() {
  console.log("Seeding relations...");

  // Obtener IDs de entidades existentes
  const entity1 = await prisma.entity1.findFirst({
    where: { field1: "value1" },
  });
  const entity2 = await prisma.entity2.findFirst({
    where: { name: "Item 1" },
  });

  // Crear relación
  await prisma.entity1.update({
    where: { id: entity1.id },
    data: {
      relatedIds: { push: entity2.id },
    },
  });

  console.log("Relations seeded successfully");
}
```

---

## 🔄 Orden de Ejecución

Los seeds deben ejecutarse en el siguiente orden para respetar dependencias:

1. **Entidades Base** (sin relaciones)
   - `seed-entity1.ts`
   - `seed-entity2.ts`

2. **Entidades Dependientes**
   - `seed-entity3.ts`

3. **Relaciones**
   - `seed-relations.ts`

**Archivo Principal** (`prisma/seed.ts`):

```typescript
import { PrismaClient } from "@prisma/client";
import { seedEntity1 } from "./seeds/seed-entity1";
import { seedEntity2 } from "./seeds/seed-entity2";
import { seedRelations } from "./seeds/seed-relations";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed process...");

  // Orden de ejecución
  await seedEntity1();
  await seedEntity2();
  await seedRelations();

  console.log("✅ Seed process completed!");
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 🌍 Seeds por Entorno

### Development

```typescript
if (process.env.NODE_ENV === "development") {
  // Datos de prueba adicionales
  await seedTestData();
}
```

### Production

```typescript
if (process.env.NODE_ENV === "production") {
  // Solo datos esenciales
  await seedEssentialData();
}
```

---

## 🧪 Testing con Seeds

### Setup para Tests

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  // Limpiar base de datos de test
  await prisma.$executeRaw`DELETE FROM entity1`;
  await prisma.$executeRaw`DELETE FROM entity2`;

  // Ejecutar seeds de test
  await seedEntity1();
  await seedEntity2();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

---

## 🔧 Utilidades

### Limpiar Base de Datos

```typescript
export async function cleanDatabase() {
  console.log("🧹 Cleaning database...");

  await prisma.entity3.deleteMany({});
  await prisma.entity2.deleteMany({});
  await prisma.entity1.deleteMany({});

  console.log("✅ Database cleaned");
}
```

### Verificar Seeds

```typescript
export async function verifySeedsexecuted() {
  const entity1Count = await prisma.entity1.count();
  const entity2Count = await prisma.entity2.count();

  console.log(`Entity1: ${entity1Count} records`);
  console.log(`Entity2: ${entity2Count} records`);

  return entity1Count > 0 && entity2Count > 0;
}
```

---

## 📝 Configuración en package.json

```json
{
  "scripts": {
    "seed": "ts-node prisma/seed.ts",
    "seed:specific": "ts-node prisma/seeds/$npm_config_name.ts",
    "seed:fresh": "npm run db:reset && npm run seed",
    "db:reset": "npx prisma migrate reset --force --skip-seed"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## ⚠️ Notas Importantes

1. **Idempotencia**: Los seeds deben poder ejecutarse múltiples veces sin errores
2. **IDs Predefinidos**: Usar IDs conocidos para datos de sistema
3. **Skip Duplicates**: Usar `skipDuplicates: true` en `createMany`
4. **Transacciones**: Usar transacciones para seeds complejos
5. **Logging**: Registrar progreso claramente

---

## 📚 Referencias

- [Base de Datos](DATABASE.md)
- [Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: [Fecha]
