# 📘 Patrón de Data Mode - Bookly Frontend

**Versión:** 1.0  
**Fecha:** 2025-11-20  
**Objetivo:** Estandarizar el manejo de Mock Mode y Serve Mode en toda la aplicación

---

## 🎯 Resumen

Bookly soporta **dos modos de datos**:

1. **Mock Mode** (`NEXT_PUBLIC_DATA_MODE=mock`): Datos simulados sin backend
2. **Serve Mode** (`NEXT_PUBLIC_DATA_MODE=serve`): Backend real en puerto 3000

Este patrón asegura que:

- ✅ El cambio entre modos sea transparente
- ✅ No se duplique código
- ✅ Todos los componentes funcionen igual en ambos modos
- ✅ El modo sea configurable desde variables de entorno

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Componentes/Páginas                      │
│                           ↓                                 │
│                    httpClient.get()                         │
│                           ↓                                 │
│               ¿NEXT_PUBLIC_DATA_MODE?                       │
│                    ↙          ↘                             │
│              mock              serve                        │
│                ↓                ↓                           │
│         MockService      AxiosInstance                      │
│                ↓                ↓                           │
│         Mock Data        API Gateway                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Componentes del Sistema

### 1. **httpClient** (Cliente HTTP Unificado)

**Ubicación:** `src/infrastructure/http/httpClient.ts`

#### Características:

- ✅ Detecta automáticamente el modo (mock/serve)
- ✅ Usa MockService en mock mode
- ✅ Usa Axios en serve mode
- ✅ Maneja tokens automáticamente
- ✅ Interceptors para refresh y errores

#### Uso:

```typescript
import { httpClient } from "@/infrastructure/http";

// GET request
const users = await httpClient.get<User[]>("auth/users");

// POST request
const response = await httpClient.post<LoginResponse>("auth/login", {
  email,
  password,
});

// PUT request
await httpClient.put(`resources/${id}`, resourceData);

// DELETE request
await httpClient.delete(`resources/${id}`);
```

#### Ventajas:

- No necesitas saber en qué modo estás
- El cliente decide automáticamente
- Código igual para mock y serve

---

### 2. **useDataMode** (Hook para Detección)

**Ubicación:** `src/hooks/useDataMode.ts`

#### Uso:

```typescript
import { useDataMode } from "@/hooks/useDataMode";

function MyComponent() {
  const { mode, isMock, isServe, isDevelopment, httpClient } = useDataMode();

  return (
    <div>
      {isMock && <Badge>🧪 Mock Mode</Badge>}
      {isServe && <Badge>🟢 Serve Mode</Badge>}
    </div>
  );
}
```

#### Retorna:

| Propiedad       | Tipo                | Descripción                  |
| --------------- | ------------------- | ---------------------------- |
| `mode`          | `"mock" \| "serve"` | Modo actual                  |
| `isMock`        | `boolean`           | true si estamos en mock      |
| `isServe`       | `boolean`           | true si estamos en serve     |
| `isDevelopment` | `boolean`           | true si NODE_ENV=development |
| `httpClient`    | `HttpClient`        | Cliente HTTP unificado       |

---

### 3. **DataModeIndicator** (Indicador Visual)

**Ubicación:** `src/components/molecules/DataModeIndicator`

#### Características:

- 🟡 Badge amarillo en Mock Mode
- 🟢 Badge verde en Serve Mode
- Solo visible en desarrollo
- Posición: bottom-right
- Click en "?" muestra cómo cambiar de modo

#### Uso:

```typescript
// Ya está incluido en el layout principal
// No necesitas hacer nada
```

---

## 🔧 Configuración

### Variables de Entorno

Archivo: `.env.local`

```env
# Modo de datos
NEXT_PUBLIC_DATA_MODE=mock  # o 'serve'

# URLs del backend (solo para serve mode)
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Auth
NEXTAUTH_URL=http://localhost:4200
NEXTAUTH_SECRET=your-secret-key

# Feature Flags
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_SSO=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

### Cambiar de Modo

```bash
# En .env.local, cambiar:
NEXT_PUBLIC_DATA_MODE=serve  # o 'mock'

# Reiniciar el servidor:
npm run dev
```

---

## 📝 Patrones de Uso

### Patrón 1: Petición Simple

```typescript
// ❌ INCORRECTO - No hacer esto
const response = await fetch("/api/v1/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});

// ✅ CORRECTO - Usar httpClient
import { httpClient } from "@/infrastructure/http";

const response = await httpClient.post("auth/login", { email, password });
```

### Patrón 2: Con Manejo de Errores

```typescript
try {
  const response = await httpClient.get<Resource[]>("resources");

  if (response.success) {
    setResources(response.data);
  }
} catch (error: any) {
  // Error ya está manejado por httpClient
  console.error("Error:", error.message);
  setError(error.message);
}
```

### Patrón 3: Con Loading State

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await httpClient.get("resources");
    setData(response.data);
  } catch (error: any) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Patrón 4: Condicional por Modo

```typescript
const { isMock } = useDataMode();

// Solo ejecutar en serve mode
if (!isMock) {
  await httpClient.post("analytics/track", eventData);
}
```

---

## 🧪 Mock Mode

### ¿Cuándo Usar Mock Mode?

- ✅ Desarrollo de UI/UX sin backend
- ✅ Testing de componentes
- ✅ Demos y presentaciones
- ✅ Desarrollo offline

### Credenciales Mock Disponibles:

```
Admin: admin@ufps.edu.co / admin123
Coordinador: coordinador@ufps.edu.co / coord123
Profesor: profesor@ufps.edu.co / prof123
Estudiante: estudiante@ufps.edu.co / est123
```

### Agregar Nuevos Mocks:

**Archivo:** `src/infrastructure/mock/mockData.ts`

```typescript
export const mockNewResource: Resource = {
  id: "res_1",
  name: "Laboratorio A101",
  // ... más propiedades
};
```

**Archivo:** `src/infrastructure/mock/mockService.ts`

```typescript
if (endpoint.includes("/resources") && method === "GET") {
  return {
    success: true,
    data: mockResources,
    timestamp: new Date().toISOString(),
  };
}
```

---

## 🌐 Serve Mode

### ¿Cuándo Usar Serve Mode?

- ✅ Integración con backend real
- ✅ Testing de APIs
- ✅ Validación de flujos completos
- ✅ Staging y producción

### Requisitos:

1. Backend corriendo en `localhost:3000`
2. Variable `NEXT_PUBLIC_DATA_MODE=serve`
3. Token de autenticación válido

### Flujo de Autenticación:

```typescript
// 1. Login
const loginResponse = await httpClient.post("auth/login", credentials);

// 2. Token se guarda automáticamente en sessionStorage

// 3. Requests subsecuentes incluyen el token automáticamente
const profile = await httpClient.get("auth/me");
```

---

## 🚀 Buenas Prácticas

### ✅ DO (Hacer)

1. **Usar siempre httpClient**

   ```typescript
   await httpClient.get("resources");
   ```

2. **Importar desde infrastructure/http**

   ```typescript
   import { httpClient } from "@/infrastructure/http";
   ```

3. **Tipar las respuestas**

   ```typescript
   const response = await httpClient.get<Resource[]>("resources");
   ```

4. **Manejar errores**
   ```typescript
   try {
     // request
   } catch (error) {
     // handle error
   }
   ```

### ❌ DON'T (No Hacer)

1. **No usar fetch directamente**

   ```typescript
   // ❌ Mal
   const response = await fetch("/api/users");
   ```

2. **No importar MockService directamente**

   ```typescript
   // ❌ Mal
   import { MockService } from "@/infrastructure/mock/mockService";
   ```

3. **No verificar el modo manualmente**

   ```typescript
   // ❌ Mal
   if (process.env.NEXT_PUBLIC_DATA_MODE === "mock") {
     // ...
   }
   ```

4. **No hardcodear URLs**
   ```typescript
   // ❌ Mal
   await fetch("http://localhost:3000/api/v1/users");
   ```

---

## 🔍 Troubleshooting

### Problema: "Cannot connect to backend"

**Solución:**

1. Verificar que `NEXT_PUBLIC_DATA_MODE=mock` en `.env.local`
2. O iniciar el backend en puerto 3000
3. Reiniciar el servidor Next.js

### Problema: "Datos no actualizan"

**Solución:**

1. Verificar que estés usando `httpClient` y no `fetch`
2. Limpiar sessionStorage: `sessionStorage.clear()`
3. Reiniciar el servidor

### Problema: "Token expired"

**Solución:**

1. httpClient redirige automáticamente al login
2. O renovar manualmente: `sessionStorage.removeItem("accessToken")`

---

## 📚 Referencias

- **httpClient:** `src/infrastructure/http/httpClient.ts`
- **useDataMode:** `src/hooks/useDataMode.ts`
- **MockService:** `src/infrastructure/mock/mockService.ts`
- **Config:** `src/lib/config.ts`
- **DataModeIndicator:** `src/components/molecules/DataModeIndicator`

---

## ✅ Checklist de Implementación

Para agregar una nueva funcionalidad:

- [ ] Usar `httpClient` para todas las peticiones
- [ ] Tipar las respuestas con interfaces TypeScript
- [ ] Manejar errores con try/catch
- [ ] Agregar mocks si es necesario (en `mockService.ts`)
- [ ] Probar en ambos modos (mock y serve)
- [ ] Documentar el endpoint en el archivo del servicio

---

**Última actualización:** 2025-11-20  
**Mantenido por:** Equipo Bookly
