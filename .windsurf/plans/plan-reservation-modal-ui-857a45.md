# Plan de Mejoras UI/UX para el Modal de Nueva Reserva

Este plan propone modernizar el modal de creación y edición de reservas alineándolo con el Design System de Bookly, asegurando consistencia visual, mejor usabilidad y compatibilidad total con los modos claro y oscuro.

## 1. Estandarización de Componentes (Atoms)
- **Crear Componente `Textarea`**: Implementar un átomo `Textarea` en `src/components/atoms/Textarea` que siga el mismo patrón visual y de estados (hover, focus, error, dark mode) que el componente `Input`.
- **Crear Componente `Label`**: Implementar un átomo `Label` para estandarizar las etiquetas de los formularios, asegurando el uso de los tokens de color de texto (`text.primary`) y spacing (8px).
- **Actualizar `ReservationModal`**: Reemplazar todos los elementos HTML nativos (`input`, `select`, `textarea`, `label`) por sus versiones del Design System (`Input`, `Select`, `Textarea`, `Label`).

## 2. Refactorización de UI/UX en `ReservationModal`
- **Layout y Grid de 8px**: Ajustar los márgenes y paddings internos para cumplir estrictamente con la regla del grid de 8px.
- **Jerarquía de Información**:
  - Mejorar el agrupamiento visual de los campos relacionados (ej. Recurso y Título).
  - Hacer el indicador de duración (`DurationBadge`) más integrado en el flujo de selección de horas.
- **Sección de Recurrencia**: Rediseñar el contenedor de la configuración recurrente para que se sienta como una sección integrada del formulario y no un bloque aislado, utilizando tokens de superficie suaves (`bg.muted`).
- **Validaciones Visuales**: Asegurar que los mensajes de error utilicen los tokens `state.error.text` y los bordes de los inputs cambien a `state.error.border`.

## 3. Compatibilidad Light/Dark Mode
- **Verificación de Tokens**: Revisar que cada componente use variables CSS (`var(--color-...)`) en lugar de colores hardcodeados o clases arbitrarias de Tailwind que no sigan el sistema.
- **Contraste**: Validar en modo oscuro que los fondos de los modales (`bg.surface`) y los inputs tengan el contraste AA requerido.

## 4. Pasos de Implementación
1.  **Atoms**: Crear `Textarea.tsx` y `Label.tsx`.
2.  **Modal Refactor**: Actualizar imports y estructura de `ReservationModal.tsx`.
3.  **Styling**: Refinar clases de Tailwind usando los tokens semánticos del DS.
4.  **Verificación**: Pruebas visuales en ambos temas y con estados de error activos.
