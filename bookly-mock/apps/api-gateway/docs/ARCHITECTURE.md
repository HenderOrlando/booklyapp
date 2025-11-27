# 🏗️ API Gateway - Arquitectura

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [🏗️ API Gateway - Arquitectura](#️-api-gateway---arquitectura)
  - [📋 Índice](#-índice)
  - [🎯 Visión General](#-visión-general)
    - [Puerto](#puerto)
  - [📐 Responsabilidades](#-responsabilidades)
    - [1. Routing](#1-routing)
    - [2. Autenticación y Autorización](#2-autenticación-y-autorización)
    - [3. Funcionalidades Transversales](#3-funcionalidades-transversales)
    - [4. Monitoreo](#4-monitoreo)
  - [📊 Diagrama de Arquitectura](#-diagrama-de-arquitectura)
  - [🧩 Componentes Principales](#-componentes-principales)
    - [Middlewares](#middlewares)
      - [1. AuthMiddleware](#1-authmiddleware)
      - [2. PathTraversalGuardMiddleware](#2-pathtraversalguardmiddleware)
      - [3. RateLimitMiddleware](#3-ratelimitmiddleware)
      - [4. LoggingMiddleware](#4-loggingmiddleware)
    - [Services](#services)
      - [HealthAggregatorService](#healthaggregatorservice)
      - [ProxyService](#proxyservice)
  - [🔄 Patrones Implementados](#-patrones-implementados)
    - [API Gateway Pattern](#api-gateway-pattern)
    - [Circuit Breaker](#circuit-breaker)
    - [Load Balancing](#load-balancing)
  - [🌐 Routing y Load Balancing](#-routing-y-load-balancing)
    - [Service Discovery](#service-discovery)
    - [Proxy Configuration](#proxy-configuration)
  - [🔗 Comunicación con Microservicios](#-comunicación-con-microservicios)
    - [Microservicios Backend](#microservicios-backend)
      - [1. Auth Service (Port 3001)](#1-auth-service-port-3001)
      - [2. Resources Service (Port 3002)](#2-resources-service-port-3002)
      - [3. Availability Service (Port 3003)](#3-availability-service-port-3003)
      - [4. Stockpile Service (Port 3004)](#4-stockpile-service-port-3004)
      - [5. Reports Service (Port 3005)](#5-reports-service-port-3005)
    - [Service Discovery](#service-discovery-1)
    - [Manejo de Fallos](#manejo-de-fallos)
  - [🔒 Seguridad](#-seguridad)
    - [1. Autenticación JWT](#1-autenticación-jwt)
    - [2. Rate Limiting](#2-rate-limiting)
    - [3. Path Traversal Protection](#3-path-traversal-protection)
    - [4. Security Headers](#4-security-headers)
  - [⚡ Cache y Performance](#-cache-y-performance)
    - [Estrategias de Cache](#estrategias-de-cache)
    - [Compression](#compression)
    - [Connection Pooling](#connection-pooling)
    - [Performance Optimizations](#performance-optimizations)
  - [📊 Monitoreo y Observabilidad](#-monitoreo-y-observabilidad)
    - [Métricas Recopiladas](#métricas-recopiladas)
      - [Request Metrics](#request-metrics)
      - [Service Health Metrics](#service-health-metrics)
    - [Logging](#logging)
    - [Alertas](#alertas)
    - [Dashboards](#dashboards)
  - [📚 Documentación Relacionada](#-documentación-relacionada)

---

## 🎯 Visión General

El **API Gateway** es el punto de entrada único para todas las solicitudes externas al sistema Bookly. Actúa como proxy inverso, enrutando peticiones a los microservicios correspondientes y proporcionando funcionalidades transversales.

### Puerto

- **Development**: 3000
- **Production**: 3000 (interno), expuesto vía Nginx

---

## 📐 Responsabilidades

### 1. Routing

Enrutamiento inteligente de peticiones a microservicios:

- `/api/auth/*` → Auth Service (3001)
- `/api/resources/*` → Resources Service (3002)
- `/api/availability/*` → Availability Service (3003)
- `/api/approvals/*` → Stockpile Service (3004)
- `/api/reports/*` → Reports Service (3005)

### 2. Autenticación y Autorización

- Validación de tokens JWT
- Verificación de permisos
- Refresh de tokens
- Rate limiting por usuario

### 3. Funcionalidades Transversales

- **Health Checks Agregados**: `/api/v1/health/aggregated`
- **Request Logging**: Winston structured logs
- **Error Handling**: Manejo global de errores
- **CORS**: Configuración flexible
- **Compression**: Gzip para responses
- **Security Headers**: Helmet.js

### 4. Monitoreo

- Métricas de latencia por microservicio
- Conteo de requests por endpoint
- Detección de microservicios caídos
- Alertas automáticas

---

## 📊 Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                         Clientes                             │
│         (Web App, Mobile App, External Systems)              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                      API Gateway (Port 3000)                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐   │
│  │ Auth Middleware│  │ Rate Limiting  │  │  Logging      │   │
│  └────────────────┘  └────────────────┘  └───────────────┘   │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐   │
│  │ Path Traversal │  │Circuit Breaker │  │Health Checks  │   │
│  │   Protection   │  │                │  │   Aggregator  │   │
│  └────────────────┘  └────────────────┘  └───────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           HTTP Proxy Middleware                      │    │
│  │         (http-proxy-middleware)                      │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┬────────┐
         ▼               ▼               ▼              ▼        ▼
    ┌─────────┐    ┌──────────┐   ┌────────────┐ ┌──────────┐ ┌─────────┐
    │  Auth   │    │Resources │   │Availability│ │Stockpile │ │ Reports │
    │ Service │    │ Service  │   │  Service   │ │ Service  │ │ Service │
    │ :3001   │    │  :3002   │   │   :3003    │ │  :3004   │ │  :3005  │
    └─────────┘    └──────────┘   └────────────┘ └──────────┘ └─────────┘
```

---

## 🧩 Componentes Principales

### Middlewares

#### 1. AuthMiddleware

- Validación de tokens JWT
- Extracción de información de usuario
- Verificación de permisos
- Refresh automático de tokens

#### 2. PathTraversalGuardMiddleware

- Bloqueo de patrones maliciosos (`../`, `%2e%2e`)
- Protección contra archivos sensibles (PHP, ASP, JSP)
- Prevención de acceso a rutas del sistema
- Logging de intentos de ataque

#### 3. RateLimitMiddleware

- Límite global: 100 req/min por IP
- Límite por usuario: 1000 req/hora
- Límite en login: 5 intentos/15 min
- Sliding window algorithm

#### 4. LoggingMiddleware

- Request logging estructurado (Winston)
- Inyección de Request ID único
- Tracking de latencia
- Error logging con stack traces

### Services

#### HealthAggregatorService

- Polling periódico de microservicios (cada 30s)
- Cache de estado de servicios
- Detección de servicios degradados
- Generación de reportes consolidados

#### ProxyService

- Enrutamiento dinámico a microservicios
- Retry logic (máx 3 intentos)
- Timeout management (30s)
- Header injection (X-Forwarded-\*, X-Request-ID)

---

## 🔄 Patrones Implementados

### API Gateway Pattern

Patrón de diseño que centraliza el acceso a microservicios.

```
Cliente → API Gateway → Microservicio
```

### Circuit Breaker

Prevención de cascading failures cuando un microservicio falla.

```typescript
// Configuración Circuit Breaker
{
  timeout: 10000,        // 10 segundos
  errorThreshold: 50,    // 50% de errores
  resetTimeout: 30000    // Reintentar después de 30s
}
```

### Load Balancing

Distribución de carga entre instancias de microservicios.

- **Estrategia**: Round Robin
- **Health Checks**: Cada 30 segundos
- **Retry Logic**: Máximo 3 intentos

---

## 🌐 Routing y Load Balancing

### Service Discovery

```typescript
const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    healthCheck: "/api/v1/health",
  },
  resources: {
    url: process.env.RESOURCES_SERVICE_URL || "http://localhost:3002",
    healthCheck: "/api/v1/health",
  },
  availability: {
    url: process.env.AVAILABILITY_SERVICE_URL || "http://localhost:3003",
    healthCheck: "/api/v1/health",
  },
  stockpile: {
    url: process.env.STOCKPILE_SERVICE_URL || "http://localhost:3004",
    healthCheck: "/api/v1/health",
  },
  reports: {
    url: process.env.REPORTS_SERVICE_URL || "http://localhost:3005",
    healthCheck: "/api/v1/health",
  },
};
```

### Proxy Configuration

- **http-proxy-middleware**: Proxy HTTP
- **Timeout**: 30 segundos
- **Retry**: 2 intentos automáticos
- **KeepAlive**: Conexiones persistentes

---

## 🔗 Comunicación con Microservicios

### Microservicios Backend

El API Gateway se comunica con los siguientes microservicios:

#### 1. Auth Service (Port 3001)

**Propósito**: Autenticación, autorización y gestión de usuarios

**Endpoints Proxied**:

- Autenticación (login, register, logout)
- Gestión de roles y permisos
- Perfil de usuario
- SSO con Google Workspace

**Dependencia**: Crítica - Sin auth-service no hay autenticación

#### 2. Resources Service (Port 3002)

**Propósito**: Gestión de recursos físicos (salas, equipos, labs)

**Endpoints Proxied**:

- CRUD de recursos
- Categorías de recursos
- Mantenimiento de recursos
- Atributos técnicos

**Dependencia**: Alta - Core del sistema de reservas

#### 3. Availability Service (Port 3003)

**Propósito**: Disponibilidad, horarios y reservas

**Endpoints Proxied**:

- Gestión de reservas
- Consulta de disponibilidad
- Búsqueda avanzada
- Integración con calendarios

**Dependencia**: Alta - Core del sistema de reservas

#### 4. Stockpile Service (Port 3004)

**Propósito**: Aprobaciones, flujos y notificaciones

**Endpoints Proxied**:

- Solicitudes de aprobación
- Generación de documentos
- Notificaciones multi-canal
- Check-in/Check-out

**Dependencia**: Media - Funcionalidad administrativa

#### 5. Reports Service (Port 3005)

**Propósito**: Reportes, dashboards y analytics

**Endpoints Proxied**:

- Reportes de uso
- Dashboards interactivos
- Feedback de usuarios
- Exportación de datos

**Dependencia**: Baja - Funcionalidad de análisis

### Service Discovery

```typescript
const serviceRegistry = {
  auth: {
    url: process.env.AUTH_SERVICE_URL,
    healthCheck: "/api/v1/health",
    priority: 1, // Crítico
  },
  resources: {
    url: process.env.RESOURCES_SERVICE_URL,
    healthCheck: "/api/v1/health",
    priority: 1, // Crítico
  },
  availability: {
    url: process.env.AVAILABILITY_SERVICE_URL,
    healthCheck: "/api/v1/health",
    priority: 1, // Crítico
  },
  stockpile: {
    url: process.env.STOCKPILE_SERVICE_URL,
    healthCheck: "/api/v1/health",
    priority: 2, // Importante
  },
  reports: {
    url: process.env.REPORTS_SERVICE_URL,
    healthCheck: "/api/v1/health",
    priority: 3, // Opcional
  },
};
```

### Manejo de Fallos

**Circuit Breaker Pattern**:

- Abre circuito después de 50% errores
- Timeout: 10 segundos por request
- Reset automático después de 30 segundos
- Fallback a respuesta en cache si disponible

**Retry Logic**:

- Máximo 3 intentos
- Backoff exponencial (100ms, 200ms, 400ms)
- Solo reintentar en errores 5xx
- No reintentar en 4xx (errores de cliente)

---

## 🔒 Seguridad

### 1. Autenticación JWT

Validación de tokens en cada request protegido.

### 2. Rate Limiting

- **Global**: 100 requests/minuto por IP
- **Por Usuario**: 1000 requests/hora
- **Login**: 5 intentos/15 minutos

### 3. Path Traversal Protection

Middleware que bloquea:

- `../`, `%2e%2e`
- Archivos PHP, ASP, JSP
- Rutas del sistema (`/etc/passwd`, etc.)

### 4. Security Headers

```typescript
helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true,
});
```

---

## ⚡ Cache y Performance

### Estrategias de Cache

**Redis Cache** para:

1. **Health Check Status**: TTL = 30 segundos

   ```typescript
   const cacheKey = `health:${serviceName}`;
   // Evita polling excesivo a microservicios
   ```

2. **Service Configuration**: TTL = 5 minutos

   ```typescript
   const cacheKey = `config:services`;
   // Configuración de routing y discovery
   ```

3. **JWT Token Validation**: TTL = Variable (según expiry)

   ```typescript
   const cacheKey = `jwt:valid:${tokenHash}`;
   // Cache de tokens ya validados
   ```

4. **Rate Limit Counters**: TTL = Basado en ventana
   ```typescript
   const cacheKey = `ratelimit:${userId}:${window}`;
   // Sliding window counters
   ```

### Compression

- **Gzip**: Automático para responses > 1KB
- **Brotli**: Para navegadores compatibles
- **Nivel**: 6 (balance entre velocidad y ratio)
- **Exclusiones**: Imágenes, videos ya comprimidos

### Connection Pooling

```typescript
const proxyConfig = {
  agent: new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 60000,
    maxSockets: 50,
    maxFreeSockets: 10,
  }),
};
```

### Performance Optimizations

- **Request Deduplication**: Coalesce de requests idénticas simultáneas
- **Response Streaming**: Streaming para requests grandes
- **Lazy Loading**: Carga diferida de middlewares no críticos
- **Worker Threads**: Procesamiento paralelo de health checks

---

## 📊 Monitoreo y Observabilidad

### Métricas Recopiladas

#### Request Metrics

```typescript
{
  requestCount: number,         // Total de requests
  requestDuration: number,      // Latencia promedio
  requestsByService: {          // Requests por servicio
    auth: number,
    resources: number,
    ...
  },
  errorRate: number             // Porcentaje de errores
}
```

#### Service Health Metrics

```typescript
{
  serviceStatus: {
    auth: { status: 'up', responseTime: 45ms },
    resources: { status: 'up', responseTime: 32ms },
    ...
  },
  degradedServices: string[],   // Servicios degradados
  downServices: string[]        // Servicios caídos
}
```

### Logging

**Winston** structured logging:

```typescript
logger.info("Request proxied", {
  requestId: req.id,
  method: req.method,
  path: req.path,
  targetService: "auth",
  duration: 123,
  statusCode: 200,
  userId: req.user?.id,
});
```

**Log Levels**:

- `error`: Errores críticos y fallos de servicio
- `warn`: Rate limiting, circuit breaker activado
- `info`: Requests normales, health checks
- `debug`: Detalles de routing, cache hits/misses

### Alertas

**Criterios de Alerta**:

1. **Servicio Caído**
   - Trigger: Health check falla 3 veces consecutivas
   - Acción: Notificación inmediata, activar circuit breaker

2. **Alta Latencia**
   - Trigger: P95 > 1000ms por 5 minutos
   - Acción: Alerta warning

3. **Alta Tasa de Errores**
   - Trigger: Error rate > 5% por 2 minutos
   - Acción: Alerta crítica

4. **Rate Limit Exceeded**
   - Trigger: >100 requests bloqueados/minuto
   - Acción: Log warning, revisar patrones

### Dashboards

**Métricas en Tiempo Real**:

- Requests por segundo (RPS)
- Latencia P50, P95, P99
- Error rate por servicio
- Estado de health checks
- Uso de cache (hit/miss ratio)
- Rate limiting activations

---

## 📚 Documentación Relacionada

- [Endpoints](ENDPOINTS.md)
- [Advanced Patterns](ADVANCED_PATTERNS.md)
- [Hybrid Architecture](HYBRID_ARCHITECTURE.md)
- [Redis JWT Integration](REDIS_JWT_INTEGRATION.md)

---

**Mantenedor**: Bookly Development Team  
**Última Actualización**: Noviembre 6, 2025
