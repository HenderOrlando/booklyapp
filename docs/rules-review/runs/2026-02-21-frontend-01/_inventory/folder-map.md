# Folder Map — bookly-mock-frontend

> Run: `2026-02-21-frontend-01` | Scope: `bookly-mock-frontend`

## Project Type

Next.js frontend application (SSR/CSR) with Atomic Design component architecture.

## Root Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies (Next.js, Redux Toolkit, SWR, Tailwind, Recharts, Playwright, Vitest) |
| `next.config.js` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS with custom tokens |
| `tsconfig.json` | TypeScript config |
| `playwright.config.ts` | E2E testing config |
| `vitest.config.ts` | Unit testing config |
| `jest.config.js` / `jest.setup.js` | Jest config (legacy/parallel) |
| `verify-translations.js` | i18n translation verification script |

## Source Tree (`src/`)

```
src/
├── app/[locale]/              # Next.js i18n routes (24 route groups)
│   ├── (auth)/                # Auth layout group
│   ├── admin/                 # Admin panel (users, roles, permissions)
│   ├── aprobaciones/          # Approval workflows
│   ├── calendario/            # Calendar view
│   ├── caracteristicas/       # Resource characteristics
│   ├── categorias/            # Categories management
│   ├── check-in/              # Check-in/out
│   ├── dashboard/             # Main dashboard
│   ├── historial-aprobaciones/# Approval history
│   ├── lista-espera/          # Waitlist
│   ├── login/ / register/ / forgot-password/ / reset-password/
│   ├── mantenimientos/        # Maintenance schedules
│   ├── profile/               # User profile
│   ├── programas/             # Academic programs
│   ├── recursos/              # Resources CRUD (12 items)
│   ├── reportes/              # Reports (11 items)
│   ├── reservas/              # Reservations (9 items)
│   └── vigilancia/            # Vigilance panel
│
├── components/                # Atomic Design
│   ├── atoms/       (44 components)  # Button, Input, Badge, Calendar, etc.
│   ├── molecules/   (36 components)  # ApprovalCard, DataTable, Charts, etc.
│   ├── organisms/   (42 components)  # Modals, Panels, Editors, Lists
│   ├── templates/   (10 items)       # Layout templates
│   ├── analytics/   (7 items)        # Analytics components
│   └── auth/        (3 items)        # Auth-specific components
│
├── hooks/                     # 44 custom hooks + mutations/
│   ├── mutations/   (13 items)       # Mutation hooks
│   └── use*.ts      (41 hooks)       # Feature hooks
│
├── infrastructure/            # API layer
│   ├── api/         (15 clients + tests) # API clients per domain
│   ├── data-providers/ (8 items)     # Data provider abstraction
│   ├── http/        (4 items)        # HTTP client + interceptors
│   ├── mock/        (11 items)       # Mock data for dev
│   ├── websocket/   (4 items)        # WebSocket client
│   └── utils/       (1 item)
│
├── i18n/                      # Internationalization
│   ├── translations/en/ (22 namespaces)
│   └── translations/es/ (22 namespaces)
│
├── types/                     # TypeScript types
│   ├── entities/    (14 entity types)
│   └── api/         (1 item)
│
├── store/           # Redux Toolkit store + slices
├── lib/             # Utilities (auth, data-config, utils)
├── contexts/        # React contexts
├── providers/       # Provider wrappers
├── utils/           # General utilities
└── middleware.ts     # Next.js middleware (auth/i18n)
```

## Domain Mapping

| Domain | Pages | Components | Hooks | API Clients | Types |
|--------|-------|------------|-------|-------------|-------|
| **Auth** | login, register, forgot-password, reset-password, profile | auth/ (3) | useAuth, useAuthorization, useCurrentUser, usePermissions, useRoles | auth-client | auth.ts, user.ts |
| **Resources** | recursos/ (12) | ResourceCard, ResourceFilterPanel, ImportResourcesModal, etc. | useResources, useInfiniteResources | resources-client | resource.ts |
| **Availability** | reservas/ (9), calendario/ | CalendarView, ReservationModal, TimeSlotSelector, etc. | useReservations, useCalendarReservations, useSchedules, useConflictValidator | reservations-client | reservation.ts, calendar.ts, conflict.ts, recurring.ts |
| **Stockpile** | aprobaciones/, check-in/, vigilancia/, historial-aprobaciones/ | ApprovalModal, VigilancePanel, CheckInOutPanel, etc. | useApprovals*, useCheckIn*, useDocumentGeneration | approvals-client, check-in-client, documents-client | approval.ts, checkInOut.ts |
| **Reports** | reportes/ (11), dashboard/ | ReportViewer, DashboardGrid, Charts, ExportPanel | useReports, useReportData, useDashboard, useChartExport | reports-client | report.ts |
| **Cross-cutting** | admin/, categorias/, caracteristicas/, programas/, mantenimientos/, lista-espera/ | AdvancedSearchModal, NotificationInbox, WaitlistManager | useNotificationChannels, useWebSocket, usePrograms, useOptimisticUI | config-client, notifications-client, monitoring-client, characteristics-client | notification.ts, waitlist.ts, reassignment.ts, template.ts |

## Testing

| Type | Count | Location |
|------|-------|----------|
| **Unit tests** | ~7 files | `src/__tests__/`, `src/lib/__tests__/`, `src/contexts/__tests__/`, `src/infrastructure/api/__tests__/` |
| **E2E specs** | 8 spec files | `e2e/*.spec.ts` |
| **Smoke tests** | 9 spec files | `e2e/smoke/*.smoke.spec.ts` |
| **Regression tests** | 2 spec files | `e2e/regression/*.spec.ts` |
| **Contract tests** | 2 files | `src/__tests__/contracts/`, `src/infrastructure/api/__tests__/` |
