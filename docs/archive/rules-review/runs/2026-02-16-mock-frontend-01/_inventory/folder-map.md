# Folder Map — bookly-mock-frontend

> **Run ID:** `2026-02-16-mock-frontend-01`  
> **Scope:** `bookly-mock-frontend`  
> **Dominio principal:** Frontend (Next.js 14 + React 18)  
> **Skill:** `SK-PLAT-OPS-001` + `SK-ARCH-GOV-001`

---

## Estructura de alto nivel

```
bookly-mock-frontend/
├── src/
│   ├── app/                    # Next.js App Router (pages y layouts)
│   │   ├── [locale]/           # i18n routing (es/en)
│   │   │   ├── (auth)/auth/login/   # Login (route group)
│   │   │   ├── admin/          # Admin: roles, usuarios, templates, auditoria
│   │   │   ├── aprobaciones/   # Stockpile: lista y detalle de aprobaciones
│   │   │   ├── calendario/     # Vista calendario de reservas
│   │   │   ├── categorias/     # Gestión de categorías de recursos
│   │   │   ├── check-in/       # Check-in/check-out digital
│   │   │   ├── dashboard/      # Dashboard principal con KPIs
│   │   │   ├── design-system/  # Showcase del design system
│   │   │   ├── forgot-password/
│   │   │   ├── historial-aprobaciones/
│   │   │   ├── lista-espera/   # Waitlist de reservas
│   │   │   ├── login/          # Login alternativo
│   │   │   ├── mantenimientos/ # Gestión de mantenimientos
│   │   │   ├── profile/        # Perfil de usuario
│   │   │   ├── programas/      # Programas académicos
│   │   │   ├── recursos/       # CRUD de recursos (list, detail, nuevo, editar)
│   │   │   ├── recursos-virtual/
│   │   │   ├── register/       # Registro de usuario
│   │   │   ├── reportes/       # Reportes (general, recursos, usuarios, avanzado)
│   │   │   ├── reservas/       # Reservas (list, detail, nueva)
│   │   │   ├── reset-password/
│   │   │   └── vigilancia/     # Panel de vigilancia
│   │   ├── layout.tsx          # Root layout
│   │   ├── providers.tsx       # Providers globales
│   │   └── globals.css         # CSS variables + Tailwind base
│   │
│   ├── components/             # Atomic Design
│   │   ├── atoms/              # ~30 componentes base (Button, Input, Badge, etc.)
│   │   ├── molecules/          # ~25 composiciones (SearchBar, DatePicker, KPIGrid, etc.)
│   │   ├── organisms/          # ~20 secciones complejas (CalendarView, DashboardGrid, etc.)
│   │   ├── templates/          # 5 layouts (Dashboard, Auth, List, Detail, Main)
│   │   ├── auth/               # ProtectedRoute
│   │   └── index.ts            # Barrel exports
│   │
│   ├── hooks/                  # Custom hooks (~40)
│   │   ├── mutations/          # React Query mutations por dominio
│   │   └── *.ts                # useAuth, useResources, useReservations, etc.
│   │
│   ├── infrastructure/         # Capa de infraestructura
│   │   ├── api/                # Clientes HTTP + interceptors + endpoints
│   │   ├── http/               # httpClient base
│   │   ├── mock/               # Mock data por servicio + MockService
│   │   ├── utils/              # response.util.ts
│   │   └── websocket/          # WebSocket provider + client + events
│   │
│   ├── services/               # Service clients (approvals, checkIn, documents, reports, templates, recurring)
│   ├── store/                  # Redux Toolkit (authSlice, uiSlice)
│   ├── contexts/               # AuthContext
│   ├── i18n/                   # next-intl config + translations (es/en) x 14 namespaces
│   ├── types/                  # Tipado por dominio (entities/, api/)
│   ├── providers/              # WebSocket, ReactQuery, Query providers
│   ├── lib/                    # config.ts, utils.ts
│   ├── utils/                  # roleUtils.ts
│   └── middleware.ts           # Next.js middleware
│
├── tests/                      # setup.ts (solo setup)
├── public/                     # Static assets (icons, images)
├── docs/                       # 176 archivos de documentación
├── scripts/                    # setup-serve-mode, verify-backend, test-api-response
├── package.json                # Next.js 14, React 18, TailwindCSS 3, Radix UI, recharts
├── tailwind.config.ts          # Brand colors + shadcn/ui compat
├── jest.config.js              # Jest setup
├── vitest.config.ts            # Vitest alternate
└── tsconfig.json
```

---

## Mapeo a dominios Bookly

| Dominio           | Pages en scope                                                      | Services / Hooks                                                |
| ----------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- |
| **auth**          | login, register, forgot-password, reset-password, profile, admin/\* | useAuth, useRoles, usePermissions, useAuthorization             |
| **resources**     | recursos/_, categorias, programas/_, mantenimientos                 | useResources, useCategoryMutations, useMaintenanceMutations     |
| **availability**  | reservas/\*, calendario, lista-espera, recursos-virtual             | useReservations, useRecurringReservations, useConflictValidator |
| **stockpile**     | aprobaciones/\*, check-in, vigilancia, historial-aprobaciones       | useApprovalActions, useCheckInOut, useDocumentGeneration        |
| **reports**       | reportes/\*, dashboard                                              | useReports, useReportExport, useDashboard                       |
| **design-system** | design-system (showcase)                                            | N/A — tokens en globals.css + tailwind.config.ts                |

---

## Stats rápidos

- **Total archivos en src/**: 356
- **Archivos .tsx**: 169
- **Archivos .ts**: 157
- **Archivos .css**: 1
- **Tests (.spec._ / .test._)**: 5 (solo interceptors)
- **i18n namespaces**: 14 (x2 idiomas = 28 archivos JSON)
- **Páginas (routes)**: ~30
- **Componentes totales**: ~75 (atoms + molecules + organisms)
- **Hooks**: ~40
- **Mock data files**: 6 (por servicio)
