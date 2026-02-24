# 🌱 Availability Service - Seeds

**Fecha**: Noviembre 23, 2025  
**Versión**: 2.0 (Refactorizado para idempotencia)

---

## 📋 Índice

- [Descripción](#descripción)
- [Ejecución de Seeds](#ejecución-de-seeds)
- [Seeds Disponibles](#seeds-disponibles)
- [Orden de Ejecución](#orden-de-ejecución)
- [Seeds por Entorno](#seeds-por-entorno)

---

## 📖 Descripción

Los seeds del Availability Service permiten poblar la base de datos con datos iniciales necesarios para la gestión de disponibilidad y reservas:

- **Disponibilidades**: Horarios regulares de recursos por día de la semana
- **Reservas**: Reservas en diferentes estados (completadas, en curso, confirmadas, pendientes, canceladas)
- **Lista de Espera**: Solicitudes de usuarios en espera de disponibilidad
- **Reservas Recurrentes**: Reservas periódicas (semanales, mensuales)

---

## 🚀 Ejecución de Seeds

### Comando Principal

```bash
# Ejecutar seeds (idempotente por defecto)
npm run seed:availability

# Limpiar DB antes de seed (destructivo)
npm run seed:availability -- --clean

# Desde cualquier ubicación del monorepo
cd bookly-backend
npm run seed:availability
```

### ⚠️ Importante: Idempotencia

Los seeds ahora son **100% idempotentes**:

- Ejecutar múltiples veces **NO genera duplicados**
- Usa `findOneAndUpdate` con `upsert: true`
- Solo el flag `--clean` limpia la base de datos
- Seguro para desarrollo y producción

### Variables de Entorno

```bash
# Conexión a base de datos
DATABASE_URL="mongodb://localhost:27017/bookly-availability"

# Entorno (development, staging, production)
NODE_ENV=development
```

---

## 🌾 Seeds Disponibles

### 1. Availabilities Seed

**Descripción**: Crea horarios regulares de disponibilidad para recursos.

**Entidades Afectadas**:

- `Availability`

**Datos Creados**: 4 disponibilidades

| Recurso             | Día       | Horario       | Capacidad |
| ------------------- | --------- | ------------- | --------- |
| Auditorio Principal | Lunes     | 06:00 - 22:00 | 500       |
| Auditorio Principal | Martes    | 06:00 - 22:00 | 500       |
| Lab de Sistemas 1   | Lunes     | 06:00 - 18:00 | 30        |
| Sala Conferencias A | Miércoles | 08:00 - 20:00 | 20        |

**Estructura Actualizada (v2.0)**:

```typescript
{
  resourceId: Types.ObjectId,               // ObjectId fijo
  dayOfWeek: WeekDay.MONDAY,                // Enum correcto
  startTime: "06:00",
  endTime: "22:00",
  isAvailable: boolean,
  maxConcurrentReservations: number,
  audit: {
    createdBy: Types.ObjectId,
    updatedBy: Types.ObjectId
  }
}
```

**Cambios Clave v2.0**:

- ✅ Usa **Schemas** en lugar de Entities
- ✅ `resourceId` es `Types.ObjectId` fijo
- ✅ `dayOfWeek` usa enum `WeekDay`
- ✅ Estructura `audit` con ObjectIds
- ✅ Campo `isAvailable` en lugar de `isActive`
- ✅ Campo `maxConcurrentReservations` en lugar de `maxCapacity`
- ❌ Eliminado campo `resourceName` (no existe en schema)

**Implementación**:

```typescript
const availabilities = [
  {
    resourceId: "auditorio-principal",
    resourceName: "Auditorio Principal",
    dayOfWeek: "monday",
    startTime: "06:00",
    endTime: "22:00",
    isActive: true,
    maxCapacity: 500,
    createdBy: "system",
    updatedBy: "system",
  },
  // ... más disponibilidades
];

await availabilityModel.insertMany(availabilities);
```

---

### 2. Reservations Seed

**Descripción**: Crea reservas en diferentes estados para simular el ciclo completo.

**Entidades Afectadas**:

- `Reservation`

**Reservas Creadas**: 6 reservas

#### Estados de Reservas

| Estado          | Cantidad | Descripción                        |
| --------------- | -------- | ---------------------------------- |
| **completed**   | 1        | Reserva completada (semana pasada) |
| **in_progress** | 1        | Reserva en curso (hoy)             |
| **confirmed**   | 2        | Reservas confirmadas (futuras)     |
| **pending**     | 1        | Pendiente de aprobación            |
| **cancelled**   | 1        | Cancelada por emergencia           |

---

#### Reserva 1: Completada (Pasada)

- **Recurso**: Auditorio Principal
- **Usuario**: docente@ufps.edu.co
- **Fecha**: Semana pasada, 10:00 - 12:00
- **Propósito**: Conferencia sobre Inteligencia Artificial
- **Estado**: completed
- **Asistentes**: 150
- **Requiere Aprobación**: Sí
- **Aprobación**: approved por admin@ufps.edu.co
- **Check-in**: 09:55 (5 min antes)
- **Check-out**: 12:10 (10 min después)

```typescript
{
  resourceId: "auditorio-principal",
  resourceName: "Auditorio Principal",
  userId: "docente@ufps.edu.co",
  userName: "Juan Docente",
  startDateTime: lastWeek 10:00,
  endDateTime: lastWeek 12:00,
  purpose: "Conferencia sobre Inteligencia Artificial",
  status: "completed",
  attendees: 150,
  program: "Ingeniería de Sistemas",
  requiresApproval: true,
  approvalStatus: "approved",
  approvedBy: "admin@ufps.edu.co",
  checkInTime: 09:55,
  checkOutTime: 12:10,
}
```

---

#### Reserva 2: En Progreso (Hoy)

- **Recurso**: Lab de Sistemas 1
- **Usuario**: docente@ufps.edu.co
- **Fecha**: Hoy, 14:00 - 16:00
- **Propósito**: Práctica de Programación
- **Estado**: in_progress
- **Asistentes**: 25
- **Requiere Aprobación**: No (auto-aprobada)
- **Check-in**: 13:58 (2 min antes)

```typescript
{
  resourceId: "laboratorio-sistemas-1",
  resourceName: "Laboratorio de Sistemas 1",
  userId: "docente@ufps.edu.co",
  startDateTime: today 14:00,
  endDateTime: today 16:00,
  purpose: "Práctica de Programación",
  status: "in_progress",
  attendees: 25,
  requiresApproval: false,
  approvalStatus: "auto_approved",
  checkInTime: 13:58,
}
```

---

#### Reserva 3: Confirmada (Mañana)

- **Recurso**: Sala Conferencias A
- **Usuario**: admin.sistemas@ufps.edu.co
- **Fecha**: Mañana, 09:00 - 11:00
- **Propósito**: Reunión de Coordinación
- **Estado**: confirmed
- **Asistentes**: 15
- **Requiere Aprobación**: No

---

#### Reserva 4: Pendiente de Aprobación

- **Recurso**: Auditorio Principal
- **Usuario**: estudiante@ufps.edu.co
- **Fecha**: Próxima semana, 16:00 - 18:00
- **Propósito**: Evento Estudiantil
- **Estado**: pending
- **Asistentes**: 200
- **Requiere Aprobación**: Sí
- **Aprobación**: Pendiente

```typescript
{
  resourceId: "auditorio-principal",
  userId: "estudiante@ufps.edu.co",
  startDateTime: nextWeek 16:00,
  endDateTime: nextWeek 18:00,
  purpose: "Evento Estudiantil",
  status: "pending",
  attendees: 200,
  requiresApproval: true,
  approvalStatus: "pending",
}
```

---

#### Reserva 5: Cancelada

- **Recurso**: Sala Conferencias A
- **Usuario**: docente@ufps.edu.co
- **Fecha**: Ayer, 15:00 - 17:00
- **Propósito**: Tutoría Grupal
- **Estado**: cancelled
- **Razón**: El docente tuvo una emergencia médica
- **Cancelada**: Ayer a las 14:30

```typescript
{
  resourceId: "sala-conferencias-a",
  userId: "docente@ufps.edu.co",
  startDateTime: yesterday 15:00,
  endDateTime: yesterday 17:00,
  purpose: "Tutoría Grupal",
  status: "cancelled",
  cancellationReason: "El docente tuvo una emergencia médica",
  cancelledAt: yesterday 14:30,
}
```

---

#### Reserva 6: Periódica (Recurrente)

- **Recurso**: Lab de Sistemas 1
- **Usuario**: docente@ufps.edu.co
- **Fecha Inicial**: Próxima semana, 10:00 - 12:00
- **Propósito**: Clase de Algoritmos (Semanal)
- **Estado**: confirmed
- **Patrón**: Semanal (todos los martes)
- **Días**: [tuesday]
- **Fecha Fin**: Dentro de 3 meses

```typescript
{
  resourceId: "laboratorio-sistemas-1",
  userId: "docente@ufps.edu.co",
  startDateTime: nextWeek 10:00,
  endDateTime: nextWeek 12:00,
  purpose: "Clase de Algoritmos (Semanal)",
  status: "confirmed",
  isRecurring: true,
  recurrencePattern: "weekly",
  recurrenceDays: ["tuesday"],
  recurrenceEndDate: nextWeek + 3 months,
}
```

---

### 3. Waiting List Seed

**Descripción**: Crea solicitudes en lista de espera cuando los recursos están ocupados.

**Entidades Afectadas**:

- `WaitingList`

**Registros Creados**: 2 solicitudes

#### Solicitud 1: Normal

- **Recurso**: Auditorio Principal
- **Usuario**: estudiante@ufps.edu.co (María Estudiante)
- **Fecha Solicitada**: Mañana, 16:00
- **Duración**: 120 minutos (2 horas)
- **Propósito**: Evento Cultural
- **Estado**: waiting
- **Posición**: 1
- **Prioridad**: normal
- **Notificar**: Sí

#### Solicitud 2: Alta Prioridad

- **Recurso**: Auditorio Principal
- **Usuario**: staff@ufps.edu.co (Ana Staff)
- **Fecha Solicitada**: Mañana, 18:00
- **Duración**: 90 minutos (1.5 horas)
- **Propósito**: Capacitación Administrativa
- **Estado**: waiting
- **Posición**: 2
- **Prioridad**: high
- **Notificar**: Sí

**Implementación**:

```typescript
const waitList = [
  {
    resourceId: "auditorio-principal",
    resourceName: "Auditorio Principal",
    userId: "estudiante@ufps.edu.co",
    userName: "María Estudiante",
    requestedDateTime: tomorrow 16:00,
    duration: 120, // minutos
    purpose: "Evento Cultural",
    status: "waiting",
    position: 1,
    priority: "normal",
    notifyWhenAvailable: true,
  },
  {
    resourceId: "auditorio-principal",
    userId: "staff@ufps.edu.co",
    userName: "Ana Staff",
    requestedDateTime: tomorrow 18:00,
    duration: 90,
    purpose: "Capacitación Administrativa",
    status: "waiting",
    position: 2,
    priority: "high",
    notifyWhenAvailable: true,
  },
];

await waitingListModel.insertMany(waitList);
```

---

## 🔄 Orden de Ejecución

Los seeds se ejecutan en el siguiente orden:

1. **Disponibilidades** (sin dependencias)
   - Se crean primero los horarios base
   - Define cuándo están disponibles los recursos

2. **Reservas** (depende de Disponibilidades)
   - Crea reservas en diferentes estados
   - Usa fechas relativas (ayer, hoy, mañana, próxima semana)

3. **Lista de Espera** (depende de Reservas)
   - Simula solicitudes cuando recursos están ocupados
   - Incluye posición y prioridad

**Archivo Principal** (`src/database/seed.ts`):

```typescript
async function seed() {
  try {
    logger.info("🌱 Iniciando seed de Availability Service...");

    const app = await NestFactory.createApplicationContext(AvailabilityModule);

    // Obtener modelos
    const reservationModel = app.get<Model<ReservationEntity>>(
      getModelToken(ReservationEntity.name)
    );
    const availabilityModel = app.get<Model<AvailabilityEntity>>(
      getModelToken(AvailabilityEntity.name)
    );
    const waitingListModel = app.get<Model<WaitingListEntity>>(
      getModelToken(WaitingListEntity.name)
    );

    // Limpiar (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      await reservationModel.deleteMany({});
      await availabilityModel.deleteMany({});
      await waitingListModel.deleteMany({});
    }

    // Ejecutar seeds en orden
    await availabilityModel.insertMany(availabilities);
    await reservationModel.insertMany(reservations);
    await waitingListModel.insertMany(waitList);

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

### Development

En desarrollo, los seeds **limpian** la base de datos antes de insertar:

```typescript
if (process.env.NODE_ENV === "development") {
  logger.info("Limpiando datos existentes...");
  await reservationModel.deleteMany({});
  await availabilityModel.deleteMany({});
  await waitingListModel.deleteMany({});
}
```

- ✅ Limpia datos existentes
- ✅ Crea 4 disponibilidades base
- ✅ Crea 6 reservas en diferentes estados
- ✅ Crea 2 solicitudes en lista de espera

### Production

En producción, los seeds **no limpian** datos existentes:

- ❌ No limpia datos
- ✅ Solo inserta disponibilidades si no existen
- ⚠️ No ejecutar reservas de ejemplo en producción
- ⚠️ No ejecutar lista de espera de ejemplo en producción

---

## 🧪 Testing con Seeds

### Setup para Tests

Los tests pueden usar los seeds para preparar datos:

```typescript
import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";

describe("ReservationService", () => {
  let reservationModel: Model<ReservationEntity>;
  let availabilityModel: Model<AvailabilityEntity>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AvailabilityModule],
    }).compile();

    reservationModel = module.get(getModelToken(ReservationEntity.name));
    availabilityModel = module.get(getModelToken(AvailabilityEntity.name));

    // Seed de disponibilidad
    await availabilityModel.create({
      resourceId: "test-resource",
      resourceName: "Test Resource",
      dayOfWeek: "monday",
      startTime: "08:00",
      endTime: "18:00",
      isActive: true,
      maxCapacity: 10,
    });

    // Seed de reserva
    await reservationModel.create({
      resourceId: "test-resource",
      userId: "test@user.com",
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 3600000),
      status: "confirmed",
    });
  });

  afterAll(async () => {
    await reservationModel.deleteMany({});
    await availabilityModel.deleteMany({});
  });

  it("should find reservations", async () => {
    const count = await reservationModel.countDocuments();
    expect(count).toBeGreaterThan(0);
  });
});
```

---

## 🔧 Utilidades

### Verificar Seeds Ejecutados

```typescript
export async function verifySeedsExecuted(
  reservationModel: Model<ReservationEntity>,
  availabilityModel: Model<AvailabilityEntity>
): Promise<boolean> {
  const availabilityCount = await availabilityModel.countDocuments();
  const reservationCount = await reservationModel.countDocuments();

  console.log(`Disponibilidades: ${availabilityCount}`);
  console.log(`Reservas: ${reservationCount}`);

  return availabilityCount > 0 && reservationCount > 0;
}
```

### Limpiar Reservas Pasadas

```typescript
export async function cleanOldReservations(
  reservationModel: Model<ReservationEntity>
): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await reservationModel.deleteMany({
    endDateTime: { $lt: thirtyDaysAgo },
    status: { $in: ["completed", "cancelled"] },
  });

  return result.deletedCount;
}
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

### Disponibilidades por Recurso

| Recurso             | Días Disponibles | Horario Total |
| ------------------- | ---------------- | ------------- |
| Auditorio Principal | Lunes, Martes    | 16 horas/día  |
| Lab Sistemas 1      | Lunes            | 12 horas      |
| Sala Conferencias A | Miércoles        | 12 horas      |

### Reservas por Estado

| Estado      | Cantidad | Período  | Requiere Aprobación    |
| ----------- | -------- | -------- | ---------------------- |
| completed   | 1        | Pasado   | Sí (aprobada)          |
| in_progress | 1        | Presente | No (auto)              |
| confirmed   | 2        | Futuro   | No (auto) + Recurrente |
| pending     | 1        | Futuro   | Sí (pendiente)         |
| cancelled   | 1        | Pasado   | No (cancelada)         |

### Lista de Espera

| Prioridad | Cantidad | Notificación |
| --------- | -------- | ------------ |
| normal    | 1        | Sí           |
| high      | 1        | Sí           |

---

## ⚠️ Notas Importantes

1. **Fechas Relativas**: Los seeds usan fechas relativas (ayer, hoy, mañana) para simular escenarios reales
2. **Check-in/Check-out**: Las reservas completadas incluyen tiempos de entrada/salida
3. **Aprobaciones**: Simula flujo completo con auto-aprobación y aprobación manual
4. **Recurrencia**: Incluye ejemplo de reserva periódica semanal
5. **Lista de Espera**: Simula posición FIFO con prioridades
6. **Idempotencia**: Los seeds pueden ejecutarse múltiples veces sin errores
7. **Limpieza**: Solo limpia en `NODE_ENV=development`

---

## 🔒 Seguridad

### Producción

En producción, **NUNCA** ejecutar seeds con limpieza de datos:

```bash
# ❌ NO HACER ESTO EN PRODUCCIÓN
NODE_ENV=development npm run seed

# ✅ Hacer esto
NODE_ENV=production npm run seed
```

### Validaciones

Las reservas se crean con validaciones de integridad:

- `resourceId` debe existir
- `startDateTime` < `endDateTime`
- `status` debe ser un valor enum válido
- `approvalStatus` coherente con `requiresApproval`
- Fechas no pueden estar en el pasado (excepto para testing)

---

## 📚 Referencias

- [Base de Datos](DATABASE.md)
- [Arquitectura](ARCHITECTURE.md)
- [RF-07: Configurar Disponibilidad](requirements/RF-07_CONFIGURAR_DISPONIBILIDAD.md)
- [RF-12: Reservas Periódicas](requirements/RF-12_RESERVAS_PERIODICAS.md)
- [RF-14: Lista de Espera](requirements/RF-14_LISTA_ESPERA.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
