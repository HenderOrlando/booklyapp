# RULE-RESOURCE-RF05 — Reglas de disponibilidad de recursos

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 2/5**

## Evidencia

- `src/types/entities/resource.ts` (L32–38) — AvailabilityRules (requiresApproval, maxAdvanceBookingDays, min/maxBookingDuration, allowRecurring)
- `src/types/entities/resource.ts` (L109, L126) — availabilityRules en CreateResourceDto y UpdateResourceDto
- `src/infrastructure/api/endpoints.ts` (L78–81) — AVAILABILITY, AVAILABILITY_BY_ID
- `src/components/atoms/AvailabilityIndicator/AvailabilityIndicator.tsx` — Indicador visual

## ACs: ✅ Modelo AvailabilityRules | ⚠️ UI para configurar reglas (parte del formulario de recurso, no verificada) | ✅ Indicador de disponibilidad

## Score: **2/5** — Parcial. Modelo de datos listo, configuración UI no verificada en formularios.
