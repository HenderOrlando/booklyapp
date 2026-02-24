# RULE-AVAIL-RF09 — Búsqueda Avanzada de Disponibilidad

> **Rule file:** `.windsurf/rules/bookly-availability-rf09-busqueda-disponibilidad.md`
> **Domain:** availability · **Service:** `apps/availability-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `docs/RF09_BUSQUEDA_AVANZADA_DISPONIBILIDAD.md`
- `docs/RF09_IMPLEMENTACION_LOGICA_MONGODB.md`
- `docs/RF09_OPTIMIZACIONES_AVANZADAS.md`
- `docs/RF09_RESUMEN_FINAL.md`
- `docs/RF09_EJEMPLOS_USO.http`
- `docs/requirements/RF-09_BUSQUEDA_AVANZADA.md`
- Query handlers in availability-service (get-availability, search patterns)

## ACs Coverage

| AC | Status |
| --- | --- |
| Multi-criteria search (name, type, location, availability) | ✅ Documented + implemented |
| Real-time availability display | ✅ MongoDB optimized queries |
| Direct booking from search results | ⚠️ API endpoint exists, UX is frontend |
| Search history | ⚠️ Needs verification |
| Mobile-responsive | Frontend scope |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for search queries | `qa-calidad` |
| P2 | Verify search history persistence | `backend` |
