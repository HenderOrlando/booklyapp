# ✅ Corrección de Validación de Roles - AppSidebar

> **Problema**: El menú de navegación no se mostraba correctamente según los roles del usuario  
> **Estado**: ✅ Resuelto  
> **Fecha**: Nov 2025

---

## 🐛 Problema Identificado

### Síntomas

- El sidebar mostraba todos los items de menú independientemente del rol del usuario
- Los items restringidos por rol (admin, coordinador, etc.) aparecían para todos
- La validación de roles no funcionaba correctamente

### Causa Raíz

**Desajuste entre formato de roles del backend y frontend:**

```typescript
// ❌ BACKEND enviaba (desde auth-service):
user.roles = [
  {
    id: "1",
    name: "Administrador General",  // ← Nombre completo
    permissions: [...],
    ...
  }
]

// ❌ FRONTEND esperaba (en AppSidebar):
navigationItems = [
  {
    href: "/admin/roles",
    roles: ["admin"]  // ← Identificador corto
  }
]

// ❌ RESULTADO: "Administrador General" !== "admin" → No coincide
```

**Problemas específicos:**

1. **Normalización incorrecta**: El código intentaba comparar strings directamente sin normalizar
2. **Validación de un solo rol**: Solo verificaba el primer rol (`user.roles[0]`)
3. **Sin mapper de roles**: No existía mapeo entre nombres del backend e identificadores del frontend
4. **Sin logging**: Difícil debuggear qué roles se estaban comparando

---

## ✅ Solución Implementada

### 1. Utilidad Centralizada de Roles

**Archivo creado**: `src/utils/roleUtils.ts`

```typescript
// Mapper de roles backend → frontend
export const ROLE_MAPPER: Record<string, string> = {
  "Administrador General": "admin",
  "Administrador de Programa": "coordinador",
  Estudiante: "estudiante",
  Docente: "profesor",
  Vigilante: "vigilancia",
  "Administrativo General": "admin",
};

// Normalización con fallback inteligente
export function normalizeRole(roleName: string): string | null {
  // 1. Mapeo directo
  if (ROLE_MAPPER[roleName]) {
    return ROLE_MAPPER[roleName];
  }

  // 2. Fallback por palabras clave
  const normalized = roleName.toLowerCase().trim();
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("coordinador")) return "coordinador";
  // ...

  // 3. Último recurso: minúsculas
  return normalized;
}

// Normalización de arrays
export function normalizeRoles(roles: Role[] | string[]): string[] {
  return roles
    .map((role) => {
      const name = typeof role === "string" ? role : role?.name;
      return normalizeRole(name);
    })
    .filter((role) => role !== null);
}
```

**Funciones auxiliares incluidas:**

- `hasRole(userRoles, requiredRoles)` - Verifica si tiene al menos un rol
- `hasAllRoles(userRoles, requiredRoles)` - Verifica si tiene todos los roles
- `isAdmin(userRoles)` - Atajos para roles específicos
- `hasAdminPrivileges(userRoles)` - Admin o Coordinador
- `getHighestRole(userRoles)` - Rol de mayor privilegio
- `getRoleDisplayName(roleId)` - Nombre legible

---

### 2. AppSidebar Refactorizado

**Antes:**

```typescript
// ❌ Solo tomaba primer rol, sin normalizar
const firstRole = user?.roles?.[0];
const userRole = typeof firstRole === "string" ? firstRole : firstRole?.name;

// ❌ Comparación directa sin normalización
visibleItems = navigationItems.filter((item) => {
  if (!item.roles) return true;
  if (!userRole) return false;
  return item.roles.includes(userRole); // Nunca coincide
});
```

**Después:**

```typescript
// ✅ Normaliza TODOS los roles del usuario
const userRoles = React.useMemo(() => {
  if (!user?.roles) return [];

  // Usar utilidad centralizada
  const normalizedRoles = normalizeRoles(user.roles);

  console.log(
    "[AppSidebar] Roles originales:",
    user.roles.map((r) => r.name)
  );
  console.log("[AppSidebar] Roles normalizados:", normalizedRoles);

  return normalizedRoles;
}, [user?.roles]);

// ✅ Verificar si ALGUNO de los roles del usuario coincide
visibleItems = navigationItems.filter((item) => {
  if (!item.roles?.length) return true;
  if (!userRoles?.length) return false;

  // Verificar si algún rol del usuario coincide
  const hasAccess = item.roles.some((required) => userRoles.includes(required));

  if (!hasAccess) {
    console.log(
      `[AppSidebar] Ocultando "${item.href}"`,
      "requiere:",
      item.roles,
      "usuario tiene:",
      userRoles
    );
  }

  return hasAccess;
});
```

---

## 🎯 Flujo Completo de Validación

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BACKEND (auth-service)                                   │
│    POST /auth/login                                          │
│    ↓                                                         │
│    user.roles = [{ name: "Administrador General", ... }]    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. AUTHCONTEXT (Frontend)                                   │
│    setUser(response.data.user)                              │
│    ↓                                                         │
│    user.roles = [{ name: "Administrador General", ... }]    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. APPSIDEBAR (normalizeRoles)                              │
│    normalizeRoles(user.roles)                               │
│    ↓                                                         │
│    ["Administrador General"] → ["admin"]                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. FILTRADO DE ITEMS                                        │
│    navigationItems.filter(item =>                           │
│      item.roles.some(role => userRoles.includes(role))      │
│    )                                                         │
│    ↓                                                         │
│    Item: roles: ["admin"] ✓ VISIBLE                         │
│    Item: roles: ["estudiante"] ✗ OCULTO                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Ejemplos de Validación

### Ejemplo 1: Administrador General

```typescript
// Usuario del backend
user = {
  email: "admin@ufps.edu.co",
  roles: [{ name: "Administrador General" }]
}

// Normalización
userRoles = ["admin"]

// Items visibles
✓ /dashboard (sin restricción)
✓ /profile (sin restricción)
✓ /recursos (sin restricción)
✓ /categorias (requiere: ["admin", "coordinador"])
✓ /mantenimientos (requiere: ["admin", "coordinador"])
✓ /admin/roles (requiere: ["admin"])
✓ /admin/auditoria (requiere: ["admin"])
✗ /vigilancia (requiere: ["vigilancia"])
```

### Ejemplo 2: Estudiante

```typescript
// Usuario del backend
user = {
  email: "estudiante@ufps.edu.co",
  roles: [{ name: "Estudiante" }]
}

// Normalización
userRoles = ["estudiante"]

// Items visibles
✓ /dashboard (sin restricción)
✓ /profile (sin restricción)
✓ /recursos (sin restricción)
✓ /reservas (sin restricción)
✓ /calendario (sin restricción)
✓ /check-in (requiere: ["admin", "profesor", "estudiante", "coordinador"])
✗ /categorias (requiere: ["admin", "coordinador"])
✗ /admin/roles (requiere: ["admin"])
✗ /reportes (requiere: ["admin", "coordinador"])
```

### Ejemplo 3: Docente

```typescript
// Usuario del backend
user = {
  email: "docente@ufps.edu.co",
  roles: [{ name: "Docente" }]
}

// Normalización
userRoles = ["profesor"]

// Items visibles
✓ /dashboard
✓ /profile
✓ /recursos
✓ /reservas
✓ /historial-aprobaciones (requiere: ["admin", "coordinador", "profesor"])
✓ /check-in
✗ /categorias (requiere: ["admin", "coordinador"])
✗ /aprobaciones (requiere: ["admin", "coordinador"])
✗ /reportes (requiere: ["admin", "coordinador"])
```

---

## 🔧 Archivos Modificados

### 1. `src/utils/roleUtils.ts` (NUEVO)

**Propósito**: Centralizar toda la lógica de roles

**Contenido:**

- Mapper de roles (ROLE_MAPPER)
- Constantes de roles (ROLES)
- Funciones de normalización
- Funciones de validación
- Funciones auxiliares

**Beneficios:**

- ✅ Única fuente de verdad para roles
- ✅ Reutilizable en todo el frontend
- ✅ Fácil de mantener y extender
- ✅ Tipado completo con TypeScript
- ✅ Bien documentado con JSDoc

---

### 2. `src/components/organisms/AppSidebar/AppSidebar.tsx` (MODIFICADO)

**Cambios principales:**

1. **Import de utilidades**:

   ```typescript
   import { normalizeRoles } from "@/utils/roleUtils";
   ```

2. **Normalización de roles del usuario**:

   ```typescript
   const userRoles = React.useMemo(() => {
     return normalizeRoles(user?.roles || []);
   }, [user?.roles]);
   ```

3. **Validación mejorada**:

   ```typescript
   const hasAccess = item.roles.some((required) =>
     userRoles.includes(required)
   );
   ```

4. **Logging para debugging**:
   ```typescript
   console.log("[AppSidebar] Roles normalizados:", normalizedRoles);
   ```

---

## 🧪 Cómo Verificar la Corrección

### 1. Login como Admin

```bash
# En la consola del navegador deberías ver:
[AppSidebar] Roles originales: ["Administrador General"]
[AppSidebar] Roles normalizados: ["admin"]

# Items de menú visibles:
✓ Dashboard
✓ Mi Perfil
✓ Recursos
✓ Categorías
✓ Mantenimientos
✓ Programas
✓ Aprobaciones
✓ Reportes
✓ Plantillas
✓ Roles y Permisos
✓ Auditoría
```

### 2. Login como Estudiante

```bash
# En la consola del navegador:
[AppSidebar] Roles originales: ["Estudiante"]
[AppSidebar] Roles normalizados: ["estudiante"]

# Items de menú visibles (menos):
✓ Dashboard
✓ Mi Perfil
✓ Recursos
✓ Reservas
✓ Calendario
✓ Check-in
✗ Categorías (oculto)
✗ Reportes (oculto)
✗ Roles y Permisos (oculto)
```

### 3. Verificar en Console

```typescript
// Abrir DevTools → Console
// Filtrar por "[AppSidebar]"

// Deberías ver:
[AppSidebar] Roles originales: ["Docente"]
[AppSidebar] Roles normalizados: ["profesor"]
[AppSidebar] Ocultando "/admin/roles" - requiere roles: ["admin"] usuario tiene: ["profesor"]
[AppSidebar] Ocultando "/reportes" - requiere roles: ["admin", "coordinador"] usuario tiene: ["profesor"]
```

---

## 🎓 Lecciones Aprendidas

### 1. Normalización de Datos

**Problema**: Backend y frontend usaban convenciones diferentes  
**Solución**: Crear capa de mapeo/normalización

**Aprendizaje**: Siempre normalizar datos del backend antes de usarlos en lógica de UI

---

### 2. Centralización de Lógica

**Problema**: Validación de roles duplicada en múltiples componentes  
**Solución**: Crear archivo utils/roleUtils.ts centralizado

**Aprendizaje**: Lógica de negocio compartida debe estar en un solo lugar

---

### 3. Logging para Debugging

**Problema**: Difícil entender por qué no funcionaba  
**Solución**: Agregar console.log estratégicos

**Aprendizaje**: Logging estructurado facilita debugging en producción

---

### 4. Soportar Múltiples Roles

**Problema**: Solo validaba primer rol del usuario  
**Solución**: Validar contra todos los roles del array

**Aprendizaje**: Los usuarios pueden tener múltiples roles simultáneamente

---

## 📚 Uso en Otros Componentes

### Proteger Rutas

```typescript
import { normalizeRoles, hasRole } from "@/utils/roleUtils";

function ProtectedRoute({ children, requiredRoles }) {
  const { user } = useAuth();
  const userRoles = normalizeRoles(user?.roles);

  if (!hasRole(userRoles, requiredRoles)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
```

### Condicionar UI

```typescript
import { isAdmin, hasAdminPrivileges } from "@/utils/roleUtils";

function ResourceCard({ resource }) {
  const { user } = useAuth();
  const userRoles = normalizeRoles(user?.roles);

  return (
    <Card>
      <h3>{resource.name}</h3>

      {/* Solo admins pueden editar */}
      {isAdmin(userRoles) && (
        <Button onClick={handleEdit}>Editar</Button>
      )}

      {/* Admins y coordinadores pueden aprobar */}
      {hasAdminPrivileges(userRoles) && (
        <Button onClick={handleApprove}>Aprobar</Button>
      )}
    </Card>
  );
}
```

### Validar Permisos

```typescript
import { hasRole, ROLES } from "@/utils/roleUtils";

function canCreateResource(userRoles: string[]): boolean {
  return hasRole(userRoles, [ROLES.ADMIN, ROLES.COORDINADOR]);
}

function canApproveReservation(userRoles: string[]): boolean {
  return hasRole(userRoles, [ROLES.ADMIN, ROLES.COORDINADOR]);
}

function canViewReports(userRoles: string[]): boolean {
  return hasRole(userRoles, [ROLES.ADMIN, ROLES.COORDINADOR]);
}
```

---

## 🚀 Próximos Pasos

### 1. Extender a Otros Componentes

- [ ] Proteger rutas con middleware
- [ ] Validar permisos en formularios
- [ ] Condicionar botones de acción
- [ ] Filtrar datos según rol

### 2. Tests Unitarios

```typescript
describe("roleUtils", () => {
  it("should normalize backend role names", () => {
    expect(normalizeRole("Administrador General")).toBe("admin");
    expect(normalizeRole("Estudiante")).toBe("estudiante");
  });

  it("should validate user roles", () => {
    const userRoles = ["admin"];
    expect(hasRole(userRoles, "admin")).toBe(true);
    expect(hasRole(userRoles, "estudiante")).toBe(false);
  });
});
```

### 3. Documentar en Storybook

```typescript
// AppSidebar.stories.tsx
export const AdminView = {
  args: {
    userRole: "admin",
  },
};

export const StudentView = {
  args: {
    userRole: "estudiante",
  },
};
```

---

## 📖 Referencias

### Código Backend (Auth Service)

**Roles predefinidos** (desde seed.ts):

```typescript
const roles = [
  { name: "Administrador General", code: "ADMIN_GENERAL" },
  { name: "Administrador de Programa", code: "ADMIN_PROGRAM" },
  { name: "Estudiante", code: "STUDENT" },
  { name: "Docente", code: "TEACHER" },
  { name: "Vigilante", code: "SECURITY" },
  { name: "Administrativo General", code: "ADMIN_STAFF" },
];
```

### Tipos TypeScript

```typescript
// src/types/entities/user.ts
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface User {
  id: string;
  email: string;
  roles: Role[];
  // ...
}
```

---

## ✅ Checklist de Validación

- [x] Roles del backend se mapean correctamente
- [x] Normalización funciona con todos los roles
- [x] Sidebar muestra items según rol
- [x] Logging ayuda a debugging
- [x] Código centralizado y reutilizable
- [x] TypeScript sin errores
- [x] Documentación completa
- [ ] Tests unitarios (pendiente)
- [ ] Tests E2E (pendiente)

---

**Estado**: ✅ **COMPLETADO Y FUNCIONAL**  
**Próxima tarea**: Implementar tests unitarios para roleUtils  
**Documentación**: Este archivo + JSDoc en roleUtils.ts
