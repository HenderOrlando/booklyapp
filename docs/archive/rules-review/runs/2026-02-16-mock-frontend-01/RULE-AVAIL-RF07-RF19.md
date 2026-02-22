# RULE-AVAILABILITY — RF-07 a RF-19 (Disponibilidad y Reservas)

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend`

---

## RF-07: Horarios disponibles — Score: 2/5

**Evidencia:** Endpoints SCHEDULES, SCHEDULE_BY_ID. Tipos TimeSlot, DayAvailability. Componente TimeSlotSelector.
**Gaps:** No hay page dedicada para configurar horarios por recurso. Configuración de franjas horarias recurrentes, días festivos y periodos académicos no visible en UI.

---

## RF-08: Integración calendarios — Score: 2/5

**Evidencia:** Endpoints CALENDAR_INTEGRATION, SYNC_CALENDAR.
**Gaps:** No hay UI para configurar integraciones con Google Calendar, Outlook, etc. Solo endpoints definidos.

---

## RF-09: Búsqueda avanzada — Score: 3/5

**Evidencia:** AdvancedSearchModal organism, SearchBar molecule, SearchResourcesAdvancedDto (types, minCapacity, maxCapacity, categoryIds, programIds, hasEquipment, location, building, status, availableOn). ResourceFilterPanel organism. FilterChips molecule. SavedFiltersPanel organism. useSavedFilters hook.
**ACs cubiertos:** Búsqueda por tipo, capacidad, categoría, programa, ubicación, equipamiento, disponibilidad.
**Gaps:** Sin tests.

---

## RF-10: Visualización calendario — Score: 3/5

**Evidencia:** `src/app/[locale]/calendario/page.tsx`, CalendarView organism, CalendarGrid molecule, CalendarHeader molecule, CalendarDayCell atom, CalendarEventBadge atom, Calendar atom, ReservationTooltip molecule. Tipos: calendar.ts.
**ACs cubiertos:** Vista calendario, indicadores visuales de reservas, tooltips con detalles.
**Gaps:** Sin tests. Interacción drag-and-drop no verificada.

---

## RF-11: Historial de uso — Score: 2/5

**Evidencia:** Endpoint USAGE, USAGE_BY_RESOURCE, USAGE_BY_USER. UserActivityTable organism. useReports hook.
**Gaps:** Page dedicada de historial por recurso no verificada. Tabla de actividad existe como componente.

---

## RF-12: Reservas periódicas — Score: 3/5

**Evidencia:** RecurrenceType ("NONE", "DAILY", "WEEKLY", "MONTHLY") en reservation.ts. RecurringPatternSelector molecule. RecurringReservationPreview molecule. useRecurringReservations hook. recurringReservations service. Endpoints RECURRING, RECURRING_BY_ID.
**ACs cubiertos:** Tipos de recurrencia, selector de patrón, preview, servicio dedicado.
**Gaps:** Sin tests.

---

## RF-13: Solicitud reserva VoBo docente — Score: 2/5

**Evidencia:** ApprovalRequest incluye userRole. ApprovalFlowConfig soporta niveles. Flujo de aprobación compartido con stockpile.
**Gaps:** UI específica para VoBo docente no diferenciada. Flujo genérico de aprobación se usa para todos los casos.

---

## RF-14: Lista de espera — Score: 3/5

**Evidencia:** `src/app/[locale]/lista-espera/page.tsx`. Endpoints WAITLIST, WAITLIST_BY_ID. useWaitlistMutations hook. Tipo waitlist.ts.
**ACs cubiertos:** Page dedicada, endpoints, mutations.
**Gaps:** Sin tests. Notificación automática al liberar slot no verificada en UI.

---

## RF-15: Reasignación de reservas — Score: 2/5

**Evidencia:** ResourceReassignmentModal organism. RescheduleConfirmModal molecule. Endpoints REASSIGNMENT, REASSIGNMENT_BY_ID. Tipo reassignment.ts.
**ACs cubiertos:** Modal de reasignación, confirmación, endpoints.
**Gaps:** Sin tests. Flujo completo de reasignación no verificado end-to-end.

---

## RF-16: Restricciones por categoría — Score: 2/5

**Evidencia:** ApprovalFlowConfig incluye categoryIds y resourceTypes. SearchResourcesAdvancedDto soporta categoryIds. AvailabilityRules en Resource.
**Gaps:** UI para configurar restricciones específicas por categoría no verificada.

---

## RF-17: Tiempo entre reservas — Score: 1/5

**Evidencia:** AvailabilityRules incluye minBookingDurationMinutes y maxBookingDurationMinutes. No hay campo explícito para "buffer time between reservations".
**Gaps:** Campo de buffer entre reservas no existe en modelo. UI de configuración no encontrada.

---

## RF-18: Cancelar/modificar con reglas — Score: 3/5

**Evidencia:** ReservationModal organism (posible edición). Reservation.status soporta CANCELLED. UpdateReservationDto. Endpoints RESERVATION_BY_ID (PUT/DELETE). useReservationMutations hook.
**ACs cubiertos:** Cancelación y modificación de reservas.
**Gaps:** Reglas de cancelación (deadline, penalización) no visibles en UI. Sin tests.

---

## RF-19: Reservas múltiples en una solicitud — Score: 2/5

**Evidencia:** `src/app/[locale]/reservas/nueva/page.tsx` — Formulario de nueva reserva. CreateReservationDto acepta un solo resourceId.
**Gaps:** No hay evidencia de selección múltiple de recursos/slots en una sola solicitud. DTO es single-resource.
