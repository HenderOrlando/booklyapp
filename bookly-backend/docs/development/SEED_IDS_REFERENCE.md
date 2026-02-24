# 🔑 Referencia de ObjectIds - Seeds de Bookly

**Fecha**: Febrero 23, 2026  
**Versión**: 2.0  
**Propósito**: Catálogo centralizado de todos los ObjectIds usados en seeds para garantizar integridad referencial  
**Fuente de verdad**: `libs/common/src/constants/seed-ids.ts` — importar como `import { SEED_IDS } from "@libs/common";`

---

## 📋 Tabla Maestra de IDs

| Constante | ObjectId | Descripción |
|---|---|---|
| `SYSTEM_USER_ID` | `507f1f77bcf86cd799439000` | Acciones automáticas del sistema |
| **Usuarios** | | |
| `COORDINADOR_SISTEMAS_ID` | `...39021` | Juan Docente — TEACHER + PROGRAM_ADMIN (Sistemas) |
| `ADMIN_GENERAL_ID` | `...39022` | Admin Principal — GENERAL_ADMIN |
| `ESTUDIANTE_MARIA_ID` | `...39023` | María Estudiante — STUDENT (Sistemas) |
| `STAFF_VIGILANTE_ID` | `...39024` | Jorge Vigilante — SECURITY |
| `ADMIN_TI_ID` | `...39025` | Admin TI — GENERAL_ADMIN |
| `COORDINADOR_INDUSTRIAL_ID` | `...39026` | Pedro Coordinador — TEACHER + PROGRAM_ADMIN (Industrial) |
| `DOCENTE_AUXILIAR_ID` | `...39027` | Carlos Auxiliar — TEACHER (Sistemas) |
| `ESTUDIANTE_CARLOS_ID` | `...39028` | Carlos Estudiante — STUDENT (Industrial) |
| `STAFF_ANA_ID` | `...39029` | Ana Staff — ADMINISTRATIVE_STAFF |
| `USUARIO_SUSPENDIDO_ID` | `...39030` | Luis Suspendido — STUDENT (isActive=false) |
| `USUARIO_NO_VERIFICADO_ID` | `...9902a` | Diana NuevoRegistro — STUDENT (isEmailVerified=false) |
| `DOCENTE_2FA_ID` | `...9902b` | Roberto Seguro — TEACHER (twoFactorEnabled=true) |
| **Programas** | | |
| `PROGRAMA_SISTEMAS_ID` | `...39041` | Ingeniería de Sistemas (coord: Juan Docente) |
| `PROGRAMA_INDUSTRIAL_ID` | `...39042` | Ingeniería Industrial (coord: Pedro Coordinador) |
| `PROGRAMA_ELECTRONICA_ID` | `...39043` | Ingeniería Electrónica (sin coordinador) |
| **Estructura Académica** | | |
| `FACULTAD_INGENIERIA_ID` | `...39051` | Facultad de Ingeniería |
| `DEPTO_SISTEMAS_ID` | `...39061` | Departamento Sistemas e Informática |
| `DEPTO_INDUSTRIAL_ID` | `...39062` | Departamento Industrial |
| `DEPTO_ELECTRONICA_ID` | `...39063` | Departamento Electrónica y Telecomunicaciones |
| **Categorías** | | |
| `CATEGORIA_SALAS_ID` | `...39071` | Salas de Conferencia |
| `CATEGORIA_LABS_ID` | `...39072` | Laboratorios |
| `CATEGORIA_AUDITORIOS_ID` | `...39073` | Auditorios |
| `CATEGORIA_EQUIPOS_AV_ID` | `...39074` | Equipos Audiovisuales |
| **Recursos** | | |
| `RECURSO_AUDITORIO_ID` | `...39011` | Auditorio Principal (500 pers., requiere aprobación) |
| `RECURSO_LAB_SIS_1_ID` | `...39012` | Laboratorio de Sistemas 1 (30 equipos) |
| `RECURSO_SALA_CONF_A_ID` | `...39013` | Sala de Conferencias A (20 pers.) |
| `RECURSO_PROYECTOR_1_ID` | `...39014` | Proyector Portátil 1 (requiere aprobación) |
| `RECURSO_AULA_201_ID` | `...39015` | Aula 201 (40 estudiantes) |
| `RECURSO_LAB_ELE_1_ID` | `...39016` | Lab Electrónica 1 (status=MAINTENANCE) |
| `RECURSO_AUD_ANTIGUO_ID` | `...39017` | Auditorio Antiguo (isActive=false, UNAVAILABLE) |
| **Reservas** | | |
| `RESERVA_COMPLETADA_ID` | `...39031` | COMPLETED — Conferencia IA (pasada, con check-in/out) |
| `RESERVA_CONFIRMADA_ID` | `...39032` | CONFIRMED — Reunión Coordinación (mañana) |
| `RESERVA_PENDIENTE_ID` | `...39033` | PENDING — Evento Estudiantil (requiere aprobación) |
| `RESERVA_CANCELADA_ID` | `...39034` | CANCELLED — Tutoría Grupal |
| `RESERVA_APROBADA_ID` | `...39035` | APPROVED — Práctica Lab Producción (mañana) |
| `RESERVA_IN_PROGRESS_ID` | `...39036` | IN_PROGRESS — Reunión Planeación (hoy, con check-in) |
| `RESERVA_RECHAZADA_ID` | `...39037` | REJECTED — Fiesta de semestre |
| `RESERVA_NO_SHOW_ID` | `...39038` | NO_SHOW — Práctica Programación |
| `RESERVA_RECURRENTE_ID` | `...39039` | CONFIRMED — Clase semanal BD (recurrente) |
| **Approval Requests** | | |
| `APPROVAL_REQ_APROBADA_ID` | `...39081` | APPROVED — Solicitud de RESERVA_COMPLETADA |
| `APPROVAL_REQ_PENDIENTE_ID` | `...39082` | PENDING — Solicitud de RESERVA_PENDIENTE |
| `APPROVAL_REQ_RECHAZADA_ID` | `...39083` | REJECTED — Solicitud de RESERVA_RECHAZADA |
| `APPROVAL_REQ_IN_REVIEW_ID` | `...39084` | IN_REVIEW — Solicitud de RESERVA_APROBADA |
| `APPROVAL_REQ_CANCELADA_ID` | `...39085` | CANCELLED — Solicitud de RESERVA_CANCELADA |

---

## 🔗 Relaciones Cross-Service

```
Auth (Users) ──┬──▶ Resources (Programs.coordinatorId, Resources.audit.createdBy)
               ├──▶ Availability (Reservations.userId, WaitingList.userId)
               ├──▶ Stockpile (ApprovalRequests.requesterId, CheckInOut.userId)
               └──▶ Reports (Feedback.userId, Evaluations.userId)

Resources ─────┬──▶ Availability (Reservations.resourceId, Availability.resourceId)
               ├──▶ Stockpile (Notifications.relatedEntityId, CheckInOut.resourceId)
               └──▶ Reports (Statistics.referenceId, UnsatisfiedDemand.resourceId)

Availability ──┬──▶ Stockpile (ApprovalRequests.reservationId, CheckInOut.reservationId)
               └──▶ Reports (Feedback.reservationId)

Stockpile ─────▶ Availability (Reservations.approvalRequestId)
```

---

## 📊 Resumen por Servicio

| Servicio | Entidades | IDs Fijos |
|---|---|---|
| **Auth** | Users, Roles, Permissions, ReferenceData | 12 usuarios (con _id fijo) |
| **Resources** | Faculties, Departments, Programs, Categories, Resources, Maintenances | 1 fac + 3 deptos + 3 progs + 4 cats + 7 recursos |
| **Availability** | Availabilities (22 slots L-S), Reservations, WaitingList | 9 reservas con _id fijo |
| **Stockpile** | ApprovalFlows, ApprovalRequests, DocumentTemplates, Notifications, CheckInOut | 5 approval requests con _id fijo |
| **Reports** | UserFeedback, UserEvaluation, UsageStatistic, UnsatisfiedDemand | Referencias a IDs anteriores |

**Total de ObjectIds Fijos**: ~50 IDs en `SEED_IDS`

---

**Última actualización**: Febrero 23, 2026  
**Mantenido por**: Equipo de Desarrollo Bookly  
**Fuente de verdad**: `libs/common/src/constants/seed-ids.ts`
