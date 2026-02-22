# Folder Map — bookly-mock

**Run ID:** `2026-02-21-bookly-mock-01`  
**SCOPE_ROOT:** `bookly-mock`  
**Generated:** 2026-02-21

---

## Estructura de Apps (6 servicios)

| Servicio              | Files | Dominio        | Hex layers                                                         |
| --------------------- | ----- | -------------- | ------------------------------------------------------------------ |
| `api-gateway`         | 49    | gateway        | application/(dto,services), infrastructure/(controllers,middleware,strategies,websocket), webhooks/ |
| `auth-service`        | 218   | auth           | application/(commands,queries,handlers,dtos,services), domain/(entities,events,repositories), infrastructure/(controllers,guards,repositories,schemas,strategies,cache,filters,interceptors,decorators,dto), modules/oauth |
| `availability-service`| 244   | availability   | application/(commands,queries,handlers,dtos,events,services), domain/(entities,events,interfaces,repositories), infrastructure/(controllers,guards,repositories,schemas,strategies,cache,cron,dtos,event-handlers) |
| `reports-service`     | 189   | reports        | application/(commands,queries,handlers,dtos,services/generators), domain/(entities,events,repositories), infrastructure/(consumers,controllers,dto,dtos,event-handlers,repositories,schemas,strategies), modules/audit, libs/audit-decorators |
| `resources-service`   | 158   | resources      | application/(commands,queries,handlers,dtos,events,event-handlers,services), domain/(entities,events,repositories), infrastructure/(controllers,cache,dto,event-handlers,repositories,schemas,strategies) |
| `stockpile-service`   | 199   | stockpile      | application/(commands,queries,handlers,dto,services), domain/(entities,events,repositories), infrastructure/(clients,controllers,database,dtos,event-bus,event-handlers,gateways,handlers,interceptors,repositories,schemas,services,strategies) |

## Estructura de Libs (14 librerías compartidas)

| Librería       | Files | Propósito                                   |
| -------------- | ----- | ------------------------------------------- |
| `common`       | 23    | Guards, events, telemetry, utils            |
| `database`     | 17    | Reference data module, repositories         |
| `decorators`   | 6     | Permissions, roles, current-user, public    |
| `event-bus`    | 26    | RabbitMQ/Kafka adapters, DLQ, event-store, request-reply |
| `filters`      | 4     | Exception filters                           |
| `guards`       | 6     | Auth/permission guards                      |
| `i18n`         | 4     | Internacionalización                        |
| `idempotency`  | 12    | Idempotency guard/service                   |
| `interceptors` | 4     | Global interceptors                         |
| `kafka`        | 4     | Kafka integration                           |
| `notifications`| 58    | Notification services                       |
| `redis`        | 5     | Redis cache module                          |
| `security`     | 4     | Security utilities                          |
| `storage`      | 6     | File storage module                         |

## Resumen General

- **Total archivos:** ~1,538
- **Extensiones principales:** `.ts` (1,004), `.md` (447), `.json` (32)
- **Patrón arquitectónico:** Hexagonal (domain/application/infrastructure) + CQRS (commands/queries/handlers)
- **EDA:** event-bus con DLQ, adapters RabbitMQ/Kafka, event-store
- **Tests:** `test/unit/services/` en cada servicio
- **Docs:** `docs/` por servicio + `docs/` global
