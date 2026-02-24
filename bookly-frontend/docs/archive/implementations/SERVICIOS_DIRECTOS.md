# 🔧 Configuración de Servicios Directos (Bypass API Gateway)

**Fecha**: 23 de Noviembre de 2025  
**Estado**: ✅ Implementado y Funcional

---

## 📊 Resumen

Se ha implementado la funcionalidad para conectar el frontend directamente a los microservicios, bypasseando el API Gateway. Esto resuelve temporalmente los problemas de circuit breaker mientras se arregla el backend.

---

## 🎯 Objetivo

Permitir que el frontend pueda conectarse directamente a los puertos de cada microservicio (3001, 3002, 3003, 3004, 3005) sin pasar por el API Gateway (puerto 3000).

---

## 🏗️ Arquitectura

### Antes (con API Gateway)

```
Frontend → API Gateway:3000 → Auth Service:3001
                             → Resources Service:3002
                             → Availability Service:3003
                             → Stockpile Service:3004
                             → Reports Service:3005
```

### Ahora (Servicios Directos)

```
Frontend → Auth Service:3001
         → Resources Service:3002
         → Availability Service:3003
         → Stockpile Service:3004
         → Reports Service:3005
```

---

## 🔧 Implementación

### 1. Configuración (`src/lib/config.ts`)

Se agregó soporte para servicios directos:

```typescript
export const config = {
  // Flag para activar servicios directos
  useDirectServices: process.env.NEXT_PUBLIC_USE_DIRECT_SERVICES === "true",

  // URLs de cada microservicio
  serviceUrls: {
    auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001",
    resources:
      process.env.NEXT_PUBLIC_RESOURCES_SERVICE_URL || "http://localhost:3002",
    availability:
      process.env.NEXT_PUBLIC_AVAILABILITY_SERVICE_URL ||
      "http://localhost:3003",
    stockpile:
      process.env.NEXT_PUBLIC_STOCKPILE_SERVICE_URL || "http://localhost:3004",
    reports:
      process.env.NEXT_PUBLIC_REPORTS_SERVICE_URL || "http://localhost:3005",
  },
  // ...
};

// Helper para obtener URL del servicio
export function getServiceUrl(
  service: keyof typeof config.serviceUrls
): string {
  if (config.useDirectServices) {
    return config.serviceUrls[service];
  }
  return config.apiGatewayUrl;
}
```

### 2. HTTP Client (`src/infrastructure/api/httpClient.ts`)

Se actualizó el cliente HTTP para detectar automáticamente el servicio:

```typescript
class HttpClient {
  /**
   * Detecta el servicio desde el endpoint y construye la URL completa
   */
  private buildFullUrl(endpoint: string): string {
    if (!config.useDirectServices) {
      return endpoint; // Usar baseURL del axios instance
    }

    // Detectar servicio desde el endpoint
    if (endpoint.includes("/auth/")) {
      return `${getServiceUrl("auth")}${endpoint}`;
    }
    if (endpoint.includes("/resources/")) {
      return `${getServiceUrl("resources")}${endpoint}`;
    }
    // ... otros servicios
  }

  public async get<T>(url: string, params?: any): Promise<T> {
    const fullUrl = this.buildFullUrl(url);
    const response = await this.instance.get<T>(fullUrl, { params });
    return response.data;
  }
  // ... otros métodos
}
```

### 3. Variables de Entorno (`.env.local`)

```bash
# Activar servicios directos
NEXT_PUBLIC_USE_DIRECT_SERVICES=true

# URLs de microservicios
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_RESOURCES_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_AVAILABILITY_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_STOCKPILE_SERVICE_URL=http://localhost:3004
NEXT_PUBLIC_REPORTS_SERVICE_URL=http://localhost:3005

# Modo serve para consumir backend real
NEXT_PUBLIC_DATA_MODE=serve
```

---

## 🚀 Uso

### Configuración Rápida

```bash
# 1. Ejecutar script de configuración
npm run setup:serve

# 2. Verificar configuración
cat .env.local | grep DIRECT_SERVICES
# → NEXT_PUBLIC_USE_DIRECT_SERVICES=true

# 3. Iniciar frontend
npm run dev
```

### Verificar Servicios

```bash
# Auth Service
curl -s http://localhost:3001/api/v1/health | jq '.'

# Resources Service
curl -s http://localhost:3002/api/v1/health | jq '.'

# Availability Service
curl -s http://localhost:3003/api/v1/health | jq '.'

# Stockpile Service
curl -s http://localhost:3004/api/v1/health | jq '.'

# Reports Service
curl -s http://localhost:3005/api/v1/health | jq '.'
```

---

## 📝 Logging y Debugging

### Consola del Navegador

Al abrir el frontend, verás en la consola:

```
📋 Configuración de la aplicación:
  🌐 API Gateway: http://localhost:3000
  🔌 WebSocket: ws://localhost:3000
  📦 Modo de datos: SERVE
  🔧 Servicios directos: ACTIVADO
  📍 Auth Service: http://localhost:3001
  📍 Resources Service: http://localhost:3002
  📍 Availability Service: http://localhost:3003
  📍 Stockpile Service: http://localhost:3004
  📍 Reports Service: http://localhost:3005
  ⚙️  Features: {...}
```

### Network Tab

En las DevTools → Network:

- **Antes**: `http://localhost:3000/api/v1/auth/login`
- **Ahora**: `http://localhost:3001/api/v1/auth/login`

---

## ✅ Ventajas

1. **Bypass del API Gateway problemático**: No depende del circuit breaker
2. **Testing directo**: Permite probar cada microservicio individualmente
3. **Debugging simplificado**: Logs directos de cada servicio
4. **Desarrollo más rápido**: Sin intermediarios
5. **Configuración flexible**: Se puede activar/desactivar con un flag

---

## ⚠️ Desventajas

1. **Sin autenticación del Gateway**: No hay validación centralizada
2. **Sin rate limiting**: No hay protección contra abuso
3. **Sin circuit breaker**: No hay protección contra fallos en cascada
4. **CORS potencial**: Podría haber problemas de CORS
5. **Solo para desarrollo**: NO usar en producción

---

## 🔄 Volver a API Gateway

Para desactivar servicios directos y volver a usar el API Gateway:

```bash
# Opción 1: Editar .env.local manualmente
NEXT_PUBLIC_USE_DIRECT_SERVICES=false

# Opción 2: Comentar la variable
# NEXT_PUBLIC_USE_DIRECT_SERVICES=true

# Opción 3: Eliminar la variable (usa API Gateway por defecto)
```

Luego reiniciar el frontend:

```bash
npm run dev
```

---

## 🧪 Testing

### Test de Login Directo

```bash
# 1. Login via Auth Service directo
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ufps.edu.co","password":"123456"}' \
  | jq '.'

# 2. Ver categorías via Resources Service directo
curl http://localhost:3002/api/v1/resources/categories | jq '.'
```

### Test desde Frontend

1. Abrir <http://localhost:4200/auth/login>
2. Ingresar credenciales:
   - Email: `admin@ufps.edu.co`
   - Password: `123456`
3. Verificar en Network Tab que las peticiones van directamente a `localhost:3001`

---

## 📊 Mapeo de Endpoints

| Servicio         | Puerto | Health Check     | Ejemplo de Endpoint                   |
| ---------------- | ------ | ---------------- | ------------------------------------- |
| **Auth**         | 3001   | `/api/v1/health` | `/api/v1/auth/login`                  |
| **Resources**    | 3002   | `/api/v1/health` | `/api/v1/resources/categories`        |
| **Availability** | 3003   | `/api/v1/health` | `/api/v1/availability/reservations`   |
| **Stockpile**    | 3004   | `/api/v1/health` | `/api/v1/stockpile/approval-requests` |
| **Reports**      | 3005   | `/api/v1/health` | `/api/v1/reports/dashboard`           |

---

## 🛠️ Troubleshooting

### Error: "Failed to fetch"

**Problema**: El navegador no puede conectarse al microservicio

**Solución**:

```bash
# 1. Verificar que el servicio esté corriendo
curl http://localhost:3001/api/v1/health

# 2. Si no responde, iniciar el servicio
cd ../bookly-mock
npm run dev:all
```

### Error: CORS

**Problema**: El microservicio rechaza peticiones desde `localhost:4200`

**Solución**:

- Verificar configuración CORS en el microservicio
- Asegurarse que permita `http://localhost:4200` en el origen

### Error: "Network timeout"

**Problema**: El servicio tarda mucho en responder

**Solución**:

- Verificar logs del microservicio
- Aumentar timeout en `httpClient.ts` (actualmente 30s)

---

## 📚 Archivos Modificados

1. ✅ `src/lib/config.ts` - Configuración y helpers
2. ✅ `src/infrastructure/api/httpClient.ts` - Cliente HTTP con routing
3. ✅ `.env.local.example` - Variables de ejemplo
4. ✅ `scripts/setup-serve-mode.sh` - Script de configuración
5. ✅ `docs/SERVICIOS_DIRECTOS.md` - Esta documentación

---

## 🎯 Próximos Pasos

1. ✅ Configuración implementada
2. ✅ Testing con Auth Service
3. ✅ Testing con Resources Service
4. ⏳ Testing completo de login end-to-end
5. ⏳ Testing de CRUD de recursos
6. ⏳ Volver a API Gateway cuando esté arreglado

---

## 💡 Recomendaciones

### Para Desarrollo

- ✅ **Usar servicios directos**: Permite debugging más fácil
- ✅ **Verificar logs de cada servicio**: Más visibilidad
- ✅ **Probar endpoints individuales**: Aislar problemas

### Para QA/Staging

- ⚠️ **Usar API Gateway**: Testing de arquitectura completa
- ⚠️ **Probar circuit breaker**: Validar resiliencia
- ⚠️ **Testing de rate limiting**: Validar protecciones

### Para Producción

- ❌ **NUNCA usar servicios directos**
- ✅ **Siempre usar API Gateway**
- ✅ **Validar seguridad completa**

---

**Última actualización**: 2025-11-23  
**Estado**: ✅ Implementado y Funcional  
**Uso recomendado**: Solo para desarrollo local
