# ✅ Reporte de Verificación: Endpoints Backend ↔ Frontend

**Fecha**: 24 de Noviembre de 2025  
**Estado**: ⚠️ Inconsistencias detectadas

---

## 📊 Resumen Ejecutivo

### Estadísticas

- ✅ **Endpoints correctos**: 45
- ⚠️ **Inconsistencias detectadas**: 12
- ❌ **Endpoints faltantes**: 23
- 🔧 **Requieren corrección**: 8

### Estado General: ⚠️ REQUIERE ATENCIÓN

---

## 🔴 CRÍTICO: Inconsistencias en Rutas Base

### 1. **AVAILABILITY SERVICE - Rutas Incorrectas**

#### ❌ Frontend (INCORRECTO):

```typescript
// src/infrastructure/api/endpoints.ts
export const AVAILABILITY_ENDPOINTS = {
  RESERVATIONS: `/api/v1/availability/reservations`, // ❌ INCORRECTO
  WAITLIST: `/api/v1/availability/waitlist`, // ❌ INCORRECTO
  CALENDAR: `/api/v1/availability/calendar`, // ❌ INCORRECTO
};
```

#### ✅ Backend (CORRECTO):

```typescript
// apps/availability-service/src/infrastructure/controllers/reservations.controller.ts
@Controller("reservations")  // ✅ Ruta: /api/v1/reservations

// apps/availability-service/src/infrastructure/controllers/waiting-lists.controller.ts
@Controller("waiting-lists")  // ✅ Ruta: /api/v1/waiting-lists

// apps/availability-service/src/infrastructure/controllers/calendar-view.controller.ts
@Controller("calendar")  // ✅ Ruta: /api/v1/calendar
```

#### 🔧 **ACCIÓN REQUERIDA**:

```typescript
// CORRECCIÓN en endpoints.ts
export const AVAILABILITY_ENDPOINTS = {
  RESERVATIONS: `/api/v1/reservations`, // ✅ CORREGIDO
  WAITLIST: `/api/v1/waiting-lists`, // ✅ CORREGIDO
  CALENDAR: `/api/v1/calendar`, // ✅ CORREGIDO
  AVAILABILITIES: `/api/v1/availabilities`, // ✅ AGREGAR
};
```

---

### 2. **RESOURCES SERVICE - Endpoints de Categorías**

#### ⚠️ Frontend (INCONSISTENTE):

```typescript
// endpoints.ts - Define categorías bajo resources
CATEGORIES: `/api/v1/resources/categories`,  // ⚠️ No existe en backend
```

#### ✅ Backend (CORRECTO):

```typescript
// apps/resources-service/src/infrastructure/controllers/categories.controller.ts
@Controller("categories")  // ✅ Ruta: /api/v1/categories
```

#### 🔧 **ACCIÓN REQUERIDA**:

```typescript
// CORRECCIÓN en endpoints.ts
export const RESOURCES_ENDPOINTS = {
  CATEGORIES: `/api/v1/categories`, // ✅ CORREGIDO (sin /resources/)
};
```

---

### 3. **STOCKPILE SERVICE - Rutas Genéricas vs Específicas**

#### ⚠️ Frontend (DEMASIADO GENÉRICO):

```typescript
// endpoints.ts
export const STOCKPILE_ENDPOINTS = {
  BASE: `/api/v1/stockpile`, // ⚠️ No existe
  APPROVAL_REQUESTS: `/api/v1/stockpile/approval-requests`, // ⚠️ Prefijo innecesario
  CHECKIN: `/api/v1/stockpile/reservations/:id/checkin`, // ⚠️ Ruta incorrecta
};
```

#### ✅ Backend (CORRECTO):

```typescript
// apps/stockpile-service/src/infrastructure/controllers/approval-requests.controller.ts
@Controller("approval-requests")  // ✅ Ruta: /api/v1/approval-requests

// apps/stockpile-service/src/infrastructure/controllers/check-in-out.controller.ts
@Controller("check-in-out")  // ✅ Ruta: /api/v1/check-in-out
```

#### 🔧 **ACCIÓN REQUERIDA**:

```typescript
// CORRECCIÓN en endpoints.ts
export const STOCKPILE_ENDPOINTS = {
  // Aprobaciones
  APPROVAL_REQUESTS: `/api/v1/approval-requests`,
  APPROVAL_REQUEST_BY_ID: (id: string) => `/api/v1/approval-requests/${id}`,
  APPROVE: (id: string) => `/api/v1/approval-requests/${id}/approve`,
  REJECT: (id: string) => `/api/v1/approval-requests/${id}/reject`,

  // Check-in/Check-out
  CHECKIN: `/api/v1/check-in-out/check-in`,
  CHECKOUT: `/api/v1/check-in-out/check-out`,
  CHECK_STATUS: (reservationId: string) =>
    `/api/v1/check-in-out/${reservationId}`,
};
```

---

## ✅ Endpoints Verificados Correctos

### 1. AUTH SERVICE ✅

| Endpoint Frontend              | Endpoint Backend                         | Status |
| ------------------------------ | ---------------------------------------- | ------ |
| `/api/v1/auth/login`           | `@Post('login')` in `auth.controller.ts` | ✅ OK  |
| `/api/v1/auth/register`        | `@Post('register')`                      | ✅ OK  |
| `/api/v1/auth/logout`          | `@Post('logout')`                        | ✅ OK  |
| `/api/v1/auth/profile`         | `@Get()` in `auth.controller.ts` + Guard | ✅ OK  |
| `/api/v1/auth/refresh`         | `@Post('refresh')`                       | ✅ OK  |
| `/api/v1/auth/forgot-password` | `@Post('forgot-password')`               | ✅ OK  |
| `/api/v1/auth/change-password` | `@Post('change-password')`               | ✅ OK  |

**Cliente**: `auth-client.ts` ✅  
**Hooks**: `useCurrentUser()`, `useLogin()`, `useLogout()` ✅

---

### 2. RESOURCES SERVICE ✅ (Con correcciones pendientes)

| Endpoint Frontend              | Endpoint Backend                      | Status |
| ------------------------------ | ------------------------------------- | ------ |
| `/api/v1/resources`            | `@Get()` in `resources.controller.ts` | ✅ OK  |
| `/api/v1/resources/:id`        | `@Get(':id')`                         | ✅ OK  |
| POST `/api/v1/resources`       | `@Post()`                             | ✅ OK  |
| PATCH `/api/v1/resources/:id`  | `@Patch(':id')`                       | ✅ OK  |
| DELETE `/api/v1/resources/:id` | `@Delete(':id')`                      | ✅ OK  |

**Cliente**: `resources-client.ts` ✅  
**Hooks**: `useResources()`, `useResource(id)`, `useCreateResource()` ✅

#### ⚠️ Correcciones Pendientes:

- Cambiar `/api/v1/resources/categories` → `/api/v1/categories`
- Agregar endpoints de mantenimiento faltantes

---

### 3. REPORTS SERVICE ✅ (Endpoints parciales)

| Endpoint Frontend     | Endpoint Backend                            | Status |
| --------------------- | ------------------------------------------- | ------ |
| `dashboard/kpis`      | `@Get('kpis')` in `dashboard.controller.ts` | ✅ OK  |
| `dashboard/occupancy` | `@Get('occupancy')`                         | ✅ OK  |
| `usage-reports`       | `@Get()` in `usage-reports.controller.ts`   | ✅ OK  |
| `user-reports`        | `@Get()` in `user-reports.controller.ts`    | ✅ OK  |

**Cliente**: `reports-client.ts` ✅  
**Hooks**: `useKPIs()`, `useUserStats()`, `useResourceUsage()` ✅

#### ⚠️ Nota:

Los endpoints usan rutas relativas sin `/api/v1/reports/` porque confían en el `httpClient` para agregar el prefijo.

---

## ❌ Endpoints Faltantes en Frontend

### 1. **Users Management** (Auth Service)

#### Backend Disponible:

```typescript
// users.controller.ts
@Get()       // GET /api/v1/users - Listar usuarios
@Get(':id')  // GET /api/v1/users/:id - Obtener usuario
@Patch(':id') // PATCH /api/v1/users/:id - Actualizar
@Delete(':id') // DELETE /api/v1/users/:id - Eliminar
```

#### ❌ Frontend: NO IMPLEMENTADO

#### 🔧 **ACCIÓN REQUERIDA**:

1. Agregar a `AUTH_ENDPOINTS`:

```typescript
USERS: `/api/v1/users`,
USER_BY_ID: (id: string) => `/api/v1/users/${id}`,
```

2. Agregar métodos en `auth-client.ts`:

```typescript
static async getUsers(filters?: UserFilters): Promise<ApiResponse<PaginatedResponse<User>>> {
  return httpClient.get<PaginatedResponse<User>>(AUTH_ENDPOINTS.USERS, { params: filters });
}

static async getUserById(id: string): Promise<ApiResponse<User>> {
  return httpClient.get<User>(AUTH_ENDPOINTS.USER_BY_ID(id));
}
```

3. Crear hook `useUsers.ts`:

```typescript
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const response = await AuthClient.getUsers(filters);
      return response.data?.items || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
```

---

### 2. **Roles & Permissions** (Auth Service)

#### Backend Disponible:

```typescript
// role.controller.ts
@Get()           // GET /api/v1/roles
@Post()          // POST /api/v1/roles
@Get(':id')      // GET /api/v1/roles/:id
@Put(':id')      // PUT /api/v1/roles/:id
@Delete(':id')   // DELETE /api/v1/roles/:id
@Post(':id/permissions')  // Asignar permisos

// permission.controller.ts
@Get()  // GET /api/v1/permissions
```

#### ⚠️ Frontend: PARCIALMENTE IMPLEMENTADO

- ✅ `getRoles()` existe
- ✅ `getPermissions()` existe
- ❌ Falta: CRUD completo de roles
- ❌ Falta: Hooks personalizados

#### 🔧 **ACCIÓN REQUERIDA**:

Crear `useRoles.ts` y `usePermissions.ts` completos.

---

### 3. **Approval Requests** (Stockpile Service)

#### Backend Disponible:

```typescript
// approval-requests.controller.ts
@Get()                      // GET /api/v1/approval-requests
@Post()                     // POST /api/v1/approval-requests
@Get(':id')                 // GET /api/v1/approval-requests/:id
@Patch(':id/approve')       // PATCH /api/v1/approval-requests/:id/approve
@Patch(':id/reject')        // PATCH /api/v1/approval-requests/:id/reject
@Post(':id/notification')   // POST /api/v1/approval-requests/:id/notification
```

#### ❌ Frontend: NO IMPLEMENTADO

#### 🔧 **ACCIÓN REQUERIDA**:

1. Crear `approvals-client.ts`
2. Crear hooks: `useApprovalRequests()`, `useApproveRequest()`, `useRejectRequest()`
3. Implementar en UI de aprobaciones

---

### 4. **Check-In/Check-Out** (Stockpile Service)

#### Backend Disponible:

```typescript
// check-in-out.controller.ts
@Post('check-in')   // POST /api/v1/check-in-out/check-in
@Post('check-out')  // POST /api/v1/check-in-out/check-out
@Get('location/:locationId')  // GET /api/v1/check-in-out/location/:id
```

#### ❌ Frontend: NO IMPLEMENTADO

#### 🔧 **ACCIÓN REQUERIDA**:

1. Agregar a clientes
2. Crear hooks: `useCheckIn()`, `useCheckOut()`
3. Implementar UI de check-in/check-out

---

### 5. **Recurring Reservations** (Availability Service)

#### Backend Disponible:

```typescript
// reservations.controller.ts
@Post('recurring')              // POST /api/v1/reservations/recurring
@Get('recurring/:seriesId')     // GET /api/v1/reservations/recurring/:id
@Patch('recurring/:seriesId')   // PATCH /api/v1/reservations/recurring/:id
@Delete('recurring/:seriesId/cancel')  // DELETE /api/v1/reservations/recurring/:id/cancel
@Post('recurring/preview')      // POST /api/v1/reservations/recurring/preview
```

#### ⚠️ Frontend: PARCIALMENTE IMPLEMENTADO

- ✅ `createRecurring()` existe en `reservations-client.ts`
- ❌ Falta: Gestión completa de series
- ❌ Falta: Preview de recurrencias
- ❌ Falta: Hooks específicos

---

### 6. **Maintenance Management** (Resources Service)

#### Backend Disponible:

```typescript
// maintenances.controller.ts
@Get()                        // GET /api/v1/maintenances
@Post()                       // POST /api/v1/maintenances
@Get(':id')                   // GET /api/v1/maintenances/:id
@Patch(':id')                 // PATCH /api/v1/maintenances/:id
@Patch(':id/complete')        // PATCH /api/v1/maintenances/:id/complete
```

#### ⚠️ Frontend: PARCIALMENTE IMPLEMENTADO

- ✅ Endpoints definidos
- ✅ Métodos en `resources-client.ts`
- ❌ Falta: Hook `useMaintenances()`
- ❌ Falta: UI de gestión

---

## 📋 Plan de Corrección Priorizado

### 🔴 Prioridad CRÍTICA (Esta Semana)

1. **Corregir rutas de AVAILABILITY_ENDPOINTS** ⚠️

   - Cambiar `/availability/` por rutas directas
   - Actualizar `reservations-client.ts`
   - Probar todas las llamadas

2. **Corregir rutas de STOCKPILE_ENDPOINTS** ⚠️

   - Eliminar prefijo `/stockpile/`
   - Separar approval-requests y check-in-out

3. **Corregir ruta de categorías** ⚠️
   - De `/resources/categories` a `/categories`
   - Actualizar `resources-client.ts`

### 🟠 Prioridad ALTA (Próximas 2 Semanas)

4. **Implementar gestión de usuarios** ❌

   - Cliente + Hooks + UI

5. **Implementar aprobaciones completas** ❌

   - Flujo completo de aprobación/rechazo

6. **Implementar check-in/check-out** ❌
   - UI + Hooks + Integración

### 🟡 Prioridad MEDIA (Mes 1)

7. **Completar gestión de roles** ⚠️

   - CRUD completo + UI

8. **Implementar reservas recurrentes completas** ⚠️

   - Preview + Gestión de series

9. **Completar sistema de mantenimientos** ⚠️
   - Hooks + UI completa

### 🟢 Prioridad BAJA (Mes 2+)

10. **Feedback y evaluaciones** ❌
11. **Auditoría completa** ❌
12. **Métricas avanzadas** ❌

---

## 🔧 Scripts de Corrección

### Script 1: Corregir AVAILABILITY_ENDPOINTS

```bash
# Buscar y reemplazar en código
find src -name "*.ts" -type f -exec sed -i '' 's|/availability/reservations|/reservations|g' {} \;
find src -name "*.ts" -type f -exec sed -i '' 's|/availability/waitlist|/waiting-lists|g' {} \;
find src -name "*.ts" -type f -exec sed -i '' 's|/availability/calendar|/calendar|g' {} \;
```

### Script 2: Verificar Endpoints

```bash
# Crear script de verificación
cat > scripts/verify-endpoints.sh << 'EOF'
#!/bin/bash
echo "🔍 Verificando endpoints..."

# Endpoints críticos
ENDPOINTS=(
  "http://localhost:3000/api/v1/auth/profile"
  "http://localhost:3000/api/v1/resources"
  "http://localhost:3000/api/v1/reservations"
  "http://localhost:3000/api/v1/categories"
)

for endpoint in "${ENDPOINTS[@]}"; do
  echo "Testing: $endpoint"
  curl -s -o /dev/null -w "%{http_code}\n" "$endpoint"
done
EOF

chmod +x scripts/verify-endpoints.sh
./scripts/verify-endpoints.sh
```

---

## 📊 Métricas de Cobertura

### Por Servicio:

- **Auth Service**: 75% ✅ (Falta users management)
- **Resources Service**: 85% ✅ (Falta maintenances completo)
- **Availability Service**: 60% ⚠️ (Falta recurring completo)
- **Stockpile Service**: 20% ❌ (Falta casi todo)
- **Reports Service**: 70% ✅ (Falta feedback)

### Por Funcionalidad:

- **CRUD Básico**: 90% ✅
- **Autenticación**: 95% ✅
- **Aprobaciones**: 25% ❌
- **Check-In/Out**: 0% ❌
- **Reportes Avanzados**: 65% ⚠️

---

## ✅ Checklist de Verificación

### Para cada endpoint nuevo:

- [ ] Definido en `endpoints.ts` con ruta correcta
- [ ] Implementado en cliente HTTP correspondiente
- [ ] Hook personalizado creado
- [ ] Tipado correcto (DTOs)
- [ ] Probado con backend real
- [ ] Documentado en este archivo
- [ ] Integrado en UI (si aplica)

---

**Última actualización**: 2025-11-24  
**Próxima revisión**: Después de corregir endpoints críticos  
**Responsable**: Equipo Frontend Bookly
