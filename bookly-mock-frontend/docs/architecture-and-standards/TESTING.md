# Guía de Testing - Bookly Frontend

## 🧪 Stack de Testing

- **Framework**: Vitest (alternativa moderna a Jest)
- **React Testing**: @testing-library/react
- **User Events**: @testing-library/user-event
- **E2E**: Playwright (opcional)
- **Coverage**: Vitest Coverage (v8)

---

## 📁 Estructura de Tests

```
tests/
├── setup.ts                      # Configuración global
├── utils/                        # Utilidades de testing
│   ├── render.tsx               # Custom render con providers
│   ├── mockData.ts              # Mock data reutilizable
│   └── waitFor.ts               # Helpers personalizados
│
├── unit/                        # Tests unitarios
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button.test.tsx
│   │   │   └── Input.test.tsx
│   │   └── molecules/
│   │       └── SearchBar.test.tsx
│   └── utils/
│       └── formatting.test.ts
│
├── integration/                 # Tests de integración
│   ├── forms/
│   │   └── UserForm.test.tsx
│   └── pages/
│       └── Dashboard.test.tsx
│
└── e2e/                        # Tests end-to-end (Playwright)
    ├── auth.spec.ts
    └── reservations.spec.ts
```

---

## 🎯 Testing Strategy

### Pirámide de Testing

```
       /\
      /  \     E2E Tests (10%)
     /____\
    /      \   Integration Tests (30%)
   /________\
  /__________\ Unit Tests (60%)
```

### Qué Testear

#### ✅ Unit Tests (60%)

- Componentes puros de presentación
- Utilidades y helpers
- Hooks personalizados
- Formateo y validaciones

#### ✅ Integration Tests (30%)

- Formularios con validación
- Páginas completas con data fetching
- Interacciones usuario-componente
- Flujos multi-paso

#### ✅ E2E Tests (10%)

- Flujos críticos de negocio
- Autenticación completa
- Crear reserva end-to-end
- Exportar reportes

### Qué NO Testear

- ❌ Implementación interna de librerías (React Query, etc.)
- ❌ Estilos CSS (usar visual regression testing)
- ❌ Código de terceros
- ❌ Configuraciones estáticas

---

## 🧩 Ejemplos de Tests

### Unit Test: Componente Básico

```typescript
// components/atoms/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Click me</Button>);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);

    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');

    rerender(<Button variant="secondary">Secondary</Button>);

    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
  });
});
```

### Integration Test: Formulario

```typescript
// tests/integration/forms/UserForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { UserForm } from '@/components/organisms/UserForm';
import * as UsersClient from '@/services/api/users.client';

// Mock del cliente API
vi.mock('@/services/api/users.client');

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('UserForm', () => {
  it('validates required fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(<UserForm onSubmit={onSubmit} />);

    // Submit sin llenar campos
    await user.click(screen.getByRole('button', { name: /crear/i }));

    // Verificar errores de validación
    expect(await screen.findByText(/el nombre es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();

    // Verificar que no se llamó onSubmit
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('creates user successfully', async () => {
    const user = userEvent.setup();
    const mockCreate = vi.mocked(UsersClient.create);
    mockCreate.mockResolvedValueOnce({
      success: true,
      data: { id: '1', name: 'John Doe', email: 'john@example.com' },
    });

    renderWithProviders(<UserForm onSubmit={vi.fn()} />);

    // Llenar formulario
    await user.type(screen.getByLabelText(/nombre/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.selectOptions(screen.getByLabelText(/rol/i), 'student');

    // Submit
    await user.click(screen.getByRole('button', { name: /crear/i }));

    // Verificar que se llamó la API
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        roleId: 'student',
      });
    });

    // Verificar mensaje de éxito
    expect(await screen.findByText(/usuario creado exitosamente/i)).toBeInTheDocument();
  });

  it('handles API errors', async () => {
    const user = userEvent.setup();
    const mockCreate = vi.mocked(UsersClient.create);
    mockCreate.mockRejectedValueOnce(new Error('Email already exists'));

    renderWithProviders(<UserForm onSubmit={vi.fn()} />);

    // Llenar y enviar formulario
    await user.type(screen.getByLabelText(/nombre/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    // Verificar mensaje de error
    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
  });
});
```

### Hook Test

```typescript
// tests/unit/hooks/useDebounce.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
  it("debounces value changes", async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    // Valor inicial
    expect(result.current).toBe("initial");

    // Cambiar valor
    rerender({ value: "updated", delay: 500 });

    // Todavía debe tener el valor antiguo
    expect(result.current).toBe("initial");

    // Avanzar tiempo
    vi.advanceTimersByTime(500);

    // Ahora debe tener el nuevo valor
    await waitFor(() => {
      expect(result.current).toBe("updated");
    });

    vi.useRealTimers();
  });

  it("cancels previous timeout on rapid changes", async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    );

    // Múltiples cambios rápidos
    rerender({ value: "change1" });
    vi.advanceTimersByTime(200);

    rerender({ value: "change2" });
    vi.advanceTimersByTime(200);

    rerender({ value: "change3" });
    vi.advanceTimersByTime(500);

    // Solo debe aplicar el último cambio
    await waitFor(() => {
      expect(result.current).toBe("change3");
    });

    vi.useRealTimers();
  });
});
```

### E2E Test (Playwright)

```typescript
// tests/e2e/reservations.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Reservations Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("user can create a reservation", async ({ page }) => {
    // Navegar a reservas
    await page.goto("/reservas");

    // Click en nueva reserva
    await page.click("text=Nueva Reserva");

    // Llenar formulario
    await page.fill('[name="title"]', "Reunión de equipo");
    await page.selectOption('[name="resourceId"]', { label: "Sala A" });
    await page.fill('[name="startDate"]', "2025-12-01");
    await page.fill('[name="startTime"]', "10:00");
    await page.fill('[name="endTime"]', "11:00");

    // Submit
    await page.click('button:has-text("Crear Reserva")');

    // Verificar éxito
    await expect(
      page.locator("text=Reserva creada exitosamente")
    ).toBeVisible();

    // Verificar que aparece en la lista
    await expect(page.locator("text=Reunión de equipo")).toBeVisible();
  });

  test("user can filter reservations by status", async ({ page }) => {
    await page.goto("/reservas");

    // Contar reservas iniciales
    const initialCount = await page
      .locator('[data-testid="reservation-card"]')
      .count();

    // Filtrar por "Confirmada"
    await page.selectOption('[name="statusFilter"]', "CONFIRMED");

    // Verificar que cambió el conteo
    const filteredCount = await page
      .locator('[data-testid="reservation-card"]')
      .count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Verificar que solo hay confirmadas
    const statuses = await page
      .locator('[data-testid="reservation-status"]')
      .allTextContents();
    statuses.forEach((status) => {
      expect(status).toContain("Confirmada");
    });
  });

  test("user can cancel a reservation", async ({ page }) => {
    await page.goto("/reservas");

    // Click en primera reserva
    await page.click('[data-testid="reservation-card"]').first();

    // Click en cancelar
    await page.click('button:has-text("Cancelar")');

    // Confirmar en diálogo
    await page.click('button:has-text("Sí, cancelar")');

    // Verificar éxito
    await expect(page.locator("text=Reserva cancelada")).toBeVisible();

    // Verificar que el estado cambió
    await expect(
      page.locator('[data-testid="reservation-status"]')
    ).toContainText("Cancelada");
  });
});
```

---

## 🛠️ Utilidades de Testing

### Custom Render

```typescript
// tests/utils/render.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  { queryClient, ...renderOptions }: CustomRenderOptions = {}
) {
  const testQueryClient = queryClient ?? createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: testQueryClient,
  };
}
```

### Mock Data

```typescript
// tests/utils/mockData.ts
import type { User, Reservation, Resource } from "@/types/entities";

export const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  role: "student",
  status: "active",
  createdAt: new Date("2025-01-01"),
};

export const mockReservation: Reservation = {
  id: "1",
  title: "Test Reservation",
  resourceId: "resource-1",
  resourceName: "Sala A",
  startDate: "2025-12-01T10:00:00Z",
  endDate: "2025-12-01T11:00:00Z",
  status: "CONFIRMED",
  userId: "1",
};

export const mockResource: Resource = {
  id: "1",
  code: "SALA-A",
  name: "Sala A",
  type: "ROOM",
  capacity: 20,
  status: "AVAILABLE",
  location: "Building A - Floor 2",
};

export function createMockUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => ({
    ...mockUser,
    id: `user-${i}`,
    name: `User ${i}`,
    email: `user${i}@example.com`,
  }));
}
```

---

## 📊 Coverage

### Objetivo de Coverage

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 75%
- **Lines**: 80%

### Ejecutar Coverage

```bash
# Coverage completo
npm run test:coverage

# Coverage de un archivo
npm run test:coverage -- Button.test.tsx

# Ver reporte HTML
open coverage/index.html
```

### Interpretar Reporte

```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
Button.tsx          |   95.00 |    90.00 |  100.00 |   95.00
Input.tsx           |   85.00 |    75.00 |   90.00 |   85.00
SearchBar.tsx       |   70.00 |    60.00 |   75.00 |   70.00  ⚠️
```

**SearchBar.tsx necesita más tests** ⚠️

---

## 🎯 Best Practices

### ✅ DO

1. **Test Behavior, Not Implementation**

   ```typescript
   // ✅ Bueno: Testear lo que el usuario ve
   expect(screen.getByText("User created")).toBeInTheDocument();

   // ❌ Malo: Testear detalles internos
   expect(component.state.userCreated).toBe(true);
   ```

2. **Use Accessible Queries**

   ```typescript
   // ✅ Bueno: Queries accesibles
   screen.getByRole("button", { name: /submit/i });
   screen.getByLabelText(/email/i);

   // ❌ Malo: Queries frágiles
   screen.getByClassName("submit-button");
   screen.getByTestId("email-input"); // Solo cuando no hay alternativa
   ```

3. **Arrange-Act-Assert (AAA)**

   ```typescript
   it('creates user', async () => {
     // Arrange
     const user = userEvent.setup();
     render(<UserForm />);

     // Act
     await user.type(screen.getByLabelText(/name/i), 'John');
     await user.click(screen.getByRole('button'));

     // Assert
     expect(await screen.findByText(/success/i)).toBeInTheDocument();
   });
   ```

4. **Mock Minimal**

   ```typescript
   // ✅ Bueno: Mock solo lo necesario
   vi.mock("@/services/api/users.client", () => ({
     create: vi.fn(),
   }));

   // ❌ Malo: Mock todo
   vi.mock("@/services/api/users.client");
   vi.mock("@/hooks/useUsers");
   vi.mock("react-query");
   ```

---

## 🚨 Common Pitfalls

### ❌ Testing Implementation Details

```typescript
// ❌ Malo
it('calls useState on mount', () => {
  const spy = vi.spyOn(React, 'useState');
  render(<Component />);
  expect(spy).toHaveBeenCalled();
});

// ✅ Bueno
it('displays initial count', () => {
  render(<Component />);
  expect(screen.getByText('Count: 0')).toBeInTheDocument();
});
```

### ❌ Not Waiting for Async Updates

```typescript
// ❌ Malo
it('shows user after fetch', () => {
  render(<UserProfile />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();  // Falla
});

// ✅ Bueno
it('shows user after fetch', async () => {
  render(<UserProfile />);
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
});
```

### ❌ Snapshot Testing Abuse

```typescript
// ❌ Malo: Snapshot de componente complejo
expect(container).toMatchSnapshot(); // Se rompe con cada cambio

// ✅ Bueno: Assertions específicas
expect(screen.getByRole("heading")).toHaveTextContent("Dashboard");
expect(screen.getByRole("button")).toBeEnabled();
```

---

## 📝 Scripts de Testing

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

**Última actualización**: Nov 2025  
**Objetivo**: Mantener coverage > 80%
