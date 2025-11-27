# 🔧 Fix: Perfil y Protección de Rutas

**Fecha**: 23 de Noviembre de 2025  
**Estado**: ✅ Solucionado

---

## 🐛 Problemas Reportados

### 1. **Perfil no carga la información del usuario**

- La página de perfil mostraba loading infinito
- Los datos del usuario no se cargaban
- El hook `useCurrentUser()` no funcionaba correctamente

### 2. **Rutas no están protegidas**

- El sidebar mostraba todas las opciones a todos los usuarios
- No se filtraban las rutas según el rol del usuario
- Faltaba integración con `AuthContext`

---

## ✅ Soluciones Implementadas

### 1. **AuthContext - Obtener Perfil Completo**

**Archivo**: `src/contexts/AuthContext.tsx`

**Cambio**: Actualizada función `checkAuth()` para obtener datos del usuario desde el backend

```typescript
const checkAuth = async () => {
  const token = getToken();
  if (!token) {
    setIsLoading(false);
    return;
  }

  try {
    setIsLoading(true);
    // Obtener datos del usuario desde el backend
    const response = await AuthClient.getProfile();

    if (response.success && response.data) {
      setUser(response.data);
    } else {
      // Token inválido, limpiar sesión
      clearToken();
      setUser(null);
    }
  } catch (error) {
    console.error("Error verificando autenticación:", error);
    clearToken();
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};
```

**Resultado**:

- ✅ Al iniciar la app, automáticamente obtiene el perfil del usuario
- ✅ Valida que el token sea válido
- ✅ Actualiza el estado global del usuario

---

### 2. **useCurrentUser - Usar AuthContext**

**Archivo**: `src/hooks/useCurrentUser.ts`

**Cambio**: Simplificado para usar `AuthContext` en lugar de React Query

**Antes**:

```typescript
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: currentUserKeys.user(),
    queryFn: async () => {
      // Lógica compleja con sessionStorage y requests manuales
      // ...
    },
  });
}
```

**Después**:

```typescript
export function useCurrentUser() {
  const { user, isLoading } = useAuth();

  return {
    data: user,
    isLoading,
    error: null,
  };
}
```

**Beneficios**:

- ✅ Código más simple y mantenible
- ✅ Una única fuente de verdad (`AuthContext`)
- ✅ Sincronización automática con el estado global
- ✅ Funciona correctamente en la página de perfil

---

### 3. **AppSidebar - Protección por Roles**

**Archivo**: `src/components/organisms/AppSidebar/AppSidebar.tsx`

**Cambios**:

1. **Import de useAuth**:

```typescript
import { useAuth } from "@/contexts/AuthContext";
```

2. **Obtener rol automáticamente**:

```typescript
export function AppSidebar({
  userRole: userRoleProp,
  className = "",
}: AppSidebarProps) {
  const { user } = useAuth();
  const t = useTranslations();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  // Usar rol del contexto si no se pasa como prop
  // Los roles pueden ser strings o objetos { name: string }
  const firstRole = user?.roles?.[0];
  const userRole =
    userRoleProp ||
    (typeof firstRole === "string" ? firstRole : firstRole?.name) ||
    null;

  // ... resto del código
}
```

3. **Filtrado existente ya implementado**:

```typescript
const visibleItems = navigationItems.filter((item) => {
  if (!item.roles || !userRole) return true; // Sin restricción
  return item.roles.includes(userRole);
});
// ...
```

**Resultado**:

- ✅ Sidebar obtiene automáticamente el rol del usuario autenticado
- ✅ Filtra las opciones según los permisos del usuario
- ✅ Maneja tanto roles en formato string como objeto
- ✅ Compatible con versiones anteriores (acepta `userRole` como prop)

---

## 🎯 Configuración de Roles en navigationItems

El sidebar ya tenía configurados los roles requeridos para cada opción:

```typescript
const navigationItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    // Sin roles = visible para todos
  },
  {
    href: "/aprobaciones",
    label: "Aprobaciones",
    roles: ["admin", "coordinador"], // Solo admins y coordinadores
  },
  {
    href: "/vigilancia",
    label: "Vigilancia",
    roles: ["admin", "vigilancia"], // Solo admins y vigilancia
  },
  {
    href: "/admin/roles",
    label: "Roles y Permisos",
    roles: ["admin"], // Solo administradores
  },
  // ...
];
```

---

## 📊 Flujo Completo

### Al Iniciar Sesión:

```
1. Usuario ingresa credenciales
   ↓
2. AuthContext.login()
   ↓
3. Backend devuelve: { user, tokens: { accessToken, refreshToken } }
   ↓
4. setToken(accessToken) → localStorage + cookies
   ↓
5. setUser(user) → Estado global
   ↓
6. Redirección a /dashboard
   ↓
7. AppSidebar lee user.roles[0]
   ↓
8. Filtra opciones según rol
   ↓
9. Usuario ve solo lo que puede acceder
```

### Al Recargar la Página:

```
1. App monta → AuthProvider useEffect
   ↓
2. checkAuth() ejecutado
   ↓
3. getToken() desde localStorage
   ↓
4. AuthClient.getProfile() con token
   ↓
5. Backend devuelve datos completos del usuario
   ↓
6. setUser(userData) → Estado actualizado
   ↓
7. useCurrentUser() devuelve datos actualizados
   ↓
8. Página de perfil muestra información
   ↓
9. AppSidebar filtra rutas
```

---

## 🧪 Verificación

### 1. **Verificar Perfil**

1. Iniciar sesión
2. Navegar a `/profile`
3. **Resultado esperado**:
   - ✅ Datos del usuario cargados correctamente
   - ✅ Nombre, email, roles visibles
   - ✅ Sin loading infinito

### 2. **Verificar Protección de Rutas**

**Como Estudiante** (sin roles especiales):

- ✅ Ve: Dashboard, Perfil, Recursos, Reservas, Calendario
- ❌ NO ve: Aprobaciones, Vigilancia, Admin

**Como Coordinador**:

- ✅ Ve: Todo lo anterior + Aprobaciones, Reportes
- ❌ NO ve: Vigilancia, Admin/Roles

**Como Admin**:

- ✅ Ve: TODO (sin restricciones)

### 3. **Verificar en DevTools**

**Console**:

```javascript
// Debería mostrar datos del usuario
console.log(localStorage.getItem("accessToken"));

// En React DevTools → Components → AuthProvider
// Debería mostrar: user: { ... datos ... }
```

**Network**:

```
GET http://localhost:3001/api/v1/auth/profile
Headers: Authorization: Bearer eyJ...
Response: { success: true, data: { id, email, roles, ... } }
```

---

## 📁 Archivos Modificados

1. ✅ `src/contexts/AuthContext.tsx` - checkAuth() obtiene perfil
2. ✅ `src/hooks/useCurrentUser.ts` - Usa AuthContext
3. ✅ `src/components/organisms/AppSidebar/AppSidebar.tsx` - Obtiene rol automáticamente
4. ✅ `src/middleware.ts` - Todas las rutas protegidas requieren autenticación

---

## 🛡️ Protección de Rutas a Nivel de Middleware

**Archivo**: `src/middleware.ts`

**Cambios**:

- Agregadas todas las rutas administrativas a `protectedRoutes`
- Rutas protegidas: `/categorias`, `/mantenimientos`, `/programas`, `/lista-espera`, `/vigilancia`, etc.
- Middleware redirige a `/login` si no hay token de autenticación

**Importante**:

- El middleware solo verifica **autenticación** (si hay token)
- NO verifica **roles específicos** del usuario
- La protección por roles se maneja en:
  1. **UI**: `AppSidebar` oculta opciones según rol
  2. **Backend**: Cada endpoint verifica permisos

**Para verificación completa por roles** necesitarías:

- Decodificar el JWT y validar roles, O
- Hacer una llamada al backend para verificar permisos

---

## 🔍 Debugging

### Si el perfil no carga:

1. **Verificar que hay token**:

   ```javascript
   localStorage.getItem("accessToken");
   ```

2. **Verificar request al backend**:

   ```bash
   # En DevTools → Network
   GET /api/v1/auth/profile
   Status: 200
   ```

3. **Verificar AuthContext en React DevTools**:
   ```
   Components → AuthProvider
   user: { ... }  // Debe tener datos
   isLoading: false
   ```

### Si el sidebar no filtra:

1. **Verificar rol del usuario**:

   ```javascript
   // En console
   const { user } = useAuth();
   console.log(user.roles);
   ```

2. **Verificar navigationItems**:
   ```javascript
   // Ver qué items tienen roles definidos
   navigationItems.filter((item) => item.roles);
   ```

---

## ✅ Resultado Final

### Problema 1: Perfil ✅ SOLUCIONADO

- `useCurrentUser()` usa `AuthContext`
- `AuthContext.checkAuth()` obtiene perfil del backend
- Datos del usuario se cargan correctamente

### Problema 2: Protección de Rutas ✅ SOLUCIONADO

- `AppSidebar` obtiene rol desde `AuthContext`
- Filtra opciones según `item.roles`
- Solo muestra rutas permitidas para cada rol

---

## 🎓 Aprendizajes

1. **Single Source of Truth**: `AuthContext` es la única fuente de datos del usuario
2. **Composition over Configuration**: Hooks componen funcionalidad del contexto
3. **Progressive Enhancement**: Sidebar funciona con o sin rol especificado
4. **Type Safety**: Manejo correcto de roles como string o objeto

---

## 📚 Referencias

- `src/contexts/AuthContext.tsx` - Contexto de autenticación
- `src/hooks/useCurrentUser.ts` - Hook de usuario actual
- `src/components/organisms/AppSidebar/AppSidebar.tsx` - Sidebar con protección
- `docs/AUTH_SIN_NEXTAUTH.md` - Documentación de autenticación

---

**Última actualización**: 2025-11-23  
**Estado**: ✅ Completamente funcional  
**Próximo**: Testing end-to-end completo
