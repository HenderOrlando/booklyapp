# 📚 Estado de Documentación de APIs - Bookly

**Fecha**: 2025-11-20  
**Estado**: ✅ Todos los microservicios operacionales

---

## 🎯 Resumen Ejecutivo

Todos los microservicios de Bookly están **activos y completamente documentados** con Swagger/OpenAPI 3.0.

| Servicio                 | Puerto | Estado | Swagger | AsyncAPI | Health |
| ------------------------ | ------ | ------ | ------- | -------- | ------ |
| **API Gateway**          | 3000   | ✅     | ✅      | ✅       | ✅     |
| **Auth Service**         | 3001   | ✅     | ✅      | ✅       | ✅     |
| **Resources Service**    | 3002   | ✅     | ✅      | ✅       | ✅     |
| **Availability Service** | 3003   | ✅     | ✅      | ✅       | ✅     |
| **Stockpile Service**    | 3004   | ✅     | ✅      | ✅       | ✅     |
| **Reports Service**      | 3005   | ✅     | ✅      | ✅       | ✅     |

---

## 📖 Acceso a Documentación

### Swagger UI (REST APIs)

Cada microservicio expone su documentación Swagger en `/api/docs`:

```bash
# API Gateway - Proxy y rutas centralizadas
http://localhost:3000/api/docs

# Auth Service - Autenticación, usuarios, roles, permisos
http://localhost:3001/api/docs

# Resources Service - Gestión de recursos físicos
http://localhost:3002/api/docs

# Availability Service - Reservas, disponibilidad, calendario
http://localhost:3003/api/docs

# Stockpile Service - Aprobaciones, check-in/out, flujos
http://localhost:3004/api/docs

# Reports Service - Reportes, dashboards, exportaciones
http://localhost:3005/api/docs
```

### AsyncAPI (Event-Driven Architecture)

La documentación de eventos asincrónicos está disponible en cada servicio:

```bash
# Eventos globales del sistema
http://localhost:3000/api/events/docs

# Ver métricas de eventos
http://localhost:3000/events/metrics

# Dashboard de eventos
http://localhost:3000/events/dashboard
```

---

## 🔍 Endpoints por Microservicio

### 1. API Gateway (Puerto 3000)

**Funcionalidad**: Proxy central, circuit breaker, rate limiting

| Grupo             | Endpoints Principales                                       |
| ----------------- | ----------------------------------------------------------- |
| **Health**        | `GET /health`, `GET /health/services`                       |
| **Proxy**         | `ALL /api/v1/:service/*`                                    |
| **Events**        | `GET /events`, `GET /events/metrics`, `POST /events/replay` |
| **DLQ**           | `GET /dlq`, `POST /dlq/:id/retry`, `DELETE /dlq/:id`        |
| **Notifications** | `GET /notifications`, `POST /notifications/:id/read`        |
| **Cache**         | `GET /api/v1/metrics/cache/*`                               |

### 2. Auth Service (Puerto 3001)

**Funcionalidad**: Autenticación, autorización, gestión de usuarios

| Grupo           | Endpoints Principales                                                |
| --------------- | -------------------------------------------------------------------- |
| **Auth**        | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`              |
| **Users**       | `GET /api/v1/users`, `POST /api/v1/users`, `PATCH /api/v1/users/:id` |
| **Roles**       | `GET /api/v1/roles`, `POST /api/v1/roles`, `PATCH /api/v1/roles/:id` |
| **Permissions** | `GET /api/v1/permissions`, `POST /api/v1/permissions`                |
| **SSO**         | `GET /api/v1/auth/google`, `GET /api/v1/auth/microsoft`              |
| **2FA**         | `POST /api/v1/auth/2fa/enable`, `POST /api/v1/auth/2fa/verify`       |

### 3. Resources Service (Puerto 3002)

**Funcionalidad**: Gestión de recursos físicos (salas, equipos)

| Grupo           | Endpoints Principales                                                            |
| --------------- | -------------------------------------------------------------------------------- |
| **Resources**   | `GET /api/v1/resources`, `POST /api/v1/resources`, `PATCH /api/v1/resources/:id` |
| **Categories**  | `GET /api/v1/categories`, `POST /api/v1/categories`                              |
| **Maintenance** | `POST /api/v1/maintenance`, `GET /api/v1/maintenance/:id`                        |
| **Attributes**  | `GET /api/v1/resource-attributes`, `POST /api/v1/resource-attributes`            |
| **Import**      | `POST /api/v1/resources/import`                                                  |

### 4. Availability Service (Puerto 3003)

**Funcionalidad**: Reservas, disponibilidad, calendario

| Grupo            | Endpoints Principales                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------- |
| **Reservations** | `GET /api/v1/reservations`, `POST /api/v1/reservations`, `PATCH /api/v1/reservations/:id` |
| **Availability** | `GET /api/v1/availability/resource/:id`, `GET /api/v1/availability/search`                |
| **Recurring**    | `POST /api/v1/reservations/recurring`, `GET /api/v1/reservations/recurring/:id`           |
| **Conflicts**    | `GET /api/v1/reservations/conflicts`, `POST /api/v1/reservations/conflicts/resolve`       |
| **Waitlist**     | `POST /api/v1/waitlist`, `GET /api/v1/waitlist`                                           |
| **Reassignment** | `POST /api/v1/reassignment/request`, `POST /api/v1/reassignment/:id/approve`              |

### 5. Stockpile Service (Puerto 3004)

**Funcionalidad**: Aprobaciones, check-in/out, flujos de trabajo

| Grupo                 | Endpoints Principales                                                         |
| --------------------- | ----------------------------------------------------------------------------- |
| **Approval Requests** | `GET /api/v1/approval-requests`, `POST /api/v1/approval-requests/:id/approve` |
| **Approval Flows**    | `GET /api/v1/approval-flows`, `POST /api/v1/approval-flows`                   |
| **Check-In/Out**      | `POST /api/v1/check-in-out/check-in`, `POST /api/v1/check-in-out/check-out`   |
| **Active**            | `GET /api/v1/check-in-out/active/all`, `GET /api/v1/check-in-out/overdue/all` |
| **Metrics**           | `GET /api/v1/metrics/cache`, `GET /api/v1/metrics/cache/prometheus`           |

### 6. Reports Service (Puerto 3005)

**Funcionalidad**: Reportes, dashboards, exportaciones, auditoría

| Grupo              | Endpoints Principales                                                     |
| ------------------ | ------------------------------------------------------------------------- |
| **Usage Reports**  | `GET /api/v1/usage-reports`, `POST /api/v1/usage-reports/generate`        |
| **Demand Reports** | `GET /api/v1/demand-reports`, `POST /api/v1/demand-reports/generate`      |
| **User Reports**   | `GET /api/v1/user-reports`, `POST /api/v1/user-reports/generate`          |
| **Dashboard**      | `GET /api/v1/dashboard/overview`, `GET /api/v1/dashboard/occupancy`       |
| **Audit**          | `GET /api/v1/audit`, `GET /api/v1/audit/:id`, `POST /api/v1/audit/export` |
| **Exports**        | `POST /api/v1/reports/export`, `GET /api/v1/reports/export/:id/download`  |
| **Feedback**       | `GET /api/v1/api/v1/feedback`, `POST /api/v1/api/v1/feedback`             |
| **Evaluations**    | `GET /api/v1/api/v1/evaluations`, `POST /api/v1/api/v1/evaluations`       |

---

## 🔐 Autenticación

Todos los endpoints (excepto `/health` y `/api/docs`) requieren autenticación JWT:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Obtener Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bookly.com",
    "password": "admin123"
  }'
```

---

## 📊 Eventos Asincrónicos (AsyncAPI)

### Eventos Publicados

| Servicio         | Eventos                                                                               |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Auth**         | `user.created`, `user.updated`, `user.deleted`, `role.assigned`                       |
| **Resources**    | `resource.created`, `resource.updated`, `resource.deleted`, `resource.status.changed` |
| **Availability** | `reservation.created`, `reservation.cancelled`, `reservation.modified`                |
| **Stockpile**    | `approval.requested`, `approval.approved`, `approval.rejected`, `checkin.completed`   |
| **Reports**      | `report.generated`, `export.completed`, `audit.recorded`                              |

### Suscripción a Eventos

Los eventos se publican en RabbitMQ (`vhost: /bookly`, `exchange: bookly-events`):

```typescript
// Ejemplo de suscripción
await eventBus.subscribe(
  "bookly.notifications.user.created",
  "my-service-consumer",
  async (payload) => {
    console.log("Usuario creado:", payload);
  }
);
```

---

## 🧪 Testing con Swagger

### 1. Abrir Swagger UI

```bash
# Cualquier servicio
open http://localhost:3001/api/docs
```

### 2. Autenticar

1. Click en **"Authorize"** (🔒)
2. Ingresar token JWT: `Bearer <token>`
3. Click en **"Authorize"**

### 3. Probar Endpoints

- Expandir cualquier endpoint
- Click en **"Try it out"**
- Completar parámetros
- Click en **"Execute"**

---

## 📈 Monitoreo

### Health Checks

```bash
# Todos los servicios
curl http://localhost:3000/health/services | jq

# Servicio individual
curl http://localhost:3001/api/v1/health | jq
```

### Métricas de Cache (Prometheus)

```bash
# Métricas generales
curl http://localhost:3004/api/v1/metrics/cache

# Formato Prometheus
curl http://localhost:3004/api/v1/metrics/cache/prometheus
```

### Event Metrics

```bash
# Dashboard de eventos
curl http://localhost:3000/events/dashboard | jq

# Métricas de eventos
curl http://localhost:3000/events/metrics | jq
```

---

## 🚀 Inicio Rápido

### Iniciar Todos los Servicios

```bash
# Desde el directorio raíz del proyecto
cd bookly-mock

# Iniciar todos los microservicios
npm run start:all

# O individualmente
npm run start:auth
npm run start:resources
npm run start:availability
npm run start:stockpile
npm run start:reports
npm run start:gateway
```

### Verificar Estado

```bash
# Healthchecks
for port in 3001 3002 3003 3004 3005; do
  curl -s http://localhost:$port/api/v1/health | jq -r '.service + ": " + .status'
done

# Swagger disponible
for port in 3001 3002 3003 3004 3005; do
  echo "http://localhost:$port/api/docs"
done
```

---

## 🔧 Troubleshooting

### Servicio no responde

```bash
# Verificar que el proceso esté corriendo
ps aux | grep "nest start"

# Verificar puerto en uso
lsof -i :3001

# Reiniciar servicio
npm run start:auth:debug
```

### Error de autenticación MongoDB

Los warnings de MongoDB `Command find requires authentication` son **normales** y no afectan la funcionalidad. Son causados por el health check de DeadLetterQueueService.

### Error de RabbitMQ

Si hay errores de conexión a RabbitMQ, verificar:

```bash
# RabbitMQ corriendo
docker ps --filter "name=rabbitmq"

# Credenciales correctas
docker exec bookly-rabbitmq rabbitmqctl list_users

# Permisos en vhost
docker exec bookly-rabbitmq rabbitmqctl list_permissions -p /bookly
```

---

## 📚 Documentación Adicional

- **Arquitectura**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Event Bus**: [EVENTBUS_RABBITMQ_CONFIG.md](./EVENTBUS_RABBITMQ_CONFIG.md)
- **API Standards**: [API_RESPONSE_STANDARD.md](./API_RESPONSE_STANDARD.md)
- **Testing**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## ✅ Checklist de Verificación

- [x] Todos los servicios iniciados
- [x] Health checks respondiendo
- [x] Swagger UI accesible en cada servicio
- [x] AsyncAPI documentado
- [x] RabbitMQ conectado correctamente
- [x] MongoDB conectado correctamente
- [x] Redis operacional
- [x] API Gateway ruteando correctamente

---

**Última actualización**: 2025-11-20  
**Estado**: ✅ Sistema completamente operacional y documentado
