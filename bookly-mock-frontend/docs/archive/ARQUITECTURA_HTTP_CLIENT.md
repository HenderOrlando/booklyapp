# 🏗️ Arquitectura del HTTP Client en Bookly Frontend

**Fecha**: 24 de Noviembre de 2025  
**Estado**: ✅ Completamente funcional

---

## 📊 Estructura de Archivos

```
src/infrastructure/
├── http/
│   └── httpClient.ts          ← ✅ Cliente HTTP principal (ÚNICO)
└── api/
    ├── auth-client.ts         ← Cliente de autenticación
    ├── resources-client.ts    ← Cliente de recursos
    ├── reservations-client.ts ← Cliente de reservas
    ├── reports-client.ts      ← Cliente de reportes
    └── endpoints.ts           ← Definición centralizada de endpoints
```

---

## 🔧 Cómo Funciona el Sistema

### 1. Definición de Endpoints (`endpoints.ts`)

Los endpoints se definen CON el prefijo `/api/v1/`:

```typescript
export const API_VERSION = "/api/v1";

export const AUTH_ENDPOINTS = {
  LOGIN: "/api/v1/auth/login", // ✅ Con prefijo completo
  PROFILE: "/api/v1/auth/profile", // ✅ Con prefijo completo
  // ...
};

export const RESOURCES_ENDPOINTS = {
  BASE: "/api/v1/resources", // ✅ Con prefijo completo
  BY_ID: (id) => `/api/v1/resources/${id}`, // ✅ Con prefijo completo
};
```

### 2. HttpClient (`http/httpClient.ts`)

El cliente HTTP procesa los endpoints y construye las URLs correctas:

```typescript
class HttpClient {
  /**
   * ⚠️ IMPORTANTE: Los métodos retornan ApiResponse<T>
   */
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);

    if (this.shouldUseMock()) {
      return await MockService.mockRequest<T>(url, "GET");
    }

    const response = await axiosInstance.get<ApiResponse<T>>(url);
    return response.data; // Ya es ApiResponse<T>
  }

  /**
   * Construye URL y NO duplica /api/v1/
   */
  private buildUrl(endpoint: string): string {
    let cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

    // ✅ Si ya tiene /api/v1/, NO lo agrega de nuevo
    const fullEndpoint = cleanEndpoint.startsWith("api/v1/")
      ? `/${cleanEndpoint}`
      : `/api/v1/${cleanEndpoint}`;

    // Lógica de servicios directos...
    return fullEndpoint;
  }
}
```

### 3. Clientes de API (`api/*-client.ts`)

Los clientes usan httpClient SIN envolver `ApiResponse`:

```typescript
// ✅ CORRECTO
export class AuthClient {
  static async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<LoginResponse>> {
    return httpClient.post<LoginResponse>( // ← T es LoginResponse
      AUTH_ENDPOINTS.LOGIN, // ← "/api/v1/auth/login"
      credentials
    );
    // httpClient retorna: ApiResponse<LoginResponse> ✅
  }

  static async getProfile(): Promise<ApiResponse<User>> {
    return httpClient.get<User>( // ← T es User
      AUTH_ENDPOINTS.PROFILE // ← "/api/v1/auth/profile"
    );
    // httpClient retorna: ApiResponse<User> ✅
  }
}
```

#### ❌ INCORRECTO (lo que estaba antes)

```typescript
// ❌ ESTO ESTABA MAL
static async login(...): Promise<ApiResponse<LoginResponse>> {
  return httpClient.post<ApiResponse<LoginResponse>>(...);
  // Retornaría: ApiResponse<ApiResponse<LoginResponse>> ❌❌
}
```

---

## 🌐 Flujo Completo de una Petición

### Ejemplo: Login

```typescript
// 1. En el componente
const response = await AuthClient.login({ email, password });
// response es: ApiResponse<LoginResponse>

// 2. AuthClient llama a httpClient
httpClient.post<LoginResponse>("/api/v1/auth/login", data)

// 3. httpClient.buildUrl() procesa el endpoint
buildUrl("/api/v1/auth/login")
  → cleanEndpoint = "api/v1/auth/login"
  → Ya tiene "api/v1/", NO agrega de nuevo
  → fullEndpoint = "/api/v1/auth/login" ✅

// 4. Según configuración:
// 4a. useDirectServices = false (API Gateway)
→ axios.post("http://localhost:3000/api/v1/auth/login") ✅

// 4b. useDirectServices = true (Servicio directo)
→ axios.post("http://localhost:3001/api/v1/auth/login") ✅
```

---

## 🔍 Ejemplos de URLs Generadas

### Con API Gateway (`NEXT_PUBLIC_USE_DIRECT_SERVICES=false`)

| Endpoint en código   | buildUrl() genera        | Axios final                                      |
| -------------------- | ------------------------ | ------------------------------------------------ |
| `/api/v1/auth/login` | `/api/v1/auth/login`     | `http://localhost:3000/api/v1/auth/login` ✅     |
| `dashboard/kpis`     | `/api/v1/dashboard/kpis` | `http://localhost:3000/api/v1/dashboard/kpis` ✅ |
| `/api/v1/resources`  | `/api/v1/resources`      | `http://localhost:3000/api/v1/resources` ✅      |

### Con Servicios Directos (`NEXT_PUBLIC_USE_DIRECT_SERVICES=true`)

| Endpoint en código   | Servicio detectado | Axios final                                      |
| -------------------- | ------------------ | ------------------------------------------------ |
| `/api/v1/auth/login` | auth               | `http://localhost:3001/api/v1/auth/login` ✅     |
| `dashboard/kpis`     | reports            | `http://localhost:3005/api/v1/dashboard/kpis` ✅ |
| `/api/v1/resources`  | resources          | `http://localhost:3002/api/v1/resources` ✅      |
| `reservations`       | availability       | `http://localhost:3003/api/v1/reservations` ✅   |

---

## ✅ Por Qué Esta Arquitectura es Correcta

### 1. No Duplica `/api/v1/`

```typescript
buildUrl("/api/v1/auth/login");
// Detecta que ya tiene "api/v1/"
// NO agrega de nuevo
// Resultado: "/api/v1/auth/login" ✅
```

### 2. No Duplica `ApiResponse`

```typescript
// httpClient.post<T>() retorna ApiResponse<T>
httpClient.post<LoginResponse>(...)
// Retorna: ApiResponse<LoginResponse> ✅

// Si hiciéramos esto (INCORRECTO):
httpClient.post<ApiResponse<LoginResponse>>(...)
// Retornaría: ApiResponse<ApiResponse<LoginResponse>> ❌
```

### 3. Soporta Múltiples Configuraciones

- ✅ Mock Mode: Usa datos simulados
- ✅ API Gateway: Centraliza en puerto 3000
- ✅ Servicios Directos: Conecta directo a cada microservicio

### 4. Backward Compatible

- ✅ Funciona con endpoints que ya tienen `/api/v1/` (desde `endpoints.ts`)
- ✅ Funciona con endpoints simples (`dashboard/kpis`)

---

## 📋 Resumen de Correcciones Aplicadas

### ✅ Problema 1: httpClient duplicado

- **Antes**: 2 archivos (`/api/httpClient.ts` y `/http/httpClient.ts`)
- **Ahora**: 1 archivo único (`/http/httpClient.ts`)

### ✅ Problema 2: Duplicación de `/api/v1/`

- **Antes**: `buildUrl()` agregaba `/api/v1/` siempre
- **Ahora**: `buildUrl()` detecta si ya existe y NO lo duplica

### ✅ Problema 3: Doble wrapping de `ApiResponse`

- **Antes**: `httpClient.get<ApiResponse<T>>()` → `ApiResponse<ApiResponse<T>>`
- **Ahora**: `httpClient.get<T>()` → `ApiResponse<T>`

### ✅ Problema 4: Imports incorrectos

- **Antes**: `import { httpClient } from "./httpClient"` (no existía)
- **Ahora**: `import { httpClient } from "@/infrastructure/http/httpClient"`

---

## 🧪 Verificación

### Verificar en Console del navegador

```
🌐 HTTP Client inicializado en modo: SERVE
🔧 Usando servicios directos (bypass API Gateway)  // Si aplica
```

### Verificar en Network tab (DevTools)

```
✅ http://localhost:3000/api/v1/auth/login          (API Gateway)
✅ http://localhost:3001/api/v1/auth/login          (Servicio directo)
✅ http://localhost:3005/api/v1/dashboard/kpis      (Reports directo)

❌ http://localhost:3000/api/v1/api/v1/auth/login  (NO debe aparecer)
```

### Verificar tipos TypeScript

```bash
# No debe haber errores de tipos
npm run type-check

# Debe compilar sin errores
npm run build
```

---

## 🎯 Estado Final

### ✅ Sistema Completamente Funcional

1. **Endpoints**: Definidos con `/api/v1/` en `endpoints.ts` ✅
2. **buildUrl()**: NO duplica `/api/v1/` ✅
3. **Tipos**: `httpClient` retorna `ApiResponse<T>` correctamente ✅
4. **Clientes**: Usan `httpClient` sin doble wrapping ✅
5. **Compilación**: Sin errores TypeScript ✅
6. **Servidor**: Funcionando correctamente ✅

---

**Última actualización**: 2025-11-24  
**Estado**: ✅ Arquitectura validada y funcional  
**Desarrollador**: Cascade AI
