# Arquitectura Frontend - Bookly

## 📐 Principios de Diseño

### 1. Mantenibilidad ✅

- **Componentes pequeños**: Ningún componente supera 400 líneas
- **Responsabilidad única**: Cada componente tiene un propósito claro
- **Separación de concerns**: Lógica de negocio separada de presentación
- **DRY (Don't Repeat Yourself)**: Componentes reutilizables evitan duplicación

### 2. Testabilidad ✅

- **Componentes puros**: Sin side effects en componentes de presentación
- **Props bien definidas**: Interfaces TypeScript para todas las props
- **Mocking fácil**: Hooks y servicios inyectables
- **Componentes aislados**: Sin dependencias hardcodeadas

### 3. Reutilizabilidad ✅

- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Props flexibles**: Componentes configurables vía props
- **Composición sobre herencia**: Uso de composición de componentes
- **Barrel exports**: `index.ts` en cada carpeta de componentes

### 4. Escalabilidad ✅

- **Arquitectura modular**: Módulos independientes y desacoplados
- **Code splitting**: Carga lazy de componentes pesados
- **Estado descentralizado**: React Query para cache y sincronización
- **Estructura clara**: Fácil agregar nuevas funcionalidades

### 5. Consistencia ✅

- **Design System**: Sistema de diseño unificado
- **Naming conventions**: Convenciones claras para nombres
- **Patrones repetibles**: Mismo patrón en todos los módulos
- **Estilos centralizados**: TailwindCSS con configuración personalizada

### 6. Documentación ✅

- **JSDoc comments**: Comentarios en componentes complejos
- **README por módulo**: Documentación en cada carpeta importante
- **Ejemplos de uso**: Storybook para componentes
- **Architecture docs**: Esta documentación

### 7. Legibilidad ✅

- **Nombres descriptivos**: Variables y funciones con nombres claros
- **Estructura consistente**: Mismo orden de imports y exports
- **Comentarios útiles**: Solo cuando agregan valor
- **Formateo automático**: Prettier configurado

### 8. Eficiencia ✅

- **Bundle optimization**: Tree-shaking y code splitting
- **Lazy loading**: Componentes cargados bajo demanda
- **Memoization**: React.memo, useMemo, useCallback
- **Debouncing**: En búsquedas y filtros

### 9. Performance ✅

- **Virtual scrolling**: Para listas largas
- **Image optimization**: Next.js Image component
- **React Query**: Cache inteligente de datos
- **Suspense boundaries**: Carga progresiva

---

## 🏗️ Estructura del Proyecto

```
bookly-mock-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   └── [locale]/                 # Rutas internacionalizadas
│   │       ├── dashboard/            # Dashboard principal
│   │       ├── reservas/             # Gestión de reservas
│   │       │   └── components/       # Componentes del módulo
│   │       ├── recursos/             # Gestión de recursos
│   │       │   └── components/       # Componentes del módulo
│   │       ├── usuarios/             # Gestión de usuarios
│   │       │   └── components/       # Componentes del módulo
│   │       ├── roles/                # Gestión de roles
│   │       │   └── components/       # Componentes del módulo
│   │       ├── aprobaciones/         # Aprobaciones
│   │       ├── check-in/             # Check-in/out
│   │       └── reportes/             # Reportes
│   │
│   ├── components/                   # Componentes compartidos
│   │   ├── atoms/                    # Componentes básicos
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── Badge/
│   │   ├── molecules/                # Composición de atoms
│   │   │   ├── SearchBar/
│   │   │   ├── FilterChips/
│   │   │   └── InfoField/
│   │   ├── organisms/                # Secciones completas
│   │   │   ├── AppHeader/
│   │   │   ├── AppSidebar/
│   │   │   ├── DataTable/
│   │   │   └── ReservationModal/
│   │   ├── templates/                # Layouts
│   │   │   ├── MainLayout/
│   │   │   └── DashboardLayout/
│   │   └── analytics/                # Componentes de analytics
│   │       ├── MetricCard.tsx
│   │       ├── TrendChart.tsx
│   │       └── ActivityTimeline.tsx
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── mutations/                # React Query mutations
│   │   ├── queries/                  # React Query queries
│   │   ├── useAuth.ts
│   │   ├── useReservations.ts
│   │   ├── useResources.ts
│   │   └── useDashboard.ts
│   │
│   ├── services/                     # Servicios de API
│   │   ├── api/                      # Clientes de API
│   │   │   ├── auth.client.ts
│   │   │   ├── reservations.client.ts
│   │   │   └── resources.client.ts
│   │   └── config/                   # Configuración
│   │       └── services.ts
│   │
│   ├── infrastructure/               # Capa de infraestructura
│   │   ├── api/                      # API clients
│   │   ├── mock/                     # Mock data
│   │   └── storage/                  # Local storage
│   │
│   ├── types/                        # TypeScript types
│   │   ├── entities/                 # Entidades del dominio
│   │   │   ├── user.ts
│   │   │   ├── reservation.ts
│   │   │   ├── resource.ts
│   │   │   └── role.ts
│   │   └── api/                      # Tipos de API
│   │
│   ├── utils/                        # Utilidades
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   │
│   ├── styles/                       # Estilos globales
│   │   └── globals.css
│   │
│   └── i18n/                         # Internacionalización
│       ├── config.ts
│       └── messages/
│           ├── es.json
│           └── en.json
│
├── public/                           # Archivos estáticos
├── tests/                            # Tests
│   ├── unit/                         # Tests unitarios
│   ├── integration/                  # Tests de integración
│   └── e2e/                          # Tests end-to-end
│
├── docs/                             # Documentación
│   ├── ARCHITECTURE.md               # Este archivo
│   ├── BEST_PRACTICES.md
│   ├── TESTING.md
│   └── PERFORMANCE.md
│
├── .storybook/                       # Storybook config
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎨 Atomic Design Pattern

### Atoms (Componentes Básicos)

Elementos indivisibles de UI:

- `Button`, `Input`, `Label`, `Badge`, `Card`, `Spinner`
- Props simples y reutilizables
- Sin lógica de negocio
- Altamente testeables

### Molecules (Composiciones Simples)

Combinación de atoms:

- `SearchBar` (Input + Button)
- `FilterChips` (múltiples Badges)
- `InfoField` (Label + Text)
- Estado local simple
- Lógica de presentación

### Organisms (Secciones Completas)

Componentes complejos y funcionales:

- `AppHeader`, `AppSidebar`, `DataTable`
- `ReservationModal`, `UserFormModal`
- Integración con hooks
- Lógica de negocio

### Templates (Layouts)

Estructuras de página:

- `MainLayout` (Header + Sidebar + Content)
- `DashboardLayout` (KPIs + Grid)
- Define estructura sin contenido
- Props para slots de contenido

### Pages (Páginas Completas)

Páginas de la aplicación:

- `dashboard/page.tsx`, `reservas/page.tsx`
- Integración de templates + organisms
- Lógica de routing
- Data fetching

---

## 🔄 Flujo de Datos

### 1. React Query (Cache + Sincronización)

```typescript
// Query (lectura)
const { data, isLoading } = useQuery({
  queryKey: reservationKeys.all,
  queryFn: ReservationsClient.getAll,
  staleTime: 3 * 60 * 1000, // 3 minutos
});

// Mutation (escritura)
const createReservation = useMutation({
  mutationFn: ReservationsClient.create,
  onSuccess: () => {
    queryClient.invalidateQueries(reservationKeys.all);
    toast.success("Reserva creada");
  },
});
```

### 2. Estado Local (useState, useReducer)

- Solo para estado UI (modales, tabs, filtros)
- No para datos del servidor

### 3. Contextos (React Context)

- Tema (dark/light mode)
- Autenticación (usuario actual)
- Internacionalización (idioma)

---

## 🎯 Patrones de Componentes

### Patrón 1: Componente de Presentación

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ variant, size, onClick, children, disabled, loading }: ButtonProps) {
  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size])}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

### Patrón 2: Componente con Lógica

```typescript
interface UserFormModalProps {
  user?: User;
  open: boolean;
  onClose: () => void;
}

export function UserFormModal({ user, open, onClose }: UserFormModalProps) {
  const form = useForm<UserFormData>();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const onSubmit = (data: UserFormData) => {
    if (user) {
      updateUser.mutate({ id: user.id, data });
    } else {
      createUser.mutate(data);
    }
  };

  return <Modal open={open} onClose={onClose}>...</Modal>;
}
```

### Patrón 3: Componente de Página

```typescript
export default function ReservasPage() {
  const { data: reservations, isLoading } = useReservations();
  const [filter, setFilter] = useState('');

  const filteredReservations = useMemo(() =>
    reservations?.filter(r =>
      r.title.toLowerCase().includes(filter.toLowerCase())
    ), [reservations, filter]
  );

  return (
    <MainLayout>
      <ReservationStatsCards reservations={reservations} />
      <ReservationFiltersSection filter={filter} onFilterChange={setFilter} />
      <ReservationsTable reservations={filteredReservations} />
    </MainLayout>
  );
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Componentes)

```typescript
describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### Integration Tests (Hooks + Components)

```typescript
describe('ReservationForm', () => {
  it('creates reservation successfully', async () => {
    render(<ReservationForm />);

    await userEvent.type(screen.getByLabelText('Título'), 'Mi reserva');
    await userEvent.click(screen.getByText('Crear'));

    await waitFor(() => {
      expect(screen.getByText('Reserva creada')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
test("user can create reservation", async ({ page }) => {
  await page.goto("/reservas");
  await page.click("text=Nueva Reserva");
  await page.fill('[name="title"]', "Mi reserva");
  await page.click("text=Crear");
  await expect(page.locator("text=Mi reserva")).toBeVisible();
});
```

---

## ⚡ Performance Optimization

### 1. Code Splitting

```typescript
// Carga lazy de componentes pesados
const ReservationModal = lazy(() => import('./ReservationModal'));

// Uso con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ReservationModal />
</Suspense>
```

### 2. Memoization

```typescript
// Memoizar componentes pesados
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>...</div>;
});

// Memoizar cálculos costosos
const filteredData = useMemo(() =>
  data.filter(item => item.active),
  [data]
);

// Memoizar callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### 3. Virtual Scrolling

```typescript
<VirtualizedList
  items={largeDataset}
  renderItem={(item) => <ItemCard item={item} />}
  itemHeight={100}
  overscan={5}
/>
```

### 4. Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

---

## 📝 Naming Conventions

### Archivos

- **Componentes**: PascalCase → `UserFormModal.tsx`
- **Hooks**: camelCase → `useReservations.ts`
- **Utilidades**: camelCase → `formatting.ts`
- **Tipos**: PascalCase → `User.ts`

### Variables y Funciones

- **Componentes**: PascalCase → `function UserCard() {}`
- **Hooks**: camelCase con 'use' → `function useAuth() {}`
- **Handlers**: camelCase con 'handle' → `const handleClick = () => {}`
- **Constantes**: UPPER_SNAKE_CASE → `const API_URL = '...'`

### Props e Interfaces

- **Interfaces de Props**: `{ComponentName}Props`
- **Tipos de Datos**: Nombre descriptivo → `User`, `Reservation`
- **Callbacks**: Prefijo 'on' → `onClose`, `onSubmit`, `onClick`

---

## 🔒 Seguridad

### 1. Validación de Inputs

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### 2. Sanitización

```typescript
import DOMPurify from "dompurify";

const sanitized = DOMPurify.sanitize(userInput);
```

### 3. CSRF Protection

- Tokens en formularios críticos
- SameSite cookies

### 4. XSS Prevention

- Usar `textContent` en lugar de `innerHTML`
- Validar URLs antes de redirigir

---

## 🌍 Internacionalización

### Estructura

```typescript
// messages/es.json
{
  "dashboard": {
    "title": "Panel de Control",
    "welcome": "Bienvenido {name}"
  }
}

// Uso
const t = useTranslations('dashboard');
<h1>{t('title')}</h1>
<p>{t('welcome', { name: user.name })}</p>
```

---

## 📊 Monitoring

### Error Tracking

- Sentry para errores en producción
- Error boundaries para componentes

### Performance Monitoring

- Web Vitals (LCP, FID, CLS)
- React DevTools Profiler
- Lighthouse CI

### Analytics

- Google Analytics para métricas
- Custom events para acciones importantes

---

## 🚀 Deployment

### Build Optimization

```bash
# Análisis de bundle
npm run build --analyze

# Variables de entorno
NEXT_PUBLIC_API_URL=https://api.bookly.com
NODE_ENV=production
```

### CI/CD Pipeline

1. Lint (ESLint + Prettier)
2. Type check (TypeScript)
3. Tests (Vitest + Playwright)
4. Build
5. Deploy (Vercel/Netlify)

---

## 📚 Recursos Adicionales

- [React Best Practices](https://react.dev/learn)
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Testing Library](https://testing-library.com/)

---

**Última actualización**: Nov 2025  
**Versión**: 1.0.0  
**Autor**: Equipo Bookly
