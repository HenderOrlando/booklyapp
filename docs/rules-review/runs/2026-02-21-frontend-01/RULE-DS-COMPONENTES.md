# RULE-DS-COMPONENTES — Sistema de Componentes y Estados

> **Score: 3/5 — Funcional** | Domain: design-system | Scope: bookly-mock-frontend

## Resumen

El frontend implementa Atomic Design con 44 atoms, 36 molecules y 42 organisms. Los componentes principales (Button, Input, Card, Alert, Badge, Tabs) existen y manejan estados básicos. Falta cobertura completa de todos los estados interactivos definidos en la rule.

## Evidencia en Scope

| Artefacto | Path | Observación |
| --- | --- | --- |
| Button (3 variantes) | `src/components/atoms/Button/` | Primary, secondary, ghost |
| Input (3 items) | `src/components/atoms/Input/` | Con estados default/focus/error |
| Card | `src/components/atoms/Card/` | Surface token |
| Alert (3 items) | `src/components/atoms/Alert/` | Success, warning, error |
| Badge (3 items) | `src/components/atoms/Badge/` | Status badges |
| Tabs | `src/components/atoms/Tabs/` | Active/inactive con indicador |
| StatusBadge | `src/components/atoms/StatusBadge/` | Reservation status badges |
| ApprovalStatusBadge | `src/components/atoms/ApprovalStatusBadge.tsx` | Approval-specific |
| FilterTag | `src/components/atoms/FilterTag.tsx` | Chips/tags |
| Grid 8px | Tailwind classes `p-4`, `gap-4`, `space-y-6` | Múltiplos de 4/8px |

## Gaps

- **Gap-1**: No todos los componentes documentan explícitamente los 5 estados (default, hover, active, focus, disabled).
- **Gap-2**: Falta Storybook configurado para documentar variantes y estados.
- **Gap-3**: No hay tests de accesibilidad (focus visible) automatizados.
- **Gap-4**: Algunos componentes no usan tokens semánticos consistentemente para disabled state.

## Plan de Mejora

| Prioridad | Tarea | Skill |
| --- | --- | --- |
| Alta | Auditar estados disabled/focus en atoms clave (Button, Input, Select) | `ux-ui` |
| Media | Configurar Storybook con stories por componente | `web-app` |
| Media | Tests de a11y con axe-core en CI para focus visible | `qa-calidad` |
| Baja | Documentar variantes en design-system page (`/design-system`) | `gestion-ingenieria-delivery` |
