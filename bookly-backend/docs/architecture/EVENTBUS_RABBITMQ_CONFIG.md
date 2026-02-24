# ✅ Configuración EventBus - RabbitMQ Unificado

## 📋 Resumen

Todos los microservicios de Bookly están configurados para usar **RabbitMQ** como Event Bus por defecto.

---

## 🔧 Configuración Aplicada

### Variables de Entorno (`.env`)

```bash
EVENT_BUS_TYPE=rabbitmq
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672/bookly
```

**Importante**: El vhost `/bookly` es obligatorio para conectarse al contenedor Docker de RabbitMQ.

---

## 🎯 Microservicios Configurados

Todos los servicios usan `EventBusModule.forRootAsync()` con lógica condicional:

| Microservicio            | Archivo                                                | brokerType | URL RabbitMQ                                    |
| ------------------------ | ------------------------------------------------------ | ---------- | ----------------------------------------------- |
| **api-gateway**          | `apps/api-gateway/src/api-gateway.module.ts`           | rabbitmq   | `amqp://bookly:bookly123@localhost:5672/bookly` |
| **auth-service**         | `apps/auth-service/src/auth.module.ts`                 | rabbitmq   | `amqp://bookly:bookly123@localhost:5672/bookly` |
| **resources-service**    | `apps/resources-service/src/resources.module.ts`       | rabbitmq   | `amqp://bookly:bookly123@localhost:5672/bookly` |
| **availability-service** | `apps/availability-service/src/availability.module.ts` | rabbitmq   | `amqp://bookly:bookly123@localhost:5672/bookly` |
| **stockpile-service**    | `apps/stockpile-service/src/stockpile.module.ts`       | rabbitmq   | `amqp://bookly:bookly123@localhost:5672/bookly` |
| **reports-service**      | `apps/reports-service/src/reports.module.ts`           | rabbitmq   | `amqp://bookly:bookly123@localhost:5672/bookly` |

---

## 🔀 Lógica Condicional

Cada módulo implementa:

```typescript
EventBusModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    brokerType:
      configService.get("EVENT_BUS_TYPE") === "kafka"
        ? "kafka"
        : "rabbitmq",  // ← DEFAULT
    config:
      configService.get("EVENT_BUS_TYPE") === "kafka"
        ? {
            // Configuración Kafka
            clientId: "service-name",
            brokers: ["localhost:9092"],
            groupId: "service-group",
          }
        : {
            // Configuración RabbitMQ
            url: configService.get("RABBITMQ_URL") ||
                 "amqp://bookly:bookly123@localhost:5672/bookly",
            exchange: "bookly-events",
            exchangeType: "topic",
            durable: true,
            prefetchCount: 1,
          },
    enableEventStore: configService.get("ENABLE_EVENT_STORE") === "true",
    topicPrefix: "bookly",
  }),
  inject: [ConfigService],
}),
```

---

## ✅ Verificación

### 1. Verificar que RabbitMQ esté corriendo

```bash
docker ps --filter "name=rabbitmq" --format "{{.Names}}\t{{.Status}}"
```

**Esperado**: `bookly-rabbitmq   Up X hours (healthy)`

### 2. Verificar configuración de vhost

```bash
docker logs bookly-rabbitmq 2>&1 | grep -i "vhost.*bookly" | tail -5
```

**Esperado**: Logs de autenticación exitosa en vhost `/bookly`

### 3. Iniciar servicios

```bash
# Individual
npm run start:auth:debug
npm run start:resources:debug
npm run start:availability:debug
npm run start:stockpile:debug
npm run start:reports:debug
npm run start:gateway:debug

# Todos a la vez
npm run start:all
```

### 4. Verificar conexión exitosa

En los logs de cada servicio, buscar:

```log
[INFO] [RabbitMQAdapter] RabbitMQ connected successfully {"url":"amqp://*****@localhost:5672/bookly","exchange":"bookly-events"}
```

---

## 🚨 Errores Comunes

### Error: `vhost / not found`

**Causa**: URL sin vhost `/bookly`

**Solución**:

```bash
# Asegurar que todas las URLs tengan el vhost
amqp://bookly:bookly123@localhost:5672/bookly
#                                         ^^^^^^
```

### Error: `PLAIN login refused: user 'bookly' - invalid credentials`

**Causa**: Credenciales incorrectas

**Solución**: Verificar usuario y contraseña en Docker:

```bash
docker exec bookly-rabbitmq rabbitmqctl list_users
```

### Error: `Expected ConnectionOpenOk; got <ConnectionClose channel:0>`

**Causa**: Problema con vhost o permisos

**Solución**: Recrear vhost y permisos:

```bash
docker exec bookly-rabbitmq rabbitmqctl add_vhost /bookly
docker exec bookly-rabbitmq rabbitmqctl set_permissions -p /bookly bookly ".*" ".*" ".*"
```

---

## 🔄 Cambiar a Kafka (Opcional)

Si en el futuro necesitas usar Kafka:

1. Actualizar `.env`:

   ```bash
   EVENT_BUS_TYPE=kafka
   KAFKA_BROKERS=localhost:9092
   ```

2. Reiniciar servicios

Los microservicios cambiarán automáticamente a Kafka sin modificar código.

---

## 📚 Referencias

- [RabbitMQ Vhosts](https://www.rabbitmq.com/vhosts.html)
- [EventBusModule docs](../libs/event-bus/README.md)
- [Arquitectura EDA](./ARCHITECTURE_EDA.md)

---

**Última actualización**: 2025-11-20  
**Estado**: ✅ Todos los servicios usando RabbitMQ con vhost `/bookly`
