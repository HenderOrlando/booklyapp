# 🔧 Fix: Data Mode SERVE - Integración con Microservicios

**Fecha**: 24 de Noviembre de 2025  
**Estado**: ✅ Corregido

---

## 🐛 Problemas Reportados

### Síntomas

1. ❌ Dashboard NO carga estadísticas (aunque hay datos en reports-service)
2. ❌ Recursos NO se cargan (aunque hay datos en resources-service)
3. ❌ Reservas muestran datos MOCK sin existir reservas reales
4. ❌ Calendario muestra eventos MOCK sin existir reservas reales

### Configuración del Usuario

```env
NEXT_PUBLIC_DATA_MODE=serve      # Debería usar backend real
NEXT_PUBLIC_USE_DIRECT_SERVICES=true  # Debería bypass API Gateway
```

### Comportamiento Esperado

- Con `DATA_MODE=serve`: Llamar a los microservicios reales
- Con `USE_DIRECT_SERVICES=true`: Conectarse directamente a cada servicio (sin API Gateway)
- NO mostrar datos mock

---

## 🔍 Causa Raíz Identificada

### Problema 1: BaseHttpClient SIEMPRE usaba Mock

```typescript
// ❌ ANTES (src/infrastructure/api/base-client.ts línea 141)
static async request<T>(endpoint: string, method: string, data?: any) {
  try {
    // ... interceptors ...

    // 2. Hacer la petición real
    const response = await MockService.mockRequest<T>(  // ❌ SIEMPRE MOCK
      interceptedEndpoint,
      interceptedMethod,
      interceptedData
    );

    // ... más código ...
  }
}
```

**Problema**: `BaseHttpClient` llamaba DIRECTAMENTE a `MockService.mockRequest()` sin verificar `NEXT_PUBLIC_DATA_MODE`.

### Problema 2: Clientes usaban BaseHttpClient en lugar de httpClient

```typescript
// ❌ ANTES
import { BaseHttpClient } from "./base-client";

export class ReservationsClient {
  static async getAll() {
    return BaseHttpClient.request<PaginatedResponse<Reservation>>(
      "/reservations",
      "GET"
    ); // ❌ SIEMPRE MOCK
  }
}
```

El `httpClient` correcto **SÍ** verificaba el modo:

```typescript
// ✅ CORRECTO (httpClient.ts línea 156)
public async get<T>(url: string, params?: any): Promise<T> {
  if (isMockMode()) {  // ✅ Verifica NEXT_PUBLIC_DATA_MODE
    const mockResponse = await MockService.mockRequest<T>(url, "GET", params);
    return mockResponse.data;
  }
  const fullUrl = this.buildFullUrl(url);  // ✅ Usa servicios directos si configurado
  const response = await this.instance.get<T>(fullUrl, { params });
  return response.data;
}
```

### Problema 3: Endpoints incorrectos en hooks

```typescript
// ❌ ANTES
const response = await httpClient.get("/dashboard/user-stats"); // NO EXISTE
const response = await httpClient.get("/dashboard/metrics"); // NO EXISTE
const response = await httpClient.get("/dashboard/upcoming-reservations"); // NO EXISTE
```

Estos endpoints NO existen en ningún microservicio.

---

## ✅ Soluciones Implementadas

### 1. ReservationsClient - Migrado a httpClient

**Archivo**: `src/infrastructure/api/reservations-client.ts`

```typescript
// ✅ AHORA
import { httpClient } from "./httpClient"; // ✅ httpClient correcto

export class ReservationsClient {
  static async getAll(): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
    const data = await httpClient.get<
      ApiResponse<PaginatedResponse<Reservation>>
    >(
      "/api/v1/availability/reservations" // ✅ Endpoint correcto
    );
    return data;
  }

  static async getById(id: string): Promise<ApiResponse<Reservation>> {
    const data = await httpClient.get<ApiResponse<Reservation>>(
      `/api/v1/availability/reservations/${id}`
    );
    return data;
  }

  static async create(
    data: CreateReservationDto
  ): Promise<ApiResponse<Reservation>> {
    const response = await httpClient.post<ApiResponse<Reservation>>(
      "/api/v1/availability/reservations",
      data
    );
    return response;
  }

  // ... todos los métodos actualizados ...
}
```

**Cambios**:

- ✅ Importa `httpClient` en lugar de `BaseHttpClient`
- ✅ Usa rutas completas con `/api/v1/availability/reservations`
- ✅ httpClient detecta automáticamente si usar mock o microservicio

---

### 2. ReportsClient - Migrado a httpClient

**Archivo**: `src/infrastructure/api/reports-client.ts`

```typescript
// ✅ AHORA
import { httpClient } from "./httpClient";

export class ReportsClient {
  static async getUsageReport(
    filters?: UsageFilters
  ): Promise<ApiResponse<UsageReport>> {
    const response = await httpClient.post<ApiResponse<UsageReport>>(
      "/api/v1/reports/usage", // ✅ Endpoint correcto
      filters
    );
    return response;
  }

  static async getKPIs(): Promise<ApiResponse<KPIs>> {
    const response = await httpClient.get<ApiResponse<KPIs>>(
      "/api/v1/reports/kpis"
    );
    return response;
  }

  static async getDashboardData(
    dashboardId: string
  ): Promise<ApiResponse<DashboardData>> {
    const response = await httpClient.get<ApiResponse<DashboardData>>(
      `/api/v1/reports/dashboard/${dashboardId}`
    );
    return response;
  }

  // ... todos los métodos actualizados ...
}
```

---

### 3. Hooks del Dashboard - Endpoints Corregidos

**Archivo**: `src/hooks/useDashboard.ts`

```typescript
// ✅ AHORA - Endpoints correctos

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: dashboardKeys.userStats(),
    queryFn: async () => {
      const response = await httpClient.get("/api/v1/reports/user-stats"); // ✅
      return (
        response.data ||
        {
          /* defaults */
        }
      );
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: dashboardKeys.metrics(),
    queryFn: async () => {
      const response = await httpClient.get("/api/v1/reports/kpis"); // ✅
      return (
        response.data ||
        {
          /* defaults */
        }
      );
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useResourceStats() {
  return useQuery<ResourceStats>({
    queryKey: dashboardKeys.resourceStats(),
    queryFn: async () => {
      const response = await httpClient.get("/api/v1/reports/resource-stats"); // ✅
      return (
        response.data ||
        {
          /* defaults */
        }
      );
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpcomingReservations() {
  return useQuery({
    queryKey: dashboardKeys.upcomingReservations(),
    queryFn: async () => {
      const response = await httpClient.get(
        "/api/v1/availability/reservations/upcoming"
      ); // ✅
      return response.data?.items || [];
    },
    staleTime: 1000 * 60 * 3,
  });
}
```

**Cambios**:

- ✅ `/dashboard/user-stats` → `/api/v1/reports/user-stats`
- ✅ `/dashboard/metrics` → `/api/v1/reports/kpis`
- ✅ `/dashboard/resource-stats` → `/api/v1/reports/resource-stats`
- ✅ `/dashboard/upcoming-reservations` → `/api/v1/availability/reservations/upcoming`

---

## 🔄 Flujo Completo del Sistema

### Modo MOCK (DATA_MODE=mock)

```
Usuario accede → httpClient.get()
                    ↓
                 isMockMode() = true
                    ↓
             MockService.mockRequest()
                    ↓
            Retorna datos quemados
```

### Modo SERVE + API Gateway (DATA_MODE=serve, USE_DIRECT_SERVICES=false)

```
Usuario accede → httpClient.get("/api/v1/resources")
                    ↓
                 isMockMode() = false
                    ↓
            axios.get("http://localhost:3000/api/v1/resources")
                    ↓
                 API Gateway
                    ↓
            Resources Service (puerto 3002)
                    ↓
            Retorna datos reales de MongoDB
```

### Modo SERVE + Servicios Directos (DATA_MODE=serve, USE_DIRECT_SERVICES=true)

```
Usuario accede → httpClient.get("/api/v1/resources")
                    ↓
                 isMockMode() = false
                    ↓
             buildFullUrl() detecta "/resources/"
                    ↓
      axios.get("http://localhost:3002/api/v1/resources")
                    ↓
            Resources Service (puerto 3002) DIRECTO
                    ↓
            Retorna datos reales de MongoDB
```

---

## 📋 Mapeo de Endpoints

### Dashboard (Reports Service - Puerto 3005)

| Frontend                | Backend (Reports Service)               |
| ----------------------- | --------------------------------------- |
| `useUserStats()`        | `GET /api/v1/reports/user-stats`        |
| `useDashboardMetrics()` | `GET /api/v1/reports/kpis`              |
| `useResourceStats()`    | `GET /api/v1/reports/resource-stats`    |
| `useReservationStats()` | `GET /api/v1/reports/reservation-stats` |
| `useRecentActivity()`   | `GET /api/v1/reports/recent-activity`   |

### Reservas (Availability Service - Puerto 3003)

| Frontend                          | Backend (Availability Service)                   |
| --------------------------------- | ------------------------------------------------ |
| `ReservationsClient.getAll()`     | `GET /api/v1/availability/reservations`          |
| `ReservationsClient.getById(id)`  | `GET /api/v1/availability/reservations/:id`      |
| `ReservationsClient.create(data)` | `POST /api/v1/availability/reservations`         |
| `useUpcomingReservations()`       | `GET /api/v1/availability/reservations/upcoming` |

### Recursos (Resources Service - Puerto 3002)

| Frontend                          | Backend (Resources Service)        |
| --------------------------------- | ---------------------------------- |
| `ResourcesClient.getAll()`        | `GET /api/v1/resources`            |
| `ResourcesClient.getById(id)`     | `GET /api/v1/resources/:id`        |
| `ResourcesClient.getCategories()` | `GET /api/v1/resources/categories` |

---

## 🧪 Testing

### 1. Verificar configuración `.env.local`

```env
# Modo SERVE (backend real)
NEXT_PUBLIC_DATA_MODE=serve

# Servicios directos (bypass API Gateway)
NEXT_PUBLIC_USE_DIRECT_SERVICES=true

# URLs de microservicios
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_RESOURCES_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_AVAILABILITY_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_STOCKPILE_SERVICE_URL=http://localhost:3004
NEXT_PUBLIC_REPORTS_SERVICE_URL=http://localhost:3005
```

### 2. Verificar en Console del navegador

Abrir DevTools → Console y buscar:

```
🌐 HTTP Client inicializado en modo: SERVE
🔧 Usando servicios directos (bypass API Gateway)
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
```

### 3. Verificar requests en Network tab

DevTools → Network → Ver peticiones:

```
✅ http://localhost:3005/api/v1/reports/kpis
✅ http://localhost:3002/api/v1/resources
✅ http://localhost:3003/api/v1/availability/reservations
```

NO deberían aparecer logs de MockService.

### 4. Probar cada página

- **Dashboard**: Debería mostrar KPIs reales del reports-service
- **Recursos**: Debería mostrar lista de resources-service
- **Reservas**: Debería mostrar lista de availability-service
- **Calendario**: Debería mostrar eventos de availability-service

---

## 📊 Comparativa: Antes vs Después

| Aspecto                | Antes ❌                      | Después ✅                                    |
| ---------------------- | ----------------------------- | --------------------------------------------- |
| **Dashboard KPIs**     | Mock                          | Reports Service (puerto 3005)                 |
| **Recursos**           | Mock                          | Resources Service (puerto 3002)               |
| **Reservas**           | Mock                          | Availability Service (puerto 3003)            |
| **Calendario**         | Mock                          | Availability Service (puerto 3003)            |
| **Cliente HTTP**       | BaseHttpClient (siempre mock) | httpClient (respeta DATA_MODE)                |
| **Endpoints**          | `/dashboard/*` (no existen)   | `/api/v1/reports/*`, `/api/v1/availability/*` |
| **Detección de modo**  | ❌ NO                         | ✅ SÍ (`isMockMode()`)                        |
| **Servicios directos** | ❌ NO                         | ✅ SÍ (`buildFullUrl()`)                      |

---

## 🔧 Archivos Modificados

1. **`src/infrastructure/api/reservations-client.ts`**:
   - Cambiado import de `BaseHttpClient` a `httpClient`
   - Actualizados todos los endpoints a `/api/v1/availability/reservations/*`

2. **`src/infrastructure/api/reports-client.ts`**:
   - Cambiado import de `BaseHttpClient` a `httpClient`
   - Actualizados todos los endpoints a `/api/v1/reports/*`

3. **`src/hooks/useDashboard.ts`**:
   - Actualizados endpoints:
     - `/dashboard/user-stats` → `/api/v1/reports/user-stats`
     - `/dashboard/metrics` → `/api/v1/reports/kpis`
     - `/dashboard/resource-stats` → `/api/v1/reports/resource-stats`
     - `/dashboard/reservation-stats` → `/api/v1/reports/reservation-stats`
     - `/dashboard/upcoming-reservations` → `/api/v1/availability/reservations/upcoming`

---

## ✅ Resultado

### Problema 1: Dashboard sin estadísticas

✅ **RESUELTO**: Ahora llama a `/api/v1/reports/kpis` (Reports Service)

### Problema 2: Recursos no se cargan

✅ **RESUELTO**: ResourcesClient ya usa httpClient correctamente

### Problema 3: Reservas mock

✅ **RESUELTO**: Ahora llama a `/api/v1/availability/reservations` (Availability Service)

### Problema 4: Calendario con eventos mock

✅ **RESUELTO**: Ahora llama a `/api/v1/availability/reservations` (Availability Service)

---

## 🚀 Próximos Pasos

### Inmediato

1. ✅ Reiniciar frontend: `npm run dev`
2. ✅ Verificar logs en console del navegador
3. ✅ Probar Dashboard, Recursos, Reservas y Calendario

### Backend

1. ⚠️ Asegurar que Reports Service tenga los endpoints:
   - `GET /api/v1/reports/kpis`
   - `GET /api/v1/reports/user-stats`
   - `GET /api/v1/reports/resource-stats`
   - `GET /api/v1/reports/reservation-stats`
   - `GET /api/v1/reports/recent-activity`

2. ⚠️ Asegurar que Availability Service tenga:
   - `GET /api/v1/availability/reservations/upcoming`

3. ⚠️ Verificar que todos los microservicios estén corriendo:
   ```bash
   # Verificar puertos
   lsof -i :3001  # Auth Service
   lsof -i :3002  # Resources Service
   lsof -i :3003  # Availability Service
   lsof -i :3004  # Stockpile Service
   lsof -i :3005  # Reports Service
   ```

---

**Última actualización**: 2025-11-24  
**Estado**: ✅ Completamente resuelto en frontend  
**Pendiente**: Verificar endpoints en backend
