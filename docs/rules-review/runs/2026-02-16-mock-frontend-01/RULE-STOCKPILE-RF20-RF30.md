# RULE-STOCKPILE — RF-20 a RF-30 (Aprobaciones y Notificaciones)

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend`

---

## RF-20: Validación por responsable — Score: 3/5

**Evidencia:** `src/app/[locale]/aprobaciones/page.tsx`, `aprobaciones/[id]/page.tsx`. ApprovalRequestList organism. ApprovalModal organism. ApprovalCard, ApprovalActions molecules. ApprovalActionDto (APPROVE, REJECT, REQUEST_CHANGES, DELEGATE, ESCALATE). useApprovalActions, useApprovalRequests hooks. approvalsClient service. Endpoints completos (APPROVE, REJECT, CANCEL, STATISTICS).
**ACs cubiertos:** Lista de solicitudes, detalle, aprobar/rechazar/solicitar cambios, notificaciones (endpoints), historial.
**Gaps:** Sin tests.

---

## RF-21: Generación automática documento — Score: 3/5

**Evidencia:** DocumentGenerator organism. DocumentPreview molecule. documentsClient service. Endpoints DOCUMENTS, DOCUMENT_BY_ID, DOWNLOAD_DOCUMENT, DOCUMENT_TEMPLATES. @react-pdf/renderer dependency.
**ACs cubiertos:** Generación PDF, preview, descarga, plantillas.
**Gaps:** Sin tests.

---

## RF-22: Notificación al solicitante — Score: 2/5

**Evidencia:** Endpoints NOTIFICATIONS, MARK_AS_READ, MARK_ALL_AS_READ. notifications-client.ts. useNotificationMutations hook.
**Gaps:** UI de notificaciones (bell icon, inbox) no verificada como componente. Contenido de notificación personalizado no verificado.

---

## RF-23: Panel de vigilancia — Score: 3/5

**Evidencia:** `src/app/[locale]/vigilancia/page.tsx`. Endpoint ACTIVE_TODAY. ApprovalStatusBadge atom.
**ACs cubiertos:** Page dedicada para vigilantes, consulta de reservas aprobadas del día.
**Gaps:** Sin tests. Verificación de check-in por vigilante no verificada en esta page.

---

## RF-24: Flujos diferenciados por tipo — Score: 3/5

**Evidencia:** ApprovalFlowConfig tipo completo (resourceTypes, categoryIds, programIds, levels, requiresAllLevels, autoApproveConditions, timeouts, notifications). ApprovalLevelConfig (FIRST_LEVEL, SECOND_LEVEL, FINAL_LEVEL, approverRoles, canDelegate, canSkip).
**ACs cubiertos:** Modelo completo de flujos multi-nivel diferenciados.
**Gaps:** UI para configurar flujos (admin) no verificada. Sin tests.

---

## RF-25: Registro trazabilidad auditable — Score: 3/5

**Evidencia:** `src/app/[locale]/historial-aprobaciones/page.tsx`. ApprovalHistoryEntry tipo (action, performedBy, level, timestamp, metadata). ApprovalTimeline molecule. ApprovalRequest.history array.
**ACs cubiertos:** Page de historial, timeline visual, tipos completos.
**Gaps:** Sin tests.

---

## RF-26: Check-in/check-out digital — Score: 3/5

**Evidencia:** `src/app/[locale]/check-in/page.tsx`. CheckInOutPanel molecule. CheckInButton, CheckOutButton atoms. useCheckIn, useCheckInOut hooks. checkInOutClient service. QRCodeDisplay atom. Endpoints CHECKIN, CHECKOUT, CHECK_IN_BY_RESERVATION, ACTIVE_CHECKINS, OVERDUE_CHECKINS. Tipos checkInOut.ts.
**ACs cubiertos:** Page dedicada, panel con botones, QR code, servicio completo, endpoints.
**Gaps:** Sin tests.

---

## RF-27: Integración email/WhatsApp — Score: 1/5

**Evidencia:** Endpoints NOTIFICATION_TEMPLATES. ApprovalFlowConfig.notifications (onSubmit, onApprove, onReject).
**Gaps:** No hay UI para configurar canales (email/WhatsApp). Integración WhatsApp es backend-only; frontend no tiene configuración visible. Score bajo por falta de UI.

---

## RF-28: Notificaciones automáticas — Score: 2/5

**Evidencia:** NOTIFICATION_TEMPLATES endpoints. WebSocketProvider para real-time. socket.io-client dependency.
**Gaps:** UI de configuración de templates de notificación no verificada. Listado de notificaciones recibidas no verificado como componente visible.

---

## RF-29: Recordatorios personalizables — Score: 1/5

**Evidencia:** ApprovalFlowConfig.notifications.reminders (enabled, intervalMinutes, maxReminders).
**Gaps:** No hay UI para que el usuario configure recordatorios. Solo modelo de datos en ApprovalFlowConfig.

---

## RF-30: Notificación en tiempo real — Score: 2/5

**Evidencia:** WebSocketProvider (`src/infrastructure/websocket/`). ws-client.ts, ws-events.ts. useWebSocket hook. socket.io-client@4.7.0.
**ACs cubiertos:** Infraestructura WebSocket implementada.
**Gaps:** Sin tests. Conexión real-time a eventos de cancelación no verificada end-to-end. Sin evidencia de toast/notification on real-time events.
