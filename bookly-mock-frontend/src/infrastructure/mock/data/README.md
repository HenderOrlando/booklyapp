# Mock Data - Bookly

Datos mock organizados por microservicio para desarrollo UI/UX sin backend.

## 📁 Estructura

```
data/
├── auth-service.mock.ts    # Users, Roles, Permissions, Credentials
├── audit.mock.ts            # Audit Logs (sistema transversal)
├── index.ts                 # Exports centralizados
└── README.md               # Este archivo
```

## 🎯 Microservicios

### Auth Service (`auth-service.mock.ts`)

**Responsabilidad:** Autenticación y gestión de usuarios

**Exports:**

- `mockPermissions` - Lista de permisos del sistema
- `mockRoles` - Roles (admin, coordinador, profesor, estudiante)
- `mockRolesExtended` - Roles con campo `usersCount` para UI
- `mockUsers` - Usuarios de prueba
- `mockUsersExtended` - Usuarios con roles como strings
- `mockCredentials` - Credenciales válidas para login
- `getMockLoginResponse()` - Función para simular login
- `currentMockUser` - Usuario actual (admin por defecto)

**Credenciales de Prueba:**

```typescript
admin@ufps.edu.co / admin123
coordinador@ufps.edu.co / coord123
profesor@ufps.edu.co / prof123
estudiante@ufps.edu.co / est123
```

---

### Audit (Sistema Transversal) (`audit.mock.ts`)

**Responsabilidad:** Logs de auditoría del sistema

**Exports:**

- `mockAuditLogs` - 12 logs de ejemplo
- `getFilteredAuditLogs()` - Función para filtrar logs
- `addAuditLog()` - Función para agregar nuevo log
- `AuditLog` - Interface del log

**Tipos de Logs:**

- login/logout
- crear/editar/eliminar (recursos, reservas, usuarios)
- aprobar/rechazar (reservas)
- Errores y advertencias

---

## 📝 Uso

### Importar desde `index.ts` (recomendado)

```typescript
import {
  mockUsers,
  mockRoles,
  mockAuditLogs,
  getMockLoginResponse,
} from "@/infrastructure/mock/data";
```

### Importar directamente desde el archivo

```typescript
import { mockUsers } from "@/infrastructure/mock/data/auth-service.mock";
import { mockAuditLogs } from "@/infrastructure/mock/data/audit.mock";
```

---

## 🔧 Agregar Nuevos Microservicios

### 1. Crear archivo

```bash
# Ejemplo: Resources Service
touch src/infrastructure/mock/data/resources-service.mock.ts
```

### 2. Definir tipos y data

```typescript
/**
 * Mock Data - Resources Service
 *
 * Datos mock para el microservicio de recursos
 */

export interface Resource {
  id: string;
  name: string;
  // ... más campos
}

export const mockResources: Resource[] = [
  // ... data
];
```

### 3. Exportar en `index.ts`

```typescript
// Resources Service
export { mockResources, type Resource } from "./resources-service.mock";
```

### 4. Usar en `mockService.ts`

```typescript
import { mockResources } from "./data";

private static mockGetResources(): ApiResponse<any> {
  return {
    success: true,
    data: {
      items: mockResources,
      meta: { /* pagination */ },
    },
    timestamp: new Date().toISOString(),
  };
}
```

---

## ✅ Ventajas de esta Estructura

### **Modularidad**

Cada microservicio tiene su propio archivo, facilitando el mantenimiento.

### **Escalabilidad**

Fácil agregar nuevos microservicios sin afectar los existentes.

### **Trazabilidad**

Clara separación de responsabilidades según la arquitectura de Bookly.

### **Reutilización**

Las funciones helper como `getFilteredAuditLogs()` evitan duplicación.

### **Tipos Seguros**

Interfaces exportadas para type-safety en TypeScript.

---

## 🚀 Próximos Microservicios

- `resources-service.mock.ts` - Salas, equipos, categorías
- `availability-service.mock.ts` - Reservas, horarios, calendario
- `stockpile-service.mock.ts` - Aprobaciones, flujos de validación
- `reports-service.mock.ts` - Reportes, estadísticas, dashboards

---

## 📚 Referencias

- [Arquitectura de Bookly](../../../README.md)
- [Mock Service](../mockService.ts)
- [Plan General](../../../../00_PLAN_GENERAL.md)
