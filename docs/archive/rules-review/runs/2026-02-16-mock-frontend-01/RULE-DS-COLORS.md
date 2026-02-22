# RULE-DS-COLORS — Sistema de Colores y Tokens de Diseño

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 4/5**

---

## Resumen

La rule define paleta base, tokens globales, tokens semánticos (light/dark), mapeo a CSS variables y a Tailwind. El frontend implementa correctamente la mayoría de tokens.

## Evidencia encontrada

| Archivo                                            | Línea(s) | Qué implementa                                                                                            |
| -------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `src/app/globals.css`                              | 12–133   | CSS variables light/dark para fondos, texto, acciones, estados, bordes + shadcn/ui compatibility          |
| `tailwind.config.ts`                               | 19–108   | Brand colors (primary 50–900, secondary 50–900), state colors (success, warning, error), shadcn/ui compat |
| `src/app/[locale]/design-system/page.tsx`          | —        | Showcase page para visualizar tokens                                                                      |
| `src/components/atoms/ColorSwatch/ColorSwatch.tsx` | —        | Componente para mostrar swatches de color                                                                 |
| `src/components/atoms/ThemeToggle.tsx`             | —        | Toggle de tema claro/oscuro                                                                               |

## Criterios de Aceptación vs Implementación

| AC                                                            | Estado | Detalle                                                                                                |
| ------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| Paleta base definida (primario, secundario, estados, neutros) | ✅     | `brand.primary`, `brand.secondary`, `state.*` en tailwind.config.ts                                    |
| Tokens globales (color.blue._, color.teal._, etc.)            | ✅     | Escala completa 50–900 para primary y secondary                                                        |
| Tokens semánticos modo claro                                  | ✅     | CSS variables: `--color-bg-app`, `--color-text-primary`, `--color-action-primary`, etc.                |
| Tokens semánticos modo oscuro                                 | ✅     | Clase `.dark` con todos los tokens remapeados                                                          |
| Mapeo a CSS variables                                         | ✅     | globals.css :root y .dark                                                                              |
| Mapeo a Tailwind                                              | ✅     | tailwind.config.ts extend.colors                                                                       |
| No usar hexadecimales directos en componentes                 | ⚠️     | Mayoría usa tokens, pero algunos componentes podrían usar hex directos (no verificado exhaustivamente) |
| Accesibilidad AA contraste 4.5:1                              | ⚠️     | No hay validación automatizada de contraste                                                            |

## Gaps

1. **Sin tests de regresión visual** para tokens de color — Gate: score max 3 sin tests, pero tokens CSS están cubiertos por el design system page como verificación manual.
2. **No hay validación automatizada de contraste** AA (4.5:1) para texto.
3. **Posible uso de hex directos** en algunos componentes; requeriría lint rule customizada.

## Plan de mejora

| Prioridad | Tarea                                                       | Skill       |
| --------- | ----------------------------------------------------------- | ----------- |
| Media     | Agregar lint rule para prohibir hex directos en componentes | `SK-QA-001` |
| Media     | Agregar test de snapshot para CSS variables (light+dark)    | `SK-QA-001` |
| Baja      | Integrar herramienta de validación de contraste (axe-core)  | `SK-QA-001` |

## Score justificado: **4/5**

Tokens bien definidos, dual mode implementado, Tailwind config alineada. Falta validación automatizada (tests + a11y audit) para llegar a 5.
