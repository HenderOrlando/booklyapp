# Rules Index — bookly-mock

> **RUN_ID:** `2026-02-16-bookly-mock-01`
> **Total rules in .windsurf/rules/:** 53
> **Applicable to scope:** 50 (3 design-system rules excluded — conditional for `bookly-mock-frontend`)

## Rule Categories

### Cross-cutting (always_on) — 2 rules

| Rule ID      | File                | Domain | Trigger   |
| ------------ | ------------------- | ------ | --------- |
| RULE-BASE    | `bookly-base.md`    | global | always_on |
| RULE-MODULES | `bookly-modules.md` | global | always_on |

### Planning (manual) — 1 rule

| Rule ID   | File                      | Domain | Trigger |
| --------- | ------------------------- | ------ | ------- |
| RULE-PLAN | `bookly-planificacion.md` | global | manual  |

### Flow Definitions (manual) — 5 rules

| Rule ID          | File                            | Domain       | Trigger |
| ---------------- | ------------------------------- | ------------ | ------- |
| RULE-FLUJO-AUTH  | `bookly-flujos-auth.md`         | auth         | manual  |
| RULE-FLUJO-AVAIL | `bookly-flujos-availability.md` | availability | manual  |
| RULE-FLUJO-RSRC  | `bookly-flujos-resources.md`    | resources    | manual  |
| RULE-FLUJO-STOCK | `bookly-flujos-stockpile.md`    | stockpile    | manual  |
| RULE-FLUJO-RPT   | `bookly-flujos-reports.md`      | reports      | manual  |

### Auth Service RF (manual) — 5 rules

| Rule ID | File                                                        | Domain | Trigger |
| ------- | ----------------------------------------------------------- | ------ | ------- |
| RF-41   | `bookly-auth-rf41-gestion-de-roles.md`                      | auth   | manual  |
| RF-42   | `bookly-auth-rf42-restriccion-de-modificacion.md`           | auth   | manual  |
| RF-43   | `bookly-auth-rf43-autenticacion-y-sso.md`                   | auth   | manual  |
| RF-44   | `bookly-auth-rf44-auditoria.md`                             | auth   | manual  |
| RF-45   | `bookly-auth-rf45-verificacion-2fa-solicitudes-criticas.md` | auth   | manual  |

### Resources Service RF (manual) — 6 rules

| Rule ID | File                                                               | Domain    | Trigger |
| ------- | ------------------------------------------------------------------ | --------- | ------- |
| RF-01   | `bookly-resource-rf01-crear-editar-eliminar-recursos.md`           | resources | manual  |
| RF-02   | `bookly-resource-rf02-asociar-recurso-a-categorias-o-programas.md` | resources | manual  |
| RF-03   | `bookly-resource-rf03-definir-attrs-recurso.md`                    | resources | manual  |
| RF-04   | `bookly-resource-rf04-importar-recursos-csv.md`                    | resources | manual  |
| RF-05   | `bookly-resource-rf05-configure-reglas-disponibilidad-recursos.md` | resources | manual  |
| RF-06   | `bookly-resource-rf06-mantenimiento-recursos.md`                   | resources | manual  |

### Availability Service RF (manual) — 13 rules

| Rule ID | File                                                                     | Domain       | Trigger |
| ------- | ------------------------------------------------------------------------ | ------------ | ------- |
| RF-07   | `bookly-availability-rf07-horarios-disponibles.md`                       | availability | manual  |
| RF-08   | `bookly-availability-rf08-integra-calendars.md`                          | availability | manual  |
| RF-09   | `bookly-availability-rf09-busqueda-disponibilidad.md`                    | availability | manual  |
| RF-10   | `bookly-availability-rf10-visualizacion-en-calendar.md`                  | availability | manual  |
| RF-11   | `bookly-availability-rf11-registro-historial-uso.md`                     | availability | manual  |
| RF-12   | `bookly-availability-rf12-permite-reserva-periodica.md`                  | availability | manual  |
| RF-13   | `bookly-availability-rf13-solicitud-reserva-vobo-docente.md`             | availability | manual  |
| RF-14   | `bookly-availability-rf14-lista-espera-para-sobrecarga.md`               | availability | manual  |
| RF-15   | `bookly-availability-rf15-reasignacion-reserva.md`                       | availability | manual  |
| RF-16   | `bookly-availability-rf16-restricciones-reserva-basada-en-categorias.md` | availability | manual  |
| RF-17   | `bookly-availability-rf17-configure-tiempo-entre-reservas.md`            | availability | manual  |
| RF-18   | `bookly-availability-rf18-cancelar-modificar-con-reglas.md`              | availability | manual  |
| RF-19   | `bookly-availability-rf19-reservas-multiples-en-una-solicitud.md`        | availability | manual  |

### Stockpile Service RF (manual) — 11 rules

| Rule ID | File                                                                                                   | Domain    | Trigger |
| ------- | ------------------------------------------------------------------------------------------------------ | --------- | ------- |
| RF-20   | `bookly-stockpile-rf20-solicitudes-validadas-por-responsable.md`                                       | stockpile | manual  |
| RF-21   | `bookly-stockpile-rf21-generacion-automatica-documento-accept-reject-reserva.md`                       | stockpile | manual  |
| RF-22   | `bookly-stockpile-rf22-notificacion-a-solicitante-con-carta.md`                                        | stockpile | manual  |
| RF-23   | `bookly-stockpile-rf23-visualizacion-reservas-aprobadas-vigilante.md`                                  | stockpile | manual  |
| RF-24   | `bookly-stockpile-rf24-configuracion-flujo-segun-tipo-de-usuario.md`                                   | stockpile | manual  |
| RF-25   | `bookly-stockpile-rf25-registro-trazabilidad-auditable.md`                                             | stockpile | manual  |
| RF-26   | `bookly-stockpile-rf26-checkin-checkout-digital.md`                                                    | stockpile | manual  |
| RF-27   | `bookly-stockpile-rf27-integracion-emails-whatsapp.md`                                                 | stockpile | manual  |
| RF-28   | `bookly-stockpile-rf28-notificaciones-automaticas-email-whatsapp-confirma-cancela-modifica-reserva.md` | stockpile | manual  |
| RF-29   | `bookly-stockpile-rf29-recordatorios-reserva-personalizables.md`                                       | stockpile | manual  |
| RF-30   | `bookly-stockpile-rf30-notificacion-tiempo-real-recurso-disponible-por-cancelacion.md`                 | stockpile | manual  |

### Reports Service RF (manual) — 9 rules

| Rule ID | File                                                       | Domain  | Trigger |
| ------- | ---------------------------------------------------------- | ------- | ------- |
| RF-31   | `bookly-reports-rf31-uso-programa-periodo-tipo-recurso.md` | reports | manual  |
| RF-32   | `bookly-reports-rf32-reservas-por-usuario.md`              | reports | manual  |
| RF-33   | `bookly-reports-rf33-exportar-en-csv.md`                   | reports | manual  |
| RF-34   | `bookly-reports-rf34-registro-feedbck-calidad-servicio.md` | reports | manual  |
| RF-35   | `bookly-reports-rf35-registro-feedback-administrativo.md`  | reports | manual  |
| RF-36   | `bookly-reports-rf36-dashboard-interactivo-tiempo-real.md` | reports | manual  |
| RF-37   | `bookly-reports-rf37-demanda-insatisfecha.md`              | reports | manual  |
| RF-38   | `bookly-reports-rf38-conflictos-reserva.md`                | reports | manual  |
| RF-39   | `bookly-reports-rf39-cumplimiento-reserva.md`              | reports | manual  |

### Design System (conditional — NOT applicable to this scope) — 3 rules

| Rule ID       | File                              | Domain   | Trigger                               |
| ------------- | --------------------------------- | -------- | ------------------------------------- |
| DS-COLORS     | `design-system-colores-tokens.md` | frontend | model_decision (bookly-mock-frontend) |
| DS-COMPONENTS | `design-system-componentes.md`    | frontend | model_decision (bookly-mock-frontend) |
| DS-LAYOUTS    | `design-system-layouts-pages.md`  | frontend | model_decision (bookly-mock-frontend) |

## Notes

- All RF rule files are now present in `.windsurf/rules/`.
- RF-29 and RF-30 are additional stockpile-service rules not originally listed in `bookly-modules.md`.
