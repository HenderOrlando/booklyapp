# RULE-AVAIL-RF17 — Tiempo de Preparación entre Reservas

> **Rule file:** `.windsurf/rules/bookly-availability-rf17-configure-tiempo-entre-reservas.md`
> **Domain:** availability · **Service:** `apps/availability-service/`
> **Score: 2 / 5** · **Gate:** 🔴 Partial — no dedicated preparation-time config found

## Evidence

- Availability configuration commands exist but no explicit preparation-time/buffer command
- `docs/requirements/` — no RF-17 specific implementation doc found
- Availability validation logic likely in create-reservation handler but buffer logic unclear

## ACs Coverage

| AC | Status |
| --- | --- |
| Configurable prep time per resource/activity | 🔴 No dedicated config found |
| Auto-calculate buffer between reservations | 🔴 Needs implementation verification |
| Per-resource/group/activity assignment | 🔴 Not confirmed |
| Auto-adjust on user booking attempt | 🔴 Not confirmed |
| Calendar shows blocked buffer periods | 🔴 Not confirmed |
| Audit of config changes | ⚠️ General audit exists |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P1 | Implement preparation-time config per resource type | `backend` |
| P1 | Add buffer validation in create-reservation handler | `backend` |
| P0 | Write BDD specs for buffer enforcement | `qa-calidad` |
