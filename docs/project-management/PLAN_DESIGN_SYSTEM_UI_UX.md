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
- **Estado:** ⏳ Pendiente
- **Resultados:** _(Se actualizará al completar)_

### Fase 2: Estandarización de Componentes Base (Atoms y Molecules)

- **Objetivo:** Refactorizar los componentes de UI reutilizables para que usen estrictamente los tokens del sistema de diseño.
- **Acciones:**
  - Botones (Primarios, Secundarios, Ghost, con iconos).
  - Formularios (Inputs, Selects, Textareas, Datepickers) con estados (focus, error, disabled).
  - Tarjetas (Cards) y Paneles.
  - Alertas, Badges y Etiquetas de Estado.
  - Tabs de Navegación.
- **Estado:** ⏳ Pendiente
- **Resultados:** _(Se actualizará al completar)_

### Fase 3: Consolidación de Layouts (Templates y Organisms)

- **Objetivo:** Asegurar que las estructuras de página base sigan el patrón definido y corregir problemas de overflow.
- **Acciones:**
  - Layout General (Dashboard: Header, Sidebar, Contenido Principal) - Ajustado el ancho y scroll horizontal (`MainLayout.tsx`).
  - Template de Listados (Filtros, Tabla/Grid, Paginación) - Estandarizado el toggle de vistas (Lista/Grid) en `ListLayout`, `ReservasPage`, `RecursosPage` y `AuditoriaPage`.
  - Template de Detalle (Header, Badges, Tabs, Tarjetas de Info) - Ajustado container rules.
  - Template de Formulario.
- **Estado:** ⏳ En Progreso
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
- **Estado:** ⏳ Pendiente
- **Resultados:** _(Se actualizará al completar)_

---
_Este documento se actualizará dinámicamente conforme avance la ejecución de las fases._
