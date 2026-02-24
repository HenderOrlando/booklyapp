# 🛡️ Configuración de Roles y Permisos del Sidebar

**Fecha**: 23 de Noviembre de 2025  
**Estado**: ✅ Configurado

---

## 📋 Resumen de Permisos por Rol

### 👨‍🎓 Estudiante

**Puede ver**:

- ✅ Dashboard
- ✅ Mi Perfil
- ✅ Recursos (solo visualización)
- ✅ Reservas (crear y gestionar sus propias reservas)
- ✅ Calendario (ver disponibilidad)
- ✅ Check-in / Check-out (registrar entrada/salida)

**NO puede ver**:

- ❌ Categorías
- ❌ Mantenimientos
- ❌ Programas
- ❌ Lista de Espera
- ❌ Aprobaciones
- ❌ Vigilancia
- ❌ Historial de Aprobaciones
- ❌ Reportes
- ❌ Plantillas
- ❌ Roles y Permisos
- ❌ Auditoría

---

### 👨‍🏫 Profesor

**Puede ver**:

- ✅ Todo lo del Estudiante, más:
- ✅ Historial de Aprobaciones (ver sus aprobaciones)
- ✅ Check-in / Check-out

**NO puede ver**:

- ❌ Categorías
- ❌ Mantenimientos
- ❌ Programas
- ❌ Lista de Espera
- ❌ Aprobaciones
- ❌ Vigilancia
- ❌ Reportes
- ❌ Plantillas
- ❌ Roles y Permisos
- ❌ Auditoría

---

### 🎯 Coordinador de Programa

**Definición**: Profesor asignado por el admin como coordinador de UN programa académico específico.

**Puede ver en el menú**:

- ✅ Todo lo del Estudiante, más:
- ✅ Categorías (solo lectura)
- ✅ Mantenimientos (solo los de recursos de SU programa) ⚠️
- ✅ Programas (solo editar SU programa) ⚠️
- ✅ Lista de Espera (solo la de SU programa) ⚠️
- ✅ Aprobaciones (solo reservas de SU programa) ⚠️
- ✅ Historial de Aprobaciones (solo las de SU programa) ⚠️
- ✅ Reportes (solo de SU programa) ⚠️
- ✅ Plantillas (ver todas, editar las de SU programa) ⚠️

**⚠️ IMPORTANTE**: El coordinador ve las opciones del menú, pero el **backend filtra los datos** para mostrar solo los de su programa. Ver [PERMISOS_CONTEXTUALES_COORDINADOR.md](./PERMISOS_CONTEXTUALES_COORDINADOR.md) para detalles de implementación.

**NO puede ver**:

- ❌ Vigilancia
- ❌ Roles y Permisos
- ❌ Auditoría

---

### 👮 Vigilancia

**Puede ver**:

- ✅ Dashboard
- ✅ Mi Perfil
- ✅ Recursos (consulta)
- ✅ Calendario
- ✅ Vigilancia (pantalla de control para verificar reservas)

**NO puede ver**:

- ❌ Todo lo demás (solo funciones de verificación)

---

### 👑 Admin (GENERAL_ADMIN)

**Puede ver**:

- ✅ **TODO** sin restricciones
- ✅ Roles y Permisos (gestión completa de roles)
- ✅ Auditoría (logs y seguimiento del sistema)

---

## 🔧 Configuración Técnica

### Ubicación del Archivo

```
src/components/organisms/AppSidebar/AppSidebar.tsx
```

### Estructura de navigationItems

```typescript
const navigationItems: NavItem[] = [
  {
    href: "/ruta",
    label: "Nombre",
    icon: <svg>...</svg>,
    roles: ["admin", "coordinador"], // Array de roles permitidos
  },
  // Si NO tiene 'roles', es visible para TODOS
];
```

### Tabla Completa de Permisos

| Opción del Menú        | Estudiante | Profesor          | Coordinador              | Vigilancia | Admin |
| ---------------------- | ---------- | ----------------- | ------------------------ | ---------- | ----- |
| Dashboard              | ✅         | ✅                | ✅                       | ✅         | ✅    |
| Mi Perfil              | ✅         | ✅                | ✅                       | ✅         | ✅    |
| Recursos               | ✅         | ✅                | ✅                       | ✅         | ✅    |
| Categorías             | ❌         | ❌                | ✅ (solo lectura)        | ❌         | ✅    |
| Mantenimientos         | ❌         | ❌                | ✅ (solo su programa) ⚠️ | ❌         | ✅    |
| Programas              | ❌         | ❌                | ✅ (solo su programa) ⚠️ | ❌         | ✅    |
| Reservas               | ✅         | ✅                | ✅                       | ❌         | ✅    |
| Calendario             | ✅         | ✅                | ✅                       | ✅         | ✅    |
| Lista de Espera        | ❌         | ❌                | ✅ (solo su programa) ⚠️ | ❌         | ✅    |
| Aprobaciones           | ❌         | ❌                | ✅ (solo su programa) ⚠️ | ❌         | ✅    |
| Vigilancia             | ❌         | ❌                | ❌                       | ✅         | ✅    |
| Historial Aprobaciones | ❌         | ✅ (solo propias) | ✅ (solo su programa) ⚠️ | ❌         | ✅    |
| Check-in/Check-out     | ✅         | ✅                | ✅                       | ❌         | ✅    |
| Reportes               | ❌         | ❌                | ✅                       | ❌         | ✅    |
| Plantillas             | ❌         | ❌                | ✅                       | ❌         | ✅    |
| Roles y Permisos       | ❌         | ❌                | ❌                       | ❌         | ✅    |
| Auditoría              | ❌         | ❌                | ❌                       | ❌         | ✅    |

**Leyenda**:

- ⚠️ = Filtrado contextual en backend requerido. El coordinador ve la opción, pero el backend filtra los datos para mostrar solo los de su programa. Ver [PERMISOS_CONTEXTUALES_COORDINADOR.md](./PERMISOS_CONTEXTUALES_COORDINADOR.md)

---

## 🔍 Cómo Funciona

### 1. Obtención del Rol

El `AppSidebar` obtiene automáticamente el rol del usuario desde `AuthContext`:

```typescript
export function AppSidebar({
  userRole: userRoleProp,
  className = "",
}: AppSidebarProps) {
  const { user } = useAuth();

  // Usar rol del contexto si no se pasa como prop
  const firstRole = user?.roles?.[0];
  const userRole =
    userRoleProp ||
    (typeof firstRole === "string" ? firstRole : firstRole?.name) ||
    null;

  // ...
}
```

### 2. Filtrado de Items

Los items se filtran según el rol del usuario:

```typescript
const visibleItems = navigationItems
  .filter((item) => {
    // Si el item no tiene roles definidos O no hay usuario, mostrar
    if (!item.roles || !userRole) return true;

    // Si el item tiene roles, verificar si el usuario tiene ese rol
    return item.roles.includes(userRole);
  })
  .map(/* traducir labels */);
```

### 3. Roles en el Backend

Los nombres de roles deben coincidir con los del backend:

```typescript
// Frontend (AppSidebar)
roles: ["admin", "coordinador", "profesor", "estudiante", "vigilancia"]

// Backend (Auth Service)
GENERAL_ADMIN      → "admin"
COORDINATOR        → "coordinador"
PROFESSOR          → "profesor"
STUDENT            → "estudiante"
SECURITY_GUARD     → "vigilancia"
```

---

## 🧪 Testing

### Verificar como Estudiante

1. Login con cuenta de estudiante
2. **Deberías ver solo**:
   - Dashboard
   - Mi Perfil
   - Recursos
   - Reservas
   - Calendario
   - Check-in/Check-out

3. **NO deberías ver**:
   - Categorías
   - Mantenimientos
   - Programas
   - Lista de Espera
   - Aprobaciones
   - Vigilancia
   - Reportes
   - Admin

### Verificar como Coordinador

1. Login con cuenta de coordinador
2. **Deberías ver**:
   - Todo lo del estudiante
   - Categorías
   - Mantenimientos
   - Programas
   - Lista de Espera
   - Aprobaciones
   - Historial de Aprobaciones
   - Reportes
   - Plantillas

3. **NO deberías ver**:
   - Vigilancia
   - Roles y Permisos
   - Auditoría

### Verificar como Admin

1. Login con cuenta admin
2. **Deberías ver**: TODO el menú completo

---

## 📝 Agregar Nuevas Opciones

Para agregar una nueva opción al menú con restricciones:

```typescript
{
  href: "/nueva-opcion",
  label: "Nueva Opción",
  icon: <svg>...</svg>,
  roles: ["admin", "coordinador"], // Especificar roles permitidos
}
```

**Importante**:

- Si NO defines `roles`, la opción será visible para TODOS
- Los roles deben coincidir con los del backend
- Usa nombres en minúsculas y español para consistencia

---

## 🐛 Debugging

### Ver rol actual del usuario

```javascript
// En consola del navegador
const { user } = useAuth();
console.log("Rol actual:", user?.roles?.[0]);
```

### Ver items visibles

```javascript
// En AppSidebar.tsx, agregar console.log temporal
console.log("User Role:", userRole);
console.log(
  "Visible Items:",
  visibleItems.map((i) => i.label)
);
```

### Verificar filtrado

```typescript
// Los items SIN roles se muestran a todos
navigationItems.filter((item) => !item.roles);

// Items que requieren roles específicos
navigationItems.filter((item) => item.roles);
```

---

## ✅ Checklist de Cambios Realizados

- [x] Agregado `roles: ["admin", "coordinador"]` a Categorías
- [x] Agregado `roles: ["admin", "coordinador"]` a Mantenimientos
- [x] Agregado `roles: ["admin", "coordinador"]` a Programas
- [x] Agregado `roles: ["admin", "coordinador", "profesor"]` a Lista de Espera
- [x] Verificado que otras opciones ya tienen roles correctos
- [x] AppSidebar obtiene rol automáticamente de AuthContext
- [x] Filtrado funcional según roles

---

## 🎯 Resultado

**Problema**: Estudiantes veían Programas, Mantenimiento, Categorías y Lista de Espera

**Solución**: Agregadas restricciones de roles a estas 4 opciones

**Estado**: ✅ Solucionado - Ahora solo usuarios con permisos apropiados ven estas opciones

---

**Última actualización**: 2025-11-23  
**Archivo modificado**: `src/components/organisms/AppSidebar/AppSidebar.tsx`
