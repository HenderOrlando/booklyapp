# Changelog - Logger Enhancements

## [2.0.0] - 2024-01-15

### 🎉 Major Changes

#### Integración con NestJS Logger

- Reemplazado `console.*` directo con `Logger` de `@nestjs/common`
- Mejor integración con el ecosistema NestJS
- Soporte para configuración dinámica de log levels
- Acceso al logger nativo de NestJS mediante `getNestLogger()`

#### Sistema de Colores ANSI

- Implementados colores ANSI para terminal
- Paleta completa de colores: red, green, yellow, blue, magenta, cyan, gray
- Colores contextuales según el tipo de log
- Soporte para colores de fondo (bgRed, bgGreen, etc.)

#### Iconos Visuales

- ❌ ERROR - Rojo
- ⚠️ WARN - Amarillo
- ℹ️ INFO - Verde
- 🔍 DEBUG - Cyan
- 📝 DEFAULT - Blanco

### ✨ New Features

#### Método `verbose()`

```typescript
logger.verbose("Processing batch", { batchSize: 100 });
```

- Alias para `debug()`, compatible con NestJS Logger
- Útil para logs muy detallados en desarrollo

#### Método `getNestLogger()`

```typescript
const nestLogger = logger.getNestLogger();
nestLogger.setContext("NewContext");
```

- Acceso directo al Logger de NestJS
- Permite usar métodos nativos de NestJS

#### Método `setLogLevels()`

```typescript
logger.setLogLevels(["error", "warn", "log"]);
```

- Configuración dinámica de niveles de log
- Útil para ajustar verbosidad según ambiente

### 🎨 Enhanced Features

#### HTTP Request Logging

```typescript
logger.logRequest("POST", "/api/users", "user-123");
```

- **Métodos HTTP colorizados:**
  - GET → Verde
  - POST → Azul
  - PUT/PATCH → Amarillo
  - DELETE → Rojo

#### HTTP Response Logging

```typescript
logger.logResponse("POST", "/api/users", 201, 150);
```

- **Status codes colorizados:**
  - 2xx → Verde (Success)
  - 3xx → Cyan (Redirect)
  - 4xx → Amarillo (Client Error)
  - 5xx → Rojo (Server Error)
- **Response times colorizados:**
  - < 1000ms → Verde (Fast)
  - ≥ 1000ms → Rojo (Slow)

#### Event Logging

```typescript
logger.logEvent("USER_CREATED", { userId: "123" });
```

- Tipo de evento colorizado en magenta
- Icono 📡 para identificación visual
- Datos estructurados en JSON

#### Query Logging

```typescript
logger.logQuery("SELECT * FROM users WHERE id = ?", { id: 123 });
```

- Icono 🔎 para queries de base de datos
- Solo se muestra en modo desarrollo
- Formato estructurado con parámetros

### 🔧 Technical Improvements

#### Formato Mejorado

```text
Antes:
2024-01-15T10:30:45.123Z [INFO] [UserService] User created

Después:
ℹ️  2024-01-15T10:30:45.123Z [INFO] [UserService] User created
   ↑         ↑                  ↑          ↑           ↑
  Icono   Timestamp         Nivel     Contexto    Mensaje
  (verde)   (gris)        (verde)   (magenta)   (brillante)
```

#### Stack Traces Mejorados

```typescript
logger.error("Database error", error);
```

- Stack trace completo en logs de error
- Color rojo para destacar errores críticos
- Formato estructurado con contexto

#### Datos Estructurados

```typescript
logger.info("User registered", {
  userId: "123",
  email: "user@example.com",
  roles: ["STUDENT", "MONITOR"],
});
```

- JSON formateado con 2 espacios
- Mejor legibilidad de objetos complejos
- Preserve structure en producción

### 📝 Files Changed

#### Modified

- `libs/common/src/utils/logger.util.ts`
  - +150 líneas (colores, iconos, métodos nuevos)
  - Integración completa con NestJS Logger
  - Sistema de colores ANSI implementado

- `package.json`
  - Agregados scripts: `test:logger`, `test:logger:colors`

#### Created

- `scripts/test-logger-colors.ts`
  - Script de demostración completo
  - 10 escenarios de uso diferentes
  - Output visual con todos los colores

- `docs/LOGGER_ENHANCEMENTS.md`
  - Documentación completa de mejoras
  - Ejemplos de uso detallados
  - Guía de referencia de colores

- `scripts/README.md`
  - Documentación de scripts
  - Guía de troubleshooting
  - Referencias de colores

- `docs/CHANGELOG_LOGGER.md`
  - Este archivo (changelog)

### 🎯 Benefits

#### Desarrollo

- ✅ Identificación visual instantánea de tipos de log
- ✅ Debugging más eficiente con colores contextuales
- ✅ Mejor legibilidad en logs extensos
- ✅ Iconos facilitan escaneo visual rápido

#### Producción

- ✅ Logging estructurado compatible con agregadores
- ✅ Stack traces completos para debugging
- ✅ Configuración dinámica de niveles
- ✅ Integración nativa con NestJS

#### Performance

- ✅ Sin overhead significativo (solo strings ANSI)
- ✅ Colores se deshabilitan automáticamente en producción si es necesario
- ✅ Debug logs solo en desarrollo (NODE_ENV)

### 🔄 Migration Guide

#### API Completamente Compatible

```typescript
// Código existente funciona sin cambios
const logger = createLogger("MyService");
logger.info("Message");
logger.error("Error", error);
logger.warn("Warning", { data: 123 });
logger.debug("Debug info");
```

#### Nuevas Características Opcionales

```typescript
// Usar nuevos métodos si se desea
logger.verbose("Verbose message"); // Nuevo
logger.setLogLevels(["error", "warn"]); // Nuevo
const nestLogger = logger.getNestLogger(); // Nuevo
```

#### Sin Breaking Changes

- ✅ Todos los métodos existentes funcionan igual
- ✅ Parámetros sin cambios
- ✅ Comportamiento idéntico (con colores añadidos)
- ✅ No requiere cambios en código existente

### 📊 Statistics

| Métrica            | Antes | Después | Mejora |
| ------------------ | ----- | ------- | ------ |
| Líneas de código   | 107   | 254     | +137%  |
| Métodos públicos   | 8     | 11      | +37.5% |
| Colores soportados | 0     | 10+     | ∞      |
| Iconos             | 0     | 5       | ∞      |
| Formatos de log    | 1     | 1       | =      |
| Compatibilidad     | ✅    | ✅      | =      |

### 🧪 Testing

#### Automated Tests

```bash
# Ejecutar demo completo
npm run test:logger

# Verificar colores en terminal
npm run start:auth
npm run start:resources
```

#### Manual Testing

```bash
# Test individual de cada nivel
ts-node -e "
const { createLogger } = require('./libs/common/src/utils/logger.util');
const logger = createLogger('Test');
logger.error('Test error', new Error('Test'));
logger.warn('Test warning');
logger.info('Test info');
logger.debug('Test debug');
"
```

### 📚 References

- [NestJS Logger Documentation](https://docs.nestjs.com/techniques/logger)
- [ANSI Escape Codes](https://en.wikipedia.org/wiki/ANSI_escape_code)
- [Terminal Colors Guide](https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797)

### 🙏 Acknowledgments

- NestJS team por el excelente Logger base
- ANSI color standards para la especificación de colores
- Bookly team por el feedback y testing

---

## [1.0.0] - 2024-01-14

### Initial Release

- Logger básico con `console.*`
- Niveles: ERROR, WARN, INFO, DEBUG
- Métodos helper: logRequest, logResponse, logEvent, logQuery
- Formato estructurado con timestamps

---

**Mantenedor:** Bookly Development Team  
**Licencia:** MIT  
**Última actualización:** 2024-01-15
