# RULE-RESOURCE-RF02 — Asociar recurso a categorías y programas

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 3/5**

## Evidencia

- `src/app/[locale]/categorias/page.tsx` — Gestión de categorías
- `src/app/[locale]/programas/page.tsx` — Lista de programas académicos
- `src/app/[locale]/programas/[id]/page.tsx` — Detalle de programa
- `src/components/organisms/CategoryModal/CategoryModal.tsx` — Modal CRUD categorías
- `src/hooks/mutations/useCategoryMutations.ts` — Mutations categorías
- `src/hooks/usePrograms.ts` — Hook de programas
- `src/hooks/mutations/useProgramMutations.ts` — Mutations programas
- `src/types/entities/resource.ts` — Category, AcademicProgram, CreateCategoryDto, programIds en Resource
- `src/infrastructure/api/endpoints.ts` (L57–64) — CATEGORIES, PROGRAMS

## ACs: ✅ Categorías CRUD | ✅ Programas académicos | ✅ Resource.programIds | ✅ Resource.categoryId

## Score: **3/5** — Funcional con páginas, tipos y hooks completos. Sin tests.
