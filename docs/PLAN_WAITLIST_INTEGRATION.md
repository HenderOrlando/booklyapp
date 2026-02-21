# Plan de Integración: Lista de Espera (Waitlist)

Este documento detalla el plan para asegurar que la funcionalidad de "lista de espera" esté completamente integrada entre el frontend y el backend, cumpliendo con el requerimiento **RF-14: Lista de Espera**.

## Estado Actual (Diagnóstico)

### Backend (`availability-service` y `api-gateway`)

- **Implementado**:
  - `POST /waiting-lists`: Agregar a lista de espera.
  - `GET /waiting-lists/resource/:resourceId`: Obtener lista de espera por recurso.
  - `DELETE /waiting-lists/:id`: Cancelar/remover de lista de espera.
- **Faltante o Incompleto**:
  - El API Gateway registra `waiting-lists` pero los endpoints en el controlador `proxy.service.ts` no parecen estar mapeados correctamente en algunos casos (hay discrepancias entre `/waitlist` y `/waiting-lists`).
  - Faltan endpoints para notificar (`/waitlist/notify`), actualizar prioridad (`/waitlist/:id/priority`) y aceptar oferta (`/waitlist/:id/accept`) que el frontend espera usar.

### Frontend (`bookly-mock-frontend`)

- **Implementado**:
  - UI: `WaitlistManager` (Componente para ver y gestionar la lista).
  - Tipos: `src/types/entities/waitlist.ts` (Estado, prioridad, etc.).
  - Hooks/Mutations (`useWaitlistMutations.ts`):
    - `useAddToWaitlist` -> Llama a `POST /waitlist`
    - `useRemoveFromWaitlist` -> Llama a `DELETE /waitlist/:id`
    - `useNotifyWaitlist` -> Llama a `POST /waitlist/notify`
    - `useUpdateWaitlistPriority` -> Llama a `PATCH /waitlist/:id/priority`
    - `useAcceptWaitlistOffer` -> Llama a `POST /waitlist/:id/accept`
- **Problema Principal**: Desalineación de rutas (`/waitlist` en frontend vs `/waiting-lists` en backend) y endpoints faltantes en el backend para acciones de gestión (notificar, cambiar prioridad, aceptar).

---

## Plan de Acción

### Fase 1: Alineación de Contratos y Endpoints (Backend)

**Objetivo:** Asegurar que el backend exponga todos los endpoints requeridos por el frontend bajo la misma ruta base.

1. **Estandarizar Ruta Base:**
   - **Acción:** Cambiar la ruta base en el frontend (o backend) para que coincidan. Se recomienda usar `/api/v1/waiting-lists` como estándar, actualizando las llamadas HTTP en `useWaitlistMutations.ts` y clientes relacionados.
2. **Implementar Endpoints Faltantes en `availability-service`:**
   - `POST /waiting-lists/notify` (o similar) para notificar al siguiente usuario en la lista (Command).
   - `PATCH /waiting-lists/:id/priority` para actualizar la prioridad de un usuario en la lista (Command).
   - `POST /waiting-lists/:id/accept` para que un usuario acepte la oferta y genere una reserva (Command).
3. **Actualizar el API Gateway:**
   - Verificar y asegurar que `waiting-lists` está correctamente enrutado en `proxy.service.ts`.

### Fase 2: Actualización del Frontend

**Objetivo:** Consumir los endpoints corregidos y asegurar el manejo de caché.

1. **Ajustar llamadas HTTP en `useWaitlistMutations.ts`:**
   - Cambiar `/waitlist` a `/waiting-lists`.
   - Asegurarse de que los payloads enviados coinciden con los DTOs esperados por el backend (ej: `resourceId`, `userId`, `requestedStartDate` vs `startDate` en UI, etc.).
2. **Revisar Queries (Obtención de Datos):**
   - Asegurar que el hook para obtener la lista (ej: `useWaitlist`) use `GET /waiting-lists/resource/:resourceId` correctamente y maneje la estructura paginada devuelta por el backend.

### Fase 3: Pruebas y Validación (QA)

**Objetivo:** Garantizar que el flujo completo funciona sin errores.

1. **Pruebas Unitarias/Integración (Backend):**
   - Escribir tests para los nuevos handlers y controladores de actualización de prioridad, notificación y aceptación.
2. **Pruebas E2E (Frontend/Playwright):**
   - Crear un escenario de prueba en `bookly-mock-frontend/e2e/` (ej: `waitlist.spec.ts`) que cubra:
     - Intentar reservar un recurso ocupado.
     - Seleccionar la opción de unirse a la lista de espera.
     - Verificar que el usuario aparece en el `WaitlistManager` (como Admin).
     - (Mock) Simular la liberación del recurso y la notificación.
     - Aceptar la oferta desde la cuenta del usuario.

### Fase 4: Documentación

**Objetivo:** Mantener la documentación sincronizada con la realidad del código.

1. **Actualizar `BACKEND_FRONTEND_ENDPOINTS_AUDIT.md` y `FRONTEND_BACKEND_ENDPOINT_MAPPING.md`:**
   - Marcar los endpoints de lista de espera como ✅ OK o actualizados.
   - Reflejar los nuevos endpoints de gestión agregados.

## Resumen de Skills a Utilizar

- `backend`: Para implementar los controladores y handlers faltantes en CQRS.
- `web-app`: Para alinear los hooks de React Query y llamadas Axios en Next.js.
- `qa-calidad`: Para definir y ejecutar las pruebas E2E del flujo de espera.
