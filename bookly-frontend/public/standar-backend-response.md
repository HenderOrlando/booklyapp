# PROMPT — Estandarización de Responses del Backend (Bookly Mock)

## Rol

Actúa como **Senior Backend Engineer + QA**.

## Objetivo

Estandarizar **todas** las respuestas del backend **bookly-mock** para:

1. **Entidad** (GET/POST/PUT/PATCH/DELETE que devuelven un recurso).
2. **Lista de entidades** (listados con filtros + paginación).
3. **Indicadores estadísticos** (dashboards).
4. **Reportes** (consulta/preview + export/descarga).
5. **Errores** (técnicos, validación y dominio).

Debe basarse en la documentación entregada (especialmente el catálogo/estructura de _responses_ y _errors_) y aplicarse consistentemente en todos los módulos.

---

## Alcance / No alcance

### Incluye

- Cambios en **backend** (bookly-mock): contrato de respuestas, interceptores/filtros globales, DTOs, controladores/handlers, documentación técnica, pruebas.

### NO incluye

- Cambios en frontend.
- Cambios de lógica de negocio (solo _shape_ de response + metadatos).

---

## Skills a usar (Windsurf)

> Usa estos skills (por **nombre de archivo sin extensión**):

- `backend`
- `qa-calidad`
- `seguridad-privacidad-compliance`
- `arquitectura-escalabilidad-resiliencia`
- `gobierno-de-arquitectura-diseno`
- `data-reporting`
- `gestion-datos-calidad`

---

## Rules a aplicar (Windsurf)

> Aplica estas rules (por **nombre de archivo sin extensión**):

- `bookly-base`
- `bookly-tech-quality-observe-i18n`
- `bookly-modules`
- `bookly-modules-core-00`
- `bookly-architecture-overview`
- `bookly-reports-rf33-exportar-en-csv`
- `bookly-reports-rf36-dashboard-interactivo-tiempo-real`

---

## Restricciones de calidad

- **Sin breaking changes silenciosos**: si hay endpoints consumidos por frontend actual, define una estrategia explícita:
  - _Opción A_: mantener formato actual y agregar `v2` (ruta o header) para el envelope nuevo.
  - _Opción B_: migración coordinada con feature-flag / config.
  - Elige una y documenta.

- **No filtrar info sensible** en errores (stack traces, SQL, secrets).
- **Observabilidad mínima**: agregar `requestId`/`traceId` (o equivalente) y `timestamp` en el envelope.

---

## Contrato canónico de respuesta (a implementar)

### 1) Respuesta exitosa — Entidad

```json
{
  "responses": [
    {
      "id": "RSRC-0001",
      "message": "Resource created successfully",
      "exception_id": "R-20",
      "code": 201,
      "exception": "Created"
    }
  ],
  "data": {
    "id": "...",
    "...": "..."
  },
  "meta": {
    "requestId": "...",
    "traceId": "...",
    "timestamp": "2026-02-18T00:00:00.000Z",
    "path": "/api/v1/resources"
  }
}
```

### 2) Respuesta exitosa — Lista de entidades

```json
{
  "responses": [
    {
      "id": "RSRC-0002",
      "message": "Resources retrieved successfully",
      "exception_id": "R-10",
      "code": 200,
      "exception": "OK"
    }
  ],
  "data": {
    "items": [{ "id": "..." }]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 57,
      "totalPages": 6
    },
    "sort": [{ "field": "createdAt", "direction": "desc" }],
    "filters": { "status": "AVAILABLE" },
    "requestId": "...",
    "traceId": "...",
    "timestamp": "...",
    "path": "..."
  }
}
```

### 3) Respuesta exitosa — Indicadores estadísticos (Dashboards)

```json
{
  "responses": [
    {
      "id": "RPRT-0001",
      "message": "Dashboard metrics retrieved successfully",
      "exception_id": "R-10",
      "code": 200,
      "exception": "OK"
    }
  ],
  "data": {
    "indicators": [
      { "key": "totalReservations", "value": 123 },
      { "key": "utilizationRate", "value": 0.74 }
    ],
    "series": [
      {
        "key": "reservationsByDay",
        "points": [
          { "t": "2026-02-01", "v": 10 },
          { "t": "2026-02-02", "v": 14 }
        ]
      }
    ]
  },
  "meta": {
    "range": { "from": "2026-02-01", "to": "2026-02-18" },
    "bucket": "day",
    "timezone": "America/Bogota",
    "computedAt": "...",
    "requestId": "...",
    "traceId": "...",
    "timestamp": "...",
    "path": "..."
  }
}
```

### 4) Respuesta exitosa — Reportes

#### 4.1 Preview/consulta (JSON)

```json
{
  "responses": [
    {
      "id": "RPRT-0002",
      "message": "Report generated successfully",
      "exception_id": "R-20",
      "code": 200,
      "exception": "OK"
    }
  ],
  "data": {
    "report": {
      "type": "usage_by_resource",
      "rows": [{ "resourceCode": "RES-001", "hours": 18 }]
    }
  },
  "meta": {
    "filters": { "from": "2026-02-01", "to": "2026-02-18" },
    "requestId": "...",
    "traceId": "...",
    "timestamp": "...",
    "path": "..."
  }
}
```

#### 4.2 Export/descarga (CSV)

- Para descargas, **NO envolver el archivo en JSON**.
- Estandariza:
  - `Content-Type: text/csv`
  - `Content-Disposition: attachment; filename="<report>-<from>-<to>.csv"`
  - En errores durante export, responder JSON estándar con `errors` y `Content-Type: application/json`.

---

## Contrato canónico de error (a implementar)

```json
{
  "errors": [
    {
      "id": "AUTH-0102",
      "type": "account_locked",
      "message": "Account is locked",
      "exception_id": "E-05",
      "code": 403,
      "exception": "Forbidden"
    }
  ],
  "meta": {
    "requestId": "...",
    "traceId": "...",
    "timestamp": "...",
    "path": "..."
  },
  "details": {
    "fieldErrors": [{ "field": "email", "reason": "must be an email" }]
  }
}
```

Reglas:

- `errors[]` viene del **catálogo documentado**.
- Para validación, usar `details.fieldErrors[]` (sin exponer internals).
- Siempre devolver `code` consistente con HTTP.

---

## Diseño técnico recomendado (NestJS)

### A) Catálogos (source of truth)

1. Crear/normalizar:
   - `src/common/catalogs/responses.catalog.(ts|json)`
   - `src/common/catalogs/errors.catalog.(ts|json)`
2. Deben soportar búsqueda por `id` y fallback:
   - `GEN-0000` (error genérico)
   - `GEN-0001` (validation error)
   - `GEN-0002` (unexpected error)

> Si ya existe un catálogo en el repo, **reutilízalo** y solo ajusta estructura.

### B) Envelope builder

Crear un builder reutilizable:

- `ApiEnvelopeBuilder.success(responseId, data, metaExtras?)`
- `ApiEnvelopeBuilder.list(responseId, items, pagination, metaExtras?)`
- `ApiEnvelopeBuilder.metrics(responseId, indicators, series, metaExtras?)`
- `ApiEnvelopeBuilder.error(errorId, details?, metaExtras?)`

### C) Decorators para declarar ResponseId

- `@ResponseId('RSRC-0002')`
- `@ErrorMap({ Validation: 'GEN-0001', NotFound: 'RSRC-0404' })` _(si aplica)_

Usar `Reflector` para leer metadatos en interceptores/filtros.

### D) Interceptor global (success)

- Intercepta todas las respuestas exitosas.
- Si el handler retorna:
  - `PaginatedResult<T>` → usar envelope de lista.
  - `MetricsResult` → usar envelope de métricas.
  - `ReportResult` → usar envelope de reportes.
  - `T` → envelope de entidad.

### E) Exception filter global (errors)

- Mapear:
  - `DomainException` → `errorId` explícito.
  - `HttpException` estándar → por status + contexto.
  - Validación (`class-validator`) → `GEN-0001` + `details.fieldErrors`.
  - Errores inesperados → `GEN-0002`.

### F) Observabilidad / correlación

- Middleware que:
  - Propaga/genera `x-request-id`.
  - (Si existe OTEL) toma `traceId` del contexto.
- Incluir en `meta`:
  - `requestId`, `traceId`, `timestamp`, `path`.

---

## Plan de trabajo (obligatorio)

### 1) Análisis (rules + docs)

1. Lee las rules listadas y extrae restricciones relevantes para:
   - consistencia de contrato,
   - i18n (si aplica),
   - observabilidad,
   - seguridad.
2. Revisa la documentación entregada para:
   - estructura oficial de `responses[]` y `errors[]`,
   - nomenclatura de IDs,
   - ejemplos y códigos.
3. Redacta **Decision Notes**: si hay huecos en el contrato, define decisión explícita (ADR liviano en `docs/adr/`).

### 2) Localización de impacto

- Identifica todas las capas que retornan HTTP:
  - controllers
  - exception filters
  - interceptors
  - services que lanzan errores
- Identifica endpoints de:
  - entidades
  - listados
  - dashboards
  - reportes (incl. export csv)

### 3) Implementación

- Implementa catálogos + builder + interceptor + filter.
- Migra endpoints por tandas (módulo por módulo) y deja evidencia.
- Asegura consistencia: **mismo envelope en todos los servicios** expuestos.

### 4) Pruebas (solo Jest o Playwright)

> Para backend, prioriza **Jest** (unit + integration). Usa Playwright solo si existe un suite e2e ya configurado y aporta valor.

1. **Unit tests (Jest)**
   - builder
   - catalogs
   - interceptor
   - exception filter
2. **Integration tests (Jest + supertest)**
   - 1 endpoint de entidad
   - 1 endpoint de lista con paginación
   - 1 endpoint de dashboard
   - 1 endpoint de report (json)
   - 1 endpoint de export csv
   - casos de error: 400 (validación), 404, 409, 500

### 5) Ejecutar pruebas

- Ejecuta los comandos del repo (Nx) para:
  - unit tests
  - integration/e2e (si aplica)

### 6) Fix until green

- Si falla algo, corrige **hasta** que todo esté verde.
- No desactives pruebas para pasar.

### 7) Informe incremental

- Crea `docs/reports/response-standardization.md` y actualízalo en cada hito:
  - cambios realizados
  - endpoints migrados
  - decisiones tomadas
  - pruebas añadidas/ejecutadas
  - pendientes y riesgos

---

## Criterios de aceptación

- [ ] Todos los endpoints HTTP devuelven `responses[] + data + meta` en éxito.
- [ ] Todos los errores devuelven `errors[] + meta (+ details opcional)`.
- [ ] Listados incluyen `meta.pagination` con `page/pageSize/totalItems/totalPages`.
- [ ] Dashboards devuelven `data.indicators` y (si aplica) `data.series`.
- [ ] Reportes soportan preview JSON y export CSV (con headers correctos).
- [ ] No se exponen stack traces ni datos sensibles.
- [ ] Pruebas Jest (y Playwright si aplica) corren y pasan en CI.
- [ ] Informe final actualizado en `docs/reports/response-standardization.md`.

---

## Entregables

1. Código implementado (catálogos + builder + interceptor + filter + migración de endpoints).
2. Pruebas Jest (y Playwright si aplica).
3. Documentación del contrato:
   - `docs/api/response-contract.md`
4. Informe de implementación:
   - `docs/reports/response-standardization.md`
