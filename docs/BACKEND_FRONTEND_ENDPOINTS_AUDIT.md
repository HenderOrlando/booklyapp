# 🔗 Auditoría de Endpoints: Backend ↔ Frontend

**Fecha**: 24 de Noviembre de 2025  
**Estado**: 🔍 Análisis en curso

---

## 📋 Resumen Ejecutivo

Este documento mapea los endpoints disponibles en el backend (bookly-mock) con su implementación en el frontend (bookly-mock-frontend), identificando inconsistencias y endpoints faltantes.

### 🎯 Objetivos

1. ✅ Documentar todos los endpoints del backend
2. ✅ Verificar implementación en clientes HTTP del frontend
3. ✅ Identificar endpoints no implementados
4. ✅ Detectar inconsistencias en nombres/rutas

---

## 🏗️ Servicios del Backend

### 1. **Auth Service** (Puerto 3001)

**Base Path**: `/api/v1/auth` y `/api/v1/users`

### 2. **Resources Service** (Puerto 3002)

**Base Path**: `/api/v1/resources` y `/api/v1/categories`

### 3. **Availability Service** (Puerto 3003)

**Base Path**: `/api/v1/reservations`, `/api/v1/availabilities`, `/api/v1/waiting-lists`

### 4. **Stockpile Service** (Puerto 3004)

**Base Path**: `/api/v1/approval-requests`, `/api/v1/check-in-out`

### 5. **Reports Service** (Puerto 3005)

**Base Path**: `/api/v1/reports`, `/api/v1/dashboard`, `/api/v1/feedback`

---

## 🔐 1. AUTH SERVICE - Endpoints

### 1.1 Autenticación (`/api/v1/auth`)

| Método | Endpoint                    | Descripción             | Frontend Client                      | Hook                  | Status |
| ------ | --------------------------- | ----------------------- | ------------------------------------ | --------------------- | ------ |
| POST   | `/auth/register`            | Registrar nuevo usuario | ✅ `AuthClient.register()`           | -                     | ✅ OK  |
| POST   | `/auth/login`               | Iniciar sesión          | ✅ `AuthClient.login()`              | -                     | ✅ OK  |
| POST   | `/auth/logout`              | Cerrar sesión           | ✅ `AuthClient.logout()`             | -                     | ✅ OK  |
| POST   | `/auth/refresh`             | Renovar token           | ✅ `AuthClient.refreshToken()`       | -                     | ✅ OK  |
| GET    | `/auth/profile`             | Obtener perfil          | ✅ `AuthClient.getProfile()`         | ✅ `useCurrentUser()` | ✅ OK  |
| POST   | `/auth/forgot-password`     | Recuperar contraseña    | ✅ `AuthClient.forgotPassword()`     | -                     | ✅ OK  |
| POST   | `/auth/reset-password`      | Restablecer contraseña  | ✅ `AuthClient.resetPassword()`      | -                     | ✅ OK  |
| POST   | `/auth/change-password`     | Cambiar contraseña      | ✅ `AuthClient.changePassword()`     | -                     | ✅ OK  |
| POST   | `/auth/verify-email`        | Verificar email         | ✅ `AuthClient.verifyEmail()`        | -                     | ✅ OK  |
| POST   | `/auth/resend-verification` | Reenviar verificación   | ✅ `AuthClient.resendVerification()` | -                     | ✅ OK  |

### 1.2 Two-Factor Authentication (`/api/v1/auth/2fa`)

| Método | Endpoint                            | Descripción              | Frontend Client                         | Status |
| ------ | ----------------------------------- | ------------------------ | --------------------------------------- | ------ |
| POST   | `/auth/2fa/setup`                   | Configurar 2FA           | ✅ `AuthClient.setup2FA()`              | ✅ OK  |
| POST   | `/auth/2fa/enable`                  | Activar 2FA              | ✅ `AuthClient.enable2FA()`             | ✅ OK  |
| POST   | `/auth/2fa/disable`                 | Desactivar 2FA           | ✅ `AuthClient.disable2FA()`            | ✅ OK  |
| POST   | `/auth/2fa/verify`                  | Verificar código 2FA     | ✅ `AuthClient.loginWith2FA()`          | ✅ OK  |
| POST   | `/auth/2fa/backup-codes/regenerate` | Regenerar códigos backup | ✅ `AuthClient.regenerateBackupCodes()` | ✅ OK  |
| POST   | `/auth/2fa/backup-codes/use`        | Usar código backup       | ✅ `AuthClient.useBackupCode()`         | ✅ OK  |

### 1.3 Gestión de Usuarios (`/api/v1/users`)

| Método | Endpoint     | Descripción             | Frontend Client | Hook     | Status                  |
| ------ | ------------ | ----------------------- | --------------- | -------- | ----------------------- |
| GET    | `/users/me`  | Perfil propio           | ❌ Falta        | ❌ Falta | ⚠️ USAR `/auth/profile` |
| GET    | `/users`     | Listar usuarios (admin) | ❌ Falta        | ❌ Falta | ⚠️ Falta                |
| GET    | `/users/:id` | Obtener usuario por ID  | ❌ Falta        | ❌ Falta | ⚠️ Falta                |
| PATCH  | `/users/:id` | Actualizar usuario      | ❌ Falta        | ❌ Falta | ⚠️ Falta                |
| DELETE | `/users/:id` | Eliminar usuario        | ❌ Falta        | ❌ Falta | ⚠️ Falta                |

### 1.4 Roles y Permisos (`/api/v1/roles`, `/api/v1/permissions`)

| Método | Endpoint                 | Descripción        | Frontend Client | Hook     | Status   |
| ------ | ------------------------ | ------------------ | --------------- | -------- | -------- |
| GET    | `/roles`                 | Listar roles       | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| POST   | `/roles`                 | Crear rol          | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| GET    | `/roles/:id`             | Obtener rol por ID | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| PUT    | `/roles/:id`             | Actualizar rol     | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| DELETE | `/roles/:id`             | Eliminar rol       | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| POST   | `/roles/:id/permissions` | Asignar permisos   | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| GET    | `/permissions`           | Listar permisos    | ❌ Falta        | ❌ Falta | ⚠️ Falta |

---

## 📦 2. RESOURCES SERVICE - Endpoints

### 2.1 Recursos (`/api/v1/resources`)

| Método | Endpoint                     | Descripción            | Frontend Client                       | Hook                     | Status        |
| ------ | ---------------------------- | ---------------------- | ------------------------------------- | ------------------------ | ------------- |
| GET    | `/resources`                 | Listar recursos        | ✅ `ResourcesClient.getAll()`         | ✅ `useResources()`      | ✅ OK         |
| POST   | `/resources`                 | Crear recurso          | ✅ `ResourcesClient.create()`         | ✅ `useCreateResource()` | ✅ OK         |
| GET    | `/resources/:id`             | Obtener recurso por ID | ✅ `ResourcesClient.getById()`        | ✅ `useResource(id)`     | ✅ OK         |
| PATCH  | `/resources/:id`             | Actualizar recurso     | ✅ `ResourcesClient.update()`         | ✅ `useUpdateResource()` | ✅ OK         |
| DELETE | `/resources/:id`             | Eliminar recurso       | ✅ `ResourcesClient.delete()`         | ✅ `useDeleteResource()` | ✅ OK         |
| POST   | `/resources/:id/restore`     | Restaurar recurso      | ❌ Falta                              | ❌ Falta                 | ⚠️ Falta      |
| POST   | `/resources/import`          | Importar recursos CSV  | ❌ Falta                              | ❌ Falta                 | ⚠️ Falta      |
| POST   | `/resources/search/advanced` | Búsqueda avanzada      | ✅ `ResourcesClient.searchAdvanced()` | ❌ Falta                 | ⚠️ Falta hook |

### 2.2 Categorías (`/api/v1/categories`)

| Método | Endpoint          | Descripción          | Frontend Client                        | Hook                     | Status        |
| ------ | ----------------- | -------------------- | -------------------------------------- | ------------------------ | ------------- |
| GET    | `/categories`     | Listar categorías    | ✅ `ResourcesClient.getCategories()`   | ❌ Falta                 | ⚠️ Falta hook |
| POST   | `/categories`     | Crear categoría      | ✅ `ResourcesClient.createCategory()`  | ✅ `useCreateCategory()` | ✅ OK         |
| GET    | `/categories/:id` | Obtener categoría    | ✅ `ResourcesClient.getCategoryById()` | ❌ Falta                 | ⚠️ Falta hook |
| PATCH  | `/categories/:id` | Actualizar categoría | ✅ `ResourcesClient.updateCategory()`  | ✅ `useUpdateCategory()` | ✅ OK         |
| DELETE | `/categories/:id` | Eliminar categoría   | ✅ `ResourcesClient.deleteCategory()`  | ✅ `useDeleteCategory()` | ✅ OK         |

### 2.3 Mantenimientos (`/api/v1/maintenances`)

| Método | Endpoint                     | Descripción              | Frontend Client                           | Hook                        | Status        |
| ------ | ---------------------------- | ------------------------ | ----------------------------------------- | --------------------------- | ------------- |
| GET    | `/maintenances`              | Listar mantenimientos    | ✅ `ResourcesClient.getMaintenances()`    | ❌ Falta                    | ⚠️ Falta hook |
| POST   | `/maintenances`              | Crear mantenimiento      | ✅ `ResourcesClient.createMaintenance()`  | ✅ `useCreateMaintenance()` | ✅ OK         |
| GET    | `/maintenances/:id`          | Obtener mantenimiento    | ✅ `ResourcesClient.getMaintenanceById()` | ❌ Falta                    | ⚠️ Falta hook |
| PATCH  | `/maintenances/:id`          | Actualizar mantenimiento | ✅ `ResourcesClient.updateMaintenance()`  | ✅ `useUpdateMaintenance()` | ✅ OK         |
| PATCH  | `/maintenances/:id/complete` | Completar mantenimiento  | ❌ Falta                                  | ❌ Falta                    | ⚠️ Falta      |

---

## 📅 3. AVAILABILITY SERVICE - Endpoints

### 3.1 Reservas (`/api/v1/reservations`)

| Método | Endpoint                      | Descripción        | Frontend Client                   | Hook                        | Status   |
| ------ | ----------------------------- | ------------------ | --------------------------------- | --------------------------- | -------- |
| GET    | `/reservations`               | Listar reservas    | ✅ `ReservationsClient.getAll()`  | ✅ `useReservations()`      | ✅ OK    |
| POST   | `/reservations`               | Crear reserva      | ✅ `ReservationsClient.create()`  | ✅ `useCreateReservation()` | ✅ OK    |
| GET    | `/reservations/:id`           | Obtener reserva    | ✅ `ReservationsClient.getById()` | ✅ `useReservation(id)`     | ✅ OK    |
| PATCH  | `/reservations/:id`           | Actualizar reserva | ✅ `ReservationsClient.update()`  | ✅ `useUpdateReservation()` | ✅ OK    |
| DELETE | `/reservations/:id/cancel`    | Cancelar reserva   | ✅ `ReservationsClient.cancel()`  | ✅ `useCancelReservation()` | ✅ OK    |
| POST   | `/reservations/:id/check-in`  | Check-in           | ❌ Falta                          | ❌ Falta                    | ⚠️ Falta |
| POST   | `/reservations/:id/check-out` | Check-out          | ❌ Falta                          | ❌ Falta                    | ⚠️ Falta |

### 3.2 Reservas Recurrentes (`/api/v1/reservations/recurring`)

| Método | Endpoint                                   | Descripción              | Frontend Client                           | Hook     | Status        |
| ------ | ------------------------------------------ | ------------------------ | ----------------------------------------- | -------- | ------------- |
| POST   | `/reservations/recurring`                  | Crear reserva recurrente | ✅ `ReservationsClient.createRecurring()` | ❌ Falta | ⚠️ Falta hook |
| GET    | `/reservations/recurring/:seriesId`        | Obtener serie            | ❌ Falta                                  | ❌ Falta | ⚠️ Falta      |
| PATCH  | `/reservations/recurring/:seriesId`        | Actualizar serie         | ❌ Falta                                  | ❌ Falta | ⚠️ Falta      |
| DELETE | `/reservations/recurring/:seriesId/cancel` | Cancelar serie           | ❌ Falta                                  | ❌ Falta | ⚠️ Falta      |
| POST   | `/reservations/recurring/preview`          | Preview de recurrencias  | ❌ Falta                                  | ❌ Falta | ⚠️ Falta      |

### 3.3 Disponibilidad (`/api/v1/availabilities`)

| Método | Endpoint                   | Descripción               | Frontend Client                             | Hook     | Status        |
| ------ | -------------------------- | ------------------------- | ------------------------------------------- | -------- | ------------- |
| GET    | `/availabilities`          | Consultar disponibilidad  | ✅ `ReservationsClient.checkAvailability()` | ❌ Falta | ⚠️ Falta hook |
| POST   | `/availabilities`          | Configurar disponibilidad | ❌ Falta                                    | ❌ Falta | ⚠️ Falta      |
| GET    | `/availabilities/calendar` | Vista calendario          | ❌ Falta                                    | ❌ Falta | ⚠️ Falta      |

### 3.4 Lista de Espera (`/api/v1/waiting-lists`)

| Método | Endpoint             | Descripción               | Frontend Client                              | Hook                         | Status   |
| ------ | -------------------- | ------------------------- | -------------------------------------------- | ---------------------------- | -------- |
| POST   | `/waiting-lists`     | Agregar a lista de espera | ✅ `ReservationsClient.addToWaitlist()`      | ✅ `useAddToWaitlist()`      | ✅ OK    |
| GET    | `/waiting-lists`     | Listar esperas            | ❌ Falta                                     | ❌ Falta                     | ⚠️ Falta |
| DELETE | `/waiting-lists/:id` | Remover de lista          | ✅ `ReservationsClient.removeFromWaitlist()` | ✅ `useRemoveFromWaitlist()` | ✅ OK    |

---

## ✅ 4. STOCKPILE SERVICE - Endpoints

### 4.1 Solicitudes de Aprobación (`/api/v1/approval-requests`)

| Método | Endpoint                              | Descripción         | Frontend Client | Hook     | Status   |
| ------ | ------------------------------------- | ------------------- | --------------- | -------- | -------- |
| GET    | `/approval-requests`                  | Listar solicitudes  | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| POST   | `/approval-requests`                  | Crear solicitud     | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| GET    | `/approval-requests/:id`              | Obtener solicitud   | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| PATCH  | `/approval-requests/:id/approve`      | Aprobar solicitud   | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| PATCH  | `/approval-requests/:id/reject`       | Rechazar solicitud  | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| POST   | `/approval-requests/:id/notification` | Enviar notificación | ❌ Falta        | ❌ Falta | ⚠️ Falta |

### 4.2 Check-In/Check-Out (`/api/v1/check-in-out`)

| Método | Endpoint                             | Descripción             | Frontend Client | Hook     | Status   |
| ------ | ------------------------------------ | ----------------------- | --------------- | -------- | -------- |
| POST   | `/check-in-out/check-in`             | Registrar check-in      | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| POST   | `/check-in-out/check-out`            | Registrar check-out     | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| GET    | `/check-in-out/location/:locationId` | Check-ins por ubicación | ❌ Falta        | ❌ Falta | ⚠️ Falta |

---

## 📊 5. REPORTS SERVICE - Endpoints

### 5.1 Dashboard (`/api/v1/dashboard`)

| Método | Endpoint                        | Descripción             | Frontend Client                           | Hook                        | Status |
| ------ | ------------------------------- | ----------------------- | ----------------------------------------- | --------------------------- | ------ |
| GET    | `/dashboard/kpis`               | KPIs generales          | ✅ `ReportsClient.getDashboardKPIs()`     | ✅ `useKPIs()`              | ✅ OK  |
| GET    | `/dashboard/user-stats`         | Estadísticas de usuario | ✅ `ReportsClient.getUserStats()`         | ✅ `useUserStats()`         | ✅ OK  |
| GET    | `/dashboard/resource-usage`     | Uso de recursos         | ✅ `ReportsClient.getResourceUsage()`     | ✅ `useResourceUsage()`     | ✅ OK  |
| GET    | `/dashboard/reservation-trends` | Tendencias de reservas  | ✅ `ReportsClient.getReservationTrends()` | ✅ `useReservationTrends()` | ✅ OK  |

### 5.2 Reportes de Uso (`/api/v1/reports/usage`)

| Método | Endpoint                  | Descripción          | Frontend Client                         | Hook     | Status        |
| ------ | ------------------------- | -------------------- | --------------------------------------- | -------- | ------------- |
| GET    | `/reports/usage/resource` | Reporte por recurso  | ✅ `ReportsClient.getUsageByResource()` | ❌ Falta | ⚠️ Falta hook |
| GET    | `/reports/usage/program`  | Reporte por programa | ✅ `ReportsClient.getUsageByProgram()`  | ❌ Falta | ⚠️ Falta hook |
| GET    | `/reports/usage/period`   | Reporte por período  | ✅ `ReportsClient.getUsageByPeriod()`   | ❌ Falta | ⚠️ Falta hook |
| POST   | `/reports/export/csv`     | Exportar a CSV       | ✅ `ReportsClient.exportToCSV()`        | ❌ Falta | ⚠️ Falta hook |

### 5.3 Reportes de Usuario (`/api/v1/reports/user`)

| Método | Endpoint                        | Descripción           | Frontend Client                    | Hook     | Status        |
| ------ | ------------------------------- | --------------------- | ---------------------------------- | -------- | ------------- |
| GET    | `/reports/user/:userId`         | Reporte de usuario    | ✅ `ReportsClient.getUserReport()` | ❌ Falta | ⚠️ Falta hook |
| GET    | `/reports/user/:userId/history` | Historial del usuario | ❌ Falta                           | ❌ Falta | ⚠️ Falta      |

### 5.4 Feedback (`/api/v1/feedback`)

| Método | Endpoint    | Descripción     | Frontend Client | Hook     | Status   |
| ------ | ----------- | --------------- | --------------- | -------- | -------- |
| POST   | `/feedback` | Crear feedback  | ❌ Falta        | ❌ Falta | ⚠️ Falta |
| GET    | `/feedback` | Listar feedback | ❌ Falta        | ❌ Falta | ⚠️ Falta |

---

## 📈 Análisis y Recomendaciones

### ✅ Endpoints Implementados Correctamente

- **Auth Service**: Login, logout, registro, 2FA ✅
- **Resources Service**: CRUD completo de recursos y categorías ✅
- **Availability Service**: CRUD de reservas básicas ✅
- **Reports Service**: Dashboard y KPIs ✅

### ⚠️ Endpoints Faltantes Críticos

1. **Gestión de Usuarios** (`/users`)
   - Listar, crear, editar, eliminar usuarios
   - Hook: `useUsers()`, `useUser(id)`
2. **Roles y Permisos**

   - CRUD completo de roles
   - Gestión de permisos
   - Hooks: `useRoles()`, `usePermissions()`

3. **Aprobaciones** (`/approval-requests`)

   - Flujo completo de aprobaciones
   - Hooks: `useApprovalRequests()`, `useApproveRequest()`

4. **Check-In/Check-Out**

   - Registro de entrada/salida
   - Hooks: `useCheckIn()`, `useCheckOut()`

5. **Feedback**
   - Sistema de feedback
   - Hook: `useFeedback()`

### 🔧 Inconsistencias Detectadas

#### 1. Perfil de Usuario

- **Backend**: `/api/v1/users/me`
- **Frontend**: Usa `/api/v1/auth/profile`
- **Acción**: Unificar en `/auth/profile`

#### 2. Check-In/Check-Out

- **Backend**: Endpoints en Availability y Stockpile
- **Frontend**: No implementado
- **Acción**: Decidir ubicación única y implementar

---

## 🎯 Plan de Acción

### Prioridad Alta (Semana 1)

- [ ] Implementar clientes HTTP faltantes
- [ ] Crear hooks para endpoints existentes sin hook
- [ ] Unificar endpoint de perfil

### Prioridad Media (Semana 2-3)

- [ ] Implementar sistema de aprobaciones
- [ ] Agregar check-in/check-out
- [ ] Crear sistema de feedback

### Prioridad Baja (Semana 4+)

- [ ] Optimizar hooks con cache
- [ ] Agregar tests de integración
- [ ] Documentar patrones de uso

---

**Última actualización**: 2025-11-24  
**Próxima revisión**: Después de implementar endpoints faltantes
