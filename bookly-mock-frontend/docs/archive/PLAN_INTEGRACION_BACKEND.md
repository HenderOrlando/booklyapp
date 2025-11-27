# 📋 Plan de Integración Frontend-Backend Bookly

## 🎯 Objetivo

Integrar el frontend Next.js con los microservicios backend a través del API Gateway, migrand o del modo MOCK al modo SERVE para consumir datos reales.

## 📊 Estado Actual

### ✅ Infraestructura Lista

- **Frontend**: Next.js en puerto 4200 ✓
- **API Gateway**: NestJS en puerto 3000 ✓
- **Auth Service**: puerto 3001 ✓
- **Resources Service**: puerto 3002 ✓
- **Availability Service**: puerto 3003 ✓
- **Stockpile Service**: puerto 3004 ✓
- **Reports Service**: puerto 3005 ✓

### ✅ Clientes HTTP Existentes

```
src/infrastructure/api/
├── httpClient.ts          # Cliente Axios con interceptors
├── base-client.ts         # Cliente base con interceptors avanzados
├── auth-client.ts         # Autenticación y usuarios
├── resources-client.ts    # Gestión de recursos
├── reservations-client.ts # Reservas y disponibilidad
├── reports-client.ts      # Reportes y análisis
├── notifications-client.ts# Notificaciones
└── types.ts              # Tipos compartidos
```

### ⚙️ Configuración Actual

```typescript
// .env.local
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_DATA_MODE=mock  // 👈 Cambiar a 'serve'
```

---

## 🗺️ Plan de Integración por Módulos

### **Fase 1: Configuración Base** ⏱️ 1-2 horas

#### 1.1 Actualizar Variables de Entorno

**Archivo**: `.env.local`

```bash
# Cambiar de modo MOCK a SERVE
NEXT_PUBLIC_DATA_MODE=serve
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# NextAuth
NEXTAUTH_URL=http://localhost:4200
NEXTAUTH_SECRET=development-secret-change-in-production

# Feature Flags
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_SSO=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

#### 1.2 Actualizar httpClient.ts

**Archivo**: `src/infrastructure/api/httpClient.ts`

**Cambios necesarios**:

1. ✅ Ya apunta al API Gateway via `config.apiGatewayUrl`
2. ✅ Ya tiene interceptor de autenticación (NextAuth)
3. ✅ Ya tiene manejo de errores global
4. ⚠️ Verificar que el modo serve funcione correctamente

**Acción**: Probar que cuando `NEXT_PUBLIC_DATA_MODE=serve` no use MockService

```typescript
// Verificar esta lógica en httpClient.ts
public async get<T>(url: string, params?: any): Promise<T> {
  if (isMockMode()) {
    // ❌ NO ejecutar en modo serve
    const mockResponse = await MockService.mockRequest<T>(url, "GET", params);
    return mockResponse.data;
  }
  // ✅ Ejecutar en modo serve
  const response = await this.instance.get<T>(url, { params });
  return response.data;
}
```

#### 1.3 Configurar Prefijos de API

**Archivo**: Crear `src/infrastructure/api/endpoints.ts`

```typescript
/**
 * Mapa centralizado de endpoints del API Gateway
 * Todos los endpoints usan el prefijo /api/v1
 */

export const API_VERSION = "/api/v1";

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_VERSION}/auth/login`,
  REGISTER: `${API_VERSION}/auth/register`,
  LOGOUT: `${API_VERSION}/auth/logout`,
  PROFILE: `${API_VERSION}/auth/profile`,
  REFRESH_TOKEN: `${API_VERSION}/auth/refresh`,
  VERIFY_EMAIL: `${API_VERSION}/auth/verify-email`,
  FORGOT_PASSWORD: `${API_VERSION}/auth/forgot-password`,
  RESET_PASSWORD: `${API_VERSION}/auth/reset-password`,
} as const;

export const RESOURCES_ENDPOINTS = {
  BASE: `${API_VERSION}/resources`,
  CATEGORIES: `${API_VERSION}/resources/categories`,
  IMPORT_CSV: `${API_VERSION}/resources/import/csv`,
  MAINTENANCE: `${API_VERSION}/resources/maintenance`,
  AVAILABILITY: `${API_VERSION}/resources/availability`,
} as const;

export const AVAILABILITY_ENDPOINTS = {
  BASE: `${API_VERSION}/availability`,
  RESERVATIONS: `${API_VERSION}/availability/reservations`,
  CALENDAR: `${API_VERSION}/availability/calendar`,
  CONFLICTS: `${API_VERSION}/availability/conflicts`,
} as const;

export const STOCKPILE_ENDPOINTS = {
  BASE: `${API_VERSION}/stockpile`,
  APPROVALS: `${API_VERSION}/stockpile/approvals`,
  NOTIFICATIONS: `${API_VERSION}/stockpile/notifications`,
  DOCUMENTS: `${API_VERSION}/stockpile/documents`,
} as const;

export const REPORTS_ENDPOINTS = {
  BASE: `${API_VERSION}/reports`,
  DASHBOARD: `${API_VERSION}/reports/dashboard`,
  USAGE: `${API_VERSION}/reports/usage`,
  EXPORT: `${API_VERSION}/reports/export`,
} as const;
```

---

### **Fase 2: Módulo Auth (Autenticación)** ⏱️ 2-3 horas

#### 2.1 Endpoints a Integrar

| Endpoint                    | Método | Descripción            | Prioridad |
| --------------------------- | ------ | ---------------------- | --------- |
| `/api/v1/auth/login`        | POST   | Login con credenciales | 🔴 Alta   |
| `/api/v1/auth/register`     | POST   | Registro de usuario    | 🔴 Alta   |
| `/api/v1/auth/profile`      | GET    | Obtener perfil actual  | 🔴 Alta   |
| `/api/v1/auth/logout`       | POST   | Cerrar sesión          | 🟡 Media  |
| `/api/v1/auth/refresh`      | POST   | Refrescar token        | 🟡 Media  |
| `/api/v1/auth/verify-email` | POST   | Verificar email        | 🟢 Baja   |

#### 2.2 Actualizar auth-client.ts

**Archivo**: `src/infrastructure/api/auth-client.ts`

```typescript
import { httpClient } from "./httpClient";
import { AUTH_ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "@/types/api/response";

export class AuthClient {
  /**
   * Login con credenciales
   */
  static async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<LoginResponse>> {
    return httpClient.post<ApiResponse<LoginResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  static async getProfile(): Promise<ApiResponse<User>> {
    return httpClient.get<ApiResponse<User>>(AUTH_ENDPOINTS.PROFILE);
  }

  /**
   * Registro de nuevo usuario
   */
  static async register(data: RegisterDto): Promise<ApiResponse<User>> {
    return httpClient.post<ApiResponse<User>>(AUTH_ENDPOINTS.REGISTER, data);
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<ApiResponse<void>> {
    return httpClient.post<ApiResponse<void>>(AUTH_ENDPOINTS.LOGOUT);
  }
}
```

#### 2.3 Integrar con NextAuth

**Archivo**: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthClient } from "@/infrastructure/api/auth-client";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await AuthClient.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (response.success && response.data) {
            return {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              accessToken: response.data.token,
              refreshToken: response.data.refreshToken,
            };
          }

          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };
```

#### 2.4 Pruebas de Integración Auth

```bash
# 1. Verificar health check
curl http://localhost:3000/api/v1/health

# 2. Probar login (usar usuario de semillas)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ufps.edu.co",
    "password": "123456"
  }'

# 3. Probar obtener perfil con token
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

---

### **Fase 3: Módulo Resources (Recursos)** ⏱️ 3-4 horas

#### 3.1 Endpoints a Integrar

| Endpoint                        | Método | Descripción                | Prioridad |
| ------------------------------- | ------ | -------------------------- | --------- |
| `/api/v1/resources`             | GET    | Listar recursos (paginado) | 🔴 Alta   |
| `/api/v1/resources/:id`         | GET    | Obtener recurso por ID     | 🔴 Alta   |
| `/api/v1/resources`             | POST   | Crear recurso              | 🔴 Alta   |
| `/api/v1/resources/:id`         | PUT    | Actualizar recurso         | 🔴 Alta   |
| `/api/v1/resources/:id`         | DELETE | Eliminar recurso           | 🟡 Media  |
| `/api/v1/resources/categories`  | GET    | Listar categorías          | 🔴 Alta   |
| `/api/v1/resources/import/csv`  | POST   | Importar CSV               | 🟢 Baja   |
| `/api/v1/resources/maintenance` | GET    | Historial mantenimiento    | 🟡 Media  |

#### 3.2 Actualizar resources-client.ts

**Archivo**: `src/infrastructure/api/resources-client.ts`

```typescript
import { httpClient } from "./httpClient";
import { RESOURCES_ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "@/types/api/response";
import type { Resource, ResourceCategory } from "@/types/entities/resource";

export interface ResourceFilters {
  type?: string;
  capacity?: number;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export class ResourcesClient {
  /**
   * Listar recursos con filtros y paginación
   */
  static async list(
    filters?: ResourceFilters
  ): Promise<ApiResponse<Resource[]>> {
    return httpClient.get<ApiResponse<Resource[]>>(
      RESOURCES_ENDPOINTS.BASE,
      filters
    );
  }

  /**
   * Obtener recurso por ID
   */
  static async getById(id: string): Promise<ApiResponse<Resource>> {
    return httpClient.get<ApiResponse<Resource>>(
      `${RESOURCES_ENDPOINTS.BASE}/${id}`
    );
  }

  /**
   * Crear nuevo recurso
   */
  static async create(data: Partial<Resource>): Promise<ApiResponse<Resource>> {
    return httpClient.post<ApiResponse<Resource>>(
      RESOURCES_ENDPOINTS.BASE,
      data
    );
  }

  /**
   * Actualizar recurso existente
   */
  static async update(
    id: string,
    data: Partial<Resource>
  ): Promise<ApiResponse<Resource>> {
    return httpClient.put<ApiResponse<Resource>>(
      `${RESOURCES_ENDPOINTS.BASE}/${id}`,
      data
    );
  }

  /**
   * Eliminar recurso
   */
  static async delete(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<ApiResponse<void>>(
      `${RESOURCES_ENDPOINTS.BASE}/${id}`
    );
  }

  /**
   * Listar categorías de recursos
   */
  static async getCategories(): Promise<ApiResponse<ResourceCategory[]>> {
    return httpClient.get<ApiResponse<ResourceCategory[]>>(
      RESOURCES_ENDPOINTS.CATEGORIES
    );
  }

  /**
   * Importar recursos desde CSV
   */
  static async importCSV(
    file: File
  ): Promise<ApiResponse<{ imported: number }>> {
    const formData = new FormData();
    formData.append("file", file);

    return httpClient.upload<ApiResponse<{ imported: number }>>(
      RESOURCES_ENDPOINTS.IMPORT_CSV,
      formData
    );
  }
}
```

#### 3.3 Actualizar Páginas de Recursos

**Archivos a actualizar**:

- `src/app/[locale]/recursos/page.tsx` - Lista de recursos
- `src/app/[locale]/recursos/nuevo/page.tsx` - Crear recurso
- `src/app/[locale]/recursos/[id]/page.tsx` - Ver recurso
- `src/app/[locale]/recursos/[id]/editar/page.tsx` - Editar recurso

**Ejemplo**: Lista de recursos

```typescript
'use client';

import { useEffect, useState } from 'react';
import { ResourcesClient } from '@/infrastructure/api/resources-client';
import { Resource } from '@/types/entities/resource';

export default function RecursosPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await ResourcesClient.list({
        page: 1,
        limit: 20,
        isActive: true
      });

      if (response.success) {
        setResources(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Error al cargar recursos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando recursos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Recursos</h1>
      <ul>
        {resources.map(resource => (
          <li key={resource.id}>{resource.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### 3.4 Pruebas de Integración Resources

```bash
# 1. Listar recursos
curl http://localhost:3000/api/v1/resources?page=1&limit=10

# 2. Obtener recurso específico
curl http://localhost:3000/api/v1/resources/<ID>

# 3. Crear recurso (requiere autenticación)
curl -X POST http://localhost:3000/api/v1/resources \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sala 101",
    "type": "ROOM",
    "capacity": 30,
    "location": "Edificio A"
  }'

# 4. Listar categorías
curl http://localhost:3000/api/v1/resources/categories
```

---

### **Fase 4: Módulo Availability (Reservas)** ⏱️ 3-4 horas

#### 4.1 Endpoints a Integrar

| Endpoint                                | Método | Descripción          | Prioridad |
| --------------------------------------- | ------ | -------------------- | --------- |
| `/api/v1/availability/reservations`     | GET    | Listar reservas      | 🔴 Alta   |
| `/api/v1/availability/reservations/:id` | GET    | Ver reserva          | 🔴 Alta   |
| `/api/v1/availability/reservations`     | POST   | Crear reserva        | 🔴 Alta   |
| `/api/v1/availability/reservations/:id` | PUT    | Modificar reserva    | 🟡 Media  |
| `/api/v1/availability/reservations/:id` | DELETE | Cancelar reserva     | 🟡 Media  |
| `/api/v1/availability/calendar`         | GET    | Vista calendario     | 🔴 Alta   |
| `/api/v1/availability/conflicts`        | POST   | Verificar conflictos | 🟡 Media  |

#### 4.2 Actualizar reservations-client.ts

```typescript
import { httpClient } from "./httpClient";
import { AVAILABILITY_ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "@/types/api/response";
import type { Reservation } from "@/types/entities/reservation";

export interface ReservationFilters {
  resourceId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class ReservationsClient {
  /**
   * Listar reservas con filtros
   */
  static async list(
    filters?: ReservationFilters
  ): Promise<ApiResponse<Reservation[]>> {
    return httpClient.get<ApiResponse<Reservation[]>>(
      AVAILABILITY_ENDPOINTS.RESERVATIONS,
      filters
    );
  }

  /**
   * Crear nueva reserva
   */
  static async create(
    data: Partial<Reservation>
  ): Promise<ApiResponse<Reservation>> {
    return httpClient.post<ApiResponse<Reservation>>(
      AVAILABILITY_ENDPOINTS.RESERVATIONS,
      data
    );
  }

  /**
   * Obtener vista de calendario
   */
  static async getCalendar(params: {
    resourceId?: string;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<any>> {
    return httpClient.get<ApiResponse<any>>(
      AVAILABILITY_ENDPOINTS.CALENDAR,
      params
    );
  }

  /**
   * Verificar conflictos de disponibilidad
   */
  static async checkConflicts(data: {
    resourceId: string;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<{ hasConflicts: boolean; conflicts: any[] }>> {
    return httpClient.post<ApiResponse<any>>(
      AVAILABILITY_ENDPOINTS.CONFLICTS,
      data
    );
  }
}
```

---

### **Fase 5: Módulo Stockpile (Aprobaciones)** ⏱️ 2-3 horas

#### 5.1 Endpoints a Integrar

| Endpoint                                  | Método | Descripción           | Prioridad |
| ----------------------------------------- | ------ | --------------------- | --------- |
| `/api/v1/stockpile/approvals`             | GET    | Listar solicitudes    | 🔴 Alta   |
| `/api/v1/stockpile/approvals/:id`         | GET    | Ver solicitud         | 🔴 Alta   |
| `/api/v1/stockpile/approvals/:id/approve` | POST   | Aprobar solicitud     | 🔴 Alta   |
| `/api/v1/stockpile/approvals/:id/reject`  | POST   | Rechazar solicitud    | 🔴 Alta   |
| `/api/v1/stockpile/notifications`         | GET    | Listar notificaciones | 🟡 Media  |
| `/api/v1/stockpile/documents/:id`         | GET    | Descargar documento   | 🟢 Baja   |

---

### **Fase 6: Módulo Reports (Reportes)** ⏱️ 2-3 horas

#### 6.1 Endpoints a Integrar

| Endpoint                    | Método | Descripción         | Prioridad |
| --------------------------- | ------ | ------------------- | --------- |
| `/api/v1/reports/dashboard` | GET    | Dashboard principal | 🔴 Alta   |
| `/api/v1/reports/usage`     | GET    | Reporte de uso      | 🟡 Media  |
| `/api/v1/reports/export`    | POST   | Exportar a CSV/PDF  | 🟢 Baja   |

---

## 🧪 Testing y Validación

### Checklist de Pruebas por Módulo

#### ✅ Auth Module

- [ ] Login exitoso con credenciales correctas
- [ ] Login fallido con credenciales incorrectas
- [ ] Registro de nuevo usuario
- [ ] Obtener perfil autenticado
- [ ] Logout y limpieza de sesión
- [ ] Refresh token automático

#### ✅ Resources Module

- [ ] Listar recursos con paginación
- [ ] Buscar recursos con filtros
- [ ] Ver detalle de recurso
- [ ] Crear nuevo recurso
- [ ] Actualizar recurso existente
- [ ] Eliminar recurso
- [ ] Listar categorías
- [ ] Importar CSV

#### ✅ Availability Module

- [ ] Listar reservas
- [ ] Crear nueva reserva
- [ ] Modificar reserva
- [ ] Cancelar reserva
- [ ] Ver calendario de disponibilidad
- [ ] Verificar conflictos

#### ✅ Stockpile Module

- [ ] Listar solicitudes pendientes
- [ ] Aprobar solicitud
- [ ] Rechazar solicitud
- [ ] Ver documento generado

#### ✅ Reports Module

- [ ] Ver dashboard con métricas
- [ ] Generar reporte de uso
- [ ] Exportar a CSV/PDF

---

## 🚨 Manejo de Errores

### Estrategia Global

**Archivo**: `src/infrastructure/api/error-handler.ts`

```typescript
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export function handleApiError(error: any): ApiError {
  // Error de red
  if (!error.response) {
    return {
      code: "NETWORK_ERROR",
      message: "No se pudo conectar con el servidor",
      statusCode: 0,
    };
  }

  // Error del servidor
  return {
    code: error.response.data?.code || "UNKNOWN_ERROR",
    message: error.response.data?.message || "Error desconocido",
    statusCode: error.response.status,
    details: error.response.data,
  };
}

export function showErrorToast(error: ApiError): void {
  // Integrar con sistema de notificaciones
  console.error(`[${error.code}] ${error.message}`);
}
```

---

## 📊 Monitoreo y Debugging

### Herramientas de Desarrollo

1. **Redux DevTools**: Ver estado global
2. **Network Tab**: Monitorear peticiones HTTP
3. **Console Logs**: Interceptors están activos en desarrollo

### Logs de Interceptors

```typescript
// Se activan automáticamente en desarrollo
[2025-11-23T12:00:00.000Z] POST /api/v1/auth/login
[Timing] POST:/api/v1/auth/login → 234ms
[2025-11-23T12:00:00.234Z] POST /api/v1/auth/login → ✓ SUCCESS
```

---

## 🔄 Migración Gradual Mock → Serve

### Estrategia de Migración

#### Opción 1: Migración por Módulo (Recomendado)

```env
# Activar solo Auth en modo serve
NEXT_PUBLIC_AUTH_MODE=serve
NEXT_PUBLIC_RESOURCES_MODE=mock
NEXT_PUBLIC_AVAILABILITY_MODE=mock
NEXT_PUBLIC_STOCKPILE_MODE=mock
NEXT_PUBLIC_REPORTS_MODE=mock
```

#### Opción 2: Migración Completa

```env
# Activar todo en modo serve de una vez
NEXT_PUBLIC_DATA_MODE=serve
```

---

## 📝 Checklist de Implementación

### Pre-Integración

- [ ] Backend levantado y funcionando en todos los puertos
- [ ] Semillas ejecutadas (`npm run prisma:db:seed`)
- [ ] Health checks respondiendo correctamente
- [ ] API Gateway redirigiendo a microservicios

### Configuración Base

- [ ] `.env.local` actualizado con modo `serve`
- [ ] `endpoints.ts` creado con todos los endpoints
- [ ] `httpClient.ts` verificado que no use MockService
- [ ] Interceptors de autenticación funcionando

### Por Módulo

- [ ] **Auth**: Login, registro, perfil
- [ ] **Resources**: CRUD completo
- [ ] **Availability**: Reservas y calendario
- [ ] **Stockpile**: Aprobaciones y notificaciones
- [ ] **Reports**: Dashboard y reportes

### Testing

- [ ] Tests unitarios de clientes API
- [ ] Tests de integración end-to-end
- [ ] Pruebas manuales con Postman/curl
- [ ] Validación de flujos completos

### Deployment

- [ ] Variables de entorno en producción
- [ ] CORS configurado en API Gateway
- [ ] SSL/TLS configurado si aplica
- [ ] Monitoreo y logs activos

---

## 🎯 Priorización Recomendada

### Sprint 1 (Semana 1)

1. ✅ Fase 1: Configuración Base
2. ✅ Fase 2: Módulo Auth

### Sprint 2 (Semana 2)

3. ✅ Fase 3: Módulo Resources
4. ✅ Fase 4: Módulo Availability

### Sprint 3 (Semana 3)

5. ✅ Fase 5: Módulo Stockpile
6. ✅ Fase 6: Módulo Reports
7. ✅ Testing integral

---

## 📚 Recursos Adicionales

- [Documentación API Gateway](../bookly-mock/docs/API_GATEWAY.md)
- [Estándares de Response](../bookly-mock/docs/API_RESPONSE_STANDARD.md)
- [Guía de Errores](../bookly-mock/docs/ERROR_HANDLING.md)
- [Testing Guide](./TESTING_STATUS.md)

---

## 🤝 Convenciones

### Nomenclatura de Endpoints

- **Formato**: `/api/v1/{service}/{resource}/{action}`
- **Ejemplo**: `/api/v1/resources/import/csv`

### Formato de Response

```typescript
{
  "success": true,
  "data": { /* payload */ },
  "message": "Operación exitosa",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Formato de Error

```typescript
{
  "success": false,
  "message": "Error en la operación",
  "code": "RESOURCE_NOT_FOUND",
  "errors": [
    {
      "field": "id",
      "message": "Recurso no encontrado"
    }
  ]
}
```

---

## ✅ Criterios de Aceptación

1. **Autenticación Funcional**
   - Login exitoso con usuarios de semillas
   - Token JWT se guarda y usa en peticiones
   - Logout limpia sesión correctamente

2. **CRUD Recursos Completo**
   - Listar, crear, editar y eliminar recursos
   - Filtros y paginación funcionando
   - Categorías cargando desde backend

3. **Reservas Operativas**
   - Crear reserva verifica disponibilidad
   - Conflictos detectados correctamente
   - Calendario muestra reservas reales

4. **Aprobaciones Funcionales**
   - Flujo completo de solicitud → aprobación
   - Notificaciones enviadas correctamente
   - Documentos generados y descargables

5. **Reportes Precisos**
   - Dashboard muestra métricas reales
   - Reportes exportables en CSV/PDF
   - Gráficos actualizados en tiempo real

---

## 🎉 Próximos Pasos

Una vez completada la integración:

1. **Optimización de Performance**
   - Implementar caching con React Query
   - Optimizar peticiones con batch requests
   - Lazy loading de componentes pesados

2. **Mejoras de UX**
   - Skeleton screens mientras carga
   - Retry automático en errores de red
   - Feedback visual de operaciones

3. **Monitoreo en Producción**
   - Integrar Sentry para error tracking
   - Configurar Google Analytics
   - Logs estructurados con Winston

---

**Fecha de Creación**: 2025-11-23
**Última Actualización**: 2025-11-23
**Versión**: 1.0.0
**Estado**: ✅ Listo para implementación
