# Logger Enhancements - NestJS Integration with Colors

## 📋 Resumen de Mejoras

Se ha actualizado el Logger personalizado de Bookly Mock para integrar el **Logger de NestJS** con **colores ANSI** y **iconos**, mejorando significativamente la legibilidad y experiencia de desarrollo.

## ✨ Nuevas Características

### 1. Integración con NestJS Logger

El logger ahora usa internamente `Logger` de `@nestjs/common`, proporcionando:

- Integración nativa con el ecosistema NestJS
- Mejor manejo de contextos
- Soporte para niveles de log configurables
- Compatibilidad con herramientas de NestJS

### 2. Sistema de Colores ANSI

Colores aplicados según el nivel de log:

| Nivel     | Color       | Icono | Descripción                      |
| --------- | ----------- | ----- | -------------------------------- |
| **ERROR** | 🔴 Rojo     | ❌    | Errores críticos con stack trace |
| **WARN**  | 🟡 Amarillo | ⚠️    | Advertencias y alertas           |
| **INFO**  | 🟢 Verde    | ℹ️    | Información general              |
| **DEBUG** | 🔵 Cyan     | 🔍    | Debugging detallado              |

### 3. Colores Contextuales

#### HTTP Methods

```typescript
GET    → 🟢 Verde
POST   → 🔵 Azul
PUT    → 🟡 Amarillo
PATCH  → 🟡 Amarillo
DELETE → 🔴 Rojo
```

#### HTTP Status Codes

```typescript
2xx → 🟢 Verde   (Success)
3xx → 🔵 Cyan    (Redirect)
4xx → 🟡 Amarillo (Client Error)
5xx → 🔴 Rojo    (Server Error)
```

#### Response Times

```typescript
< 1000ms → 🟢 Verde  (Fast)
≥ 1000ms → 🔴 Rojo   (Slow)
```

## 🎨 Paleta de Colores

### Colores de Primer Plano

```typescript
const colors = {
  reset: "\x1b[0m", // Reset
  bright: "\x1b[1m", // Negrita
  dim: "\x1b[2m", // Atenuado
  red: "\x1b[31m", // Rojo
  green: "\x1b[32m", // Verde
  yellow: "\x1b[33m", // Amarillo
  blue: "\x1b[34m", // Azul
  magenta: "\x1b[35m", // Magenta
  cyan: "\x1b[36m", // Cyan
  white: "\x1b[37m", // Blanco
  gray: "\x1b[90m", // Gris
};
```

### Colores de Fondo

```typescript
bgRed: "\x1b[41m",      // Fondo rojo
bgGreen: "\x1b[42m",    // Fondo verde
bgYellow: "\x1b[43m",   // Fondo amarillo
bgBlue: "\x1b[44m",     // Fondo azul
```

## 📝 Formato de Log Mejorado

### Antes (Sin colores)

```text
2024-01-15T10:30:45.123Z [INFO] [WebSocketTestClient] Connected to server
```

### Después (Con colores e iconos)

```text
ℹ️  2024-01-15T10:30:45.123Z [INFO] [WebSocketTestClient] Connected to server
   ↑         ↑                  ↑          ↑                  ↑
  Icono   Timestamp         Nivel     Contexto           Mensaje
  (verde)   (gris)        (verde)   (magenta)          (brillante)
```

## 🚀 API Mejorada

### Nuevos Métodos

#### `verbose(message: string, data?: any)`

Alias para debug, compatible con NestJS Logger:

```typescript
logger.verbose("Processing batch", { batchSize: 100 });
```

#### `getNestLogger(): NestLogger`

Obtiene la instancia del Logger de NestJS:

```typescript
const nestLogger = logger.getNestLogger();
```

#### `setLogLevels(levels: NestLogLevel[])`

Configura los niveles de log dinámicamente:

```typescript
logger.setLogLevels(["error", "warn", "log"]);
```

### Métodos Mejorados con Colores

#### `logRequest(method, url, userId?)`

```typescript
logger.logRequest("GET", "/api/users", "user-123");
// Output: ℹ️  [timestamp] [INFO] GET /api/users { "userId": "user-123" }
//              Método en verde (GET), resto colorizado
```

#### `logResponse(method, url, statusCode, duration)`

```typescript
logger.logResponse("POST", "/api/users", 201, 150);
// Output: ℹ️  [timestamp] [INFO] POST /api/users - 201 150ms
//              Status en verde (2xx), duración en verde (<1000ms)

logger.logResponse("GET", "/api/users", 500, 2500);
// Output: ❌ [timestamp] [ERROR] GET /api/users - 500 2500ms
//              Status en rojo (5xx), duración en rojo (≥1000ms)
```

#### `logEvent(eventType, data?)`

```typescript
logger.logEvent("USER_CREATED", { userId: "123" });
// Output: ℹ️  [timestamp] [INFO] 📡 Event: USER_CREATED { "userId": "123" }
//              Event type en magenta
```

#### `logQuery(query, params?)`

```typescript
logger.logQuery("SELECT * FROM users WHERE id = ?", { id: 123 });
// Output: 🔍 [timestamp] [DEBUG] 🔎 Query: SELECT * FROM users WHERE id = ?
//              Solo en desarrollo, con icono de búsqueda
```

## 🔧 Ejemplos de Uso

### Logging Básico

```typescript
import { createLogger } from "@libs/common/src/utils/logger.util";

const logger = createLogger("UserService");

// Info con colores
logger.info("User registered successfully", { userId: "123" });

// Warning con icono amarillo
logger.warn("API rate limit approaching", { remaining: 10 });

// Error con stack trace en rojo
try {
  throw new Error("Database connection failed");
} catch (error) {
  logger.error("Failed to connect to database", error);
}

// Debug solo en desarrollo (cyan)
logger.debug("Cache hit", { key: "user:123", ttl: 3600 });
```

### HTTP Request/Response

```typescript
// Request logging
logger.logRequest("POST", "/api/v1/auth/login", "guest");
// Output: ℹ️  [timestamp] [INFO] POST /api/v1/auth/login { "userId": "guest" }
//              POST en azul

// Response logging
logger.logResponse("POST", "/api/v1/auth/login", 200, 145);
// Output: ℹ️  [timestamp] [INFO] POST /api/v1/auth/login - 200 145ms
//              200 en verde, 145ms en verde (rápido)
```

### Event Logging

```typescript
// Event con tipo colorizado
logger.logEvent("RESERVATION_CREATED", {
  resourceId: "lab-101",
  userId: "user-456",
  startTime: new Date(),
});
// Output: ℹ️  [timestamp] [INFO] 📡 Event: RESERVATION_CREATED {...}
//              RESERVATION_CREATED en magenta
```

### Database Query Logging

```typescript
// Query debugging (solo desarrollo)
logger.logQuery("SELECT * FROM reservations WHERE user_id = $1 AND date > $2", {
  userId: "123",
  date: "2024-01-15",
});
// Output: 🔍 [timestamp] [DEBUG] 🔎 Query: SELECT * FROM reservations...
```

## 🎯 Beneficios

### 1. Mejor Legibilidad

- **Colores** facilitan identificar el tipo de log rápidamente
- **Iconos** proporcionan indicadores visuales instantáneos
- **Formato estructurado** con timestamps y contextos claros

### 2. Debugging Más Eficiente

- Los errores destacan en **rojo** con ❌
- Las advertencias llaman la atención en **amarillo** con ⚠️
- Los logs de debug son **discretos** en cyan con 🔍

### 3. Monitoreo en Tiempo Real

- **HTTP methods** colorizados según el tipo de operación
- **Status codes** con colores según rango (2xx, 4xx, 5xx)
- **Tiempos de respuesta** alertan sobre lentitud (>1s en rojo)

### 4. Integración NestJS

- Compatibilidad total con módulos NestJS
- Configuración de niveles de log dinámica
- Manejo consistente de contextos

## 📊 Comparación Antes/Después

### Antes (Console Simple)

```text
2024-01-15T10:30:45.123Z [ERROR] [AuthService] Login failed
2024-01-15T10:30:46.234Z [WARN] [AuthService] Rate limit warning
2024-01-15T10:30:47.345Z [INFO] [AuthService] User logged in
2024-01-15T10:30:48.456Z [DEBUG] [AuthService] Token validated
```

### Después (Con Colores e Iconos)

```text
❌ 2024-01-15T10:30:45.123Z [ERROR] [AuthService] Login failed
⚠️  2024-01-15T10:30:46.234Z [WARN] [AuthService] Rate limit warning
ℹ️  2024-01-15T10:30:47.345Z [INFO] [AuthService] User logged in
🔍 2024-01-15T10:30:48.456Z [DEBUG] [AuthService] Token validated
```

## 🔍 Testing

### Verificar Colores en Terminal

```bash
# Ejecutar cualquier script con logger
cd bookly-mock
npm run start:auth

# Deberías ver logs con colores e iconos
# Si no se ven colores, verificar:
# - Terminal con soporte ANSI
# - NO_COLOR no está configurado
# - NODE_DISABLE_COLORS no está configurado
```

### Deshabilitar Colores

```bash
# Opción 1: Variable de entorno
export NO_COLOR=1
npm run start:auth

# Opción 2: En código
process.env.NO_COLOR = '1';
```

## 🛠️ Configuración Avanzada

### Niveles de Log Personalizados

```typescript
const logger = createLogger("MyService");

// Producción: solo errores y warnings
if (process.env.NODE_ENV === "production") {
  logger.setLogLevels(["error", "warn"]);
}

// Desarrollo: todos los niveles
if (process.env.NODE_ENV === "development") {
  logger.setLogLevels(["error", "warn", "log", "debug", "verbose"]);
}
```

### Acceso al Logger de NestJS

```typescript
const logger = createLogger("MyService");
const nestLogger = logger.getNestLogger();

// Usar métodos nativos de NestJS si es necesario
nestLogger.setContext("NewContext");
```

## 📚 Referencias

- [NestJS Logger Documentation](https://docs.nestjs.com/techniques/logger)
- [ANSI Escape Codes](https://en.wikipedia.org/wiki/ANSI_escape_code)
- [Terminal Color Standards](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors)

## ✅ Checklist de Migración

- [x] Integrar Logger de NestJS
- [x] Implementar sistema de colores ANSI
- [x] Agregar iconos por nivel de log
- [x] Colorizar HTTP methods y status codes
- [x] Colorizar tiempos de respuesta
- [x] Agregar método `verbose()`
- [x] Agregar método `getNestLogger()`
- [x] Agregar método `setLogLevels()`
- [x] Actualizar documentación
- [x] Mantener compatibilidad con API existente

---

**Fecha de Actualización:** 2024-01-15  
**Versión:** 2.0.0  
**Estado:** ✅ Completado
