# PROMPT — Estandarizar **Requests** del Backend (`bookly-backend`)

> **Objetivo**: Unificar y normalizar **la forma en que el backend recibe solicitudes** (requests) para:
>
> 1. Entidades (CRUD / comandos)
> 2. Listas de entidades (paginación, filtros, orden, búsqueda)
> 3. Indicadores estadísticos (dashboards)
> 4. Reportes (consulta + exportación)
> 5. Requests relacionados con errores/soporte (headers, trazabilidad, catálogo de errores)

---

## 🧠 Contexto del repo

- Monorepo **Nx**.
- Backend: **`bookly-backend`** (NestJS).
- Debe respetar los modos existentes (p.ej. `MOCK/SERVER`), pero **este trabajo solo aplica a backend**.
- La estandarización debe reflejar los procesos/casos de uso y reglas del proyecto en la documentación proporcionada.

### Documentación a consultar (fuente de verdad funcional)

- `Bookly - Flujos de procesos - v1.pdf`
- `Bookly - Detalle de Casos de Uso.pdf`
- `Bookly - Historias de Usuario.pdf`
- `Bookly - matriz de requerimientos.pdf`
- `bookly - documentacion de errores.pdf`

---

## ✅ Skills (Windsurf) a utilizar

> Usa los **nombres de los skills** tal como existen en `.windsurf/skills/*` (carpeta / nombre del archivo sin extensión).

- `backend` — estandarización de controladores, DTOs, pipes, middlewares, Swagger/OpenAPI.
- `gobierno-de-arquitectura-diseno` — contratos consistentes, convenciones, compatibilidad y gobernanza de API.
- `qa-calidad` — estrategia y ejecución de pruebas en **Jest** (unit/integration/e2e).
- `gestion-datos-calidad` — validación, normalización, consistencia de formatos (fechas, ids, enums, i18n).
- `data-reporting` — modelado de requests para métricas, agregaciones, reportes y export.
- `seguridad-privacidad-compliance` — headers, trazabilidad, control de exposición de datos, auditoría básica.
- `plataforma-build-deploy-operate-observe` — logging/tracing (correlation), contratos para observabilidad.

---

## ✅ Rules (Windsurf) relacionadas a aplicar

> Usa las **rules** tal como existen en `.windsurf/rules/*` (nombre del archivo sin extensión).

### Base / organización

- `bookly-base`
- `bookly-modules`
- `bookly-planificacion`
- `bookly-tech-quality-observe-i18n`

### Recursos / Listas / Búsquedas

- `bookly-resource-rf01-crear-editar-eliminar-recursos`
- `bookly-resource-rf03-definir-attrs-recurso`
- `bookly-resource-rf04-importar-recursos-csv`
- `bookly-resource-rf05-configure-reglas-disponibilidad-recursos`
- `bookly-availability-rf09-busqueda-disponibilidad`

### Reportes / Dashboards

- `bookly-reports-rf31-uso-programa-periodo-tipo-recurso`
- `bookly-reports-rf32-reservas-por-usuario`
- `bookly-reports-rf33-exportar-en-csv`
- `bookly-reports-rf36-dashboard-interactivo-tiempo-real`

---

## 🎯 Resultado esperado

Al finalizar, el backend debe exponer **requests estandarizados** (contratos de entrada) para:

- CRUD de entidades → JSON consistente, validado y documentado.
- Listados → paginación + filtros + sort + búsqueda con un esquema consistente.
- Dashboards → queries de métricas con rango/intervalo/filtros uniformes.
- Reportes → ejecución y exportación con request contract único.
- Errores/soporte → headers obligatorios (request-id/correlation-id), endpoint de catálogo de errores (opcional) y compatibilidad con i18n.

---

## 📦 Entregables (obligatorios)

1. **Documento de contrato** (nuevo): `docs/api/REQUEST-CONTRACT.md`
   - Headers estándar
   - Convenciones de query params
   - Esquemas de body para: command/entity, list/search, dashboard query, report run/export
   - Ejemplos por dominio (resources, availability, reports)
2. **Implementación en `bookly-backend`**
   - DTOs compartidos
   - Pipes/Interceptors/Middlewares
   - Swagger/OpenAPI actualizado
3. **Pruebas Jest**
   - Unit tests para DTO validation (puntos críticos)
   - E2E tests para endpoints representativos
4. **Reporte de cambios**
   - `docs/changes/REQUEST-STANDARDIZATION-REPORT.md` (log incremental durante la ejecución)

---

## 🧩 Contrato propuesto (baseline) — **Requests**

> Ajusta si en el código ya existe un estándar; si existe, **converge** (no inventes 2 estándares).

### 1) Headers estándar (todas las requests)

**Obligatorios**

- `Authorization: Bearer <token>` (si aplica)
- `X-Request-Id` (si no viene, generarlo en gateway/backend y devolverlo en response)
- `X-Correlation-Id` (propagar entre microservicios si aplica)
- `Accept-Language` (para i18n, ej. `es-CO`, `en-US`)

**Opcionales recomendados**

- `X-Tenant-Id` (si el sistema es multi-tenant por header)
- `X-Client` (ej. `web`, `mobile`)
- `X-Client-Version`
- `X-Idempotency-Key` (para POST/acciones críticas: create/approve)

### 2) Entidades (CRUD / Commands)

**Convención de body (commands)**:

```json
{
  "data": { "...": "..." },
  "meta": {
    "idempotencyKey": "optional",
    "requestedBy": "optional"
  }
}
```

**Reglas**

- `POST`/`PATCH`/`PUT` usan `data`.
- **Nunca** mezclar `id` del recurso en body si ya va en path.
- Fechas en ISO-8601 (`YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss.sssZ`) + `timezone` cuando aplique.

### 3) Listas (GET list) + Búsqueda avanzada (POST search)

**GET list (simple)**

- `page`, `pageSize`
- `sort` (ej: `sort=createdAt:desc,name:asc`)
- `q` (búsqueda textual)
- `filter[status]=AVAILABLE`
- `filter[type]=MEETING_ROOM`
- `filter[locationId]=...`

**POST search (complejo)**
Endpoint sugerido: `POST /v1/<entity>/search`

```json
{
  "pagination": { "page": 1, "pageSize": 20 },
  "sort": [{ "field": "createdAt", "direction": "desc" }],
  "query": "texto opcional",
  "filters": {
    "status": ["AVAILABLE", "MAINTENANCE"],
    "type": ["MEETING_ROOM"],
    "categoryId": ["..."],
    "features": ["PROJECTOR", "AIR_CONDITIONING"],
    "dateRange": {
      "from": "2026-02-01",
      "to": "2026-02-28",
      "timezone": "America/Bogota"
    }
  }
}
```

### 4) Dashboards (indicadores estadísticos)

Sugerencia: `POST /v1/dashboards/<dashboardId>/query`

```json
{
  "range": {
    "from": "2026-02-01",
    "to": "2026-02-28",
    "timezone": "America/Bogota"
  },
  "interval": "day",
  "metrics": ["TOTAL_RESERVAS", "OCUPACION", "DEMANDA_INSATISFECHA"],
  "groupBy": ["resourceType", "programId"],
  "filters": { "resourceType": ["AUDITORIUM"], "programId": ["..."] },
  "realtime": { "enabled": false, "refreshSeconds": 10 }
}
```

> Si hay WebSockets para dashboards, estandariza el **request** inicial del query y el **payload** del evento de actualización (en la parte de responses, si aplica).

### 5) Reportes (consulta + export)

Sugerencia: ejecución asíncrona:

- `POST /v1/reports/<reportId>/runs`

```json
{
  "range": {
    "from": "2026-02-01",
    "to": "2026-02-28",
    "timezone": "America/Bogota"
  },
  "filters": { "resourceType": ["LABORATORY"], "programId": ["..."] },
  "format": "csv",
  "delivery": { "mode": "download" }
}
```

- `GET /v1/reports/runs/<runId>` (estado)
- `GET /v1/reports/runs/<runId>/download` (archivo)

Alternativa síncrona (solo si aplica): `GET /v1/reports/<reportId>?format=csv&from=...&to=...`

### 6) Requests relacionados con errores/soporte

Objetivo: trazabilidad y soporte **sin exponer datos sensibles**.

- Estándar de headers obligatorios (Request-Id / Correlation-Id / Accept-Language).
- Implementar (opcional, pero recomendado):
  - `GET /v1/meta/errors` → catálogo de errores (desde `bookly - documentacion de errores.pdf` / fuente interna)
  - `GET /v1/meta/health` / `GET /v1/meta/version` (si ya existen, estandarizar response; aquí solo asegurar request headers/trace)

---

## 🛠️ Plan de trabajo (paso a paso)

> **No pidas confirmación**. Ejecuta de forma determinista y documenta.

### Paso 1 — Auditoría de requests actuales

- Identifica endpoints actuales por módulo (`resources`, `availability`, `reports`, etc.).
- Extrae:
  - Query params existentes (paginación, filtros, sort)
  - DTOs de body (create/update/search)
  - Convenciones de fechas, enums y nombres
- Detecta inconsistencias: `camelCase` vs `snake_case`, `page/perPage` vs `page/pageSize`, etc.

### Paso 2 — Definir el estándar de requests (contrato)

- Crea `docs/api/REQUEST-CONTRACT.md`.
- Define:
  - Headers obligatorios y opcionales
  - Convención de query params
  - DTOs base reutilizables:
    - `PaginationDto`, `SortDto`, `SearchDto<TFilters>`, `DateRangeDto`, `RealtimeDto`
- Incluye ejemplos por dominio.

### Paso 3 — Implementación de infraestructura transversal

- Middleware/Interceptor:
  - Generar/propagar `X-Request-Id` / `X-Correlation-Id`
  - Inyectar al logger y a la respuesta (si aplica)
- Configurar `ValidationPipe` global con:
  - `transform: true`, `whitelist: true`, `forbidNonWhitelisted: true`
- Centralizar normalización de:
  - Fechas, timezone
  - Enums (case-insensitive si aplica)

### Paso 4 — Refactor de endpoints por dominio

- `resources`
  - Unificar `GET list` y `POST search`.
  - Ajustar `create/update` a `body.data`.
- `availability`
  - Alinear búsqueda de disponibilidad con `DateRangeDto` + filtros.
- `reports` / `dashboards`
  - Implementar `query`/`runs` con DTO estándar.
  - Alinear export `format=csv` (headers y request DTO).

### Paso 5 — Swagger / OpenAPI

- Documentar requests (headers, query, body).
- Evitar duplicación: decorators comunes / composables.

### Paso 6 — Pruebas (Jest)

- Unit tests:
  - Validación de DTOs (casos límite: fechas inválidas, pageSize máximo, sort inválido)
- E2E tests:
  - `GET /resources?page=...`
  - `POST /resources/search`
  - `POST /dashboards/<id>/query`
  - `POST /reports/<id>/runs` + polling status

### Paso 7 — Ejecutar pruebas y corregir

- Ejecutar `nx test <proyecto>` y `nx e2e <proyecto>` si existe.
- Corregir hasta verde.

### Paso 8 — Reporte incremental

- Mantén actualizado: `docs/changes/REQUEST-STANDARDIZATION-REPORT.md`
  - Cambios por endpoint
  - Breaking changes (si los hay)
  - Migración recomendada para consumidores internos

---

## ✅ Definition of Done (DoD)

- Todos los endpoints cubiertos usan:
  - Headers estándar (o los generan)
  - DTOs consistentes para list/search/dashboard/report
- `docs/api/REQUEST-CONTRACT.md` completo y coherente con el código
- Pruebas **Jest** pasan (unit + e2e si aplica)
- Reporte de cambios creado/actualizado
- No hay endpoints duplicados con estándares paralelos

---

## 📌 Notas de compatibilidad

- Si existe frontend u otros consumidores:
  - Preferir **compatibilidad retroactiva** (aceptar el request viejo temporalmente) o documentar “breaking changes” y su migración.
  - Si se implementa compatibilidad: hacerlo con un “adapter layer” (pipes/transformers) y marcar deprecación en docs.
