---
name: ux-ui
description: Skill de UX/UI que asegura entregas usables, claras, consistentes, accesibles y medibles, con diseño sistemático y estados completos.
---

# 🎨 Windsurf Skill — UX/UI (Clave para que se use)
**Skill ID:** SK-UXUI-001  
**Aplica a:** Fintech, Legaltech, Edtech, Healthtech, Retailtech, Proptech, Foodtech, Medtech, Regtech  
**Objetivo:** garantizar que cualquier entrega sea **usable**, **clara**, **consistente**, **accesible** y **medible** (sin fricción), con un diseño sistemático y estados completos.

---

## 1) Principios (no negociables)
1. **Clarity beats cleverness:** copy directo, sin jerga innecesaria.
2. **Friction is a bug:** cada paso debe justificarse por valor o control de riesgo.
3. **Consistency scales:** todo UI nuevo debe salir del Design System (o ampliarlo).
4. **States are features:** empty/loading/error/disabled/success son parte del alcance.
5. **Accessibility by default:** a11y no es “extra”; es requisito.
6. **Progressive disclosure:** mostrar lo mínimo; expandir cuando el usuario lo pida.
7. **Trust & safety:** especialmente en dominios regulados: transparencias, confirmaciones y auditabilidad.

---

## 2) Outputs obligatorios (según fase BMAD)

### 2.1 BRIEF — UX Brief (obligatorio)
- **Persona/Contexto:** quién, dónde, qué intenta lograr.
- **JTBD + top pains:** 3 dolores y 3 motivaciones.
- **Success criteria UX:** (ej. completar onboarding < 2 min, tasa de activación, task success rate).
- **Constraints:** plataforma (web/mobile), i18n, dark mode, compliance, a11y target.

**Gate BRIEF UX (bloquea):**
- No hay usuario/escenario principal.
- No hay métrica de éxito UX (task success / time-on-task / activation).

---

### 2.2 MODEL — UX Model (obligatorio)
- **User Flow** (happy path + alternos mínimos).
- **Information Architecture (IA)** (navegación, jerarquía).
- **Content Model:** qué información aparece y por qué (prioridades).
- **State Model:** estados por pantalla/componente (empty/loading/error/permission/first-run).
- **Design System impact:** reutiliza/crea componentes.

**Gate MODEL UX (bloquea):**
- Flujo sin estados de error/empty.
- IA inconsistente o navegación no definida.

---

### 2.3 ACTION — UI Spec (obligatorio)
- **Screen Spec** por pantalla (mínimo):
  - Objetivo de la pantalla
  - Componentes usados (DS)
  - Copy final (títulos, ayudas, CTAs)
  - Validaciones y mensajes de error
  - Estados (empty/loading/error/success/disabled)
  - Accesibilidad (focus order, labels, roles, tamaños)
- **Checklist de implementación** (dev-ready):
  - tokens (spacing, typography)
  - responsive breakpoints (si web)
  - instrumentation (eventos clave UX)

**Gate ACTION UX (bloquea):**
- No hay copy final (o hay placeholders).
- No hay definición de estados.
- No hay criterios a11y mínimos.

---

### 2.4 DEPLOY — Usability + Observabilidad UX (obligatorio)
- **Plan de prueba de usabilidad:** tareas, criterios, muestra mínima.
- **Telemetría UX:** eventos para drop-off y fricción.
- **Iteración:** qué se cambia si el funnel cae.

**Gate DEPLOY UX (bloquea):**
- No hay plan de pruebas o señales de fricción.
- No hay instrumentación mínima de onboarding/activación.

---

## 3) UX Research & UX Writing (claridad + onboarding)
### 3.1 UX Writing: reglas
- **CTA = verbo + resultado** (ej. “Crear presupuesto”, no “Continuar”).
- Microcopy siempre responde:
  - “¿Qué pasa si hago esto?”
  - “¿Por qué me pides esto?”
  - “¿Cómo lo arreglo si falla?”
- Evitar culpa/juicio (finanzas/salud/legal): tono neutral y empático.
- Confirmaciones solo cuando:
  - hay riesgo (pérdida de datos, cambio irreversible, pago)
  - o reduce ansiedad

### 3.2 Onboarding sin fricción (framework)
- **3 pasos máximo** (si se excede, justificar por compliance/riesgo).
- **Progressive onboarding:** pedir datos cuando el usuario ya vio valor.
- **Education-in-context:** tips dentro del flujo, no “manuales”.
- **Aha Moment** definido + evento de activación medible.

**Gate UX Writing (bloquea):**
- Copy ambiguo en CTAs (“OK”, “Siguiente”) sin contexto.
- Mensajes de error no accionables.

---

## 4) UI Design + Design System (consistencia)
### 4.1 Reglas Design System
- Todo nuevo elemento debe ser:
  - **Tokenizado** (color, spacing, typography)
  - **Reutilizable** (prop-driven)
  - **Documentado** (uso + do/don’t)
- Componentes obligatorios:
  - Buttons, Inputs, Selects, Modal/Sheet, Toast, Card, ListItem, Tabs, Badge/Chip
  - Charts (si aplica) con estados “no data”
- Estados obligatorios por componente:
  - default / hover (web) / pressed / focus / disabled
  - loading
  - error
  - empty (cuando aplica)

### 4.2 Dark mode
- No es “invertir colores”; es un **tema completo**:
  - contraste validado
  - colores semánticos (success/warn/error)
  - sombras/overlays ajustados
- Gate: si hay dark mode, toda pantalla debe probarse en ambos temas.

**Gate Design System (bloquea):**
- Componentes “one-off” sin justificación.
- Inconsistencia visual entre pantallas del mismo flujo.

---

## 5) Accesibilidad (a11y) — mínimos exigibles
**Checklist mínimo:**
- Contraste suficiente (texto, iconos, controles).
- Tamaños legibles (tipografía y targets táctiles).
- Navegación por teclado (web) y focus visible.
- Labels/roles correctos en inputs y componentes interactivos.
- Lectura (screen reader): orden lógico, headings, aria-* donde aplique.
- No depender solo de color para comunicar estado (error/success).

**Gate a11y (bloquea para flows core):**
- Inputs sin label accesible.
- Focus order roto o imposible navegar.
- Targets táctiles demasiado pequeños en mobile.

---

## 6) Prototipado (Figma) + pruebas de usabilidad
### 6.1 Prototipo (definición)
- Fidelity por fase:
  - Discovery: low-fi (wire)
  - Validación: mid-fi clickable
  - Pre-dev: hi-fi con componentes DS
- Debe cubrir:
  - Happy path
  - 2 alternos (mínimo)
  - Estado empty y error principal

### 6.2 Pruebas de usabilidad (mínimo viable)
- 5 usuarios por ronda (heurística), o 3 si es interno con limitación.
- 3 tareas críticas (onboarding + 2 tareas core).
- Métricas:
  - **Task success rate**
  - **Time on task**
  - **Error rate**
  - **Confidence score** (1–5)

**Gate usabilidad (bloquea en lanzamientos R2+):**
- No hay tareas definidas ni criterio de éxito.
- No existe iteración planificada post-test.

---

## 7) Heurísticas de calidad UX (Windsurf debe auditar)
- ¿El usuario entiende qué hacer en < 5 segundos?
- ¿Hay una “salida” clara (back/cancel) sin perder datos?
- ¿Se puede recuperar de errores sin soporte?
- ¿Las pantallas enseñan en contexto (sin tutorial largo)?
- ¿Se mide la fricción (drop-offs y rage taps/clicks)?

---

## 8) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **UX Brief** (persona + objetivo + success criteria)  
2) **User Flow** (happy + alternos) + **State Model**  
3) **UI Spec** (pantallas, componentes DS, copy final, validaciones)  
4) **A11y Checklist aplicado**  
5) **Figma/Prototype Plan** (qué se prototipa)  
6) **Usability Test Plan** (tareas + métricas + iteración)  
7) **Next Steps** (accionables)

---

## 9) Señales de deuda UX (Windsurf debe advertir)
- Copy ambiguo / jerga / onboarding largo sin razón.
- Falta de estados (empty/loading/error).
- Inconsistencia de componentes.
- Dark mode parcial.
- Sin a11y mínimo.
- No hay medición de fricción ni plan de prueba.

---
**End of skill.**

