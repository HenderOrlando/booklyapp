---
name: web-app
description: Skill para construir interfaces web robustas con SSR/CSR, formularios complejos, visualización de datos y tablas avanzadas. Incluye accesibilidad (a11y), optimización de performance (Core Web Vitals) e internacionalización (i18n) listos para producción.
---

# 🌐 Windsurf Skill — Web App (Web App / Admin Panel)
**Skill ID:** SK-WEB-001  
**Aplica a:** Productos con web app y/o panel administrativo (cualquier vertical)  
**Stack default:** React + Next.js (si se define otro, Windsurf debe declarar el cambio en el “Web Profile”)  
**Objetivo:** construir interfaces web robustas (SSR/CSR), formularios complejos, data-viz y tablas avanzadas, con a11y, performance (Core Web Vitals) e i18n listos para producción.

---

## 0) Web Profile (output obligatorio)
Antes de diseñar/codificar, Windsurf debe fijar:

- **App type:** web app | admin panel | marketing site | híbrido
- **Framework:** Next.js (versión) | otro (justificar)
- **Rendering strategy:** SSR | SSG | ISR | CSR (por rutas)
- **Routing:** App Router / Pages Router (según Next)
- **State:** server state (TanStack Query / SWR) + client state (Zustand/Redux/Context)
- **Forms:** React Hook Form / Formik / otro (justificar)
- **UI kit / DS:** shadcn/ui / MUI / custom DS (definir)
- **Auth:** OIDC/OAuth, session/cookies/JWT (definir)
- **i18n:** next-intl / next-i18next / otro (definir)
- **Telemetry:** Sentry/Datadog/OTel (definir)

> Gate: si Web Profile no está explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Ruta decide render:** SSR/SSG/ISR/CSR se elige por SEO, data-sensitivity, latencia y UX.
2. **Forms son producto:** validación, errores, estados y accesibilidad son parte del alcance.
3. **Data-heavy UI con disciplina:** tablas, filtros y export deben ser escalables (no “todo en memoria”).
4. **A11y y performance desde el MVP:** no “parches” al final.
5. **Consistencia via Design System:** componentes reutilizables y tokenizados.

---

## 2) Rendering: SSR/CSR/SSG/ISR (reglas de decisión)
### 2.1 Reglas rápidas (por ruta)
- **SSG/ISR:** contenido público, estable, SEO (docs, landing, pricing).
- **SSR:** contenido personalizado pero cacheable por usuario/tenant; primera carga rápida; SEO opcional.
- **CSR:** dashboards privados, alta interactividad, data dependiente de sesión; evita SSR si complica auth.
- **Híbrido:** SSR shell + CSR data (streaming/suspense) si mejora UX.

### 2.2 Gate de estrategia de render (bloquea)
- No hay decisión explícita por tipo de página.
- Se usa SSR en rutas privadas sin estrategia segura de sesión/cookies.
- Se hace CSR total en páginas que requieren SEO sin justificación.

---

## 3) Arquitectura Frontend (escalable)
### 3.1 Módulos recomendados
- `features/*` (por dominio: transactions, reports, users, etc.)
- `shared/*` (ui, hooks, utils)
- `services/*` (api clients, auth)
- `store/*` (client state)
- `i18n/*`, `styles/*`

### 3.2 Separación de estados
- **Server state:** fetch/cache (TanStack Query/SWR) con invalidation
- **Client state:** UI state (modals, filters temporales) con boundaries por feature
- Evitar “global soup” (estado global sin ownership)

**Gate arquitectura (bloquea):**
- Componentes mezclan fetch + lógica + UI sin separación.
- No existe contrato del API client ni manejo de errores consistente.

---

## 4) Componentes + Formularios complejos
### 4.1 Estándar de formularios (obligatorio)
Cada formulario debe incluir:
- Validación **client + server**
- Estados: `idle/loading/success/error`
- Errores accionables (campo + resumen)
- Prevención de doble submit (idempotencia UI)
- Autosave o confirmación (según riesgo)
- Accesibilidad:
  - labels asociados
  - focus management
  - mensajes de error anunciables

### 4.2 Gate de forms (bloquea)
- Inputs sin label accesible.
- Errores genéricos (“Algo salió mal”) sin guía.
- Submit duplicable (sin disable/loading).
- Validación solo en cliente para reglas críticas.

---

## 5) Visualización de datos (charts, tablas, filtros, export)
### 5.1 Charts (reglas)
- Elegir chart por decisión:
  - time-series → line/area
  - comparación → bar
  - composición → stacked / (pie solo si < 5 categorías y muy claro)
- Estados obligatorios:
  - loading skeleton
  - no-data (empty) con explicación y CTA
  - error con retry
- Tooltips y unidades claras (moneda, %)
- Soportar “download image” o “export data” si el panel lo requiere

### 5.2 Tablas + filtros (data grid)
**Requisitos mínimos para “data-heavy”:**
- Paginación server-side (por defecto)
- Sorting server-side
- Filtros composables (AND/OR si aplica)
- Columnas configurables (show/hide)
- Persistencia de filtros (URL params o storage)
- Selección y acciones masivas (si aplica)
- Virtualización para listas grandes (cuando CSR)

### 5.3 Exportaciones
- CSV/XLSX/PDF (según caso)
- Export asíncrono (job) si dataset grande
- Auditoría/permiso para export de datos sensibles
- Redacción/masking para PII si aplica

**Gate data-viz (bloquea):**
- Tablas grandes renderizadas completas (sin paginación/virtualización).
- Filtros solo client-side sin justificar (riesgo performance).
- Export sin permisos o sin estrategia para volúmenes grandes.

---

## 6) Accesibilidad web (a11y)
### 6.1 Checklist mínimo
- Navegación por teclado (tab/shift+tab) completa
- Focus visible + focus trap en modals
- Roles/aria correctos en componentes interactivos
- Contraste suficiente (texto/controles)
- No depender solo de color para estado
- Headings jerárquicos y landmarks (main/nav/aside)

**Gate a11y (bloquea para flujos core):**
- Modal sin focus trap.
- Componentes custom sin roles/labels.
- Errores de forms no anunciables a screen reader.

---

## 7) Performance web (Core Web Vitals) + prácticas
### 7.1 Objetivos (declarar en Web Profile)
- **LCP**, **INP**, **CLS** (targets)
- First load JS budget (aprox)
- TTFB (si SSR)

### 7.2 Técnicas obligatorias
- Code splitting por ruta/feature
- Lazy loading de componentes pesados (charts, editors)
- Optimización de imágenes (Next Image) y caching
- Prefetch controlado (no saturar)
- Evitar render thrash (memoization cuando aplica)
- Server caching (ISR/SSR) si corresponde

**Gate performance (bloquea):**
- Sin medición (Lighthouse/Web Vitals) en rutas clave.
- Charts/tablas sin virtualización o sin paginación con datasets grandes.
- Bundle creciendo sin control (sin splitting).

---

## 8) i18n (obligatorio si el producto es multi-idioma)
### 8.1 Reglas
- No hardcode strings: todo via diccionarios.
- Formatos locales:
  - moneda, números, fechas, timezones
- Pluralización y género (cuando aplica)
- Layouts deben soportar textos largos (overflow/line breaks)

**Gate i18n (bloquea si i18n requerido):**
- Strings hardcoded en UI.
- Moneda/fecha sin localización.
- UI se rompe con traducciones largas.

---

## 9) Seguridad web (mínimos)
- Protección XSS (escape, sanitización donde aplique)
- CSRF (si cookies) + sameSite
- Manejo seguro de tokens (no en localStorage si es evitable)
- RBAC/ABAC por ruta y por acción
- Redacción de PII en logs/client telemetry

**Gate security (bloquea):**
- Tokens expuestos/inseguros.
- Rutas privadas sin protección consistente.

---

## 10) Test Strategy (mínimos)
- **Unit:** utils, hooks, reducers
- **Component:** estados de UI y forms
- **E2E:** flujo core (login + acción principal + export si aplica)
- **A11y checks:** axe (si disponible) en páginas core

---

## 11) Outputs obligatorios (por fase BMAD)
### BRIEF
- Web Profile + objetivos UX/perf + rutas + riesgos

### MODEL
- Mapa de rutas (render strategy por ruta)
- Diseño de componentes DS
- Modelo de datos UI (filters/sort/pagination)

### ACTION
- Plan de implementación por feature + forms spec
- Plan de data-viz (charts/tables/export)
- Instrumentación (eventos UX y errores)
- Checklist a11y + perf

### DEPLOY
- CI (lint/test/build)
- Error/crash monitoring (Sentry) + web vitals
- Rollout plan (feature flags)

---

## 12) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Web Profile**  
2) **Routing + Rendering Plan** (SSR/CSR/SSG/ISR por ruta)  
3) **Architecture Plan** (features/shared/services/state)  
4) **Forms Spec** (validaciones + errores + a11y)  
5) **Data-viz Plan** (charts + tables + filters + export)  
6) **A11y Checklist aplicado**  
7) **Performance Plan** (Core Web Vitals + optimizaciones)  
8) **i18n Plan** (si aplica)  
9) **Next Steps** (accionables)

---

## 13) Señales de deuda web (Windsurf debe advertir)
- CSR total por default sin justificar.
- Forms sin validación server-side o sin estados completos.
- Tablas grandes sin paginación/virtualización.
- Charts sin empty/error states.
- i18n parcial (strings hardcoded).
- Sin métricas de Web Vitals o sin monitoreo de errores.

---
**End of skill.**
