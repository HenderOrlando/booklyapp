# 🏗️ Availability Service - Arquitectura

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Arquitectura por Capas](#arquitectura-por-capas)
- [Patrones Implementados](#patrones-implementados)
- [Event-Driven Architecture](#event-driven-architecture)
- [Algoritmos de Reserva](#algoritmos-de-reserva)
- [Gestión de Estado](#gestión-de-estado)

---

## 🎯 Visión General

El **Availability Service** gestiona toda la lógica de disponibilidad de recursos, horarios, reservas y reasignaciones automáticas.

### Responsabilidades

- **Disponibilidad**: Consultar horarios disponibles de recursos
- **Reservas**: Crear, modificar, cancelar reservas
- **Conflictos**: Detectar y resolver conflictos de horarios
- **Reasignaciones**: Sugerir recursos alternativos
- **Calendarios**: Sincronizar con Google Calendar, Outlook
- **Listas de Espera**: Gestionar solicitudes pendientes
- **Reservas Periódicas**: Manejar reservas recurrentes

---

## 🏛️ Arquitectura por Capas

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                        │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │  Availability  │  │   Reservation  │  │ Reassignment  │  │
│  │   Controller   │  │   Controller   │  │  Controller   │  │
│  └────────────────┘  └────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌─────────────────────┐        ┌──────────────────┐        │
│  │  Command Bus        │        │    Query Bus     │        │
│  │                     │        │                  │        │
│  │ • CreateReservation │        │ • GetAvailability│        │
│  │ • CancelReservation │        │ • SearchSlots    │        │
│  │ • ModifyReservation │        │ • GetReservations│        │
│  └─────────────────────┘        └──────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Reservation  │  │ Availability │  │ TimeSlot     │       │
│  │   Entity     │  │   Entity     │  │   Entity     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Services                            │   │
│  │  • ReservationService                                │   │
│  │  • AvailabilityService                               │   │
│  │  • ReassignmentService                               │   │
│  │  • ConflictResolutionService                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Prisma Repositories                     │   │
│  │  • PrismaReservationRepository                       │   │
│  │  • PrismaAvailabilityRepository                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           External Service Clients                   │   │
│  │  • ResourceServiceClient                             │   │
│  │  • CalendarIntegrationClient                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Patrones Implementados

### 1. CQRS + Event Sourcing

```typescript
// Command
export class CreateReservationCommand {
  constructor(
    public readonly dto: CreateReservationDto,
    public readonly userId: string
  ) {}
}

// Handler
@CommandHandler(CreateReservationCommand)
export class CreateReservationHandler {
  async execute(command: CreateReservationCommand): Promise<Reservation> {
    // 1. Validar disponibilidad
    const isAvailable = await this.availabilityService.checkAvailability(
      command.dto.resourceId,
      command.dto.startDate,
      command.dto.endDate
    );

    if (!isAvailable) {
      throw new ConflictException("Time slot not available");
    }

    // 2. Crear reserva
    const reservation = await this.reservationService.create(command.dto);

    // 3. Publicar evento
    await this.eventBus.publish("availability.reservation.created", {
      reservationId: reservation.id,
      resourceId: reservation.resourceId,
      userId: command.userId,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
    });

    return reservation;
  }
}
```

---

### 2. Strategy Pattern - Conflict Resolution

```typescript
interface ConflictResolutionStrategy {
  resolve(conflicts: Conflict[]): Resolution;
}

export class AutoReassignStrategy implements ConflictResolutionStrategy {
  resolve(conflicts: Conflict[]): Resolution {
    // Buscar recursos equivalentes disponibles
    return {
      action: "reassign",
      targetResource: this.findAlternative(conflicts[0].resource),
    };
  }
}

export class WaitlistStrategy implements ConflictResolutionStrategy {
  resolve(conflicts: Conflict[]): Resolution {
    // Agregar a lista de espera
    return {
      action: "waitlist",
      priority: this.calculatePriority(conflicts[0].reservation),
    };
  }
}

export class ConflictResolutionService {
  constructor(private strategies: Map<string, ConflictResolutionStrategy>) {}

  resolve(conflict: Conflict, policy: string): Resolution {
    const strategy = this.strategies.get(policy);
    return strategy.resolve([conflict]);
  }
}
```

---

### 3. Specification Pattern - Availability Rules

```typescript
export class AvailabilitySpecification {
  static isAvailable(
    resource: Resource,
    startDate: Date,
    endDate: Date
  ): boolean {
    // Verificar horario
    if (!this.isWithinBusinessHours(resource, startDate, endDate)) {
      return false;
    }

    // Verificar mantenimiento
    if (this.isUnderMaintenance(resource, startDate, endDate)) {
      return false;
    }

    // Verificar reservas existentes
    if (this.hasOverlappingReservations(resource, startDate, endDate)) {
      return false;
    }

    return true;
  }

  private static isWithinBusinessHours(
    resource: Resource,
    start: Date,
    end: Date
  ): boolean {
    const dayOfWeek = start.getDay();
    const rules = resource.availabilityRules[dayOfWeek];

    return (
      rules.isAvailable &&
      start.getHours() >= rules.startHour &&
      end.getHours() <= rules.endHour
    );
  }
}
```

---

## 🔄 Event-Driven Architecture

### Eventos Publicados

```typescript
// ReservationCreatedEvent
{
  eventId: "uuid",
  timestamp: Date,
  data: {
    reservationId: string,
    resourceId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
    purpose: string
  }
}

// ReservationCancelledEvent
{
  eventId: "uuid",
  timestamp: Date,
  data: {
    reservationId: string,
    cancelledBy: string,
    reason: string
  }
}

// ResourceBecameAvailableEvent
{
  eventId: "uuid",
  timestamp: Date,
  data: {
    resourceId: string,
    availableSlot: {
      startDate: Date,
      endDate: Date
    }
  }
}
```

### Eventos Consumidos

- `resources.resource.created` → Crear disponibilidad inicial
- `resources.resource.updated` → Actualizar horarios
- `resources.maintenance.scheduled` → Bloquear horarios

---

## 🧮 Algoritmos de Reserva

### Algoritmo de Búsqueda de Slots Disponibles

```typescript
async findAvailableSlots(
  resourceId: string,
  startDate: Date,
  endDate: Date,
  duration: number
): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = [];

  // 1. Obtener reservas existentes
  const reservations = await this.reservationRepository.findByDateRange(
    resourceId,
    startDate,
    endDate
  );

  // 2. Obtener reglas de disponibilidad
  const rules = await this.getAvailabilityRules(resourceId);

  // 3. Generar slots candidatos
  let currentTime = startDate;
  while (currentTime < endDate) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);

    // Verificar disponibilidad
    if (this.isSlotAvailable(currentTime, slotEnd, reservations, rules)) {
      slots.push({
        startTime: currentTime,
        endTime: slotEnd,
      });
    }

    // Avanzar al siguiente slot
    currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30 min
  }

  return slots;
}
```

---

### Algoritmo de Reasignación Automática

```typescript
async findEquivalentResources(
  originalResource: string,
  startDate: Date,
  endDate: Date
): Promise<Resource[]> {
  // 1. Obtener características del recurso original
  const original = await this.resourceClient.getById(originalResource);

  // 2. Buscar recursos similares
  const candidates = await this.resourceClient.search({
    type: original.type,
    capacity: { min: original.capacity * 0.9, max: original.capacity * 1.2 },
    attributes: original.attributes,
  });

  // 3. Filtrar por disponibilidad
  const available = [];
  for (const candidate of candidates) {
    const isAvailable = await this.checkAvailability(
      candidate.id,
      startDate,
      endDate
    );
    if (isAvailable) {
      available.push(candidate);
    }
  }

  // 4. Ordenar por score de similitud
  return this.sortBySimilarity(original, available);
}
```

---

## 💾 Gestión de Estado

### Cache de Disponibilidad

```typescript
@Injectable()
export class AvailabilityCacheService {
  constructor(private readonly redis: RedisService) {}

  private readonly CACHE_TTL = 300; // 5 minutos
  private readonly PREFIX = "availability:";

  async getAvailability(
    resourceId: string,
    date: string
  ): Promise<AvailabilityStatus | null> {
    const key = `${this.PREFIX}${resourceId}:${date}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setAvailability(
    resourceId: string,
    date: string,
    status: AvailabilityStatus
  ): Promise<void> {
    const key = `${this.PREFIX}${resourceId}:${date}`;
    await this.redis.set(key, JSON.stringify(status), this.CACHE_TTL);
  }

  async invalidateResource(resourceId: string): Promise<void> {
    const pattern = `${this.PREFIX}${resourceId}:*`;
    const keys = await this.redis.keys(pattern);
    await Promise.all(keys.map((k) => this.redis.del(k)));
  }
}
```

---

### Locks Distribuidos para Reservas

```typescript
async createReservationWithLock(dto: CreateReservationDto): Promise<Reservation> {
  const lockKey = `lock:reservation:${dto.resourceId}:${dto.startDate.toISOString()}`;
  const lockValue = uuid();

  try {
    // Adquirir lock (expira en 30 segundos)
    const acquired = await this.redis.set(lockKey, lockValue, {
      NX: true,
      EX: 30,
    });

    if (!acquired) {
      throw new ConflictException("Resource is being reserved by another user");
    }

    // Crear reserva
    const reservation = await this.reservationRepository.create(dto);

    return reservation;
  } finally {
    // Liberar lock
    const current = await this.redis.get(lockKey);
    if (current === lockValue) {
      await this.redis.del(lockKey);
    }
  }
}
```

---

## 📚 Referencias

- [Base de Datos](DATABASE.md)
- [Endpoints](ENDPOINTS.md)
- [Event Bus](EVENT_BUS.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
