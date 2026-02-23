# Frontend y Experiencia de Usuario

## Análisis para Tesis de Grado — bookly-web (Next.js)

---

## 1. Contexto del Dominio

El frontend de Bookly (`bookly-web`) es una aplicación web moderna construida con Next.js que consume los 5 microservicios del backend a través del API Gateway. Implementa Atomic Design, internacionalización completa, accesibilidad (a11y), Design System propio y componentes de analytics avanzados.

**Stack**: Next.js (App Router) + TypeScript + TailwindCSS + React Query + Zustand + Storybook

---

## 2. Arquitectura Frontend

### 2.1 Principios de Diseño (9 pilares)

1. **Mantenibilidad**: Componentes < 400 líneas, responsabilidad única
2. **Testabilidad**: Props tipadas, hooks inyectables, componentes puros
3. **Reutilizabilidad**: Atomic Design con barrel exports
4. **Escalabilidad**: Módulos independientes, code splitting
5. **Consistencia**: Design System unificado con tokens
6. **Documentación**: Storybook + JSDoc + architecture docs
7. **Legibilidad**: Naming conventions estrictas + Prettier
8. **Eficiencia**: Tree-shaking, lazy loading, memoization
9. **Performance**: Virtual scrolling, image optimization, React Query cache

### 2.2 Estructura del Proyecto

```text
src/
├── app/[locale]/           # Next.js App Router con i18n
│   ├── dashboard/          # Panel principal
│   ├── reservas/           # Gestión de reservas
│   ├── recursos/           # Gestión de recursos
│   ├── usuarios/           # Gestión de usuarios
│   ├── roles/              # Roles y permisos
│   ├── aprobaciones/       # Flujos de aprobación
│   ├── check-in/           # Check-in/out
│   ├── reportes/           # Reportes y analytics
│   └── caracteristicas/    # Características del sistema
│
├── components/             # Atomic Design
│   ├── atoms/              # Button, Input, Card, Badge, Spinner
│   ├── molecules/          # SearchBar, FilterChips, InfoField
│   ├── organisms/          # AppHeader, AppSidebar, DataTable, ReservationModal
│   ├── templates/          # MainLayout, DashboardLayout
│   └── analytics/          # MetricCard, TrendChart, ActivityTimeline
│
├── hooks/                  # React Query queries + mutations
├── infrastructure/         # API clients, mock data, storage
├── types/                  # TypeScript entities + API types
├── utils/                  # Formatting, validation, helpers
├── styles/                 # TailwindCSS globals
└── i18n/                   # Internacionalización (es/en)
```

### 2.3 Atomic Design Pattern

| Nivel | Componentes | Características |
|-------|-------------|-----------------|
| **Atoms** | Button, Input, Label, Badge, Card, Spinner | Sin lógica de negocio, props simples, altamente testeables |
| **Molecules** | SearchBar, FilterChips, InfoField | Composición de atoms, estado local simple |
| **Organisms** | AppHeader, AppSidebar, DataTable, ReservationModal, UserFormModal | Integración con hooks, lógica de negocio |
| **Templates** | MainLayout, DashboardLayout | Estructura sin contenido, slots via props |
| **Pages** | dashboard, reservas, recursos, usuarios, roles, aprobaciones | Data fetching, routing, composición completa |

---

## 3. Flujo de Datos

### 3.1 Server State (React Query)

```typescript
// Queries con cache inteligente
const { data, isLoading } = useQuery({
  queryKey: reservationKeys.all,
  queryFn: ReservationsClient.getAll,
  staleTime: 3 * 60 * 1000, // 3 minutos
});

// Mutations con invalidación automática
const createReservation = useMutation({
  mutationFn: ReservationsClient.create,
  onSuccess: () => {
    queryClient.invalidateQueries(reservationKeys.all);
    toast.success('Reserva creada');
  },
});
```

### 3.2 Client State

- **React Context**: Tema (dark/light), autenticación, idioma
- **useState/useReducer**: Estado UI local (modales, tabs, filtros temporales)

### 3.3 Integración con Backend

- **Data Providers**: `ServerGatewayDataProvider` y `ServerDirectDataProvider` extraen `response.data.data` del `GlobalResponseInterceptor`
- **Idempotency**: Interceptor inyecta UUID en header `Idempotency-Key` para POST/PUT/PATCH/DELETE
- **Error Mapping**: `errorMapper.ts` consume formato estandarizado `{ code, message, type, exception_code, http_code }`

---

## 4. Componentes de Analytics

6 componentes profesionales implementados con zero dependencias externas para gráficos:

| Componente | Líneas | Funcionalidad |
|------------|--------|---------------|
| **MetricCard** | 120 | Tarjetas con tendencias, 6 esquemas de color |
| **MetricsGrid** | 30 | Grid responsivo (1/2/3/4 columnas) |
| **StatsSummary** | 100 | Comparaciones entre períodos (4 formatos) |
| **TrendChart** | 160 | Gráfico de líneas con Canvas 2D nativo |
| **QuickStats** | 70 | Panel de estadísticas compactas |
| **ActivityTimeline** | 130 | Timeline con 4 tipos y timestamps relativos |

**Total**: ~610 líneas para un sistema de analytics completo renderizado con Canvas nativo.

---

## 5. Módulos UI Implementados (100%)

| Módulo | Endpoints | Clientes | Hooks | UI | Estado |
|--------|-----------|----------|-------|----|--------|
| **Auth (Users)** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | Completo |
| **Resources** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | Completo |
| **Availability** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | Completo |
| **Stockpile** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | Completo |
| **Check-in/out** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | Completo |
| **Roles & Perms** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | Completo |
| **Reports** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | Completo |

---

## 6. Refactorizaciones Completadas

Refactoring sistemático aplicado a cada módulo UI:

| Módulo | Antes | Después | Reducción | Componentes Extraídos |
|--------|-------|---------|-----------|----------------------|
| **Usuarios** | 1147 líneas | 580 líneas + 4 componentes | -49% | UserStatsCards, UsersTable, UserFormModal, UserDetailPanel |
| **Roles** | 1147 líneas | 580 líneas + 4 componentes | -49% | RoleForm, RoleList, PermissionForm, PermissionList |
| **Recursos** | 588 líneas | 300 líneas + 3 componentes | -49% | ResourceStatsCards, ResourcesTable, ResourceFiltersSection |
| **Reservas** | 349 líneas | 299 líneas + 2 componentes | -14% | ReservationStatsCards, ReservationFiltersSection |

---

## 7. Internacionalización (i18n)

- **Framework**: next-intl / react-i18next
- **Idiomas**: Español (es) + Inglés (en)
- **Estructura**: Namespaces por módulo en `i18n/messages/`
- **Detección**: Token JWT o encabezado HTTP `Accept-Language`
- **Cobertura**: UI completa + mensajes de error del backend

---

## 8. Performance y Optimización

| Técnica | Implementación |
|---------|---------------|
| **Code Splitting** | `lazy()` + `Suspense` por ruta y componente pesado |
| **Virtual Scrolling** | Para listas largas de recursos y reservas |
| **Memoization** | `React.memo`, `useMemo`, `useCallback` en componentes costosos |
| **Debouncing** | En búsquedas y filtros (300ms) |
| **Image Optimization** | Next.js Image component con lazy loading |
| **React Query Cache** | staleTime de 3 min, invalidación selectiva por mutation |
| **Bundle Analysis** | `npm run build --analyze` |

---

## 9. Seguridad Frontend

- **Validación**: Zod schemas client + server
- **Sanitización**: DOMPurify para inputs de texto libre
- **CSRF**: SameSite cookies
- **XSS**: `textContent` > `innerHTML`, validación de URLs
- **RBAC por ruta**: Protección de rutas según permisos del usuario
- **Token handling**: Sin localStorage, cookies HttpOnly cuando posible

---

## 10. Testing

| Nivel | Herramienta | Cobertura |
|-------|-------------|-----------|
| **Unit** | Vitest + Testing Library | Componentes, hooks, utils |
| **E2E** | Playwright | 9+ spec files (auth, admin, resources, reservations, etc.) |
| **Visual** | Storybook | Documentación de componentes UI |
| **A11y** | axe + auditorías manuales | Accesibilidad en flujos core |

---

## 11. Aspectos Destacables para Tesis

### 11.1 Innovación Técnica

- **Atomic Design sistemático**: No solo nombrar niveles, sino implementar un sistema donde cada componente tiene responsabilidad clara, props tipadas y documentación en Storybook.
- **Analytics con Canvas nativo**: En lugar de depender de librerías pesadas (Chart.js, D3), los gráficos se renderizan con Canvas 2D nativo, reduciendo el bundle significativamente.
- **Refactoring medible**: Cada módulo fue refactorizado con métricas de reducción de código (-14% a -49%), demostrando mejora cuantificable de mantenibilidad.
- **Integración idempotente automática**: El frontend inyecta automáticamente `Idempotency-Key` en toda mutación, garantizando seguridad ante double-submit sin intervención del desarrollador.

### 11.2 Contribución Académica

- **Patrón de integración frontend-microservicios**: Demuestra cómo un frontend único consume 5 microservicios a través de un gateway, con manejo unificado de errores, cache y autenticación.
- **Design System como artefacto de ingeniería**: Sistema de diseño tokenizado (colores, spacing, tipografía) que garantiza consistencia visual en toda la aplicación.
- **Internacionalización completa**: Preparación para multilenguaje desde el diseño, no como parche posterior.

### 11.3 Impacto Institucional

- **Interfaz moderna y accesible**: Diseño responsivo que funciona en dispositivos móviles y de escritorio, accesible para usuarios con discapacidades.
- **Curva de aprendizaje mínima**: Diseño intuitivo con progressive disclosure que muestra lo mínimo y expande cuando el usuario lo pide.
- **Dashboard ejecutivo**: Visualización de métricas clave en tiempo real para directivos universitarios.

---

## 12. Skills y Rules Aplicadas

- **Skills**: `web-app`, `ux-ui`, `ingenieria-de-producto`
- **Rules**: `design-system-colores-tokens`, `design-system-componentes`, `design-system-layouts-pages`

---

**Framework**: Next.js (App Router) + TypeScript
**Componentes**: ~50+ componentes organizados en Atomic Design
**Módulos UI**: 7/7 completados al 100%
**Idiomas**: Español + Inglés
**E2E Specs**: 9+ archivos Playwright
