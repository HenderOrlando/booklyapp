# Rules Index — bookly-mock-frontend

> **Run ID:** `2026-02-16-mock-frontend-01`  
> **Scope:** `bookly-mock-frontend`  
> **Total rules evaluadas:** 45  
> **Skill:** `SK-DATA-OPS-001` + `SK-ARCH-GOV-001`

---

## Resumen por dominio

| Dominio           | Rules | IDs                                      |
| ----------------- | ----- | ---------------------------------------- |
| **design-system** | 3     | DS-COLORS, DS-COMPONENTS, DS-LAYOUTS     |
| **auth**          | 5     | RF-41, RF-42, RF-43, RF-44, RF-45        |
| **resources**     | 6     | RF-01, RF-02, RF-03, RF-04, RF-05, RF-06 |
| **availability**  | 13    | RF-07 .. RF-19                           |
| **stockpile**     | 11    | RF-20 .. RF-30                           |
| **reports**       | 9     | RF-31 .. RF-39                           |

> **Nota:** No se aplicaron filtros `SCOPE_DOMAINS` ni `RULE_FILTER`. Todas las rules se evalúan contra el frontend ya que este implementa UI para todos los módulos.

---

## Catálogo completo

### Design System (conditional rules para bookly-mock-frontend)

| ID            | Archivo                         | Título                                |
| ------------- | ------------------------------- | ------------------------------------- |
| DS-COLORS     | design-system-colores-tokens.md | Sistema de Colores y Tokens de Diseño |
| DS-COMPONENTS | design-system-componentes.md    | Sistema de Componentes y Estados      |
| DS-LAYOUTS    | design-system-layouts-pages.md  | Layouts y Patrones de Página          |

### Auth Service (RF-41 a RF-45)

| ID    | Archivo                                                   | Título                                   |
| ----- | --------------------------------------------------------- | ---------------------------------------- |
| RF-41 | bookly-auth-rf41-gestion-de-roles.md                      | Gestión de roles y permisos según perfil |
| RF-42 | bookly-auth-rf42-restriccion-de-modificacion.md           | Restricción de modificación              |
| RF-43 | bookly-auth-rf43-autenticacion-y-sso.md                   | Autenticación segura y SSO               |
| RF-44 | bookly-auth-rf44-auditoria.md                             | Auditoría de accesos                     |
| RF-45 | bookly-auth-rf45-verificacion-2fa-solicitudes-criticas.md | Verificación 2FA                         |

### Resources Service (RF-01 a RF-06)

| ID    | Archivo                                                          | Título                                 |
| ----- | ---------------------------------------------------------------- | -------------------------------------- |
| RF-01 | bookly-resource-rf01-crear-editar-eliminar-recursos.md           | CRUD de recursos                       |
| RF-02 | bookly-resource-rf02-asociar-recurso-a-categorias-o-programas.md | Asociar recurso a categorías/programas |
| RF-03 | bookly-resource-rf03-definir-attrs-recurso.md                    | Definir atributos clave del recurso    |
| RF-04 | bookly-resource-rf04-importar-recursos-csv.md                    | Importación masiva CSV                 |
| RF-05 | bookly-resource-rf05-configure-reglas-disponibilidad-recursos.md | Reglas de disponibilidad               |
| RF-06 | bookly-resource-rf06-mantenimiento-recursos.md                   | Mantenimiento de recursos              |

### Availability Service (RF-07 a RF-19)

| ID    | Archivo                                                                | Título                      |
| ----- | ---------------------------------------------------------------------- | --------------------------- |
| RF-07 | bookly-availability-rf07-horarios-disponibles.md                       | Horarios disponibles        |
| RF-08 | bookly-availability-rf08-integra-calendars.md                          | Integración calendarios     |
| RF-09 | bookly-availability-rf09-busqueda-disponibilidad.md                    | Búsqueda avanzada           |
| RF-10 | bookly-availability-rf10-visualizacion-en-calendar.md                  | Visualización calendario    |
| RF-11 | bookly-availability-rf11-registro-historial-uso.md                     | Historial de uso            |
| RF-12 | bookly-availability-rf12-permite-reserva-periodica.md                  | Reservas periódicas         |
| RF-13 | bookly-availability-rf13-solicitud-reserva-vobo-docente.md             | VoBo docente                |
| RF-14 | bookly-availability-rf14-lista-espera-para-sobrecarga.md               | Lista de espera             |
| RF-15 | bookly-availability-rf15-reasignacion-reserva.md                       | Reasignación de reservas    |
| RF-16 | bookly-availability-rf16-restricciones-reserva-basada-en-categorias.md | Restricciones por categoría |
| RF-17 | bookly-availability-rf17-configure-tiempo-entre-reservas.md            | Tiempo entre reservas       |
| RF-18 | bookly-availability-rf18-cancelar-modificar-con-reglas.md              | Cancelar/modificar reservas |
| RF-19 | bookly-availability-rf19-reservas-multiples-en-una-solicitud.md        | Reservas múltiples          |

### Stockpile Service (RF-20 a RF-30)

| ID    | Archivo                                                                                              | Título                        |
| ----- | ---------------------------------------------------------------------------------------------------- | ----------------------------- |
| RF-20 | bookly-stockpile-rf20-solicitudes-validadas-por-responsable.md                                       | Validación por responsable    |
| RF-21 | bookly-stockpile-rf21-generacion-automatica-documento-accept-reject-reserva.md                       | Generación de documento       |
| RF-22 | bookly-stockpile-rf22-notificacion-a-solicitante-con-carta.md                                        | Notificación al solicitante   |
| RF-23 | bookly-stockpile-rf23-visualizacion-reservas-aprobadas-vigilante.md                                  | Panel de vigilancia           |
| RF-24 | bookly-stockpile-rf24-configuracion-flujo-segun-tipo-de-usuario.md                                   | Flujos diferenciados          |
| RF-25 | bookly-stockpile-rf25-registro-trazabilidad-auditable.md                                             | Trazabilidad auditable        |
| RF-26 | bookly-stockpile-rf26-checkin-checkout-digital.md                                                    | Check-in/check-out            |
| RF-27 | bookly-stockpile-rf27-integracion-emails-whatsapp.md                                                 | Integración email/WhatsApp    |
| RF-28 | bookly-stockpile-rf28-notificaciones-automaticas-email-whatsapp-confirma-cancela-modifica-reserva.md | Notificaciones automáticas    |
| RF-29 | bookly-stockpile-rf29-recordatorios-reserva-personalizables.md                                       | Recordatorios personalizables |
| RF-30 | bookly-stockpile-rf30-notificacion-tiempo-real-recurso-disponible-por-cancelacion.md                 | Notificación en tiempo real   |

### Reports Service (RF-31 a RF-39)

| ID    | Archivo                                                  | Título                             |
| ----- | -------------------------------------------------------- | ---------------------------------- |
| RF-31 | bookly-reports-rf31-uso-programa-periodo-tipo-recurso.md | Reportes por programa/período/tipo |
| RF-32 | bookly-reports-rf32-reservas-por-usuario.md              | Reportes por usuario               |
| RF-33 | bookly-reports-rf33-exportar-en-csv.md                   | Exportación CSV                    |
| RF-34 | bookly-reports-rf34-registro-feedbck-calidad-servicio.md | Feedback calidad de servicio       |
| RF-35 | bookly-reports-rf35-registro-feedback-administrativo.md  | Feedback administrativo            |
| RF-36 | bookly-reports-rf36-dashboard-interactivo-tiempo-real.md | Dashboard interactivo              |
| RF-37 | bookly-reports-rf37-demanda-insatisfecha.md              | Demanda insatisfecha               |
| RF-38 | bookly-reports-rf38-conflictos-reserva.md                | Conflictos de reserva              |
| RF-39 | bookly-reports-rf39-cumplimiento-reserva.md              | Cumplimiento de reserva            |
