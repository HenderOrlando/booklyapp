# Dominio de Aprobaciones y Validaciones

## Análisis para Tesis de Grado — stockpile-service

---

## 1. Contexto del Dominio

El módulo de aprobaciones (`stockpile-service`) gestiona los flujos de validación institucional: desde la solicitud de uso de un recurso hasta su aprobación/rechazo, generación de documentos oficiales, control de acceso físico mediante check-in/check-out digital, y notificaciones multicanal. Es el puente entre la reserva digital y el uso físico del espacio.

**Puerto**: 3004
**Responsabilidades**: Solicitudes de aprobación, flujos diferenciados, check-in/check-out digital con QR, generación de documentos PDF, notificaciones multicanal (email, WhatsApp, push), pantalla de vigilancia, trazabilidad completa.

---

## 2. Requerimientos Funcionales Implementados

| RF | Nombre | Estado | Descripción |
|----|--------|--------|-------------|
| RF-20 | Validar solicitudes de reserva | ✅ | Revisión por responsable con criterios configurables |
| RF-21 | Generación de documentos | ✅ | PDF automático de aprobación/rechazo con datos de reserva |
| RF-22 | Notificación automática | ✅ | Envío al solicitante con estado de la solicitud |
| RF-23 | Pantalla de vigilancia | ✅ | Dashboard en tiempo real para control de acceso físico |
| RF-24 | Flujos diferenciados | ✅ | Configuración de flujos por tipo de recurso/rol |
| RF-25 | Registro de aprobaciones | ✅ | Trazabilidad completa de cada decisión |
| RF-26 | Check-in/Check-out digital | ✅ | Registro de entrada/salida con QR, RFID o manual |
| RF-27 | Integración con mensajería | ✅ | Correo, WhatsApp, push notifications |
| RF-28 | Notificaciones de cambios | ✅ | Alertas automáticas ante modificaciones de reservas |

## 3. Historias de Usuario Cubiertas

- **HU-17**: Validar solicitudes
- **HU-18**: Generar carta PDF
- **HU-19**: Notificación automática
- **HU-20**: Pantalla de vigilancia
- **HU-21**: Flujos diferenciados
- **HU-22**: Registro de aprobaciones
- **HU-23**: Check-in/Check-out
- **HU-24**: Notificaciones por mensajería
- **HU-25**: Confirmación vía WhatsApp/email

## 4. Casos de Uso

- **CU-016**: Enviar solicitud
- **CU-017**: Revisar solicitud
- **CU-018**: Aprobar reserva
- **CU-019**: Rechazar solicitud
- **CU-020**: Generar carta y notificar

---

## 5. Arquitectura Técnica

### 5.1 Flujos de Aprobación Configurables

El servicio permite definir flujos de aprobación diferenciados según:

- **Tipo de recurso**: Salas comunes (auto-aprobación) vs. auditorios (requiere aprobación de decanatura)
- **Rol del solicitante**: Docentes (flujo simplificado) vs. estudiantes (flujo completo)
- **Duración de la reserva**: Reservas cortas (< 2h) vs. reservas extendidas
- **Número de aprobadores**: Simple (1 aprobador) o multi-nivel (secuencial/paralelo)

### 5.2 Check-in/Check-out Digital

Sistema completo de control de acceso físico:

```typescript
// Generación automática de QR Code
metadata.qrCode = `CHECKIN-${reservationId}-${timestamp}-${random}`;

// Métodos de check-in soportados
type CheckInMethod = 'QR' | 'RFID' | 'MANUAL' | 'GEOLOCATION';
```

**Datos enriquecidos en DTO de respuesta**:

- `reservationStartTime`, `reservationEndTime` (desde Reservation)
- `resourceType`, `resourceName` (desde Resource)
- `userName`, `userEmail` (desde User)
- `metadata.qrCode`, `location`, `deviceInfo`, `photoUrl`, `signature`

### 5.3 Pantalla de Vigilancia en Tiempo Real

Dashboard especializado para personal de seguridad:

- **Check-ins activos**: Lista de personas actualmente en instalaciones
- **Check-ins vencidos**: Alertas de personas que excedieron su tiempo de reserva
- **Estadísticas en tiempo real**: Ocupación actual, capacidad disponible
- **WebSocket**: Actualizaciones automáticas sin refresh manual
- **Geolocalización**: Dashboard AsyncAPI documentado (`geolocation-dashboard.asyncapi.yaml`)

### 5.4 Notificaciones Multicanal

Librería compartida `@libs/notifications` con soporte para:

- **Email**: Plantillas HTML para aprobación/rechazo/recordatorio
- **SMS**: Notificaciones cortas de confirmación
- **WhatsApp**: Mensajes con botones de acción
- **Push**: Notificaciones en navegador
- **Webhooks**: Integración con sistemas externos

### 5.5 API Endpoints

| Grupo | Endpoints |
|-------|-----------|
| **Approval Requests** | `GET/POST /approval-requests`, `POST /:id/approve`, `POST /:id/reject`, `POST /:id/cancel` |
| **Approval Flows** | `GET/POST /approval-flows`, `PATCH/DELETE /approval-flows/:id` |
| **Check-In/Out** | `POST /check-in-out/check-in`, `POST /check-in-out/check-out` |
| **Active/Overdue** | `GET /check-in-out/active/all`, `GET /check-in-out/overdue/all` |
| **Statistics** | `GET /approval-requests/statistics`, `GET /approval-requests/active-today` |
| **Metrics** | `GET /metrics/cache`, `GET /metrics/cache/prometheus` |

### 5.6 Eventos Asincrónicos

15 canales documentados:

- `approval.requested`, `approval.approved`, `approval.rejected`, `approval.cancelled`
- `approval.flow.created`, `approval.flow.updated`
- `checkin.completed`, `checkout.completed`, `checkin.overdue`
- `notification.sent`, `notification.failed`
- `document.generated`, `document.sent`
- `monitoring.alert`, `geolocation.updated`

---

## 6. Requerimientos No Funcionales

| RNF | Requisito | Implementación |
|-----|-----------|---------------|
| RNF-07 | Registro completo de cada decisión | Audit log inmutable con actor, acción, razón, timestamp |
| RNF-08 | Envío de notificaciones automáticas | Procesamiento asíncrono vía RabbitMQ con reintentos |
| RNF-09 | Seguridad en pasos críticos | Guards de permisos en aprobación/rechazo, validación de autoridad |

---

## 7. KPIs Operativos del Dominio

| KPI | Fuente | Umbral de Alerta |
|-----|--------|-----------------|
| Approval turnaround time (p50) | stockpile-service BD | > 24 horas |
| Approval rate | stockpile-service | Informacional |
| Check-in compliance rate | stockpile-service | < 70% |

---

## 8. Aspectos Destacables para Tesis

### 8.1 Innovación Técnica

- **Flujos de aprobación configurables**: No hard-coded; cada institución puede definir sus propios flujos según tipo de recurso, rol y duración, sin cambios de código.
- **Check-in digital con QR auto-generado**: Cada reserva aprobada genera un código QR único que el personal de vigilancia puede escanear para verificar el acceso.
- **Dashboard de vigilancia en tiempo real**: Combina WebSocket + geolocalización para monitoreo activo de ocupación institucional, con alertas automáticas de check-ins vencidos.
- **Notificaciones multicanal desacopladas**: El envío de notificaciones es asíncrono vía eventos, permitiendo agregar nuevos canales sin modificar la lógica de negocio.

### 8.2 Contribución Académica

- **Digitalización de procesos burocráticos**: Transforma un proceso típicamente manual (solicitar permiso en papel, llevar carta firmada, registrarse con vigilancia) en un flujo digital completo.
- **Trazabilidad completa del ciclo de vida**: Desde la solicitud hasta el check-out, cada paso queda registrado con actor, timestamp y resultado, facilitando auditorías institucionales.
- **Integración mundo digital-físico**: El módulo de check-in/check-out es el puente entre la reserva digital y el acceso físico al recurso, resolviendo un gap común en sistemas de reservas.

### 8.3 Impacto Institucional

- **Reducción de tiempos de aprobación**: Medible con KPI de turnaround time, objetivo de < 24h vs. días/semanas del proceso manual.
- **Control de acceso verificable**: Reemplaza registros en papel de portería con sistema digital auditable.
- **Tasa de cumplimiento**: Métrica de check-in compliance rate que antes era imposible de medir.
- **Comunicación automática**: Elimina la incertidumbre del solicitante sobre el estado de su solicitud.

---

## 9. Skills y Rules Aplicadas

- **Skills**: `backend`, `ux-ui`, `operaciones-soporte-escalamiento`
- **Rules**: `bookly-stockpile-rf20-validar-solicitudes`, `bookly-stockpile-rf23-pantalla-vigilancia`, `bookly-stockpile-rf26-check-in-check-out`

---

**Dominio**: Aprobaciones y Validaciones
**Servicio**: stockpile-service (Puerto 3004)
**Swagger**: 12 controllers documentados
**AsyncAPI**: 15 canales de eventos
