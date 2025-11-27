# @libs/event-bus - Event Bus Unificado

## ✅ ESTADO: IMPLEMENTADO Y LISTO

Event Bus unificado con soporte para Kafka y RabbitMQ + Event Sourcing completo.

---

## 🎯 Características

- ✅ **Abstracción Unificada**: Mismo código funciona con Kafka o RabbitMQ
- ✅ **Event Sourcing**: Almacenamiento inmutable de eventos en MongoDB
- ✅ **Snapshots**: Optimización con snapshots de agregados
- ✅ **Event Replay**: Reproducción de eventos para reconstruir estado
- ✅ **Type-Safe**: Interfaces y tipos completos en TypeScript
- ✅ **Health Checks**: Verificación de salud del broker
- ✅ **Auto-Connect**: Inicialización automática en `onModuleInit`
- ✅ **Topic Prefix**: Prefijos configurables para namespacing

---

## 📦 Instalación

Ya están instaladas las dependencias:
- ✅ kafkajs
- ✅ amqplib
- ✅ @types/amqplib

---

## 🚀 Uso Básico

### 1. Importar en Módulo

```typescript
import { EventBusModule } from "@libs/event-bus";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    EventBusModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        brokerType: configService.get("EVENT_BUS_TYPE") === "kafka" ? "kafka" : "rabbitmq",
        config: configService.get("EVENT_BUS_TYPE") === "kafka"
          ? {
              clientId: "my-service",
              brokers: configService.get("KAFKA_BROKERS").split(","),
              groupId: "my-group",
            }
          : {
              url: configService.get("RABBITMQ_URL"),
              exchange: "bookly-events",
              exchangeType: "topic",
              durable: true,
            },
        enableEventStore: true,
        topicPrefix: "bookly",
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MyModule {}
```

### 2. Publicar Eventos

```typescript
import { Injectable } from "@nestjs/common";
import { EventBusService } from "@libs/event-bus";
import { EventType } from "@libs/common/src/enums";

@Injectable()
export class UserService {
  constructor(private readonly eventBus: EventBusService) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.repository.create(dto);

    // Publicar evento
    await this.eventBus.publish(EventType.USER_CREATED, {
      eventId: uuidv4(),
      eventType: EventType.USER_CREATED,
      service: "availability-service",
      timestamp: new Date(),
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
      // Event Sourcing metadata
      aggregateId: user.id,
      aggregateType: "User",
      version: 1,
    });

    return user;
  }
}
```

### 3. Suscribirse a Eventos

```typescript
import { Injectable, OnModuleInit } from "@nestjs/common";
import { EventBusService } from "@libs/event-bus";
import { EventType } from "@libs/common/src/enums";
import { EventPayload } from "@libs/common/src/interfaces";

@Injectable()
export class UserEventHandler implements OnModuleInit {
  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.USER_CREATED,
      "my-group",
      this.handleUserCreated.bind(this)
    );
  }

  async handleUserCreated(event: EventPayload<any>) {
    const data = event.data || event;
    console.log("User created:", data.userId);
  }
}
```

---

## 🔧 Configuración

### Variables de Entorno

```env
# Event Bus Type
EVENT_BUS_TYPE=kafka          # kafka | rabbitmq

# Event Store
ENABLE_EVENT_STORE=true

# Kafka Configuration
KAFKA_BROKERS=localhost:9092

# RabbitMQ Configuration
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672
```

---

## 📁 Archivos Implementados

```
libs/event-bus/
├── src/
│   ├── interfaces/
│   │   ├── event-bus.interface.ts       ✅
│   │   ├── event-store.interface.ts     ✅
│   │   └── index.ts                     ✅
│   ├── adapters/
│   │   ├── kafka.adapter.ts             ✅
│   │   ├── rabbitmq.adapter.ts          ✅
│   │   └── index.ts                     ✅
│   ├── event-store/
│   │   ├── event-store.schema.ts        ✅
│   │   ├── event-store.service.ts       ✅
│   │   └── index.ts                     ✅
│   ├── event-bus.service.ts             ✅
│   ├── event-bus.module.ts              ✅
│   └── index.ts                         ✅
├── tsconfig.lib.json                    ✅
├── IMPLEMENTATION_PLAN.md               ✅ (Guía detallada)
└── README.md                            ✅ (Este archivo)
```

---

## ⚡ Próximos Pasos

### 1. Compilar

```bash
cd /Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-mock
npm run build
```

### 2. Actualizar Resource Event Handler

Aplicar los mismos cambios que en `user-info.event-handler.ts`:
- Importar `EventBusService` y `EventPayload`
- Implementar `OnModuleInit`
- Suscribirse a eventos en `onModuleInit`
- Quitar decoradores `@EventPattern` y `@Payload`

### 3. Variables de Entorno

Agregar a `.env` del root:

```env
EVENT_BUS_TYPE=rabbitmq
ENABLE_EVENT_STORE=true
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672
```

---

## 🎯 Beneficios

| Característica | Antes | Después |
|----------------|-------|---------|
| **Cambiar broker** | Refactor completo | 1 variable de entorno |
| **Event Sourcing** | Manual | Automático |
| **Code reuse** | Duplicado por servicio | Centralizado |
| **Trazabilidad** | Limitada | Completa |
| **Replay events** | No disponible | Built-in |

---

## 📖 Documentación Adicional

- `IMPLEMENTATION_PLAN.md`: Código completo de todos los archivos + ejemplos
- `../stockpile-service/docs/RF23_REVISION_IMPLEMENTACION.md`: Análisis de eventos
- `../stockpile-service/docs/RF23_EDA_IMPLEMENTACION_FINAL.md`: Guía de EDA

---

## ✅ Estado de Migración

- [x] stockpile-service: Migrado a EventBusModule ✅
- [ ] availability-service: Pendiente migración
- [ ] resources-service: Pendiente migración

---

**Creado:** 2025-01-05  
**Versión:** 1.0.0  
**Arquitectura:** Event-Driven + Event Sourcing
