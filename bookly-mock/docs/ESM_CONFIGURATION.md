# Configuración ESM en Bookly

## 📋 Resumen

Bookly utiliza una **configuración híbrida óptima** para NestJS que combina:

- ✅ **Sintaxis ESM** en código fuente (TypeScript)
- ✅ **Compilación a CommonJS** para máxima compatibilidad
- ✅ **Target ES2022** para características modernas de JavaScript

## 🎯 Configuración Actual

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "module": "commonjs", // Compila a CommonJS (estándar NestJS)
    "moduleResolution": "node", // Resolución Node.js estándar
    "target": "ES2022", // Sintaxis JavaScript moderna
    "lib": ["ES2022"], // APIs de ES2022 disponibles
    "esModuleInterop": true, // Interoperabilidad ESM/CommonJS
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true
    // ... otras opciones
  }
}
```

### NestJS CLI Configuration (`nest-cli.json`)

```json
{
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": false, // Usa TypeScript compiler directo
    "tsConfigPath": "tsconfig.json",
    "builder": "tsc" // Compilador TypeScript
  },
  "monorepo": true // Soporte para monorepo
}
```

### Package.json

```json
{
  "type": "commonjs" // Tipo de módulo Node.js
}
```

## ✅ Verificación de Configuración

### 1. Sintaxis ESM en Código Fuente

Todos los archivos TypeScript usan sintaxis ESM:

```typescript
// ✅ CORRECTO - Imports ESM
import { Module } from "@nestjs/common";
import { AuditDecoratorsModule } from "@reports/audit-decorators";

// ✅ CORRECTO - Exports ESM
export class AuthModule {}
export { UserService } from "./services/user.service";

// ❌ INCORRECTO - CommonJS (no usar)
const { Module } = require("@nestjs/common");
module.exports = { AuthModule };
```

### 2. Path Aliases Configurados

Todos los microservicios tienen acceso a path aliases:

```typescript
// Librerías compartidas
import { LoggingService } from "@libs/common";
import { EventBusService } from "@libs/event-bus";

// Librería de auditoría migrada
import { Audit, AuditAction } from "@reports/audit-decorators";

// Imports internos de cada servicio
import { UserService } from "@auth/services/user.service";
```

### 3. Compilación a CommonJS

El código compilado en `dist/` es CommonJS para máxima compatibilidad:

```javascript
// dist/apps/auth-service/main.js (ejemplo simplificado)
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
// ...
```

## 🚀 Beneficios de Esta Configuración

### 1. **Desarrollo Moderno**

- Usas sintaxis ESM limpia y moderna en todo el código
- Tree-shaking en desarrollo (eliminación de código no usado)
- Better IDE support y autocompletado

### 2. **Compatibilidad Máxima**

- CommonJS es el estándar de NestJS y Node.js ecosystem
- Compatible con todas las librerías NPM (ESM y CommonJS)
- Sin problemas de interoperabilidad entre módulos

### 3. **Performance**

- Compilación rápida con TypeScript directo (sin webpack)
- Builds incrementales optimizados
- Hot reload en desarrollo

### 4. **Target ES2022**

- Soporte para características modernas:
  - `async/await`
  - Nullish coalescing (`??`)
  - Optional chaining (`?.`)
  - Class fields
  - Top-level await
  - Private class fields (`#field`)

## 📊 Estructura de Compilación

```
bookly-mock/
├── apps/                           # Código fuente (TypeScript + ESM)
│   ├── auth-service/
│   │   └── src/
│   │       └── main.ts            # import { NestFactory } from '@nestjs/core';
│   ├── resources-service/
│   └── ...
│
└── dist/                          # Código compilado (JavaScript + CommonJS)
    └── apps/
        ├── auth-service/
        │   └── main.js            # const { NestFactory } = require('@nestjs/core');
        ├── resources-service/
        └── ...
```

## 🔧 Comandos de Compilación

```bash
# Compilar todos los microservicios
npm run build:all

# Compilar servicio específico
nest build auth-service
nest build reports-service

# Limpiar y compilar
rm -rf dist && npm run build:all

# Modo watch para desarrollo
nest start --watch auth-service
```

## ⚙️ Configuración por Microservicio

Cada microservicio hereda la configuración base:

```json
// apps/auth-service/tsconfig.app.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "declaration": false,
    "outDir": "../../dist/apps/auth-service"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

## 🎯 Casos de Uso

### Import de Librerías Compartidas

```typescript
// ✅ Desde cualquier microservicio
import { LoggingService } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Audit } from "@reports/audit-decorators";
```

### Import de Módulos NestJS

```typescript
// ✅ Imports estándar de NestJS
import { Module, Injectable, Controller } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
```

### Import de Tipos e Interfaces

```typescript
// ✅ Type-only imports (se eliminan en compilación)
import type { IAuditRecord } from "@reports/audit-decorators";
import type { User } from "@prisma/client";
```

### Re-exports de Módulos

```typescript
// ✅ Re-exportar para crear barrels
export { UserService } from "./services/user.service";
export { AuthController } from "./controllers/auth.controller";
export * from "./dtos";
```

## 🔍 Troubleshooting

### Error: "Cannot find module"

**Causa:** Path alias no resuelto

**Solución:**

1. Verificar que el path alias está en `tsconfig.json`
2. Reiniciar TypeScript server en el IDE
3. Limpiar y recompilar: `rm -rf dist && npm run build:all`

### Error: "require() of ES Module"

**Causa:** Intentando importar módulo ESM puro en entorno CommonJS

**Solución:**

1. Usar versión CommonJS de la librería
2. O usar dynamic import: `const module = await import('esm-package')`

### Error: Module resolution failed

**Causa:** Configuración incorrecta de moduleResolution

**Solución:**

- Asegurar `"moduleResolution": "node"` en `tsconfig.json`
- Verificar que `node_modules` esté instalado: `npm install`

## 📚 Referencias

- [NestJS Documentation - Modules](https://docs.nestjs.com/modules)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)

## ✅ Checklist de Configuración

- [x] `tsconfig.json` con `module: "commonjs"`
- [x] `tsconfig.json` con `target: "ES2022"`
- [x] `tsconfig.json` con `lib: ["ES2022"]`
- [x] `package.json` con `type: "commonjs"`
- [x] `nest-cli.json` configurado para monorepo
- [x] Todos los microservicios heredan configuración base
- [x] Path aliases configurados y funcionando
- [x] Código fuente usa sintaxis ESM (`import/export`)
- [x] Compilación a CommonJS exitosa
- [x] Hot reload funcionando en desarrollo

## 🎉 Estado Actual

**✅ CONFIGURACIÓN COMPLETA Y OPTIMIZADA**

Bookly está configurado con la mejor práctica recomendada por NestJS:

- Sintaxis ESM moderna en desarrollo
- Compilación a CommonJS para producción
- Soporte completo para ES2022
- Path aliases funcionando correctamente
- Compilación sin errores en todos los microservicios
