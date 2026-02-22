# Rules Index — bookly-mock

**Run ID:** `2026-02-21-bookly-mock-01`  
**Generated:** 2026-02-21

## Resumen

- **Total rules:** 52
- **Auditable (RF + Flow + Other):** 47
- **Meta/context rules:** 5

## Por dominio

### Auth (5 RF + 1 Flow)

| Rule | Título |
|------|--------|
| RF-41 | Gestión de roles y permisos |
| RF-42 | Restricción de modificaciones a admins |
| RF-43 | Autenticación y SSO |
| RF-44 | Auditoría de accesos |
| RF-45 | 2FA solicitudes críticas |
| FLOW-AUTH | Flujos de seguridad y control de accesos |

### Resources (2 RF + 1 Other + 1 Flow)

| Rule | Título |
|------|--------|
| RF-01 | CRUD de recursos |
| RF-02 | Asociar recurso a categorías/programas |
| CHAR | Resource Characteristics Management |
| FLOW-RES | Flujos de gestión de recursos |

### Availability (13 RF + 1 Flow)

| Rule | Título |
|------|--------|
| RF-07 | Horarios disponibles |
| RF-08 | Integración con calendarios |
| RF-09 | Búsqueda avanzada disponibilidad |
| RF-10 | Visualización en calendario |
| RF-11 | Historial de uso |
| RF-12 | Reservas periódicas |
| RF-13 | VoBo docente para estudiantes |
| RF-14 | Lista de espera |
| RF-15 | Reasignación de reservas |
| RF-16 | Restricciones por categoría |
| RF-17 | Tiempo entre reservas |
| RF-18 | Cancelar/modificar con reglas |
| RF-19 | Reservas múltiples |
| FLOW-AVAIL | Flujos de disponibilidad y reserva |

### Stockpile (11 RF + 1 Flow)

| Rule | Título |
|------|--------|
| RF-20 | Solicitudes validadas por responsable |
| RF-21 | Generación documento aprobación/rechazo |
| RF-22 | Notificación con carta al solicitante |
| RF-23 | Pantalla vigilancia reservas aprobadas |
| RF-24 | Flujos aprobación según tipo usuario |
| RF-25 | Registro y trazabilidad auditable |
| RF-26 | Check-in/check-out digital |
| RF-27 | Integración email/WhatsApp |
| RF-28 | Notificaciones automáticas confirma/cancela/modifica |
| RF-29 | Recordatorios reserva personalizables |
| RF-30 | Alerta tiempo real recurso disponible por cancelación |
| FLOW-STOCK | Flujos de aprobaciones y solicitudes |

### Reports (10 RF + 1 Flow)

| Rule | Título |
|------|--------|
| RF-31 | Reportes uso/programa/periodo |
| RF-32 | Reservas por usuario |
| RF-33 | Exportar CSV |
| RF-34 | Feedback calidad servicio |
| RF-35 | Evaluación usuarios por admin |
| RF-36 | Dashboard interactivo tiempo real |
| RF-37 | Demanda insatisfecha |
| RF-38 | Conflictos de reserva |
| RF-39 | Cumplimiento de reservas |
| RF-40 | Cancelaciones y ausencias |
| FLOW-REP | Flujos de reportes y análisis |

### Meta (no scored)

| Rule | Propósito |
|------|-----------|
| bookly-base | Arquitectura general y stack |
| bookly-modules | Resumen de módulos |
| bookly-documentacion-estandar | Estándar de documentación |
| bookly-planificacion | Planificación del proyecto |
| bookly-resource-characteristics | Contrato frontend-backend characteristics |
