# Mejores Prácticas - Bookly Frontend

## 📋 Índice

1. [Componentes React](#componentes-react)
2. [TypeScript](#typescript)
3. [Hooks](#hooks)
4. [Estado y Data Fetching](#estado-y-data-fetching)
5. [Estilos](#estilos)
6. [Performance](#performance)
7. [Accesibilidad](#accesibilidad)
8. [Testing](#testing)
9. [Git y Commits](#git-y-commits)

---

## 🎨 Componentes React

### ✅ DO: Componentes Pequeños y Enfocados

```typescript
// ✅ Bueno: Componente con responsabilidad única
export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  return (
    <div className={cn('rounded-full', sizeClasses[size])}>
      <Image src={user.avatar} alt={user.name} />
    </div>
  );
}
```

```typescript
// ❌ Malo: Componente que hace demasiado
export function UserProfileSection() {
  // Maneja avatar, formulario, estadísticas, etc.
  // Más de 500 líneas...
}
```

### ✅ DO: Props Bien Definidas

```typescript
// ✅ Bueno: Interface clara y específica
interface ButtonProps {
  variant: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  "aria-label"?: string;
}

export function Button({ variant, size = "md", ...props }: ButtonProps) {
  // ...
}
```

```typescript
// ❌ Malo: Props genéricas o sin tipar
export function Button(props: any) {
  // ...
}
```

### ✅ DO: Composición sobre Configuración

```typescript
// ✅ Bueno: Composición flexible
<Modal open={open} onClose={onClose}>
  <ModalHeader>
    <ModalTitle>Crear Usuario</ModalTitle>
  </ModalHeader>
  <ModalBody>
    <UserForm onSubmit={handleSubmit} />
  </ModalBody>
  <ModalFooter>
    <Button onClick={onClose}>Cancelar</Button>
    <Button onClick={handleSubmit}>Crear</Button>
  </ModalFooter>
</Modal>
```

```typescript
// ❌ Malo: Configuración compleja con muchas props
<Modal
  title="Crear Usuario"
  showHeader={true}
  showFooter={true}
  cancelText="Cancelar"
  confirmText="Crear"
  onCancel={onClose}
  onConfirm={handleSubmit}
  headerColor="blue"
  footerAlign="right"
  // ... 20 props más
>
  <UserForm />
</Modal>
```

### ✅ DO: Early Returns

```typescript
// ✅ Bueno: Early returns para casos especiales
export function UserList({ users }: UserListProps) {
  if (!users) return <LoadingSpinner />;
  if (users.length === 0) return <EmptyState />;

  return (
    <div className="space-y-2">
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
```

```typescript
// ❌ Malo: Anidación profunda
export function UserList({ users }: UserListProps) {
  return (
    <div>
      {users ? (
        users.length > 0 ? (
          <div className="space-y-2">
            {users.map(user => <UserCard key={user.id} user={user} />)}
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
}
```

---

## 🔷 TypeScript

### ✅ DO: Tipos Explícitos

```typescript
// ✅ Bueno: Tipos explícitos y descriptivos
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

type UserRole = "admin" | "teacher" | "student";
type UserStatus = "active" | "inactive" | "suspended";

function getUserById(id: string): Promise<User> {
  return api.get<User>(`/users/${id}`);
}
```

```typescript
// ❌ Malo: Uso de any o tipos implícitos
function getUserById(id): Promise<any> {
  return api.get(`/users/${id}`);
}
```

### ✅ DO: Utility Types

```typescript
// ✅ Bueno: Uso de utility types
type CreateUserDto = Omit<User, "id" | "createdAt">;
type UpdateUserDto = Partial<CreateUserDto>;
type UserResponse = Pick<User, "id" | "name" | "email">;

// Extract tipos de respuestas
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

### ✅ DO: Type Guards

```typescript
// ✅ Bueno: Type guards para validación
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value
  );
}

const data = await fetchUser();
if (isUser(data)) {
  // TypeScript sabe que data es User
  console.log(data.name);
}
```

---

## 🪝 Hooks

### ✅ DO: Custom Hooks para Lógica Reutilizable

```typescript
// ✅ Bueno: Hook personalizado
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Uso
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 500);
```

### ✅ DO: Reglas de Hooks

```typescript
// ✅ Bueno: Hooks en el top level
function Component() {
  const [state, setState] = useState(initial);
  const data = useQuery(...);

  useEffect(() => {
    // ...
  }, []);

  return <div>...</div>;
}
```

```typescript
// ❌ Malo: Hooks condicionales
function Component({ shouldFetch }) {
  const [state, setState] = useState(initial);

  if (shouldFetch) {
    const data = useQuery(...); // ❌ Hook condicional
  }

  return <div>...</div>;
}
```

### ✅ DO: Dependencias Correctas en useEffect

```typescript
// ✅ Bueno: Todas las dependencias incluidas
useEffect(() => {
  fetchData(userId, filter);
}, [userId, filter]); // Incluye todas las dependencias

// ✅ Bueno: useCallback para funciones estables
const handleSubmit = useCallback(
  (data: FormData) => {
    submitData(data, userId);
  },
  [userId]
);

useEffect(() => {
  handleSubmit(formData);
}, [handleSubmit, formData]);
```

---

## 📊 Estado y Data Fetching

### ✅ DO: React Query para Datos del Servidor

```typescript
// ✅ Bueno: React Query con keys estructuradas
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => UsersClient.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UsersClient.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("Usuario creado exitosamente");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
```

### ✅ DO: useState para Estado UI Local

```typescript
// ✅ Bueno: useState para UI local
function Modal() {
  const [currentTab, setCurrentTab] = useState<Tab>('general');
  const [isExpanded, setIsExpanded] = useState(false);

  // Estado UI que no necesita persistirse ni compartirse
  return <div>...</div>;
}
```

```typescript
// ❌ Malo: React Query para estado UI
function Modal() {
  // ❌ No usar React Query para estado local UI
  const { data: currentTab } = useQuery(["currentTab"], () => "general");
}
```

---

## 🎨 Estilos

### ✅ DO: TailwindCSS con Utility Classes

```typescript
// ✅ Bueno: Utility classes de Tailwind
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
  Click me
</button>
```

### ✅ DO: cn() para Clases Condicionales

```typescript
import { cn } from '@/utils/cn';

// ✅ Bueno: cn() para combinar clases
<button
  className={cn(
    'px-4 py-2 rounded-lg transition-colors',
    variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
    variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    disabled && 'opacity-50 cursor-not-allowed'
  )}
>
  {children}
</button>
```

### ✅ DO: Extraer Clases Repetidas

```typescript
// ✅ Bueno: Constantes para estilos repetidos
const cardStyles = {
  base: 'rounded-lg border bg-white shadow-sm',
  padding: 'p-6',
  hover: 'hover:shadow-md transition-shadow',
};

<Card className={cn(cardStyles.base, cardStyles.padding, cardStyles.hover)}>
  {children}
</Card>
```

---

## ⚡ Performance

### ✅ DO: React.memo para Componentes Pesados

```typescript
// ✅ Bueno: Memo para componentes que renderizan frecuentemente
export const UserCard = React.memo(({ user }: UserCardProps) => {
  return (
    <Card>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </Card>
  );
});

// Comparación personalizada
export const ExpensiveComponent = React.memo(
  ({ data }: Props) => {
    return <div>...</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### ✅ DO: useMemo para Cálculos Costosos

```typescript
// ✅ Bueno: useMemo para filtrado/ordenamiento
function UserList({ users, filter }: UserListProps) {
  const filteredUsers = useMemo(() => {
    return users
      .filter(u => u.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, filter]);

  return <div>{filteredUsers.map(...)}</div>;
}
```

```typescript
// ❌ Malo: Cálculos en cada render
function UserList({ users, filter }: UserListProps) {
  // ❌ Se ejecuta en CADA render
  const filteredUsers = users
    .filter(u => u.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return <div>{filteredUsers.map(...)}</div>;
}
```

### ✅ DO: Lazy Loading

```typescript
// ✅ Bueno: Lazy loading de componentes pesados
const ReservationModal = lazy(() => import('./ReservationModal'));
const ReportGenerator = lazy(() => import('./ReportGenerator'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ReservationModal />
    </Suspense>
  );
}
```

---

## ♿ Accesibilidad

### ✅ DO: Atributos ARIA

```typescript
// ✅ Bueno: ARIA labels y roles
<button
  aria-label="Cerrar modal"
  aria-pressed={isActive}
  role="button"
  onClick={handleClose}
>
  <XIcon />
</button>

<input
  type="text"
  aria-label="Buscar usuarios"
  aria-describedby="search-help"
  aria-invalid={hasError}
/>
<span id="search-help">Busca por nombre o email</span>
```

### ✅ DO: Navegación con Teclado

```typescript
// ✅ Bueno: Soporte de teclado
function Modal({ onClose }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return <div role="dialog" aria-modal="true">...</div>;
}
```

### ✅ DO: Focus Management

```typescript
// ✅ Bueno: Gestión de foco
function Modal({ open, onClose }: ModalProps) {
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      firstFocusableRef.current?.focus();
    }
  }, [open]);

  return (
    <div>
      <button ref={firstFocusableRef} onClick={onClose}>
        Cerrar
      </button>
    </div>
  );
}
```

---

## 🧪 Testing

### ✅ DO: Tests Descriptivos

```typescript
// ✅ Bueno: Nombres descriptivos y estructura AAA
describe('UserForm', () => {
  it('should display validation errors when submitting empty form', async () => {
    // Arrange
    render(<UserForm onSubmit={mockSubmit} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Assert
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
```

### ✅ DO: Test User Behavior, Not Implementation

```typescript
// ✅ Bueno: Testear comportamiento del usuario
it('allows user to create a reservation', async () => {
  render(<ReservationForm />);

  await userEvent.type(screen.getByLabelText(/title/i), 'Meeting Room');
  await userEvent.selectOptions(screen.getByLabelText(/resource/i), 'Room A');
  await userEvent.click(screen.getByRole('button', { name: /create/i }));

  expect(await screen.findByText(/reservation created/i)).toBeInTheDocument();
});
```

```typescript
// ❌ Malo: Testear detalles de implementación
it("calls useState when button clicked", () => {
  const { result } = renderHook(() => useState(false));
  // ❌ Testear hooks internos
});
```

---

## 📝 Git y Commits

### ✅ DO: Conventional Commits

```bash
# ✅ Bueno: Mensajes descriptivos
feat: add user profile modal with edit functionality
fix: resolve infinite loop in useEffect hook
refactor: extract UserCard component from UserList
docs: update ARCHITECTURE.md with new patterns
style: format code with prettier
test: add tests for ReservationForm component
chore: update dependencies to latest versions
```

```bash
# ❌ Malo: Mensajes vagos
update stuff
fix bug
changes
wip
```

### ✅ DO: Commits Atómicos

```bash
# ✅ Bueno: Un cambio lógico por commit
git commit -m "feat: add UserForm component"
git commit -m "test: add tests for UserForm"
git commit -m "docs: document UserForm props"
```

```bash
# ❌ Malo: Muchos cambios no relacionados
git commit -m "add user form, fix button bug, update readme, refactor hooks"
```

---

## 🔧 Utilidades y Helpers

### ✅ DO: Funciones Puras

```typescript
// ✅ Bueno: Función pura sin side effects
export function formatDate(date: Date, locale: string = "es-ES"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

// ✅ Bueno: Función pura para validación
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### ✅ DO: Type-Safe Utilities

```typescript
// ✅ Bueno: Utilidad type-safe para pick
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}

// Uso
const user = {
  id: "1",
  name: "John",
  email: "john@example.com",
  role: "admin",
};
const userProfile = pick(user, ["name", "email"]); // { name: string, email: string }
```

---

## 📦 Organización de Imports

```typescript
// ✅ Bueno: Orden de imports
// 1. React y librerías externas
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

// 2. Componentes internos
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { UserForm } from "@/components/organisms/UserForm";

// 3. Hooks y utilidades
import { useUsers } from "@/hooks/useUsers";
import { formatDate } from "@/utils/formatting";

// 4. Tipos
import type { User } from "@/types/entities/user";

// 5. Estilos (si aplica)
import styles from "./Component.module.css";
```

---

## 🎯 Checklist de Revisión de Código

Antes de hacer commit, verificar:

- [ ] ✅ Componentes tienen menos de 300 líneas
- [ ] ✅ Props están tipadas con TypeScript
- [ ] ✅ Nombres son descriptivos y claros
- [ ] ✅ No hay console.log olvidados
- [ ] ✅ Imports están organizados
- [ ] ✅ Código está formateado con Prettier
- [ ] ✅ No hay warnings de ESLint
- [ ] ✅ Tests pasan correctamente
- [ ] ✅ Accesibilidad básica implementada
- [ ] ✅ Performance considerada (memo, useMemo si aplica)

---

**Última actualización**: Nov 2025  
**Versión**: 1.0.0
