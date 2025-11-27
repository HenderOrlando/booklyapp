# 🎯 Stockpile Service

Sistema de aprobaciones, validaciones y gestión de check-in/check-out para Bookly.

## 📋 Índice

- [Descripción](#descripción)
- [Características](#características)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 📖 Descripción

El **Stockpile Service** es un microservicio que gestiona:

- **Aprobaciones**: Flujos de validación de solicitudes de reserva
- **Check-in/Check-out**: Gestión de entrada y salida de recursos
- **Notificaciones**: Sistema multi-canal (email, SMS, WhatsApp, push)
- **Geolocalización**: Tracking en tiempo real y proximidad
- **Analytics**: Reportes de uso y estadísticas
- **Firmas Digitales**: Generación y validación de PDFs firmados
- **QR Codes**: Códigos QR para check-in/check-out rápido

---

## ✨ Características

### Flujos de Aprobación (RF-20 a RF-28)

- ✅ Validación de solicitudes por responsables
- ✅ Flujos diferenciados por tipo de recurso
- ✅ Aprobación multi-nivel
- ✅ Generación automática de documentos PDF
- ✅ Notificaciones en cada cambio de estado
- ✅ Pantalla de vigilancia (check-in/check-out)

### Notificaciones Multi-Canal

- ✅ Sistema agnóstico al proveedor
- ✅ Configuración por tenant/usuario
- ✅ 10 adapters implementados:
  - **Email**: SendGrid, AWS SES, NodeMailer
  - **SMS**: Twilio SMS
  - **WhatsApp**: Twilio WhatsApp, WhatsApp Business API
  - **Push**: Firebase FCM, OneSignal, Expo Push
  - **In-App**: MongoDB + WebSocket
- ✅ Fallback automático entre proveedores
- ✅ Métricas en tiempo real
- ✅ Webhooks para actualización de estado

### Geolocalización en Tiempo Real

- ✅ Dashboard WebSocket para tracking
- ✅ Notificaciones por proximidad (FAR, APPROACHING, NEAR, ARRIVED)
- ✅ Validación de ubicación en check-in
- ✅ Cálculo de distancia con fórmula Haversine
- ✅ Analytics por ubicación

### Firmas Digitales y PDFs

- ✅ Generación de PDFs con PDFKit
- ✅ Firmas digitales con hash SHA-256
- ✅ QR codes visuales con `qrcode` library
- ✅ Compresión gzip (ahorro 60-80%)
- ✅ Watermark y logo institucional

### Analytics Avanzado

- ✅ Uso por ubicación
- ✅ Mapas de calor (heatmap)
- ✅ Estadísticas generales
- ✅ Análisis por recurso
- ✅ Horas pico y tendencias
- ✅ Paginación en todos los endpoints

---

## 🏗️ Arquitectura

### Stack Tecnológico

- **Framework**: NestJS + TypeScript
- **Base de Datos**: MongoDB + Mongoose
- **Cache**: Redis (distribuido)
- **Mensajería**: RabbitMQ (Event Bus)
- **WebSocket**: Socket.io
- **PDF**: PDFKit
- **QR**: qrcode library
- **Documentación**: Swagger + AsyncAPI

### Patrones Implementados

- ✅ **CQRS**: Separación Commands/Queries
- ✅ **Event-Driven Architecture**: RabbitMQ Event Bus
- ✅ **Repository Pattern**: Acceso a datos
- ✅ **Adapter Pattern**: Proveedores de notificaciones
- ✅ **Strategy Pattern**: Selección de proveedor por tenant
- ✅ **Observer Pattern**: WebSocket subscriptions

### Comunicación con Otros Servicios

```
┌─────────────────┐
│  Auth Service   │──────┐
└─────────────────┘      │
                         │
┌─────────────────┐      │    ┌────────────────────┐
│Availability Svc │──────┼───▶│  Stockpile Service │
└─────────────────┘      │    └────────────────────┘
                         │              │
┌─────────────────┐      │              │
│ Resources Svc   │──────┘              │
└─────────────────┘                     │
                                        ▼
                                  [Event Bus]
```

**Comunicación Request-Response Síncrona**:

- Implementada con Promises sobre Event Bus
- Timeout configurable (5s default)
- Retry automático

---

## 📦 Requisitos

- **Node.js**: v18+
- **MongoDB**: v6.0+
- **Redis**: v7.0+
- **RabbitMQ**: v3.12+

---

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Compilar
npm run build
```

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/bookly-stockpile

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# WebSocket
CORS_ORIGIN=http://localhost:3000
WEBSOCKET_PING_TIMEOUT=60000
WEBSOCKET_PING_INTERVAL=25000
WEBSOCKET_CONNECT_TIMEOUT=45000

# Notificaciones
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
FIREBASE_PROJECT_ID=

# JWT
JWT_SECRET=your-secret-key
```

### Crear Índices MongoDB

```bash
npm run db:create-indexes
```

---

## 📚 API Documentation

### Swagger UI

**URL**: `http://localhost:3004/api/docs`

**Endpoints Principales**:

- **Approval Requests**: 8 endpoints
- **Check-In/Out**: 12 endpoints
- **Notifications**: 6 endpoints
- **Location Analytics**: 4 endpoints
- **Proximity Notifications**: 5 endpoints
- **Reminders**: 3 endpoints

### AsyncAPI (WebSocket)

**Archivo**: `src/infrastructure/gateways/geolocation-dashboard.asyncapi.yaml`

**Namespace**: `/geolocation`

**Eventos**:

- `user-location-update` (client → server)
- `active-users` (server → client)
- `proximity-alert` (server → client)
- `check-in` / `check-out` (server → client)
- `dashboard-stats` (server → client)

### Ejemplos Frontend

Ver: `../../docs/frontend-integration-examples.md`

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov

# Linting
npm run lint
```

---

## 🚀 Deployment

### Desarrollo

```bash
npm run start:dev
```

### Producción

```bash
# Build
npm run build

# Start
npm run start:prod

# Con PM2
pm2 start ecosystem.config.js --env production
```

### Docker

```bash
# Build imagen
docker build -t bookly/stockpile-service .

# Run container
docker run -d \
  -p 3004:3004 \
  --env-file .env.production \
  bookly/stockpile-service
```

### Kubernetes

```bash
kubectl apply -f k8s/stockpile-service/
```

---

## 📊 Métricas y Monitoreo

- **Health Check**: `GET /api/health`
- **Redis Health**: `GET /api/health/redis`
- **Logs**: Winston (JSON structured)
- **Tracing**: OpenTelemetry (opcional)
- **Errors**: Sentry (opcional)

---

## 🔗 Enlaces Relacionados

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [Notification Providers](./docs/NOTIFICATION_PROVIDERS.md)
- [Redis Cache Setup](./docs/REDIS_CACHE_SETUP.md)
- [Frontend Integration Examples](../../docs/frontend-integration-examples.md)
- [Production Deployment Guide](../../DEPLOYMENT_GUIDE.md)

---

## 📝 Licencia

MIT License - Bookly Development Team

**Última actualización**: Noviembre 6, 2025
