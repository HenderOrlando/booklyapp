---
trigger: model_decision
description: when work in bookly-mock-frontend folder
---

# 🎨 Sistema de Colores y Tokens de Diseño – Bookly

## 1. Propósito del documento

Este documento define el **sistema de color y tokens de diseño** para Bookly.  
El objetivo es que cualquier miembro del equipo (frontend, backend con templates, diseño, documentación) pueda:

- Extender componentes.
- Crear nuevas páginas y vistas.
- Añadir nuevos módulos.

…sin romper la **coherencia visual** ni la identidad de la plataforma.

Este archivo se centra en:

- Paleta base.
- Tokens de color globales.
- Tokens semánticos por rol (fondo, texto, acciones, estados).
- Mapeo sugerido a CSS variables y Tailwind.

---

## 2. Principios de diseño de color en Bookly

1. **Consistencia antes que creatividad**  
   Mejor reutilizar un token existente que inventar un nuevo color.

2. **Semántico antes que literal**  
   En el código, debemos usar nombres como `color.bg.surface` o `color.action.primary` en lugar de `#2563EB` directamente.

3. **Accesibilidad por defecto**  
   Todo texto y elementos interactivos deben respetar un contraste mínimo AA (4.5:1 cuando sea texto normal).

4. **Escalabilidad**  
   Los tokens deben permitir agregar nuevos módulos (reportes, mantenimiento, aprobaciones, etc.) sin redefinir colores.

---

## 3. Paleta base

La identidad cromática general de Bookly se construye con estos grupos:

- Color primario: azul eléctrico (acciones principales, navegación, énfasis).
- Color secundario: turquesa (resaltados, información clave, elementos complementarios).
- Estados: éxito, advertencia, error.
- Neutros: gama de grises para fondos, superficies y textos.
- Modos: claro y oscuro.

Los valores base son:

- Primario: `#2563EB`
- Secundario: `#14B8A6`
- Éxito: `#22C55E`
- Advertencia: `#F97316`
- Error: `#EF4444`
- Neutros: desde `#F9FAFB` (muy claro) hasta `#111827` (muy oscuro).
- Fondo oscuro principal: `#1E293B`

Estos colores no deberían usarse directamente en componentes; en su lugar se emplean **tokens semánticos**.

---

## 4. Tokens globales de color (nivel base)

Los tokens globales son la “materia prima” que luego se mapea a tokens semánticos.  
Una posible nomenclatura es:

- `color.blue.50`, `color.blue.100`, … `color.blue.900`
- `color.teal.50` …
- `color.gray.50` …
- `color.red.*`, `color.green.*`, `color.orange.*`

Un ejemplo de mapeo aproximado:

- Azul (primario técnico):

  - `color.blue.50 = #EFF6FF`
  - `color.blue.100 = #DBEAFE`
  - `color.blue.500 = #2563EB`
  - `color.blue.600 = #1D4ED8`

- Turquesa (secundario técnico):

  - `color.teal.50 = #F0FDFA`
  - `color.teal.500 = #14B8A6`
  - `color.teal.600 = #0D9488`

- Verde (éxito):

  - `color.green.50 = #ECFDF5`
  - `color.green.500 = #22C55E`
  - `color.green.700 = #15803D`

- Naranja (advertencia):

  - `color.orange.50 = #FFF7ED`
  - `color.orange.500 = #F97316`
  - `color.orange.700 = #C2410C`

- Rojo (error):

  - `color.red.50 = #FEF2F2`
  - `color.red.500 = #EF4444`
  - `color.red.700 = #B91C1C`

- Grises (neutros):

  - `color.gray.50 = #F9FAFB`
  - `color.gray.100 = #F3F4F6`
  - `color.gray.200 = #E5E7EB`
  - `color.gray.300 = #D1D5DB`
  - `color.gray.400 = #9CA3AF`
  - `color.gray.500 = #6B7280`
  - `color.gray.700 = #374151`
  - `color.gray.800 = #1F2937`
  - `color.gray.900 = #111827`

- Fondo oscuro:
  - `color.slate.800 = #1E293B`
  - `color.slate.900 = #0F172A`

Estos valores pueden ajustarse finamente más adelante, pero la estructura se debe mantener.

---

## 5. Tokens semánticos – Modo Claro

Los tokens semánticos se refieren a **intención de uso**, no a un color en sí.  
A continuación se define un conjunto mínimo para modo claro.

### 5.1. Fondos

- `color.light.bg.app = color.gray.50`  
  Fondo general de la aplicación.

- `color.light.bg.surface = #FFFFFF`  
  Tarjetas, paneles, modales.

- `color.light.bg.muted = color.gray.100`  
  Secciones secundarias, banners suaves.

- `color.light.bg.inverse = color.slate.800`  
  Elementos pequeños con fondo oscuro dentro de vistas claras.

### 5.2. Texto

- `color.light.text.primary = color.gray.900`  
  Texto principal, títulos y contenido clave.

- `color.light.text.secondary = color.gray.500`  
  Descripciones, etiquetas, meta información.

- `color.light.text.inverse = #FFFFFF`  
  Texto sobre fondos oscuros o botones sólidos.

- `color.light.text.danger = color.red.700`  
  Mensajes de error, validaciones críticas.

### 5.3. Acciones

- `color.light.action.primary.default = color.blue.500`  
  Botón primario, links principales.

- `color.light.action.primary.hover = color.blue.600`

- `color.light.action.primary.disabled = color.gray.300`

- `color.light.action.secondary.default = color.teal.500`  
  Botón secundario, acciones menos frecuentes.

- `color.light.action.secondary.hover = color.teal.600`

- `color.light.action.ghost.default = transparent`  
  Botón sin relleno, solo borde o texto.

- `color.light.action.ghost.hover = color.gray.100`

### 5.4. Estados del sistema

- `color.light.state.success.bg = color.green.50`
- `color.light.state.success.text = color.green.700`
- `color.light.state.success.border = color.green.200`

- `color.light.state.warning.bg = color.orange.50`
- `color.light.state.warning.text = color.orange.700`
- `color.light.state.warning.border = color.orange.200`

- `color.light.state.error.bg = color.red.50`
- `color.light.state.error.text = color.red.700`
- `color.light.state.error.border = color.red.200`

### 5.5. Bordes y divisores

- `color.light.border.subtle = color.gray.200`  
  Divisores, contornos de tarjetas.

- `color.light.border.strong = color.gray.300`  
  Campos activos, contenedores destacados.

- `color.light.border.focus = color.blue.500`  
  Foco accesible en inputs y botones.

---

## 6. Tokens semánticos – Modo Oscuro

En modo oscuro los nombres de tokens se mantienen, pero apuntan a otros colores.

### 6.1. Fondos

- `color.dark.bg.app = color.slate.800`  
  Fondo general de la aplicación.

- `color.dark.bg.surface = color.slate.900`  
  Tarjetas, paneles y modales en modo oscuro.

- `color.dark.bg.muted = color.gray.800`  
  Bloques secundarios.

- `color.dark.bg.inverse = #FFFFFF`  
  Pequeños elementos claros dentro de vistas oscuras.

### 6.2. Texto

- `color.dark.text.primary = #F9FAFB`  
  Texto principal.

- `color.dark.text.secondary = #CBD5E1`  
  Texto secundario.

- `color.dark.text.inverse = color.gray.900`  
  Texto sobre fondos blancos dentro del modo oscuro.

- `color.dark.text.danger = color.red.400`

### 6.3. Acciones

- `color.dark.action.primary.default = #3B82F6`
- `color.dark.action.primary.hover = #60A5FA`
- `color.dark.action.primary.disabled = color.gray.600`

- `color.dark.action.secondary.default = #2DD4BF`
- `color.dark.action.secondary.hover = #14B8A6`

- `color.dark.action.ghost.default = transparent`
- `color.dark.action.ghost.hover = color.slate.700`

### 6.4. Estados del sistema

- `color.dark.state.success.bg = #064E3B`
- `color.dark.state.success.text = #A7F3D0`
- `color.dark.state.success.border = #10B981`

- `color.dark.state.warning.bg = #7C2D12`
- `color.dark.state.warning.text = #FED7AA`
- `color.dark.state.warning.border = #FDBA74`

- `color.dark.state.error.bg = #7F1D1D`
- `color.dark.state.error.text = #FCA5A5`
- `color.dark.state.error.border = #F87171`

### 6.5. Bordes y divisores

- `color.dark.border.subtle = color.slate.700`
- `color.dark.border.strong = color.slate.600`
- `color.dark.border.focus = #60A5FA`

---

## 7. Mapeo a CSS Variables

Un enfoque recomendado es exponer estos tokens como variables CSS para que tanto React, Next.js como otros consumidores puedan usarlos.

Ejemplo simplificado para modo claro:

```css
:root {
  --color-bg-app: #f9fafb;
  --color-bg-surface: #ffffff;

  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;

  --color-action-primary: #2563eb;
  --color-action-primary-hover: #1d4ed8;

  --color-state-success-bg: #ecfdf5;
  --color-state-success-text: #15803d;

  /* etc. */
}
```

Y para modo oscuro, usando una clase de tema:

```css
:root[data-theme="dark"] {
  --color-bg-app: #1e293b;
  --color-bg-surface: #0f172a;

  --color-text-primary: #f9fafb;
  --color-text-secondary: #cbd5e1;

  --color-action-primary: #3b82f6;
  --color-action-primary-hover: #60a5fa;

  --color-state-success-bg: #064e3b;
  --color-state-success-text: #a7f3d0;

  /* etc. */
}
```

---

## 8. Mapeo a Tailwind (opcional)

Si se usa Tailwind como base de estilos, se pueden registrar colores de marca y tokens en `tailwind.config.js`.

Ejemplo conceptual:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2563EB",
          primaryDark: "#1D4ED8",
          secondary: "#14B8A6",
          secondaryDark: "#0D9488",
        },
        state: {
          success: "#22C55E",
          warning: "#F97316",
          error: "#EF4444",
        },
      },
    },
  },
};
```

Adicionalmente, se pueden mapear los tokens semánticos a utilidades personalizadas o usarse vía CSS variables dentro de componentes.

---

## 9. Reglas de uso y anti-patrones

1. No usar hexadecimales directos en los componentes. Siempre usar tokens.
2. No introducir nuevos colores sin pasar por diseño y actualizar este documento.
3. No usar el color secundario para acciones destructivas; para eso existe el color de error.
4. No mezclar más de dos colores de acción en una misma vista (típicamente primario y secundario).

---

## 10. Próximos pasos

- Alinear este sistema de tokens con la librería de componentes de UI.
- Actualizar documentación de Storybook (si aplica) usando estas referencias.
- Conectar el cambio de modo claro/oscuro al estado de la app (por ejemplo, preferencia del usuario).

Este documento es la base cromática del sistema de diseño de Bookly; otros archivos complementarán componentes, estados y patrones de página.
