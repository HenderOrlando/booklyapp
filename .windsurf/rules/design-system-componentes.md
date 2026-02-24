---
trigger: model_decision
description: when work in bookly-frontend folder
---

# 🧩 Sistema de Componentes y Estados – Bookly

## 1. Propósito del documento

Este documento define **cómo los tokens de color se aplican a los componentes** de la interfaz de Bookly, de forma que:

- Nuevos componentes puedan crearse sin romper la identidad visual.
- Los estados de interacción sean consistentes (hover, focus, active, disabled).
- Sea sencillo mantener la coherencia entre módulos (auth, recursos, reservas, reportes, etc.).

Este archivo se enfoca en:

- Botones.
- Campos de formulario (inputs, selects, textareas).
- Tarjetas (cards) y paneles.
- Alertas y banners de estado.
- Etiquetas, chips y badges.
- Tabs de navegación.

Se asume que los colores base y tokens están definidos en `Bookly_Design_System_Colors_and_Tokens.md`.

---

## 2. Principios transversales de componentes

1. **Grid de 8px**  
   Dimensiones, paddings y márgenes deben ser múltiplos de 4 u 8 píxeles.

2. **Radio de borde consistente**  
   Para la mayoría de componentes se recomienda un radio de borde medio (por ejemplo 8 px).  
   Componentes críticos o compactos (badges, chips) pueden usar radios ligeramente menores.

3. **Foco visible y accesible**  
   Todo componente interactivo debe mostrar un estado de foco claro usando el token de borde de foco (`border.focus`).

4. **Estados mínimos por componente**
   - default
   - hover
   - active
   - focus
   - disabled

---

## 3. Botones

Los botones son componentes clave para la interacción en Bookly. Existen tres variantes principales:

- Botón primario.
- Botón secundario.
- Botón ghost (o texto).

### 3.1. Botón primario

Usado para la acción más importante de la pantalla (por ejemplo “Reservar recurso”, “Guardar cambios”).

- Fondo por defecto: token `action.primary.default`.
- Fondo al hover: token `action.primary.hover`.
- Texto: token `text.inverse` (generalmente blanco).
- Bordes: mismo color que el fondo o transparente.
- Disabled: fondo `action.primary.disabled`, texto con menor opacidad.
- Focus: borde o sombra usando `border.focus`.

En modo claro, el aspecto es un botón azul sólido.  
En modo oscuro, el azul se aclara ligeramente para mantener contraste sobre el fondo oscuro.

### 3.2. Botón secundario

Usado para acciones importantes pero no principales (por ejemplo “Ver detalles”, “Exportar CSV”).

- Fondo por defecto: token `action.secondary.default`.
- Fondo al hover: token `action.secondary.hover`.
- Texto: `text.inverse`.
- Disabled: utilizar un gris suave o reducir opacidad del fondo.
- Focus: mismo patrón que el botón primario.

Visualmente se diferencia del primario por el tono (turquesa frente a azul).  
Nunca debe competir visualmente con el primario en la misma vista; el primario debe ser más evidente.

### 3.3. Botón ghost o texto

Usado para acciones de bajo peso visual (por ejemplo “Cancelar”, “Volver”, “Ver más”).

- Fondo por defecto: transparente.
- Texto: puede usar `action.primary.default` o un gris medio según la importancia.
- Hover: fondo usa un color de superficie sutil (`bg.muted`).
- Borde: normalmente ninguno, salvo en estados de foco.

Este botón es útil para secondary actions que no deberían llamar tanto la atención.

### 3.4. Botones con icono

Cualquier tipo de botón puede incorporar iconos:

- Icono + texto: icono alineado a la izquierda con espaciado horizontal consistente.
- Solo icono: botón cuadrado con mismo alto que un botón normal, centrando el icono.

El color del icono debe seguir el color del texto del botón.

---

## 4. Inputs y campos de formulario

Campos de formulario incluyen inputs de texto, selects, datepickers, textareas, etc.

### 4.1. Estados de los inputs

Todo input debe manejar al menos estos estados:

- default (sin error, sin focus)
- focus (activo)
- error (validación)
- disabled / readonly

### 4.2. Colores por estado (modo claro)

- Fondo por defecto: `bg.surface` o un gris muy claro.
- Texto: `text.primary`.
- Placeholder: `text.secondary` con menor opacidad.
- Borde por defecto: `border.subtle`.
- Borde al focus: `border.focus` (azul).
- Borde en error: token de error (`state.error.border`).
- Mensaje de error: `state.error.text`.

En modo oscuro, los mismos tokens semánticos apuntan a fondos más oscuros y bordes más luminosos.

### 4.3. Lectura rápida de estados

- Si el usuario ve un borde azul: el campo está enfocado.
- Si el usuario ve un borde rojo y mensaje en rojo: el campo tiene error.
- Si el campo se ve “apagado” y no responde: está deshabilitado.

---

## 5. Tarjetas (cards) y paneles

Las tarjetas son contenedores de información usadas para:

- Listado de recursos.
- Resumen de reservas.
- Paneles de reportes.

### 5.1. Estructura básica

- Fondo: `bg.surface`.
- Borde: `border.subtle`.
- Sombra: ligera, opcional según el contexto.
- Título: `text.primary`.
- Texto secundario: `text.secondary`.

### 5.2. Variantes por uso

- Tarjeta clicable: al hover puede elevarse ligeramente (sombra y pequeño cambio de fondo usando `bg.muted`).
- Tarjeta destacada: puede usar un borde lateral del color primario o secundario para indicar importancia sin cambiar todo el fondo.

Las tarjetas no deben usar colores de estado (éxito, error) como fondo principal, salvo en casos muy específicos (como dashboards de KPI). Para eso existen las alertas.

---

## 6. Alertas y banners de estado

Las alertas comunican estados del sistema: éxito, advertencia, error, información.

### 6.1. Composición

Una alerta típica tiene:

- Icono representativo (check, signo de alerta, cruz).
- Título breve.
- Mensaje opcional más largo.
- Botones de acción opcionales (“Ver más”, “Reintentar”).

### 6.2. Colores por tipo

Usar siempre los tokens de estado:

- Éxito:

  - Fondo: `state.success.bg`.
  - Texto: `state.success.text`.
  - Borde (opcional): `state.success.border`.

- Advertencia:

  - Fondo: `state.warning.bg`.
  - Texto: `state.warning.text`.
  - Borde: `state.warning.border`.

- Error:
  - Fondo: `state.error.bg`.
  - Texto: `state.error.text`.
  - Borde: `state.error.border`.

Los botones dentro de alertas deben seguir usando los tokens de acción (primario o secundarios), no inventar nuevos colores.

---

## 7. Etiquetas, chips y badges

Estos componentes son útiles para indicar estado o categoría de un recurso o reserva.

### 7.1. Uso típico en Bookly

- Estado de reserva: confirmada, pendiente, cancelada.
- Tipo de recurso: laboratorio, auditorio, sala de cómputo.
- Prioridad: alta, media, baja.

### 7.2. Colores sugeridos

- Reservas confirmadas: usar esquema de éxito (verdes).
- Reservas pendientes: usar esquema de advertencia (naranjas o amarillos).
- Reservas canceladas: usar esquema de error (rojos).
- Categorías neutrales: usar grises o variantes suaves del color primario.

### 7.3. Reglas de legibilidad

- Siempre usar texto oscuro sobre fondo claro o texto claro sobre fondo oscuro.
- Evitar fondos saturados con texto saturado; preferir fondos suaves con texto más intenso.

---

## 8. Tabs de navegación

Los tabs ayudan a cambiar entre vistas dentro de una misma página (por ejemplo: “Detalles”, “Historial”, “Aprobaciones”).

### 8.1. Tab activo

- Texto: `text.primary`.
- Indicador (línea inferior): `action.primary.default`.
- Fondo: normalmente transparente o `bg.surface` si se requiere una banda.

### 8.2. Tab inactivo

- Texto: `text.secondary`.
- Sin indicador o con indicador transparente.
- Hover: texto se acerca a `text.primary` y puede mostrar un subrayado suave.

La alineación y spacing entre tabs debe seguir el mismo grid de 8 px.

---

## 9. Estados interactivos y foco

Todos los componentes interactivos deben mostrar un **estado de foco**, tanto por accesibilidad como por consistencia.

- Foco por teclado: usar un borde o halo visible con `border.focus` (azul) alrededor del componente.
- Foco por mouse: puede ser más sutil, pero recomendable mantener el mismo patrón.

Evitar dependencias solo de color para indicar foco; la forma (bordes, sombras) también debe ayudar.

---

## 10. Conclusión y relación con otros documentos

Este documento se apoya en los tokens definidos en `Bookly_Design_System_Colors_and_Tokens.md` y debe usarse junto con el documento de layouts y patrones de página:

- `Bookly_Design_System_Colors_and_Tokens.md`
- `Bookly_Design_System_Components.md` (este archivo)
- `Bookly_Design_System_Layouts_and_Pages.md`

La combinación de estos tres documentos permite escalar Bookly a nuevos módulos sin perder coherencia visual.
