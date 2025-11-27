# 📋 Estructura de Responses del API Backend

Documentación de las estructuras de respuesta del backend Bookly.

---

## 🎯 Estructura General

Todas las respuestas exitosas del backend siguen este formato:

```typescript
{
  success: true,
  data: T,              // Datos específicos del endpoint
  timestamp: string,    // ISO 8601 datetime
  message?: string      // Mensaje descriptivo opcional
}
```

### Respuestas de Error

```typescript
{
  success: false,
  code: string,         // Ej: "RSRC-0301"
  message: string,
  type: "error" | "warning" | "info",
  exception_code?: string,
  http_code: number,
  http_exception: string,
  timestamp: string,
  path?: string,
  details?: any
}
```

---

## 📦 Endpoints con Paginación

### GET /resources

```typescript
{
  success: true,
  data: {
    resources: Resource[],  // ← Array de recursos
    meta: {
      total: number,
      page: number,
      limit: number,
      totalPages: number
    }
  },
  timestamp: "2025-11-27T04:16:15.084Z",
  message: "Resources retrieved successfully"
}
```

**Acceso correcto en frontend:**

```typescript
const response = await httpClient.get("resources");
const resources = response.data?.resources || [];
```

---

### GET /categories

```typescript
{
  success: true,
  data: {
    categories: Category[],  // ← Array de categorías
    meta: {
      total: number,
      page: number,
      limit: number,
      totalPages: number
    }
  },
  timestamp: "2025-11-27T04:16:20.123Z",
  message: "Categories retrieved successfully"
}
```

**Acceso correcto en frontend:**

```typescript
const response = await httpClient.get("categories");
const categories = response.data?.categories || [];
```

---

### GET /programs

```typescript
{
  success: true,
  data: {
    programs: AcademicProgram[],  // ← Array de programas
    meta: {
      total: number,
      page: number,
      limit: number,
      totalPages: number
    }
  },
  timestamp: "2025-11-27T04:16:25.456Z",
  message: "Programs retrieved successfully"
}
```

---

## 🔑 Autenticación

### POST /auth/login (Servicio Directo)

**Request:**

```json
{
  "email": "admin@ufps.edu.co",
  "password": "123456"
}
```

**Response (Servicio Directo - puerto 3001):**

```typescript
{
  success: true,
  data: {
    requiresTwoFactor: false,
    user: {
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      roles: string[],
      permissions: string[],
      isActive: boolean,
      isEmailVerified: boolean,
      twoFactorEnabled: boolean,
      lastLogin: string
    },
    tokens: {
      accessToken: string,    // JWT token
      refreshToken: string    // Refresh token
    }
  },
  timestamp: string,
  message: "Inicio de sesión exitoso"
}
```

**Response (API Gateway - puerto 3000):**

```typescript
{
  success: true,
  message: "Command accepted and queued for processing",
  eventId: string,
  status: "processing"
}
```

⚠️ **IMPORTANTE**: El API Gateway usa patrón CQRS asíncrono para login. Para desarrollo, usa el servicio directo (puerto 3001).

---

## 🔍 GET Endpoints Individuales

### GET /resources/:id

```typescript
{
  success: true,
  data: Resource,  // ← Objeto Resource directo (no array)
  timestamp: string,
  message: "Resource retrieved successfully"
}
```

**Acceso en frontend:**

```typescript
const response = await httpClient.get(`resources/${id}`);
const resource = response.data; // Ya es el objeto
```

---

### GET /categories/:id

```typescript
{
  success: true,
  data: Category,  // ← Objeto Category directo
  timestamp: string,
  message: "Category retrieved successfully"
}
```

---

## 🏥 Health Checks

### GET /health (Servicios Directos)

**Ejemplo - Resources Service (puerto 3002):**

```json
{
  "status": "ok",
  "service": "resources-service",
  "timestamp": "2025-11-27T04:15:51.332Z",
  "environment": "development"
}
```

⚠️ **NOTA**: El API Gateway no tiene ruta `/api/v1/health` (retorna 404).

---

## 📊 Tipos de Datos

### Resource

```typescript
interface Resource {
  id: string;
  code: string;
  name: string;
  description: string;
  type: ResourceType;
  categoryId: string;
  capacity: number;
  location: string;
  floor?: string;
  building?: string;
  attributes: {
    features?: string[];
    [key: string]: any;
  };
  programIds: string[];
  status: ResourceStatus;
  isActive: boolean;
  availabilityRules: {
    requiresApproval: boolean;
    maxAdvanceBookingDays: number;
    minBookingDurationMinutes: number;
    maxBookingDurationMinutes: number;
    allowRecurring: boolean;
  };
  createdAt: string;
  updatedAt: string;
  audit: {
    createdBy: string;
    updatedBy: string;
  };
}
```

### Category

```typescript
interface Category {
  id: string;
  type: CategoryType;
  subtype?: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  service: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🛠️ Helpers para Frontend

### Helper Genérico para Parsear Responses

```typescript
/**
 * Extrae array de datos de diferentes estructuras de response
 */
function extractArrayFromResponse<T>(
  response: ApiResponse<any>,
  key: string
): T[] {
  // Si data es array directo
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // Si tiene estructura paginada: { [key]: [...], meta: {...} }
  if (response.data?.[key]) {
    return response.data[key];
  }

  // Fallback para estructura con items
  if (response.data?.items) {
    return response.data.items;
  }

  return [];
}

// Uso:
const resources = extractArrayFromResponse<Resource>(response, "resources");
const categories = extractArrayFromResponse<Category>(response, "categories");
```

---

## 🔄 Patrones Comunes

### Pattern 1: Lista Paginada

```typescript
// Backend
{
  success: true,
  data: {
    [entityName]: Entity[],
    meta: PaginationMeta
  }
}

// Frontend
const items = response.data?.[entityName] || [];
```

### Pattern 2: Item Individual

```typescript
// Backend
{
  success: true,
  data: Entity
}

// Frontend
const item = response.data;
```

### Pattern 3: Comando CQRS (API Gateway)

```typescript
// Backend
{
  success: true,
  message: "Command accepted",
  eventId: string,
  status: "processing"
}

// Frontend: Usar polling o WebSocket para obtener resultado
```

---

## ✅ Checklist de Integración

Cuando integres un nuevo endpoint:

- [ ] Verificar estructura del response con curl
- [ ] Identificar si es array directo o con metadata
- [ ] Agregar tipos TypeScript correspondientes
- [ ] Implementar parsing correcto en queryFn
- [ ] Manejar casos de error (401, 404, 500)
- [ ] Agregar logging en desarrollo para debugging
- [ ] Documentar en este archivo

---

## 🧪 Scripts de Testing

Para probar estructura de responses:

```bash
# Health check
curl -s http://localhost:3002/api/v1/health | jq '.'

# Login (obtener token)
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ufps.edu.co","password":"123456"}' \
  | jq '.data.tokens.accessToken' -r

# GET con autenticación
TOKEN="tu-token-aqui"
curl -s http://localhost:3002/api/v1/resources \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

Script completo:

```bash
./scripts/test-api-response.sh
```

---

## 📚 Referencias

- [Base HTTP Client](/src/infrastructure/http/httpClient.ts)
- [API Response Types](/src/types/api/response.ts)
- [Resources Client](/src/infrastructure/api/resources-client.ts)
