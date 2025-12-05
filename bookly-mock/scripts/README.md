# Bookly Mock - Scripts

Scripts utilitarios para desarrollo, testing y mantenimiento de Bookly Mock.

## 📋 Scripts Disponibles

### 🔧 Scripts de Utilidad

#### fix-imports-syntax.js

Corrige problemas de sintaxis en imports (comillas inconsistentes).

**Ejecutar:**
```bash
node scripts/fix-imports-syntax.js
```

**Función:**
- Corrige comillas inconsistentes en imports
- Procesa archivos en `apps/` y `libs/`
- Reporta archivos corregidos

---

#### fix-imports.ts

Refactoriza imports relativos a alias de TypeScript.

**Ejecutar:**
```bash
ts-node scripts/fix-imports.ts
```

**Función:**
- Convierte rutas relativas (../../) a alias (@auth, @resources, etc.)
- Procesa todos los microservicios
- Muestra estadísticas de archivos modificados

---

#### fix-imports-paths.sh

Corrige paths de @libs/* removiendo /src/ y archivos específicos.

**Ejecutar:**
```bash
bash scripts/fix-imports-paths.sh
```

**Función:**
- Corrige imports de @libs/common, @libs/decorators, @libs/guards, etc.
- Remueve referencias a /src/ en paths
- Normaliza imports de librerías compartidas

---

#### fix-tsconfig-rootdir.sh

Corrige configuraciones de rootDir en tsconfig.json de microservicios.

**Ejecutar:**
```bash
bash scripts/fix-tsconfig-rootdir.sh
```

---

#### test-pattern.js

Utilidad para testing de patrones.

**Ejecutar:**
```bash
node scripts/test-pattern.js
```

---

### 🚀 Scripts de Inicio

#### start-all-services.sh

Inicia todos los microservicios simultáneamente.

**Ejecutar:**
```bash
bash scripts/start-all-services.sh
```

**Función:**
- Inicia los 6 microservicios en modo watch
- Útil para desarrollo local

---

#### start-all-prod.sh

Inicia todos los microservicios en modo producción.

**Ejecutar:**
```bash
bash scripts/start-all-prod.sh
```

**Función:**
- Build optimizado de todos los servicios
- Modo producción sin watch
- Configuración para deployment

---

### 🧪 Testing & Validación

#### test-logger-colors.ts

Script de demostración del Logger mejorado con colores e iconos.

**Ejecutar:**

```bash
npm run test:logger
# o
npm run test:logger:colors
# o directamente
ts-node scripts/test-logger-colors.ts
```

**Demuestra:**

- ✅ Niveles de log con colores e iconos (ERROR, WARN, INFO, DEBUG)
- 📡 HTTP Request/Response logging con colores contextuales
- 📊 Status codes colorizados (2xx verde, 4xx amarillo, 5xx rojo)
- ⏱️ Tiempos de respuesta colorizados (< 1s verde, ≥ 1s rojo)
- 🎯 Event logging con tipos colorizados
- 🔎 Database query logging (solo en desarrollo)
- 💾 Datos estructurados con formato JSON
- 🚀 Flujo completo de ejemplo (reserva de recurso)
- ❌ Manejo de errores con stack traces
- 📊 Métricas de rendimiento

**Output esperado:**

- Logs con **colores ANSI** según el nivel
- **Iconos** visuales (❌ ERROR, ⚠️ WARN, ℹ️ INFO, 🔍 DEBUG)
- **Métodos HTTP** colorizados (GET verde, POST azul, DELETE rojo)
- **Status codes** colorizados según rango
- **Timestamps** en gris para menor distracción
- **Contextos** en magenta para identificación rápida
- **Mensajes** en brillante para destacar contenido

---

#### seed-events-for-replay.ts

Pobla el Event Store con eventos de prueba para testing de Event Replay.

**Ejecutar:**

```bash
ts-node scripts/seed-events-for-replay.ts
```

**Función:**

- Genera 1000 eventos de prueba
- Crea snapshots para agregados
- Muestra progreso y estadísticas
- Útil para testing de event sourcing y replay

**Variables de entorno:**

- `MONGODB_GATEWAY_URI`: URI de MongoDB para el API Gateway
- `RABBITMQ_URL`: URL de RabbitMQ

**Output:**

- Barra de progreso durante la generación
- Estadísticas finales (total eventos, tipos, servicios, agregados)
- Confirmación de snapshots creados

---

#### test-websocket-client.ts

Cliente de prueba para WebSocket con subscripciones a múltiples canales.

**Ejecutar:**

```bash
ts-node scripts/test-websocket-client.ts
```

**Variables de entorno:**

- `WEBSOCKET_URL`: URL del servidor WebSocket (default: `http://localhost:3000/api/v1/ws`)
- `USER_ID`: ID del usuario de prueba (default: `test-user-123`)

**Función:**

- Conecta al servidor WebSocket
- Se subscribe a canales: events, dlq, dashboard, notifications, logs
- Escucha eventos en tiempo real
- Prueba notificaciones (get, mark as read)
- Logging con colores del Logger mejorado

**Canales subscriptos:**

- `events`: Eventos del Event Bus
- `dlq`: Eventos de Dead Letter Queue
- `dashboard`: Métricas del dashboard
- `notifications`: Notificaciones en tiempo real
- `logs`: Logs del sistema

---

## 🎨 Logger con Colores

Todos los scripts usan el Logger mejorado de Bookly Mock que incluye:

### Características

- ✅ Integración con NestJS Logger
- 🎨 Colores ANSI según nivel de log
- 🔤 Iconos visuales por tipo de log
- 📊 Colores contextuales para HTTP (methods, status, timing)
- 💾 Formato estructurado con timestamps
- 🔍 Debug mode solo en desarrollo

### Paleta de Colores

| Elemento  | Color       | Uso                 |
| --------- | ----------- | ------------------- |
| ERROR     | 🔴 Rojo     | Errores críticos    |
| WARN      | 🟡 Amarillo | Advertencias        |
| INFO      | 🟢 Verde    | Información         |
| DEBUG     | 🔵 Cyan     | Debugging           |
| Timestamp | Gris        | Timestamps          |
| Context   | Magenta     | Nombre del contexto |
| Message   | Brillante   | Mensaje principal   |

### HTTP Colors

| Método    | Color       |
| --------- | ----------- |
| GET       | 🟢 Verde    |
| POST      | 🔵 Azul     |
| PUT/PATCH | 🟡 Amarillo |
| DELETE    | 🔴 Rojo     |

| Status Code      | Color       |
| ---------------- | ----------- |
| 2xx Success      | 🟢 Verde    |
| 3xx Redirect     | 🔵 Cyan     |
| 4xx Client Error | 🟡 Amarillo |
| 5xx Server Error | 🔴 Rojo     |

| Response Time | Color    |
| ------------- | -------- |
| < 1000ms      | 🟢 Verde |
| ≥ 1000ms      | 🔴 Rojo  |

---

## 📚 Documentación

Para más información sobre el Logger y sus características:

- [LOGGER_ENHANCEMENTS.md](../docs/LOGGER_ENHANCEMENTS.md) - Guía completa del Logger mejorado
- [LOGGER_STANDARDIZATION.md](../docs/LOGGER_STANDARDIZATION.md) - Proceso de estandarización

---

## 🚀 Uso en Desarrollo

### Probar Logger con Colores

```bash
# Ejecutar demo completo
npm run test:logger

# Ver logs de un microservicio
npm run start:auth
npm run start:resources
npm run start:availability
```

### Testing de WebSocket

```bash
# Terminal 1: Iniciar API Gateway
npm run start:gateway

# Terminal 2: Conectar cliente WebSocket
ts-node scripts/test-websocket-client.ts
```

### Poblar Event Store

```bash
# Asegurarse que MongoDB y RabbitMQ estén corriendo
npm run docker:up

# Ejecutar seeding
ts-node scripts/seed-events-for-replay.ts
```

---

## 🔧 Troubleshooting

### Los colores no se muestran

- Verificar que el terminal soporte ANSI colors
- Comprobar que `NO_COLOR` no esté configurado
- Revisar que `NODE_DISABLE_COLORS` no esté configurado

### Error "Cannot find module"

```bash
# Instalar dependencias
npm install

# Regenerar node_modules si es necesario
rm -rf node_modules package-lock.json
npm install
```

### WebSocket connection failed

- Verificar que el API Gateway esté corriendo en puerto 3000
- Comprobar la variable `WEBSOCKET_URL`
- Revisar logs del API Gateway

### MongoDB connection error

- Verificar que MongoDB esté corriendo
- Comprobar `MONGODB_GATEWAY_URI` en variables de entorno
- Revisar configuración de Docker

---

**Versión:** 2.0.0  
**Actualizado:** 2024-01-15
