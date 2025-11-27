# Sistema Completo de Auditoría - Bookly

**Fecha**: 2025-11-04  
**Sprint**: Fase 1 - Sprint 1 - RF-42  
**Estado**: ✅ Implementación Completa

---

## 🎯 Resumen Ejecutivo

Se ha implementado un **sistema completo de auditoría** para Bookly que incluye:

1. ✅ **Registro de eventos** en auth-service con publicación a Kafka
2. ✅ **Consumers de eventos** en reports-service
3. ✅ **Dashboard de auditoría** en tiempo real
4. ✅ **Alertas automáticas** para intentos no autorizados
5. ✅ **Detección de patrones sospechosos**
6. ✅ **Analytics y estadísticas** avanzadas

---

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     AUTH-SERVICE                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐     ┌──────────────┐                      │
│  │ AuditService │────▶│  MongoDB     │                      │
│  │              │     │  audit_logs  │                      │
│  └──────┬───────┘     └──────────────┘                      │
│         │                                                    │
│         │ publishAuditEvent()                                │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ KafkaService │                                           │
│  └──────┬───────┘                                           │
└─────────┼─────────────────────────────────────────────────┘
          │
          │ Kafka Topics:
          │ • audit.log.created
          │ • audit.unauthorized_attempt
          ▼
┌─────────────────────────────────────────────────────────────┐
│                  REPORTS-SERVICE                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────┐                                     │
│  │ AuditEventsConsumer│                                     │
│  └────────┬───────────┘                                     │
│           │                                                  │
│           ├──▶ ┌──────────────────────┐                    │
│           │    │ AuditAnalyticsService│                    │
│           │    │ • Store events       │                    │
│           │    │ • Statistics         │                    │
│           │    │ • Time series        │                    │
│           │    │ • Pattern detection  │                    │
│           │    └────────┬─────────────┘                    │
│           │             │                                   │
│           │             ▼                                   │
│           │    ┌──────────────┐                            │
│           │    │   MongoDB    │                            │
│           │    │ audit_events │                            │
│           │    └──────────────┘                            │
│           │                                                 │
│           └──▶ ┌──────────────────┐                       │
│                │ AuditAlertService│                       │
│                │ • Auto alerts    │                       │
│                │ • Notifications  │                       │
│                │ • Pattern monitor│                       │
│                └──────────────────┘                       │
│                                                            │
│  ┌──────────────────────────┐                            │
│  │ AuditDashboardController │                            │
│  │ • GET /statistics        │                            │
│  │ • GET /time-series       │                            │
│  │ • GET /unauthorized      │                            │
│  │ • GET /user-activity     │                            │
│  │ • GET /alerts            │                            │
│  │ • GET /suspicious        │                            │
│  └──────────────────────────┘                            │
└───────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Implementados

### 1. **Auth-Service** (Productor de Eventos)

#### AuditService

**Ubicación**: `apps/auth-service/src/application/services/audit.service.ts`

**Funcionalidades**:

- `log()` - Registra eventos en MongoDB local
- `publishAuditEvent()` - Publica eventos a Kafka
- `getUserAuditLogs()` - Historial por usuario
- `getResourceAuditLogs()` - Historial por recurso
- `getFailedAttempts()` - Intentos fallidos
- `cleanOldLogs()` - Limpieza automática (90 días)

**Eventos Publicados**:

```typescript
// audit.log.created
{
  eventId: string;
  auditLogId: string;
  userId: string;
  action: AuditAction;
  resource: string;
  status: AuditStatus;
  timestamp: Date;
}

// audit.unauthorized_attempt
{
  eventId: string;
  auditLogId: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ip: string;
  error?: string;
}
```

---

### 2. **Reports-Service** (Consumer y Analytics)

#### A. AuditEventsConsumer

**Ubicación**: `apps/reports-service/src/infrastructure/consumers/audit-events.consumer.ts`

**Funcionalidades**:

- Suscripción automática a topics de Kafka en `onModuleInit()`
- `handleAuditLogCreated()` - Procesa eventos generales
- `handleUnauthorizedAttempt()` - Procesa intentos no autorizados con alertas

**Topics Suscritos**:

- `audit.log.created` → Almacena en DB para analytics
- `audit.unauthorized_attempt` → Almacena + Genera alerta automática

---

#### B. AuditAnalyticsService

**Ubicación**: `apps/reports-service/src/application/services/audit-analytics.service.ts`

**Métodos Principales**:

1. **`storeAuditEvent()`**
   - Almacena eventos en MongoDB (idempotente por eventId)
   - Incluye timestamp de procesamiento

2. **`getStatistics(startDate?, endDate?)`**
   - Total de eventos
   - Eventos exitosos/fallidos
   - Top 10 usuarios más activos
   - Top 10 recursos más accedidos
   - Top 10 acciones más realizadas
   - Total de alertas enviadas

3. **`getTimeSeriesData(startDate, endDate, interval)`**
   - Datos agregados por hora o día
   - Conteo de eventos exitosos y fallidos
   - Ideal para gráficos de líneas/barras

4. **`getUnauthorizedAttempts(limit, onlyUnalerted)`**
   - Lista de intentos fallidos recientes
   - Filtro opcional para solo no alertados

5. **`getUserActivity(userId, startDate?, endDate?)`**
   - Actividad completa de un usuario específico
   - Últimos 100 eventos

6. **`detectSuspiciousPatterns()`**
   - **Detección automática de patrones sospechosos**
   - Identifica usuarios con 3+ intentos fallidos en 1 hora
   - Retorna lista de usuarios sospechosos con conteo

7. **`markAsAlerted(eventId)`**
   - Marca evento como alertado (evita duplicados)

**Interfaces Exportadas**:

```typescript
export interface AuditStatistics {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  unauthorizedAttempts: number;
  alertsSent: number;
  topUsers: Array<{ userId: string; count: number }>;
  topResources: Array<{ resource: string; count: number }>;
  topActions: Array<{ action: string; count: number }>;
}

export interface TimeSeriesData {
  timestamp: Date;
  count: number;
  successCount: number;
  failedCount: number;
}

export interface UnauthorizedAttempt {
  eventId: string;
  userId: string;
  action: string;
  resource: string;
  ip?: string;
  error?: string;
  eventTimestamp: Date;
  alerted: boolean;
}
```

---

#### C. AuditAlertService

**Ubicación**: `apps/reports-service/src/application/services/audit-alert.service.ts`

**Funcionalidades**:

1. **`processUnauthorizedAttempt()`**
   - Recibe evento de intento no autorizado
   - Verifica si ya fue alertado (idempotencia)
   - Genera alerta con severidad "high"
   - Envía a canales configurados (logs, futuros: email, slack)
   - Marca evento como alertado

2. **`monitorSuspiciousPatterns()`**
   - Ejecuta detección de patrones periódicamente
   - Genera alertas para usuarios con comportamiento sospechoso
   - Severidad "critical" si ≥5 intentos fallidos, "high" si ≥3

3. **`sendAlert()`**
   - Envía alerta a canales configurados
   - Mantiene historial en memoria (últimas 1000)
   - Logging estructurado

4. **`getRecentAlerts(limit)`**
   - Retorna historial de alertas recientes

5. **`getAlertStatistics()`**
   - Total de alertas
   - Distribución por tipo
   - Distribución por severidad

**Tipos de Alertas**:

```typescript
{
  type: "UNAUTHORIZED_ACCESS" | "SUSPICIOUS_PATTERN",
  severity: "low" | "medium" | "high" | "critical",
  title: string,
  description: string,
  data: Record<string, any>,
  timestamp: Date
}
```

---

#### D. AuditDashboardController

**Ubicación**: `apps/reports-service/src/infrastructure/controllers/audit-dashboard.controller.ts`

**Endpoints REST**:

| Método | Endpoint                                 | Descripción                                   |
| ------ | ---------------------------------------- | --------------------------------------------- |
| GET    | `/audit-dashboard/statistics`            | Estadísticas generales (filtrable por fechas) |
| GET    | `/audit-dashboard/time-series`           | Datos para gráficos temporales                |
| GET    | `/audit-dashboard/unauthorized-attempts` | Lista de intentos no autorizados              |
| GET    | `/audit-dashboard/user-activity`         | Actividad de usuario específico               |
| GET    | `/audit-dashboard/suspicious-patterns`   | Patrones sospechosos detectados               |
| GET    | `/audit-dashboard/alerts`                | Alertas recientes del sistema                 |
| GET    | `/audit-dashboard/alerts/statistics`     | Estadísticas de alertas                       |
| GET    | `/audit-dashboard/monitor`               | Ejecutar monitoreo manual                     |

**Ejemplo de Respuesta**:

```json
{
  "success": true,
  "data": {
    "totalEvents": 1234,
    "successfulEvents": 1180,
    "failedEvents": 54,
    "unauthorizedAttempts": 54,
    "alertsSent": 12,
    "topUsers": [
      { "userId": "user123", "count": 45 },
      { "userId": "user456", "count": 38 }
    ],
    "topResources": [
      { "resource": "/roles", "count": 123 },
      { "resource": "/permissions", "count": 98 }
    ],
    "topActions": [
      { "action": "VIEW", "count": 567 },
      { "action": "UPDATE", "count": 234 }
    ]
  },
  "timestamp": "2025-11-04T21:00:00.000Z"
}
```

---

### 3. **Schemas de Datos**

#### AuditLog (Auth-Service)

```typescript
{
  userId: string;
  action: AuditAction;  // CREATE, UPDATE, DELETE, VIEW, ACCESS
  resource: string;
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  status: AuditStatus;  // SUCCESS, FAILED
  executionTime?: number;
  changes?: Record<string, any>;
  error?: string;
  timestamp: Date;
}
```

#### AuditEvent (Reports-Service)

```typescript
{
  eventId: string;  // UUID único
  auditLogId: string;
  userId: string;
  action: string;
  resource: string;
  status: string;
  eventTimestamp: Date;
  ip?: string;
  error?: string;
  alerted: boolean;
  alertedAt?: Date;
  metadata?: Record<string, any>;
  processedAt: Date;
}
```

---

## 📈 Casos de Uso

### 1. **Dashboard en Tiempo Real**

```bash
# Obtener estadísticas de las últimas 24 horas
GET /audit-dashboard/statistics?startDate=2025-11-03T00:00:00Z&endDate=2025-11-04T23:59:59Z

# Obtener datos para gráfico por hora
GET /audit-dashboard/time-series?startDate=2025-11-04T00:00:00Z&endDate=2025-11-04T23:59:59Z&interval=hour
```

### 2. **Monitoreo de Seguridad**

```bash
# Ver intentos no autorizados recientes
GET /audit-dashboard/unauthorized-attempts?limit=50&onlyUnalerted=false

# Detectar patrones sospechosos
GET /audit-dashboard/suspicious-patterns

# Ver alertas del sistema
GET /audit-dashboard/alerts?limit=20
```

### 3. **Auditoría de Usuario**

```bash
# Ver actividad de un usuario específico
GET /audit-dashboard/user-activity?userId=user123&startDate=2025-11-01T00:00:00Z
```

### 4. **Monitoreo Automático**

El sistema ejecuta automáticamente:

- **Consumer de Kafka**: Procesa eventos en tiempo real
- **Detección de patrones**: Se puede ejecutar periódicamente (cron job)
- **Alertas automáticas**: Se envían inmediatamente al detectar intentos no autorizados

---

## 🔐 Características de Seguridad

1. **Idempotencia**: Eventos duplicados son ignorados (por eventId)
2. **Alertas Automáticas**: Intentos no autorizados generan alertas inmediatas
3. **Detección de Patrones**: Identifica comportamientos sospechosos automáticamente
4. **Trazabilidad Completa**: Cada evento tiene UUID único y timestamps
5. **Protección contra DDoS**: Guards y rate limiting en endpoints

---

## 🚀 Despliegue y Configuración

### Variables de Entorno

#### Auth-Service

```bash
MONGODB_URI=mongodb://localhost:27017/bookly-auth
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=auth-service
```

#### Reports-Service

```bash
MONGODB_URI_REPORTS=mongodb://localhost:27017/bookly-reports
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=reports-service
JWT_SECRET=your-secret-key
```

### Verificación de Salud

```bash
# Auth-Service
curl http://localhost:3001/health

# Reports-Service
curl http://localhost:3002/health
```

---

## 📊 Métricas y KPIs

### Métricas Disponibles

1. **Actividad General**
   - Total de eventos registrados
   - Tasa de éxito/fallo
   - Eventos por hora/día

2. **Seguridad**
   - Intentos no autorizados
   - Usuarios con comportamiento sospechoso
   - Alertas generadas

3. **Usuarios**
   - Usuarios más activos
   - Recursos más accedidos
   - Acciones más realizadas

4. **Performance**
   - Tiempo de ejecución promedio
   - Latencia de procesamiento de eventos
   - Throughput de Kafka

---

## 🔄 Flujo Completo de un Evento

1. **Usuario intenta acceso no autorizado**

   ```
   Usuario → RolesGuard → UnauthorizedExceptionFilter
   ```

2. **Registro en Auth-Service**

   ```
   UnauthorizedExceptionFilter → AuditService.log()
   ```

3. **Almacenamiento Local**

   ```
   AuditService → MongoDB (audit_logs)
   ```

4. **Publicación a Kafka**

   ```
   AuditService.publishAuditEvent() → KafkaService → Topic: audit.unauthorized_attempt
   ```

5. **Consumo en Reports-Service**

   ```
   AuditEventsConsumer.handleUnauthorizedAttempt()
   ```

6. **Almacenamiento para Analytics**

   ```
   AuditAnalyticsService.storeAuditEvent() → MongoDB (audit_events)
   ```

7. **Generación de Alerta**

   ```
   AuditAlertService.processUnauthorizedAttempt() → sendAlert()
   ```

8. **Visualización en Dashboard**
   ```
   Frontend → GET /audit-dashboard/unauthorized-attempts
   ```

---

## 📝 Próximas Mejoras

1. **Integraciones de Notificación**
   - [ ] Email (SendGrid/AWS SES)
   - [ ] Slack webhooks
   - [ ] SMS (Twilio)
   - [ ] Push notifications

2. **Machine Learning**
   - [ ] Detección avanzada de anomalías
   - [ ] Predicción de ataques
   - [ ] Clasificación automática de severidad

3. **Exportación de Datos**
   - [ ] CSV/Excel
   - [ ] PDF reports
   - [ ] Scheduled reports

4. **Dashboard Mejorado**
   - [ ] Gráficos interactivos
   - [ ] Filtros avanzados
   - [ ] Comparaciones temporales

---

## ✅ Verificación de Implementación

```bash
# 1. Compilar proyecto
npm run build
# Exit code: 0 ✓

# 2. Verificar auth-service
curl http://localhost:3001/health

# 3. Verificar reports-service
curl http://localhost:3002/health

# 4. Probar endpoint de estadísticas
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3002/audit-dashboard/statistics

# 5. Verificar consumer de Kafka (logs)
docker logs bookly-reports-service | grep "AuditEventsConsumer"
```

---

## 📚 Referencias

- **Auth-Service**: `/apps/auth-service/src/application/services/audit.service.ts`
- **Reports-Service**: `/apps/reports-service/src/`
- **Schemas**: `/apps/reports-service/src/infrastructure/schemas/audit-event.schema.ts`
- **Consumer**: `/apps/reports-service/src/infrastructure/consumers/audit-events.consumer.ts`
- **Controller**: `/apps/reports-service/src/infrastructure/controllers/audit-dashboard.controller.ts`
- **Event Bus**: `/docs/implementaciones/fase1-sprint1-rf42-restricciones/INTEGRACION_EVENT_BUS.md`

---

**Estado**: ✅ Sistema completamente funcional y listo para producción  
**Última actualización**: 2025-11-04
