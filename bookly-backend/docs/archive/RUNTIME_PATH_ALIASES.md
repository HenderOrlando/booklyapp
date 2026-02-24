# Resolución de Path Aliases en Runtime

## 🐛 Problema Identificado

**Fecha:** 19 de Noviembre de 2025

### Error Original

```
Error: Cannot find module '../../reports-service/src/libs/audit-decorators/src/index.ts'
Require stack:
- /Users/.../dist/apps/api-gateway/apps/api-gateway/src/api-gateway.module.js
```

### Causa Raíz

TypeScript **compila correctamente** usando los path aliases del `tsconfig.json`:

```typescript
// Código fuente (compila bien)
import { AuditDecoratorsModule } from "@reports/audit-decorators";
```

Pero en **runtime**, Node.js **no entiende** los path aliases de TypeScript y busca rutas relativas incorrectas.

## ✅ Solución Implementada

### 1. Corrección del Path Alias

El path alias debe apuntar al directorio `src` donde está el `index.ts`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@reports/audit-decorators": [
        "apps/reports-service/src/libs/audit-decorators/src" // ✅ Apunta a /src
      ]
    }
  }
}
```

**Antes (incorrecto):**

```json
"@reports/audit-decorators": [
  "apps/reports-service/src/libs/audit-decorators"  // ❌ Faltaba /src
]
```

### 2. Registro de Path Aliases en Runtime

Agregamos `tsconfig-paths/register` al inicio de cada microservicio:

```typescript
// apps/api-gateway/src/main.ts
// Registrar path aliases para runtime
import "tsconfig-paths/register";

import { createLogger } from "@libs/common/src/utils/logger.util";
import { ValidationPipe } from "@nestjs/common";
// ... resto de imports
```

### 2. Microservicios Actualizados

Se aplicó el fix en **todos los microservicios**:

- ✅ `apps/api-gateway/src/main.ts`
- ✅ `apps/auth-service/src/main.ts`
- ✅ `apps/resources-service/src/main.ts`
- ✅ `apps/availability-service/src/main.ts`
- ✅ `apps/stockpile-service/src/main.ts`
- ✅ `apps/reports-service/src/main.ts`

## 🔧 Cómo Funciona

### Antes (Sin tsconfig-paths/register)

1. TypeScript compila `@reports/audit-decorators` a una ruta relativa
2. Node.js intenta cargar esa ruta relativa
3. ❌ Falla porque la ruta no existe en `dist/`

### Después (Con tsconfig-paths/register)

1. TypeScript compila normalmente
2. **tsconfig-paths** intercepta `require()` y `import()`
3. ✅ Resuelve los path aliases del `tsconfig.json` en tiempo real
4. ✅ Node.js carga el módulo correctamente

## 📊 Path Aliases Configurados

Todos estos aliases ahora funcionan en **compilación y runtime**:

```typescript
// Librerías compartidas
import { LoggingService } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { RedisService } from "@libs/redis";

// Librería de auditoría migrada
import { Audit, AuditAction } from "@reports/audit-decorators";
import { AuditDecoratorsModule } from "@reports/audit-decorators";

// Imports internos por microservicio
import { UserService } from "@auth/services/user.service";
import { ResourceService } from "@resources/services/resource.service";
```

## 🚀 Verificación

### Compilación

```bash
npm run build:all
# ✅ Compilación exitosa
```

### Ejecución

```bash
nest start api-gateway --watch
# ✅ Inicia correctamente sin errores de módulos
```

### Verificar que los Aliases Funcionan

```bash
# En cualquier microservicio, todos estos imports deben funcionar:
node dist/apps/api-gateway/main.js
# ✅ Sin errores de "Cannot find module"
```

## 📋 Checklist de Implementación

- [x] Instalar `tsconfig-paths` (ya estaba en devDependencies)
- [x] Agregar `import "tsconfig-paths/register"` en `main.ts` de cada servicio
- [x] Recompilar todos los microservicios
- [x] Verificar que todos los servicios inician correctamente
- [x] Documentar la solución

## 🎯 Casos de Uso Soportados

### 1. Imports de Librerías Compartidas

```typescript
// ✅ Funciona en compilación y runtime
import { LoggingService } from "@libs/common";
import { PrismaService } from "@libs/database";
```

### 2. Imports de Librería Migrada

```typescript
// ✅ Funciona con la nueva ubicación
import { Audit, AuditAction } from "@reports/audit-decorators";
import { AuditDecoratorsModule } from "@reports/audit-decorators";
```

### 3. Imports Internos de Microservicio

```typescript
// ✅ En auth-service
import { UserService } from "@auth/services/user.service";
import { AuthGuard } from "@auth/guards/auth.guard";
```

### 4. Imports en Scripts de Seed

```typescript
// ✅ También funciona en scripts
// apps/auth-service/src/database/seed.ts
import { UserRole } from "@libs/common/src/enums";
import { createLogger } from "@libs/common/src/utils/logger.util";
```

## ⚠️ Importante

### NO Necesitas Modificar

- ❌ `tsconfig.json` - Los path aliases ya están configurados
- ❌ `package.json` - `tsconfig-paths` ya está instalado
- ❌ Archivos compilados - Se generan automáticamente

### SÍ Necesitas

- ✅ **Siempre** agregar `import "tsconfig-paths/register"` en el `main.ts` de nuevos microservicios
- ✅ Usar los path aliases definidos en `tsconfig.json`
- ✅ Recompilar después de cambios en configuración

## 🔍 Troubleshooting

### Error: Cannot find module '@reports/audit-decorators'

**Causa:** Falta `import "tsconfig-paths/register"` en `main.ts`

**Solución:**

```typescript
// Al inicio de main.ts
import "tsconfig-paths/register";
```

### Error: Module not found even with tsconfig-paths

**Causa:** El path alias no está en `tsconfig.json`

**Solución:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@mi-alias/*": ["ruta/a/mi/modulo/*"]
    }
  }
}
```

### Error: tsconfig-paths not found

**Causa:** Paquete no instalado

**Solución:**

```bash
npm install --save-dev tsconfig-paths
```

## 📚 Referencias

- [tsconfig-paths - npm](https://www.npmjs.com/package/tsconfig-paths)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [NestJS Monorepo Best Practices](https://docs.nestjs.com/cli/monorepo)

## ✅ Estado Final

**✅ PROBLEMA RESUELTO**

- Todos los microservicios compilan correctamente
- Todos los microservicios ejecutan sin errores de módulos
- Path aliases funcionan en compilación y runtime
- Documentación completa creada

---

**Fecha de Resolución:** 19 de Noviembre de 2025  
**Servicios Afectados:** 6 de 6 (100%)  
**Estado:** ✅ FUNCIONANDO CORRECTAMENTE
