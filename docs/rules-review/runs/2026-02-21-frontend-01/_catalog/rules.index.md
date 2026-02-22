# Rules Index — bookly-mock-frontend

> Run: `2026-02-21-frontend-01` | Total Rules: 41 | All applicable to frontend scope

## By Domain

### Design System (3 rules) — Frontend-specific

| ID | Title | Relevance | File |
| --- | --- | --- | --- |
| DS-COLORES | Sistema de Colores y Tokens | direct | `design-system-colores-tokens.md` |
| DS-COMPONENTES | Sistema de Componentes y Estados | direct | `design-system-componentes.md` |
| DS-LAYOUTS | Layouts y Patrones de Página | direct | `design-system-layouts-pages.md` |

### Auth (5 rules)

| ID | Title | Relevance | File |
| --- | --- | --- | --- |
| RF-41 | Gestión de roles y permisos | direct | `bookly-auth-rf41-gestion-de-roles.md` |
| RF-42 | Restricción de modificaciones | direct | `bookly-auth-rf42-restriccion-de-modificacion.md` |
| RF-43 | Autenticación y SSO | direct | `bookly-auth-rf43-autenticacion-y-sso.md` |
| RF-44 | Auditoría de accesos | indirect | `bookly-auth-rf44-auditoria.md` |
| RF-45 | Verificación 2FA | direct | `bookly-auth-rf45-verificacion-2fa-solicitudes-criticas.md` |

### Resources (3 rules)

| ID | Title | Relevance | File |
| --- | --- | --- | --- |
| RF-01 | CRUD de recursos | direct | `bookly-resource-rf01-crear-editar-eliminar-recursos.md` |
| RF-02 | Categorías y programas | direct | `bookly-resource-rf02-asociar-recurso-a-categorias-o-programas.md` |
| CHAR | Características de recursos | direct | `bookly-resource-characteristics.md` |

### Availability (13 rules)

| ID | Title | Relevance | File |
| --- | --- | --- | --- |
| RF-07 | Horarios disponibles | direct | `bookly-availability-rf07-horarios-disponibles.md` |
| RF-08 | Integración calendarios | direct | `bookly-availability-rf08-integra-calendars.md` |
| RF-09 | Búsqueda disponibilidad | direct | `bookly-availability-rf09-busqueda-disponibilidad.md` |
| RF-10 | Visualización calendario | direct | `bookly-availability-rf10-visualizacion-en-calendar.md` |
| RF-11 | Historial de uso | direct | `bookly-availability-rf11-registro-historial-uso.md` |
| RF-12 | Reservas periódicas | direct | `bookly-availability-rf12-permite-reserva-periodica.md` |
| RF-13 | Solicitud reserva VoBo | direct | `bookly-availability-rf13-solicitud-reserva-vobo-docente.md` |
| RF-14 | Lista de espera | direct | `bookly-availability-rf14-lista-espera-para-sobrecarga.md` |
| RF-15 | Reasignación reservas | direct | `bookly-availability-rf15-reasignacion-reserva.md` |
| RF-16 | Restricciones por categorías | direct | `bookly-availability-rf16-restricciones-reserva-basada-en-categorias.md` |
| RF-17 | Tiempo entre reservas | indirect | `bookly-availability-rf17-configure-tiempo-entre-reservas.md` |
| RF-18 | Cancelar/modificar con reglas | direct | `bookly-availability-rf18-cancelar-modificar-con-reglas.md` |
| RF-19 | Reservas múltiples | direct | `bookly-availability-rf19-reservas-multiples-en-una-solicitud.md` |

### Stockpile (11 rules)

| ID | Title | Relevance | File |
| --- | --- | --- | --- |
| RF-20 | Validación por responsable | direct | `bookly-stockpile-rf20-solicitudes-validadas-por-responsable.md` |
| RF-21 | Generación documentos | direct | `bookly-stockpile-rf21-generacion-automatica-documento-accept-reject-reserva.md` |
| RF-22 | Notificación solicitante | direct | `bookly-stockpile-rf22-notificacion-a-solicitante-con-carta.md` |
| RF-23 | Pantalla vigilancia | direct | `bookly-stockpile-rf23-visualizacion-reservas-aprobadas-vigilante.md` |
| RF-24 | Flujo por tipo usuario | direct | `bookly-stockpile-rf24-configuracion-flujo-segun-tipo-de-usuario.md` |
| RF-25 | Trazabilidad auditable | direct | `bookly-stockpile-rf25-registro-trazabilidad-auditable.md` |
| RF-26 | Check-in/check-out | direct | `bookly-stockpile-rf26-checkin-checkout-digital.md` |
| RF-27 | Integración emails/WhatsApp | indirect | `bookly-stockpile-rf27-integracion-emails-whatsapp.md` |
| RF-28 | Notificaciones automáticas | direct | `bookly-stockpile-rf28-notificaciones-automaticas-email-whatsapp-confirma-cancela-modifica-reserva.md` |
| RF-29 | Recordatorios personalizables | direct | `bookly-stockpile-rf29-recordatorios-reserva-personalizables.md` |
| RF-30 | Notificación tiempo real | direct | `bookly-stockpile-rf30-notificacion-tiempo-real-recurso-disponible-por-cancelacion.md` |

### Reports (10 rules)

| ID | Title | Relevance | File |
| --- | --- | --- | --- |
| RF-31 | Reporte uso recurso/programa | direct | `bookly-reports-rf31-uso-programa-periodo-tipo-recurso.md` |
| RF-32 | Reporte por usuario | direct | `bookly-reports-rf32-reservas-por-usuario.md` |
| RF-33 | Exportar CSV | direct | `bookly-reports-rf33-exportar-en-csv.md` |
| RF-34 | Feedback calidad servicio | direct | `bookly-reports-rf34-registro-feedbck-calidad-servicio.md` |
| RF-35 | Feedback administrativo | direct | `bookly-reports-rf35-registro-feedback-administrativo.md` |
| RF-36 | Dashboard interactivo | direct | `bookly-reports-rf36-dashboard-interactivo-tiempo-real.md` |
| RF-37 | Demanda insatisfecha | direct | `bookly-reports-rf37-demanda-insatisfecha.md` |
| RF-38 | Conflictos reserva | direct | `bookly-reports-rf38-conflictos-reserva.md` |
| RF-39 | Cumplimiento reserva | direct | `bookly-reports-rf39-cumplimiento-reserva.md` |
| RF-40 | Cancelaciones y ausencias | direct | `bookly-reports-rf40-cancelaciones-ausencias.md` |

### Cross-cutting (9 rules)

| ID | Title | Relevance | File |
| --- | --- | --- | --- |
| BASE | Arquitectura base | indirect | `bookly-base.md` |
| MODULES | Módulos del sistema | indirect | `bookly-modules.md` |
| DOC-STD | Documentación estándar | indirect | `bookly-documentacion-estandar.md` |
| PLAN | Planificación e hitos | indirect | `bookly-planificacion.md` |
| FLUJO-AUTH | Flujos autenticación | direct | `bookly-flujos-auth.md` |
| FLUJO-RESOURCES | Flujos recursos | direct | `bookly-flujos-resources.md` |
| FLUJO-AVAIL | Flujos disponibilidad | direct | `bookly-flujos-availability.md` |
| FLUJO-STOCKPILE | Flujos aprobaciones | direct | `bookly-flujos-stockpile.md` |
| FLUJO-REPORTS | Flujos reportes | direct | `bookly-flujos-reports.md` |
