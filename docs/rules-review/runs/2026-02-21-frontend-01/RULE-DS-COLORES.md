# RULE-DS-COLORES — Sistema de Colores y Tokens

> **Score: 3/5 — Funcional** | Domain: design-system | Scope: bookly-mock-frontend

## Resumen

El frontend implementa un sistema de tokens de color a través de Tailwind CSS y CSS variables. Se usan tokens semánticos en componentes, pero no se alcanza la cobertura completa definida en la rule.

## Evidencia en Scope

| Artefacto | Path | Observación |
| --- | --- | --- |
| Tailwind config | `tailwind.config.ts` | Define `brand`, `state`, colores extendidos |
| CSS Variables | Componentes usan `var(--color-bg-primary)`, `var(--color-text-primary)` | Tokens semánticos en uso |
| Dark mode | Clases `dark:` en componentes | Soporte dual light/dark |
| ThemeToggle | `src/components/atoms/ThemeToggle.tsx` | Toggle de tema implementado |
| ThemeColorEditorPanel | `src/components/organisms/ThemeColorEditorPanel.tsx` (14KB) | Editor de colores avanzado |

## Gaps

- **Gap-1**: No todos los tokens semánticos definidos en la rule (ej. `color.light.bg.inverse`, `color.light.action.ghost.*`) están mapeados como CSS variables.
- **Gap-2**: Algunos componentes usan hex directos en lugar de tokens semánticos (anti-patrón #1 de la rule).
- **Gap-3**: No hay validación automatizada de contraste AA (4.5:1) definida en la rule.
- **Gap-4**: Sin tests unitarios que validen el uso correcto de tokens.

## Gate Check

- Sin tests → máximo **3** ✅ (score es 3)

## Plan de Mejora

| Prioridad | Tarea | Skill |
| --- | --- | --- |
| Alta | Auditar componentes con hex directos y migrar a tokens CSS var | `ux-ui` |
| Alta | Completar mapeo de tokens semánticos en `:root` y `[data-theme="dark"]` | `web-app` |
| Media | Agregar lint rule (stylelint) para detectar hex directos en componentes | `qa-calidad` |
| Media | Agregar test de contraste (axe-core o similar) en CI | `qa-calidad` |
| Baja | Documentar tokens en Storybook | `gestion-ingenieria-delivery` |
