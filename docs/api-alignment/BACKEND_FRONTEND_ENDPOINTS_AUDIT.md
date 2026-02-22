# 🔗 Auditoría de Endpoints: Backend ↔ Frontend

**Fecha**: 22 de Febrero de 2026  
**Estado**: ✅ Auditoría actualizada — Hooks verificados contra código real

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
| GET    | `/users/me`  | Perfil propio           | ✅ `AuthClient.getProfile()`  | ✅ `useCurrentUser()`  | ✅ OK |
| GET    | `/users`     | Listar usuarios (admin) | ✅ `AuthClient.getUsers()`    | ✅ `useUsers()`        | ✅ OK |
| GET    | `/users/:id` | Obtener usuario por ID  | ✅ `AuthClient.getUserById()` | ✅ `useUser(id)`       | ✅ OK |
| PATCH  | `/users/:id` | Actualizar usuario      | ✅ `AuthClient.updateUser()`  | ✅ `useUpdateUser()`   | ✅ OK |
| DELETE | `/users/:id` | Eliminar usuario        | ✅ `AuthClient.deleteUser()`  | ✅ `useDeleteUser()`   | ✅ OK |

### 1.4 Roles y Permisos (`/api/v1/roles`, `/api/v1/permissions`)

| Método | Endpoint                 | Descripción        | Frontend Client | Hook     | Status   |
| ------ | ------------------------ | ------------------ | --------------- | -------- | -------- |
| GET    | `/roles`                 | Listar roles       | ✅ `AuthClient.getRoles()`                | ✅ `useRoles()`                  | ✅ OK |
| POST   | `/roles`                 | Crear rol          | ✅ `AuthClient.createRole()`              | ✅ `useCreateRole()`             | ✅ OK |
| GET    | `/roles/:id`             | Obtener rol por ID | ✅ `AuthClient.getRoleById()`             | ✅ `useRole(id)`                 | ✅ OK |
| PUT    | `/roles/:id`             | Actualizar rol     | ✅ `AuthClient.updateRole()`              | ✅ `useUpdateRole()`             | ✅ OK |
| DELETE | `/roles/:id`             | Eliminar rol       | ✅ `AuthClient.deleteRole()`              | ✅ `useDeleteRole()`             | ✅ OK |
| POST   | `/roles/:id/permissions` | Asignar permisos   | ✅ `AuthClient.assignPermissionsToRole()` | ✅ `useAssignPermissionsToRole()`| ✅ OK |
| GET    | `/permissions`           | Listar permisos    | ✅ `AuthClient.getPermissions()`          | ✅ `usePermissions()`            | ✅ OK |

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
| POST   | `/resources/:id/restore`     | Restaurar recurso      | ✅ `ResourcesClient.restoreResource()` | ✅ `useRestoreResource()`  | ✅ OK |
| POST   | `/resources/import`          | Importar recursos CSV  | ✅ `ResourcesClient.importResources()` | ✅ `useImportResources()`  | ✅ OK |
| POST   | `/resources/search/advanced` | Búsqueda avanzada      | ✅ `ResourcesClient.searchAdvanced()`  | ✅ `useResourcesSearch()`  | ✅ OK |

### 2.2 Categorías (`/api/v1/categories`)

| Método | Endpoint          | Descripción          | Frontend Client                        | Hook                     | Status        |
| ------ | ----------------- | -------------------- | -------------------------------------- | ------------------------ | ------------- |
| GET    | `/categories`     | Listar categorías    | ✅ `ResourcesClient.getCategories()`   | ✅ `useResourceCategories()` | ✅ OK |
| POST   | `/categories`     | Crear categoría      | ✅ `ResourcesClient.createCategory()`  | ✅ `useCreateCategory()` | ✅ OK         |
| GET    | `/categories/:id` | Obtener categoría    | ✅ `ResourcesClient.getCategoryById()` | ✅ `useCategoryDetail()`     | ✅ OK |
| PATCH  | `/categories/:id` | Actualizar categoría | ✅ `ResourcesClient.updateCategory()`  | ✅ `useUpdateCategory()` | ✅ OK         |
| DELETE | `/categories/:id` | Eliminar categoría   | ✅ `ResourcesClient.deleteCategory()`  | ✅ `useDeleteCategory()` | ✅ OK         |

### 2.3 Mantenimientos (`/api/v1/maintenances`)

| Método | Endpoint                     | Descripción              | Frontend Client                           | Hook                        | Status        |
| ------ | ---------------------------- | ------------------------ | ----------------------------------------- | --------------------------- | ------------- |
| GET    | `/maintenances`              | Listar mantenimientos    | ✅ `ResourcesClient.getMaintenances()`    | ✅ `useMaintenanceHistory()`  | ✅ OK |
| POST   | `/maintenances`              | Crear mantenimiento      | ✅ `ResourcesClient.createMaintenance()`  | ✅ `useCreateMaintenance()` | ✅ OK         |
| GET    | `/maintenances/:id`          | Obtener mantenimiento    | ✅ `ResourcesClient.getMaintenanceById()` | ✅ `useMaintenanceDetail()`   | ✅ OK |
| PATCH  | `/maintenances/:id`          | Actualizar mantenimiento | ✅ `ResourcesClient.updateMaintenance()`  | ✅ `useUpdateMaintenance()` | ✅ OK         |
| PATCH  | `/maintenances/:id/complete` | Completar mantenimiento  | ✅ `ResourcesClient.completeMaintenance()`| ✅ `useCompleteMaintenance()` | ✅ OK |

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
| POST   | `/reservations/:id/check-in`  | Check-in           | ✅ `ReservationsClient.checkIn()`  | ✅ `useCheckIn()`             | ✅ OK |
| POST   | `/reservations/:id/check-out` | Check-out          | ✅ `ReservationsClient.checkOut()` | ✅ `useCheckOut()`            | ✅ OK |

### 3.2 Reservas Recurrentes (`/api/v1/reservations/recurring`)

| Método | Endpoint                                   | Descripción              | Frontend Client                           | Hook     | Status        |
| ------ | ------------------------------------------ | ------------------------ | ----------------------------------------- | -------- | ------------- |
| POST   | `/reservations/recurring`                  | Crear reserva recurrente | ✅ `ReservationsClient.createRecurring()`        | ✅ `useCreateRecurring()`   | ✅ OK |
| GET    | `/reservations/recurring/:seriesId`        | Obtener serie            | ✅ `ReservationsClient.getRecurringSeriesById()` | ✅ `useRecurringSeries(id)` | ✅ OK |
| PATCH  | `/reservations/recurring/:seriesId`        | Actualizar serie         | ✅ `ReservationsClient.updateRecurringSeries()`  | ✅ `useUpdateRecurring()`   | ✅ OK |
| DELETE | `/reservations/recurring/:seriesId/cancel` | Cancelar serie           | ✅ `ReservationsClient.cancelRecurringSeries()`  | ✅ `useCancelRecurring()`   | ✅ OK |
| POST   | `/reservations/recurring/preview`          | Preview de recurrencias  | ✅ `ReservationsClient.previewRecurring()`       | ✅ `usePreviewRecurring()`  | ✅ OK |

### 3.3 Disponibilidad (`/api/v1/availabilities`)

| Método | Endpoint                   | Descripción               | Frontend Client                             | Hook     | Status        |
| ------ | -------------------------- | ------------------------- | ------------------------------------------- | -------- | ------------- |
| GET    | `/availabilities`          | Consultar disponibilidad  | ✅ `ReservationsClient.checkAvailability()` | ✅ `useConflictValidator()` | ✅ OK |
| POST   | `/availabilities`          | Configurar disponibilidad | ❌ Falta                                    | ❌ Falta | ⚠️ Falta      |
| GET    | `/availabilities/calendar` | Vista calendario          | ❌ Falta                                    | ❌ Falta | ⚠️ Falta      |

### 3.4 Lista de Espera (`/api/v1/waiting-lists`)

| Método | Endpoint             | Descripción               | Frontend Client                              | Hook                         | Status   |
| ------ | -------------------- | ------------------------- | -------------------------------------------- | ---------------------------- | -------- |
| POST   | `/waiting-lists`            | Agregar a lista de espera | ✅ `ReservationsClient.addToWaitlist()`      | ✅ `useAddToWaitlist()`      | ✅ OK    |
| GET    | `/waiting-lists/resource/:id` | Listar esperas por recurso| ✅ `ReservationsClient.getWaitlist()`        | ✅ `useWaitlist()`           | ✅ OK    |
| DELETE | `/waiting-lists/:id`        | Remover de lista          | ✅ `ReservationsClient.removeFromWaitlist()` | ✅ `useRemoveFromWaitlist()` | ✅ OK    |
| POST   | `/waiting-lists/notify`     | Notificar siguientes      | ✅ `ReservationsClient.notifyWaitlist()`     | ✅ `useNotifyWaitlist()`     | ✅ OK    |
| PATCH  | `/waiting-lists/:id/priority`| Actualizar prioridad      | ✅ `ReservationsClient.updateWaitlistPriority()`| ✅ `useUpdateWaitlistPriority()`| ✅ OK    |
| POST   | `/waiting-lists/:id/accept` | Aceptar oferta            | ✅ `ReservationsClient.acceptWaitlistOffer()`| ✅ `useAcceptWaitlistOffer()`| ✅ OK    |

---

## ✅ 4. STOCKPILE SERVICE - Endpoints

### 4.1 Solicitudes de Aprobación (`/api/v1/approval-requests`)

| Método | Endpoint                              | Descripción         | Frontend Client | Hook     | Status   |
| ------ | ------------------------------------- | ------------------- | --------------- | -------- | -------- |
| GET    | `/approval-requests`                  | Listar solicitudes  | ✅ `ApprovalsClient.getApprovalRequests()`    | ✅ `useApprovalRequests()`       | ✅ OK |
| POST   | `/approval-requests`                  | Crear solicitud     | ✅ `ApprovalsClient.createApprovalRequest()`  | ✅ `useCreateApprovalRequest()`  | ✅ OK |
| GET    | `/approval-requests/:id`              | Obtener solicitud   | ✅ `ApprovalsClient.getApprovalRequestById()` | ✅ `useApprovalRequest(id)`      | ✅ OK |
| PATCH  | `/approval-requests/:id/approve`      | Aprobar solicitud   | ✅ `ApprovalsClient.approveRequest()`         | ✅ `useApproveRequest()`         | ✅ OK |
| PATCH  | `/approval-requests/:id/reject`       | Rechazar solicitud  | ✅ `ApprovalsClient.rejectRequest()`          | ✅ `useRejectRequest()`          | ✅ OK |
| POST   | `/approval-requests/:id/notification` | Enviar notificación | ❌ Falta        | ❌ Falta | ⚠️ Falta |

### 4.2 Check-In/Check-Out (`/api/v1/check-in-out`)

| Método | Endpoint                             | Descripción             | Frontend Client | Hook     | Status   |
| ------ | ------------------------------------ | ----------------------- | --------------- | -------- | -------- |
| POST   | `/check-in-out/check-in`             | Registrar check-in      | ✅ `CheckInClient.checkIn()`  | ✅ `useCheckIn()`  | ✅ OK |
| POST   | `/check-in-out/check-out`            | Registrar check-out     | ✅ `CheckInClient.checkOut()` | ✅ `useCheckOut()` | ✅ OK |
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
| GET    | `/reports/usage/resource` | Reporte por recurso  | ✅ `ReportsClient.getUsageReport()` | ✅ `useGenerateReport()` | ✅ OK |
| GET    | `/reports/usage/program`  | Reporte por programa | ✅ `ReportsClient.getUsageReport()` | ✅ `useGenerateReport()` | ✅ OK |
| GET    | `/reports/usage/period`   | Reporte por período  | ✅ `ReportsClient.getUsageReport()` | ✅ `useGenerateReport()` | ✅ OK |
| POST   | `/reports/export/csv`     | Exportar a CSV       | ✅ `ReportsClient.exportToCSV()`    | ✅ `useExportReport()`   | ✅ OK |

### 5.3 Reportes de Usuario (`/api/v1/reports/user`)

| Método | Endpoint                        | Descripción           | Frontend Client                    | Hook     | Status        |
| ------ | ------------------------------- | --------------------- | ---------------------------------- | -------- | ------------- |
| GET    | `/reports/user/:userId`         | Reporte de usuario    | ✅ `ReportsClient.getUserReport()` | ✅ `useUserStats()` | ✅ OK |
| GET    | `/reports/user/:userId/history` | Historial del usuario | ❌ Falta                           | ❌ Falta | ⚠️ Falta      |

### 5.4 Feedback (`/api/v1/feedback`)

| Método | Endpoint    | Descripción     | Frontend Client | Hook     | Status   |
| ------ | ----------- | --------------- | --------------- | -------- | -------- |
| POST   | `/feedback` | Crear feedback  | ✅ `FeedbackClient.create()` | ✅ `useCreateFeedback()` | ✅ OK |
| GET    | `/feedback` | Listar feedback | ✅ `FeedbackClient.getAll()` | ✅ `useFeedbackList()` | ✅ OK |

---

## 📈 Análisis y Recomendaciones

### ✅ Endpoints Implementados Correctamente

- **Auth Service**: Login, logout, registro, 2FA ✅
- **Resources Service**: CRUD completo de recursos y categorías ✅
- **Availability Service**: CRUD de reservas básicas ✅
- **Reports Service**: Dashboard y KPIs ✅

### ⚠️ Endpoints Pendientes de Implementación Backend

1. **Reports Service — 31 endpoints STUB** (87% del servicio)
   - Scheduled Reports (6 endpoints)
   - Custom Reports (5 endpoints)
   - Report Templates (5 endpoints)
   - Alert Management (6 endpoints)
   - Performance Monitoring (4 endpoints)
   - Data Processing (5 endpoints)

2. **Endpoints avanzados menores**
   - `POST /availabilities` — Configurar disponibilidad
   - `GET /availabilities/calendar` — Vista calendario
   - `POST /approval-requests/:id/notification` — Enviar notificación
   - `GET /check-in-out/location/:locationId` — Check-ins por ubicación
   - `GET /reports/user/:userId/history` — Historial de reportes

### 🔧 Inconsistencias Detectadas

#### 1. Perfil de Usuario

- **Backend**: `/api/v1/users/me` y `/api/v1/users/me/profile`
- **Frontend**: Usaba `/api/v1/auth/profile`
- **Acción**: ✅ Unificado para usar `/api/v1/users/me` y `/api/v1/users/me/profile` en `endpoints.ts`.

#### 2. Check-In/Check-Out

- **Backend**: Endpoints en Stockpile (`/api/v1/check-in-out`)
- **Frontend**: Implementado usando `CheckInClient`.
- **Acción**: ✅ Consolidado bajo `STOCKPILE_ENDPOINTS` en `endpoints.ts`.

---

## 🎯 Plan de Acción

### ✅ Completado

- [x] Implementar clientes HTTP faltantes
- [x] Crear hooks para endpoints existentes sin hook
- [x] Unificar endpoint de perfil
- [x] Implementar sistema de aprobaciones (queries + mutations)
- [x] Agregar check-in/check-out (queries + mutations)
- [x] Crear sistema de feedback (queries + mutations)
- [x] Hooks de gestión de usuarios (CRUD admin)
- [x] Hooks de roles y permisos (CRUD + asignación)
- [x] Hooks de auditoría (logs + stats + export)
- [x] Hooks de reservas recurrentes
- [x] Hooks de dashboard y KPIs

### Pendiente

- [ ] Implementar 31 endpoints STUB de Reports Service en backend
- [ ] Crear clientes + hooks para endpoints STUB tras implementación
- [ ] Agregar tests de integración
- [ ] Implementar endpoints avanzados menores (5 endpoints)

---

**Última actualización**: 2026-02-22  
**Próxima revisión**: Después de implementar feedback y tests de integración
