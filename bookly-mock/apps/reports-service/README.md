# 📊 Reports Service

Sistema de reportes, análisis y dashboards para Bookly.

## 📋 Índice

- [Librerías Exportables](#librerías-exportables)
- [Descripción](#descripción)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [API Documentation](#api-documentation)
- [Testing](#testing)

---

## 📦 Librerías Exportables

Este servicio también exporta librerías compartidas que pueden ser utilizadas por otros microservicios:

### 🎯 @reports/audit-decorators

Decoradores e interceptores para auditoría event-driven en Bookly.

**Importación:**

```typescript
import { AuditDecoratorsModule } from "@reports/audit-decorators";
import { Audit, AuditAction } from "@reports/audit-decorators";
```

**Características:**

- ✅ Decorador `@Audit()` para HTTP endpoints
- ✅ Decorador `@AuditWebSocket()` para WebSocket handlers
- ✅ Decorador `@AuditEvent()` para Event handlers
- ✅ Interceptores automáticos que emiten eventos
- ✅ Interfaces compartidas (`IAuditRecord`, `IAuditQueryOptions`, etc.)

**Documentación completa:** [src/libs/audit-decorators/README.md](./src/libs/audit-decorators/README.md)  
**Guía de migración:** [src/libs/audit-decorators/MIGRATION.md](./src/libs/audit-decorators/MIGRATION.md)

---

## 📖 Descripción

El **Reports Service** gestiona la generación de reportes, análisis de datos y visualizaciones para el sistema Bookly:

- **Reportes de Uso**: Análisis por recurso, programa y período
- **Reportes por Usuario**: Historial de reservas y uso
- **Dashboards**: Visualizaciones en tiempo real
- **Exportación**: CSV, Excel, PDF
- **Analytics**: Tendencias y predicciones
- **Feedback**: Registro y análisis de satisfacción

---

## ✨ Características

### RF-31: Reporte de Uso por Recurso/Programa/Período

- ✅ Análisis por recurso individual
- ✅ Análisis por programa académico
- ✅ Análisis por período temporal
- ✅ Estadísticas de ocupación
- ✅ Visualización gráfica

**Documentación**: [`docs/requirements/RF-31_REPORTE_USO.md`](docs/requirements/RF-31_REPORTE_USO.md)

---

### RF-32: Reporte por Usuario/Profesor

- ✅ Historial completo de reservas
- ✅ Estadísticas de uso individual
- ✅ Recursos más utilizados
- ✅ Patrones de comportamiento
- ✅ Exportación personalizada

**Documentación**: [`docs/requirements/RF-32_REPORTE_USUARIO.md`](docs/requirements/RF-32_REPORTE_USUARIO.md)

---

### RF-33: Exportación en CSV

- ✅ Exportación a CSV
- ✅ Exportación a Excel (XLSX)
- ✅ Exportación a PDF
- ✅ Exportación programada
- ✅ Filtros avanzados de exportación

**Documentación**: [`docs/requirements/RF-33_EXPORTACION_CSV.md`](docs/requirements/RF-33_EXPORTACION_CSV.md)

---

### RF-34: Registro de Feedback de Usuarios

- ✅ Sistema de calificación (1-5 estrellas)
- ✅ Comentarios textuales
- ✅ Categorización de feedback
- ✅ Análisis de sentimientos
- ✅ Reportes de satisfacción

**Documentación**: [`docs/requirements/RF-34_FEEDBACK_USUARIOS.md`](docs/requirements/RF-34_FEEDBACK_USUARIOS.md)

---

### RF-35: Evaluación de Usuarios por el Staff

- ⚠️ Sistema de evaluación interna (en progreso)
- ⚠️ Historial de incidentes (en progreso)
- ⚠️ Scoring de usuarios (en progreso)

**Documentación**: [`docs/requirements/RF-35_EVALUACION_USUARIOS.md`](docs/requirements/RF-35_EVALUACION_USUARIOS.md)

---

### RF-36: Dashboards Interactivos

- ✅ Dashboard de ocupación en tiempo real
- ✅ Dashboard de tendencias
- ✅ Dashboard por programa académico
- ✅ Dashboard administrativo
- ✅ Widgets configurables

**Documentación**: [`docs/requirements/RF-36_DASHBOARDS.md`](docs/requirements/RF-36_DASHBOARDS.md)

---

### RF-37: Reporte de Demanda Insatisfecha

- ✅ Análisis de solicitudes rechazadas
- ✅ Recursos más demandados
- ✅ Horas pico de demanda
- ✅ Sugerencias de optimización
- ✅ Predicción de necesidades

**Documentación**: [`docs/requirements/RF-37_DEMANDA_INSATISFECHA.md`](docs/requirements/RF-37_DEMANDA_INSATISFECHA.md)

---

## 🛠️ Stack Tecnológico

### Backend

- **NestJS**: Framework modular
- **Prisma**: ORM sobre MongoDB
- **MongoDB**: Base de datos NoSQL
- **MongoDB Aggregation**: Pipeline de análisis

### Reporting & Analytics

- **ExcelJS**: Generación de archivos Excel
- **PDFKit**: Generación de PDFs
- **Chart.js**: Gráficos y visualizaciones
- **D3.js**: Visualizaciones avanzadas

### Comunicación

- **RabbitMQ**: Event Bus
- **Redis**: Cache de reportes
- **WebSockets**: Dashboards en tiempo real

### Observabilidad

- **Winston**: Logging estructurado
- **OpenTelemetry**: Trazabilidad
- **Sentry**: Notificación de errores

---

## 📋 Requisitos

- **Node.js**: v18 o superior
- **npm**: v9 o superior
- **MongoDB**: v6 o superior
- **Redis**: v7 o superior
- **RabbitMQ**: v3.11 o superior

---

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Ejecutar seeds
npm run seed
```

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# MongoDB
DATABASE_URL="mongodb://localhost:27017/bookly-reports"

# Event Bus
RABBITMQ_URL="amqp://localhost:5672"
RABBITMQ_EXCHANGE="bookly-events"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Port
PORT=3005

# Reports Configuration
REPORTS_CACHE_TTL=3600
REPORTS_MAX_EXPORT_SIZE=10000
```

---

## 📚 API Documentation

### Swagger

```
http://localhost:3005/api/docs
```

### Endpoints Principales

#### Reportes de Uso

- `GET /api/reports/usage` - Reporte general de uso
- `GET /api/reports/usage/resource/:id` - Uso por recurso
- `GET /api/reports/usage/program/:id` - Uso por programa
- `GET /api/reports/usage/period` - Uso por período

#### Reportes de Usuario

- `GET /api/reports/user/:id` - Reporte de usuario específico
- `GET /api/reports/user/:id/history` - Historial de reservas
- `GET /api/reports/user/:id/statistics` - Estadísticas del usuario

#### Exportación

- `POST /api/reports/export/csv` - Exportar a CSV
- `POST /api/reports/export/xlsx` - Exportar a Excel
- `POST /api/reports/export/pdf` - Exportar a PDF

#### Feedback

- `POST /api/feedback` - Crear feedback
- `GET /api/feedback/resource/:id` - Feedback por recurso
- `GET /api/feedback/statistics` - Estadísticas de feedback

#### Dashboards

- `GET /api/dashboards/occupancy` - Dashboard de ocupación
- `GET /api/dashboards/trends` - Dashboard de tendencias
- `GET /api/dashboards/admin` - Dashboard administrativo

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

---

## 🚀 Deployment

### Docker

```bash
# Build
docker build -t bookly-reports-service .

# Run
docker run -p 3005:3005 bookly-reports-service
```

### Kubernetes

```bash
kubectl apply -f k8s/reports-service/
```

---

## 📊 Métricas y Observabilidad

### Health Check

```bash
curl http://localhost:3005/api/health
```

### Métricas Principales

- **Reportes generados**: Total de reportes por tipo
- **Tiempo de generación**: Promedio por tipo de reporte
- **Cache hit rate**: Tasa de aciertos de cache
- **Exportaciones**: Total por formato

---

## 🔗 Enlaces Relacionados

- [Arquitectura Detallada](docs/ARCHITECTURE.md)
- [Base de Datos](docs/DATABASE.md)
- [Endpoints](docs/ENDPOINTS.md)
- [Event Bus](docs/EVENT_BUS.md)
- [Requerimientos Implementados](docs/requirements/)

---

**Mantenedores**:

- Bookly Development Team
- UFPS - Universidad Francisco de Paula Santander

**Última actualización**: Noviembre 6, 2025
