# RULE-AVAIL-RF16 — Restricciones de Reserva por Categoría

> **Rule file:** `.windsurf/rules/bookly-availability-rf16-restricciones-reserva-basada-en-categorias.md`
> **Domain:** availability + resources · **Service:** `apps/availability-service/` + `apps/resources-service/`
> **Score: 2 / 5** · **Gate:** 🔴 Partial implementation

## Evidence

- `apps/resources-service/src/application/commands/create-category.command.ts`
- `apps/resources-service/src/application/handlers/create-category.handler.ts`
- `apps/resources-service/src/application/handlers/get-categories.handler.ts`
- `libs/common/src/guards/permissions.guard.ts` — general permission check
- No dedicated category-based booking restriction validator found in availability-service

## ACs Coverage

| AC | Status |
| --- | --- |
| Configure restrictions per resource by user category | 🔴 Category CRUD exists, restriction enforcement unclear |
| Verify user category on booking attempt | 🔴 No explicit category check in reservation flow |
| Deny booking with message if unauthorized | ⚠️ Permission guard exists but category-specific logic unclear |
| Admin config interface for restrictions | ⚠️ Category management exists |
| Special access request flow | 🔴 Not found |
| Audit of restricted access attempts | ⚠️ General audit exists |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P1 | Implement category-based booking restriction validator in create-reservation handler | `backend` |
| P1 | Add special access request command for restricted resources | `backend` |
| P0 | Write BDD specs for category restriction enforcement | `qa-calidad` |
