# 🎨 Plan de Estandarización de Sistema de Diseño UI/UX - Bookly

## 1. Objetivo

Garantizar que **todas las páginas y componentes del frontend (`bookly-mock-frontend`)** apliquen de manera estricta y consistente los componentes, tokens de color y layouts definidos en el sistema de diseño de Bookly, logrando una interfaz visualmente uniforme, usable y accesible en todos los dominios.

## 2. Reglas Afectadas (Rules)

Este plan se basa y hace cumplir las siguientes reglas del proyecto:

- `.windsurf/rules/design-system-colores-tokens.md`: Define paleta base, tokens globales y semánticos (fondos, texto, acciones, estados).
- `.windsurf/rules/design-system-componentes.md`: Define aplicación de tokens a botones, inputs, cards, alertas, badges y tabs, incluyendo estados de interacción (hover, focus, active, disabled).
- `.windsurf/rules/design-system-layouts-pages.md`: Define estructura de páginas (Dashboard, Listados, Detalles, Formularios) y comportamiento responsive.

## 3. Skills Necesarias

- **ux-ui (SK-UXUI-001):** Principal skill para asegurar usabilidad, claridad, consistencia (Design System), estados completos (empty/loading/error/success) y accesibilidad (a11y).
- **web-app:** Para la correcta implementación de componentes React/Next.js, Tailwind CSS, accesibilidad (a11y) en el código y optimización de renderizado.

## 4. Fases de Ejecución

### Fase 1: Auditoría y Ajuste de Tokens Base

- **Objetivo:** Asegurar que la configuración global de estilos y Tailwind exponga y utilice los tokens definidos.
- **Acciones:**
  - Revisar y ajustar `tailwind.config.ts`.
  - Revisar y ajustar variables CSS globales (`globals.css` o equivalente).
- **Estado:** ✅ Completada
- **Resultados:**
  - `tailwind.config.ts` ya expone correctamente: `brand.primary.*`, `brand.secondary.*`, `state.success.*`, `state.warning.*`, `state.error.*`, y tokens semánticos vía CSS variables (`app`, `surface`, `content.*`, `action.*`, `line.*`).
  - `globals.css` define variables CSS para modo claro y oscuro alineadas con las rules: fondos, texto, acciones, estados y bordes.
  - Compatibilidad Shadcn/ui mantenida vía variables HSL paralelas.
  - No se requirieron cambios estructurales; la infraestructura de tokens estaba correctamente implementada.

### Fase 2: Estandarización de Componentes Base (Atoms y Molecules)

- **Objetivo:** Refactorizar los componentes de UI reutilizables para que usen estrictamente los tokens del sistema de diseño.
- **Acciones:**
  - Botones (Primarios, Secundarios, Ghost, con iconos).
  - Formularios (Inputs, Selects, Textareas, Datepickers) con estados (focus, error, disabled).
  - Tarjetas (Cards) y Paneles.
  - Alertas, Badges y Etiquetas de Estado.
  - Tabs de Navegación.
- **Estado:** ✅ Completada
- **Resultados:**
  - **Button:** Ya usa tokens (`action-primary`, `action-secondary`, `content-inverse`, `action-ghost-hover`, `state-error-text`, `line-focus`). Sin cambios necesarios.
  - **Input:** Ya usa tokens (`line-subtle`, `surface`, `content-primary`, `content-secondary`, `line-focus`, `state-error-border`). Sin cambios necesarios.
  - **Select:** **Fix crítico** en `SelectContent` — clases CSS estaban corruptas/garbled. Corregidas a `bg-surface border-line-subtle text-content-primary`.
  - **Textarea:** Migrada de `var()` inline a clases Tailwind semánticas (`border-line-subtle`, `bg-surface`, `text-content-primary`, `ring-line-focus`, etc.) para consistencia con Input.
  - **Card:** Ya usa tokens (`line-subtle`, `surface`, `content-primary`, `content-secondary`). Sin cambios necesarios.
  - **Badge:** Ya usa tokens (`state-success-*`, `state-warning-*`, `state-error-*`, `action-primary`, `action-secondary`, `line-strong`). Sin cambios necesarios.
  - **Checkbox:** Ya usa tokens (`line-strong`, `line-focus`, `action-primary`, `content-inverse`). Sin cambios necesarios.
  - **Tabs:** Ya usa tokens semánticos vía `var()` (`color-text-secondary`, `color-text-primary`, `color-border-focus`). Sin cambios necesarios.

### Fase 3: Consolidación de Layouts (Templates y Organisms)

- **Objetivo:** Asegurar que las estructuras de página base sigan el patrón definido y corregir problemas de overflow.
- **Acciones:**
  - Layout General (Dashboard: Header, Sidebar, Contenido Principal) - Ajustado el ancho y scroll horizontal (`MainLayout.tsx`).
  - Template de Listados (Filtros, Tabla/Grid, Paginación) - Estandarizado el toggle de vistas (Lista/Grid) en `ListLayout`, `ReservasPage`, `RecursosPage` y `AuditoriaPage`.
  - Template de Detalle (Header, Badges, Tabs, Tarjetas de Info) - Ajustado container rules.
  - Template de Formulario.
- **Estado:** ✅ Completada
- **Resultados:**
  - Corrección de desbordamiento horizontal en layouts (`MainLayout`, `ListLayout`, `DashboardLayout`, `DetailLayout`) cambiando constraints rígidos por `w-full` y `min-w-0`.
  - Estandarización visual del componente Segmented Control (Toggle) para alternar entre "Vista Tabla" y "Vista Lista/Grid" en las pantallas de Recursos, Reservas y Auditoría, igualando el diseño al mockup de referencia.

### Fase 4: Aplicación a Vistas por Dominio (Pages)

- **Objetivo:** Propagar los componentes y layouts estandarizados a todas las páginas del sistema.
- **Acciones:**
  - **Auth:** Login, Registro, Recuperación.
  - **Resources:** Listado, Detalle, Formulario de Creación/Edición.
  - **Availability:** Vistas de Calendario, Búsqueda Avanzada, Formularios de Reserva.
  - **Stockpile:** Flujos de Aprobación, Pantalla de Vigilancia.
  - **Reports:** Dashboards, Exportación de datos.
- **Estado:** ✅ Completada
- **Resultados:**
  - **ResourceStatsCards:** Migradas 4 tarjetas KPI de colores hardcoded (`blue-*`, `green-*`, `orange-*`, `purple-*`) a tokens DS (`brand-primary-*`, `state-success-*`, `state-warning-*`, `brand-secondary-*`). Agregado soporte dark mode.
  - **ResourcesTable:** Migrados botones de acción (restaurar, eliminar) de `green-*`/`red-*` a `state-success-*`/`state-error-*`. Agregado soporte dark mode.
  - **recursos/page.tsx:** Alerta de conflicto de puertos migrada de `orange-*` a `state-warning-*`.
  - **recursos/nuevo/page.tsx:** 10 ocurrencias de `blue-*`/`gray-*` migradas a `brand-primary-*`/`content-tertiary` (chips de características, botón crear, info de programas, indicadores de facultad).
  - **aprobaciones/[id]/page.tsx:** Prioridad HIGH migrada de `orange-*` a `state-warning-*`. Botones de aprobación migrados de `green-*` a `state-success-*`.
  - **check-in/page.tsx:** Info title migrado de `blue-*` a `brand-primary-*`.
  - **vigilancia/page.tsx:** Stat de retrasos migrado de `orange-*` a `state-warning-*`.
  - **admin/configuraciones/page.tsx:** Labels de preview y contenedor dark migrados de `gray-*`/`slate-*` a `content-tertiary`/`inverse`.
  - **admin/usuarios/UserStatsCards.tsx:** Indicador de inactivos migrado de `orange-*` a `state-warning-*`.
  - **admin/roles/RoleStatsCards.tsx:** Color de roles migrado de `blue-*` a `brand-primary-*`.

---

## 5. Verificación

- `npm run type-check` ✅ Sin errores
- `npm run build` ✅ Build exitoso (todas las 50 rutas compiladas)
- `npm run test` ✅ 45/46 suites pasaron (1 skipped preexistente), 297 tests passed

---
_Documento actualizado: 2026-02-23. Plan ejecutado completamente en las 4 fases._
