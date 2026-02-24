# Fix Editar Recurso: Características (tags) + Programas (multi-select)

Fecha: 2026-02-18
Scope: `bookly-mock-frontend`

## 1) Objetivo

Corregir dos problemas críticos en `Editar Recurso`:

1. **Características**: reemplazar el selector booleano por selector tipo tags con búsqueda, filtrado y creación diferida ("create-on-save").
2. **Programas**: corregir el bug donde la selección individual terminaba marcando múltiples programas y asegurar persistencia correcta.

> Política aplicada: frontend alineado a contratos backend y uso de infraestructura de requests respetando modos `MOCK/SERVER` y `SERVER -> GATEWAY/DIRECT` (sin bypass del `httpClient`).

---

## 2) Análisis de causa raíz

### 2.1 Programas (multi-select)

Causas principales detectadas:

- **Normalización insuficiente del payload de programas**: podían venir `id`, `_id` o `code`; si no se normalizaban correctamente, el estado de checkboxes quedaba inconsistente.
- **Riesgo de estado obsoleto en interacciones rápidas** (ej. limpiar selección + seleccionar): `setState` no funcional podía usar snapshot anterior.

### 2.2 Características

Causa principal:

- La UI anterior solo manejaba atributos booleanos (`hasProjector`, etc.), sin modelo de tags con catálogo, búsqueda, selección múltiple ni creación diferida.

---

## 3) Implementación

## 3.1 Editar Recurso: lógica de programas y características

Archivo: `src/app/[locale]/recursos/[id]/editar/page.tsx`

### Programas

- Se añadió normalización robusta de programas (`id | _id | code`) y deduplicación por ID.
- Se preservó persistencia a contrato backend vía `programIds: string[]`.
- Se corrigió toggle con `setSelectedProgramIds((prev) => ...)` para evitar carreras de estado.

### Características (tags)

- Nuevo estado para catálogo y selección de características:
  - `characteristicsCatalog`
  - `selectedCharacteristics` con flag `isNew`
  - `characteristicQuery`
- Catálogo combinado desde:
  - defaults del módulo
  - atributos de recursos existentes (`characteristics` / `features`)
  - mapeo de booleans legados (`hasProjector`, etc.)
- UI nueva:
  - chips seleccionados
  - buscador y lista filtrada
  - opción `Crear "..."` para tags no existentes
  - indicador visual `Nueva` sin estilos tipo "glow"
- Persistencia create-on-save:
  - las tags nuevas se quedan en estado local hasta submit
  - en submit se envían en `attributes.characteristics` y `attributes.features`
  - se mantiene compatibilidad booleana derivada (`hasProjector`, etc.)

### Selectores de testing añadidos

Se añadieron `data-testid` para facilitar pruebas estables:

- `resource-edit-form`, `resource-edit-save-btn`
- `resource-program-checkbox-*`, `resource-program-selected-count`, `resource-program-clear-selection`
- `resource-characteristics-search-input`, `resource-characteristic-create-option`, `resource-characteristic-chip-*`

---

## 3.2 Pruebas unitarias (Jest)

Archivo nuevo: `src/app/[locale]/recursos/[id]/editar/__tests__/page.test.tsx`

Casos cubiertos:

1. **Programas**: seleccionar solo un programa no selecciona todos y el `PATCH` envía únicamente ese `programId`.
2. **Características**: crear característica nueva en UI no dispara persistencia inmediata; solo se envía al guardar (`PATCH`).

---

## 3.3 Pruebas E2E (Playwright)

Archivo nuevo: `e2e/regression/resource-edit-selectors.spec.ts`

Casos cubiertos:

1. **Programas**: limpiar selección, elegir un único programa, guardar y verificar persistencia navegando detalle -> editar.
2. **Características**: crear tag nueva, guardar y verificar persistencia navegando detalle -> editar.

Nota técnica: se ejecuta en modo `serial` para evitar interferencia de estado compartido en mock runtime durante la misma suite.

---

## 4) Verificación ejecutada

### Lint (targeted)

```bash
npm run lint -- --file "src/app/[locale]/recursos/[id]/editar/page.tsx" --file "src/app/[locale]/recursos/[id]/editar/__tests__/page.test.tsx"
```

Resultado: ✅ PASS

### Jest (targeted)

```bash
npm run test -- --runTestsByPath "./src/app/[locale]/recursos/[id]/editar/__tests__/page.test.tsx" --runInBand
```

Resultado: ✅ PASS (2/2)

### Playwright (targeted)

```bash
npm run e2e -- --project=regression e2e/regression/resource-edit-selectors.spec.ts
```

Resultado: ✅ PASS (2/2)

---

## 5) Alineación de contratos y modos de request

Se mantuvo alineación estricta con contrato backend:

- `PATCH /resources/:id` con:
  - `programIds: string[]`
  - `attributes` tipado y compatible (`characteristics`, `features`, booleans legacy)

Se respetó arquitectura de requests por modo:

- Sin llamadas directas ad-hoc a servicios.
- Todas las operaciones pasan por `httpClient`/providers existentes, preservando `MOCK/SERVER` y `SERVER->GATEWAY/DIRECT`.

---

## 6) Archivos modificados

- `src/app/[locale]/recursos/[id]/editar/page.tsx`
- `src/app/[locale]/recursos/[id]/editar/__tests__/page.test.tsx` (nuevo)
- `e2e/regression/resource-edit-selectors.spec.ts` (nuevo)
- `docs/reports/fix-editar-recurso-tags-programas.md` (nuevo)

---

## 7) Estado final

- [x] Selector de características convertido a tags con búsqueda/filtrado/create-on-save.
- [x] Multi-select de programas corregido (selección individual estable + persistencia).
- [x] Cobertura de regresión en Jest.
- [x] Cobertura E2E en Playwright.
- [x] Reporte incremental generado.
