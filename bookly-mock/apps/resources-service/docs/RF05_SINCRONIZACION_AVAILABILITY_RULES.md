# RF-05: Sincronización de Reglas de Disponibilidad

**Fecha de Implementación**: 2025-11-04  
**Estado**: ✅ COMPLETO

---

## 🎯 Objetivo

Establecer un sistema de sincronización entre `resources-service` y `availability-service` para que las reglas de disponibilidad definidas en los recursos sean utilizadas automáticamente al gestionar reservas.

---

## 🏗️ Arquitectura de Sincronización

### Modelo de Datos

**ResourceEntity** (resources-service) contiene:

```typescript
availabilityRules: {
  requiresApproval: boolean;
  maxAdvanceBookingDays: number;
  minBookingDurationMinutes: number;
  maxBookingDurationMinutes: number;
  allowRecurring: boolean;
  customRules?: {
    businessHoursOnly: boolean;
    weekdaysOnly: boolean;
    maxConcurrentBookings: number;
  };
}
```

---

## 📡 Estrategias de Sincronización

### 1. Pull-Based (Consulta Directa) ✅ RECOMENDADO

El `availability-service` consulta las reglas al momento de crear/validar reservas.

#### Endpoint en resources-service

```typescript
GET /api/v1/resources/:id/availability-rules
Response: {
  "success": true,
  "data": {
    "resourceId": "res_123",
    "requiresApproval": true,
    "maxAdvanceBookingDays": 90,
    "minBookingDurationMinutes": 60,
    "maxBookingDurationMinutes": 480,
    "allowRecurring": true,
    "customRules": {
      "businessHoursOnly": true,
      "weekdaysOnly": false,
      "maxConcurrentBookings": 1
    }
  }
}
```

#### Implementación en availability-service

```typescript
// availability-service/src/application/services/booking-validation.service.ts

@Injectable()
export class BookingValidationService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async validateBookingRules(
    resourceId: string,
    bookingData: CreateBookingDto
  ): Promise<ValidationResult> {
    // 1. Obtener reglas (con cache)
    const rules = await this.getResourceRules(resourceId);

    // 2. Validar según reglas
    const errors = [];

    if (rules.requiresApproval && !bookingData.hasApproval) {
      errors.push("Este recurso requiere aprobación previa");
    }

    const advanceDays = this.calculateDaysBetween(
      new Date(),
      bookingData.startDate
    );
    if (advanceDays > rules.maxAdvanceBookingDays) {
      errors.push(
        `No se puede reservar con más de ${rules.maxAdvanceBookingDays} días de anticipación`
      );
    }

    const durationMinutes = this.calculateDurationMinutes(
      bookingData.startDate,
      bookingData.endDate
    );
    if (durationMinutes < rules.minBookingDurationMinutes) {
      errors.push(
        `La duración mínima de reserva es ${rules.minBookingDurationMinutes} minutos`
      );
    }
    if (durationMinutes > rules.maxBookingDurationMinutes) {
      errors.push(
        `La duración máxima de reserva es ${rules.maxBookingDurationMinutes} minutos`
      );
    }

    if (!rules.allowRecurring && bookingData.isRecurring) {
      errors.push("Este recurso no permite reservas recurrentes");
    }

    // Validaciones custom
    if (rules.customRules?.businessHoursOnly) {
      if (
        !this.isWithinBusinessHours(bookingData.startDate, bookingData.endDate)
      ) {
        errors.push(
          "Solo se permiten reservas en horario laboral (8:00 - 18:00)"
        );
      }
    }

    if (rules.customRules?.weekdaysOnly) {
      if (this.isWeekend(bookingData.startDate)) {
        errors.push("Solo se permiten reservas en días hábiles");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async getResourceRules(
    resourceId: string
  ): Promise<AvailabilityRules> {
    // Intentar obtener del cache (TTL: 1 hora)
    const cacheKey = `resource_rules:${resourceId}`;
    const cached = await this.cacheManager.get<AvailabilityRules>(cacheKey);

    if (cached) {
      return cached;
    }

    // Consultar resources-service
    const response = await this.httpService
      .get(
        `${process.env.RESOURCES_SERVICE_URL}/api/v1/resources/${resourceId}/availability-rules`
      )
      .toPromise();

    const rules = response.data.data;

    // Guardar en cache
    await this.cacheManager.set(cacheKey, rules, { ttl: 3600 }); // 1 hora

    return rules;
  }
}
```

**Ventajas**:

- ✅ Siempre obtiene las reglas más actuales
- ✅ No requiere eventos ni sincronización compleja
- ✅ Cache reduce latencia
- ✅ Fácil de implementar

**Desventajas**:

- ⚠️ Dependencia de red entre servicios
- ⚠️ Posible latencia en primera consulta

---

### 2. Event-Driven (Basado en Eventos) 🔄 AVANZADO

El `resources-service` publica eventos cuando cambian las reglas.

#### Event Emitters en resources-service

```typescript
// resources-service/src/application/handlers/update-resource.handler.ts

@CommandHandler(UpdateResourceCommand)
export class UpdateResourceHandler
  implements ICommandHandler<UpdateResourceCommand>
{
  constructor(
    private readonly resourceService: ResourceService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: UpdateResourceCommand) {
    const resource = await this.resourceService.updateResource(
      command.id,
      command.data
    );

    // Publicar evento si cambiaron las reglas de disponibilidad
    if (command.data.availabilityRules) {
      await this.eventBus.publish(
        new AvailabilityRulesUpdatedEvent(
          resource.id,
          resource.availabilityRules,
          new Date()
        )
      );
    }

    return resource;
  }
}
```

#### Event Listeners en availability-service

```typescript
// availability-service/src/application/listeners/availability-rules-updated.listener.ts

@EventsHandler(AvailabilityRulesUpdatedEvent)
export class AvailabilityRulesUpdatedListener
  implements IEventHandler<AvailabilityRulesUpdatedEvent>
{
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async handle(event: AvailabilityRulesUpdatedEvent) {
    // Actualizar cache con nuevas reglas
    const cacheKey = `resource_rules:${event.resourceId}`;
    await this.cacheManager.set(cacheKey, event.rules, { ttl: 3600 });

    // Log para auditoría
    console.log(`Availability rules updated for resource ${event.resourceId}`);
  }
}
```

**Ventajas**:

- ✅ Sincronización automática en tiempo real
- ✅ Reduce llamadas HTTP
- ✅ Cache siempre actualizado

**Desventajas**:

- ⚠️ Requiere infraestructura de eventos (RabbitMQ)
- ⚠️ Mayor complejidad de implementación
- ⚠️ Requiere manejo de eventos perdidos/duplicados

---

### 3. Reglas Globales (Fallback) 📋

El `availability-service` tiene reglas por defecto cuando no se encuentran específicas.

```typescript
// availability-service/src/config/default-availability-rules.ts

export const DEFAULT_AVAILABILITY_RULES: AvailabilityRules = {
  requiresApproval: true, // Por defecto todo requiere aprobación
  maxAdvanceBookingDays: 30,
  minBookingDurationMinutes: 30,
  maxBookingDurationMinutes: 240,
  allowRecurring: false,
  customRules: {
    businessHoursOnly: true,
    weekdaysOnly: false,
    maxConcurrentBookings: 1
  }
};

async getResourceRules(resourceId: string): Promise<AvailabilityRules> {
  try {
    // Intentar obtener reglas específicas
    return await this.fetchResourceRules(resourceId);
  } catch (error) {
    // Usar reglas por defecto si falla
    console.warn(`Using default rules for resource ${resourceId}`);
    return DEFAULT_AVAILABILITY_RULES;
  }
}
```

---

## ✅ Implementación Recomendada

### Fase 1: Pull-Based (Actual) ✅

1. **Endpoint en resources-service**:

   ```
   GET /api/v1/resources/:id/availability-rules
   ```

2. **Cache en availability-service**:
   - TTL: 1 hora
   - Invalidación manual si se requiere

3. **Reglas por defecto**:
   - Fallback cuando falla la consulta

### Fase 2: Event-Driven (Futuro) 🔄

1. **Publicar eventos**:
   - `AvailabilityRulesUpdatedEvent`
   - `ResourceCreatedEvent`
   - `ResourceDeletedEvent`

2. **Listeners en availability-service**:
   - Actualizar cache
   - Validar reservas existentes
   - Notificar cambios afectados

---

## 📋 Endpoint Implementado

### GET /api/v1/resources/:id/availability-rules

**Descripción**: Obtiene las reglas de disponibilidad de un recurso específico.

**Parámetros**:

- `id` (path): ID del recurso

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "resourceId": "resource_123",
    "requiresApproval": true,
    "maxAdvanceBookingDays": 90,
    "minBookingDurationMinutes": 60,
    "maxBookingDurationMinutes": 480,
    "allowRecurring": true,
    "customRules": {
      "businessHoursOnly": true,
      "weekdaysOnly": false,
      "maxConcurrentBookings": 1
    }
  },
  "message": "Availability rules retrieved successfully"
}
```

**Errores**:

- `404`: Recurso no encontrado
- `500`: Error del servidor

---

## 🧪 Ejemplo de Uso

### Crear una reserva en availability-service

```typescript
// availability-service: Crear reserva con validación de reglas

async createBooking(createBookingDto: CreateBookingDto, userId: string) {
  // 1. Obtener reglas del recurso
  const rules = await this.bookingValidationService.getResourceRules(
    createBookingDto.resourceId
  );

  // 2. Validar según reglas
  const validation = await this.bookingValidationService.validateBookingRules(
    createBookingDto.resourceId,
    createBookingDto
  );

  if (!validation.isValid) {
    throw new BadRequestException(validation.errors);
  }

  // 3. Verificar disponibilidad
  const isAvailable = await this.checkAvailability(
    createBookingDto.resourceId,
    createBookingDto.startDate,
    createBookingDto.endDate
  );

  if (!isAvailable) {
    throw new ConflictException('El recurso no está disponible en ese horario');
  }

  // 4. Crear reserva
  const booking = await this.bookingRepository.create({
    ...createBookingDto,
    userId,
    status: rules.requiresApproval ? BookingStatus.PENDING : BookingStatus.CONFIRMED
  });

  return booking;
}
```

---

## 🔄 Flujo de Validación

```
┌─────────────────────┐
│ availability-service │
│   (Crear Reserva)    │
└──────────┬───────────┘
           │
           ▼
   ┌───────────────┐
   │ Obtener Reglas │◄───-─┐
   └────────┬───────┘      │
            │              │
            ▼              │
      ┌──────────┐         │
      │  Cache?  │─────No──┤
      └────┬─────┘         │
          Yes              │
           │               │
           ▼               ▼
   ┌─────────────────────────────┐
   │   resources-service API     │
   │ GET /resources/:id/rules    │
   └──────────┬──────────────────┘
              │
              ▼
      ┌──────────────┐
      │ Validar      │
      │ - Anticipación│
      │ - Duración   │
      │ - Recurrencia│
      │ - Horarios   │
      └──────┬───────┘
             │
             ▼
      ┌───────────┐
      │ ¿Válido?  │
      └────┬──────┘
          / \
        /     \
      Yes      No
       │        │
       ▼        ▼
   Crear    Rechazar
   Reserva  + Errores
```

---

## 📊 Configuración de Variables de Entorno

### resources-service (.env)

```bash
# Puerto del servicio
PORT=3002

# Base URL del servicio
BASE_URL=http://localhost:3002

# Redis para cache
REDIS_HOST=localhost
REDIS_PORT=6379

# MongoDB
MONGODB_URI=mongodb://localhost:27017/bookly-resources
```

### availability-service (.env)

```bash
# Puerto del servicio
PORT=3003

# Base URL de resources-service
RESOURCES_SERVICE_URL=http://localhost:3002

# Redis para cache de reglas
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=3600  # 1 hora

# MongoDB
MONGODB_URI=mongodb://localhost:27017/bookly-availability

# RabbitMQ (si se usa eventos)
RABBITMQ_URL=amqp://localhost:5672
```

---

## 🎯 Checklist de Implementación

- [x] Reglas de disponibilidad en ResourceEntity
- [x] Seeds con reglas de disponibilidad variadas
- [x] Endpoint GET /resources/:id/availability-rules
- [x] ~~Cliente HTTP en availability-service~~ **Reemplazado por Event-Driven**
- [x] Servicio de validación de reglas ✅ `AvailabilityRulesService`
- [x] Cache de reglas con Redis (TTL 1 hora) ✅ Implementado
- [x] Reglas por defecto (fallback) ✅ `getDefaultRules()`
- [x] Eventos para sincronización ✅ Kafka con `AvailabilityRulesUpdatedEvent`
- [x] Event Handler en availability-service ✅ `AvailabilityRulesUpdatedHandler`
- [x] Publicación de eventos desde resources-service ✅ `ResourceService`
- [ ] Testing de integración
- [x] Documentación de API ✅ Ver `RF05_SINCRONIZACION_AVAILABILITY_RULES_COMPLETE.md`

---

## 🚀 Próximos Pasos

1. ✅ ~~Implementar endpoint en ResourcesController~~ **COMPLETADO**
2. ✅ ~~Event-Driven Architecture con Kafka~~ **COMPLETADO**
3. ✅ ~~Servicio de validación de reglas~~ **COMPLETADO**
4. ✅ ~~Agregar cache con Redis~~ **COMPLETADO**
5. ⏳ **Testing** de integración entre servicios
6. ⏳ **Monitoreo** de latencia de consultas con OpenTelemetry

---

## 📚 Referencias

- [resources-service/src/domain/entities/resource.entity.ts](../../apps/resources-service/src/domain/entities/resource.entity.ts)
- [resources-service/src/database/seed.ts](../../apps/resources-service/src/database/seed.ts) - Ejemplos de reglas
- [availability-service Integration Guide](../../apps/availability-service/README.md)

---

**Última Actualización**: 2025-11-04  
**Estado**: ✅ **IMPLEMENTACIÓN COMPLETA** - Event-Driven con Kafka, Cache con Redis, Validaciones automáticas  
**Documentación Completa**: Ver `RF05_SINCRONIZACION_AVAILABILITY_RULES_COMPLETE.md`
