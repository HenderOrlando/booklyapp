# RULE-RESOURCE-RF03 — Definir atributos clave del recurso

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 2/5**

## Evidencia

- `src/types/entities/resource.ts` (L58) — `attributes: Record<string, any>` en Resource
- `src/types/entities/resource.ts` (L107) — `attributes?: Record<string, any>` en CreateResourceDto
- `src/infrastructure/api/endpoints.ts` (L83–84) — ATTRIBUTES, EQUIPMENT endpoints

## ACs: ⚠️ Atributos dinámicos (tipo genérico Record, no tipado estricto) | ⚠️ UI para editar atributos (no verificada en formulario)

## Gaps: Editor de atributos dinámicos en formularios, validación de atributos obligatorios.

## Score: **2/5** — Parcial. Modelo de datos soporta atributos pero UI de gestión no verificada.
