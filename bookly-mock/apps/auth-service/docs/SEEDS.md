# 🌱 Auth Service - Seeds

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Descripción](#descripción)
- [Ejecución de Seeds](#ejecución-de-seeds)
- [Seeds Disponibles](#seeds-disponibles)
- [Orden de Ejecución](#orden-de-ejecución)
- [Seeds por Entorno](#seeds-por-entorno)

---

## 📖 Descripción

Los seeds del Auth Service permiten poblar la base de datos con datos iniciales necesarios para el sistema de autenticación y autorización:

- **Permisos del sistema**: Todos los permisos granulares de Bookly
- **Roles base**: Roles predefinidos del sistema (Admin, Teacher, Student, etc.)
- **Usuarios de prueba**: Usuarios para desarrollo y testing

---

## 🚀 Ejecución de Seeds

### Comando Principal

```bash
# Ejecutar todos los seeds (Idempotente - Seguro para correr múltiples veces)
npm run seed:auth

# Ejecutar con limpieza previa (BORRA DATOS EXISTENTES)
npm run seed:auth -- --clean
```

### Variables de Entorno

```bash
# Conexión a base de datos
DATABASE_URL="mongodb://localhost:27017/bookly-auth"

# Entorno (development, staging, production)
NODE_ENV=development
```

---

## 🌾 Seeds Disponibles

### 1. Permissions Seed - `permissions.seed-data.ts`

**Descripción**: Crea o actualiza todos los permisos del sistema organizados por recurso.

**Entidades Afectadas**:

- `Permission`

**Comportamiento**:

- Usa `upsert`: Si el permiso existe por código, lo actualiza. Si no, lo crea.
- Seguro de ejecutar múltiples veces.

### 2. Roles Seed - `roles.seed-data.ts`

**Descripción**: Crea o actualiza los roles del sistema con sus permisos asignados.

**Entidades Afectadas**:

- `Role`

**Comportamiento**:

- Usa `upsert`: Si el rol existe por nombre, actualiza sus propiedades y permisos. Si no, lo crea.
- Mantiene la consistencia de IDs de permisos.

### 3. Users Seed - `seed.ts`

**Descripción**: Crea usuarios de prueba si no existen, o actualiza su información básica si ya existen.

**Entidades Afectadas**:

- `User`

**Comportamiento**:

- Busca usuario por `email`.
- Si existe: Actualiza nombre, roles y estado (NO modifica contraseña).
- Si no existe: Crea el usuario con contraseña por defecto (`123456`).

---

## 🔄 Orden de Ejecución

Los seeds se ejecutan automáticamente en el orden correcto dentro del script:

1. **Permisos**: `seedPermissions()`
2. **Roles**: `seedRoles()` (depende de permisos)
3. **Usuarios**: `seedUsers()` (depende de roles)

---

## 🌍 Comportamiento por Entorno

El script ahora es **seguro por defecto** en todos los entornos.

- **Development / Production**:
  - Por defecto: Ejecuta en modo **Idempotente** (Upsert/Update).
  - No borra datos a menos que se pase el flag `--clean`.
  - Si se pasa `--clean`: Borra todas las colecciones afectadas antes de insertar.

---

## 🧪 Testing con Seeds

### Setup para Tests

Los tests pueden usar los seeds para preparar datos:

```typescript
import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { seedPermissions, seedRoles } from "../database/seed";

describe("AuthService", () => {
  let permissionModel: Model<PermissionEntity>;
  let roleModel: Model<RoleEntity>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    permissionModel = module.get(getModelToken(PermissionEntity.name));
    roleModel = module.get(getModelToken(RoleEntity.name));

    // Ejecutar seeds de test
    const permissionMap = await seedPermissions(permissionModel);
    await seedRoles(roleModel, permissionMap);
  });

  afterAll(async () => {
    // Limpiar
    await permissionModel.deleteMany({});
    await roleModel.deleteMany({});
  });

  it("should have all permissions", async () => {
    const count = await permissionModel.countDocuments();
    expect(count).toBeGreaterThan(0);
  });
});
```

---

## 🔧 Utilidades

### Verificar Seeds Ejecutados

```typescript
export async function verifySeedsExecuted(
  permissionModel: Model<PermissionEntity>,
  roleModel: Model<RoleEntity>
): Promise<boolean> {
  const permissionCount = await permissionModel.countDocuments();
  const roleCount = await roleModel.countDocuments();

  console.log(`Permisos: ${permissionCount}`);
  console.log(`Roles: ${roleCount}`);

  return permissionCount > 0 && roleCount > 0;
}
```

### Actualizar Permisos

Si se agregan nuevos permisos al sistema:

```bash
# 1. Actualizar permissions.seed-data.ts con nuevos permisos
# 2. Ejecutar seed (solo agregará los nuevos)
npm run seed
```

---

## 📝 Configuración en package.json

```json
{
  "scripts": {
    "seed": "ts-node src/database/seed.ts",
    "seed:fresh": "npm run db:reset && npm run seed",
    "db:reset": "echo 'Cleaning database...' && npm run seed"
  }
}
```

---

## 📊 Resumen de Datos

### Permisos por Recurso

| Recurso      | Cantidad de Permisos |
| ------------ | -------------------- |
| reservations | 5                    |
| users        | 5                    |
| roles        | 5                    |
| permissions  | 2                    |
| resources    | 5                    |
| audit        | 2                    |
| reports      | 3                    |
| approvals    | 4                    |
| **TOTAL**    | **31+**              |

### Roles del Sistema

| Rol                  | Permisos   | Usuarios de Prueba |
| -------------------- | ---------- | ------------------ |
| GENERAL_ADMIN        | Todos (\*) | 1                  |
| PROGRAM_ADMIN        | 20+        | 1                  |
| TEACHER              | 10+        | 1                  |
| STUDENT              | 5+         | 1                  |
| SECURITY             | 5+         | 1                  |
| ADMINISTRATIVE_STAFF | 15+        | 1                  |

---

## ⚠️ Notas Importantes

1. **Contraseñas**: En desarrollo, todos los usuarios tienen contraseña "123456"
2. **Idempotencia**: Los seeds pueden ejecutarse múltiples veces sin errores
3. **Limpieza**: Solo limpia en `NODE_ENV=development`
4. **Audit**: Todos los datos creados tienen `audit.createdBy = "system"`
5. **Activación**: Todos los permisos, roles y usuarios se crean activos

---

## 🔒 Seguridad

### Producción

En producción, **NUNCA** ejecutar seeds con limpieza de datos:

```bash
# ❌ NO HACER ESTO EN PRODUCCIÓN
NODE_ENV=development npm run seed

# ✅ Hacer esto
NODE_ENV=production npm run seed
```

### Contraseñas

Las contraseñas de usuarios de prueba se hashean con bcrypt:

```typescript
const defaultPassword = await bcrypt.hash("123456", 10);
```

**Nota**: En producción, no se crean usuarios con contraseñas por defecto.

---

## 📚 Referencias

- [Base de Datos](DATABASE.md)
- [Arquitectura](ARCHITECTURE.md)
- [Roles y Permisos RF-41](requirements/RF-41_GESTION_ROLES_PERMISOS.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
