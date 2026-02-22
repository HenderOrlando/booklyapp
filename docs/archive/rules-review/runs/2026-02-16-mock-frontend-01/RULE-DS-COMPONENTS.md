# RULE-DS-COMPONENTS — Sistema de Componentes y Estados

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 3/5**

---

## Resumen

La rule define cómo aplicar tokens a botones, inputs, tarjetas, alertas, badges, tabs y estados interactivos (hover, focus, active, disabled). El frontend implementa Atomic Design con componentes bien estructurados, pero carece de tests.

## Evidencia encontrada

| Archivo                                            | Qué implementa                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| `src/components/atoms/Button/Button.tsx`           | Botón con variantes primary, secondary, ghost, destructive, outline, link |
| `src/components/atoms/Input/Input.tsx`             | Input con estados default, focus, error, disabled                         |
| `src/components/atoms/Card/Card.tsx`               | Tarjeta con bg.surface y bordes                                           |
| `src/components/atoms/Alert/Alert.tsx`             | Alertas con variantes success, warning, error                             |
| `src/components/atoms/Badge/Badge.tsx`             | Badges/etiquetas con colores semánticos                                   |
| `src/components/atoms/Tabs/Tabs.tsx`               | Tabs con active/inactive states                                           |
| `src/components/atoms/Select/Select.tsx`           | Select con estados                                                        |
| `src/components/atoms/Dialog/Dialog.tsx`           | Modal/dialog (Radix-based)                                                |
| `src/components/atoms/StatusBadge/StatusBadge.tsx` | Badges de estado (confirmed, pending, cancelled)                          |
| `src/components/atoms/ApprovalStatusBadge.tsx`     | Badge específico de aprobación                                            |

## Criterios de Aceptación vs Implementación

| AC                                                        | Estado | Detalle                                                                           |
| --------------------------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| Grid de 8px                                               | ✅     | Tailwind spacing system (múltiplos de 4px)                                        |
| Radio de borde consistente                                | ✅     | `--radius: 0.5rem` en globals.css, tailwind config con lg/md/sm                   |
| Foco visible y accesible (border.focus)                   | ⚠️     | Radix UI provee focus-visible, pero no todos los custom components lo implementan |
| Estados mínimos (default, hover, active, focus, disabled) | ⚠️     | Botones y inputs los tienen; algunos componentes custom podrían estar incompletos |
| Botón primario, secundario, ghost                         | ✅     | CVA (class-variance-authority) con variantes definidas                            |
| Inputs con estados (default, focus, error, disabled)      | ✅     | Implementados con tokens CSS                                                      |
| Tarjetas con bg.surface + border.subtle                   | ✅     | Card component usa shadcn/ui tokens                                               |
| Alertas con tokens de estado                              | ✅     | Alert component con variantes                                                     |
| Badges/chips para estados de reserva                      | ✅     | StatusBadge, ApprovalStatusBadge                                                  |
| Tabs con active indicator                                 | ✅     | Radix Tabs con estilos                                                            |

## Gaps

1. **Sin tests unitarios ni de snapshot** para ningún componente — Gate: max 3.
2. **Foco accesible inconsistente** en componentes custom (no Radix).
3. **Sin Storybook** para documentar componentes visualmente (mencionado en la arquitectura pero no implementado).
4. **Algunos componentes pueden no cubrir todos los 5 estados** interactivos.

## Plan de mejora

| Prioridad | Tarea                                                           | Skill                 |
| --------- | --------------------------------------------------------------- | --------------------- |
| Alta      | Agregar tests de render + snapshot para atoms/                  | `SK-QA-001`           |
| Alta      | Auditar focus-visible en todos los componentes interactivos     | `SK-QA-001` + `ux-ui` |
| Media     | Implementar Storybook para documentación visual de componentes  | `SK-ENG-DELIVERY-001` |
| Baja      | Verificar cobertura de 5 estados en cada componente interactivo | `ux-ui`               |

## Score justificado: **3/5**

Componentes funcionales con atomic design, CVA para variantes, Radix UI como base. Sin tests → gate a max 3.
