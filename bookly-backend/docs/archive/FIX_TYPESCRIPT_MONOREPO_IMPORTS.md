# Fix TypeScript Monorepo Imports

## Problema Original

TypeScript reportaba errores en archivos que importaban desde otras librerías del monorepo:

```
File '/Users/.../libs/common/src/index.ts' is not under 'rootDir' '/Users/.../libs/event-bus'.
'rootDir' is expected to contain all source files.
```

## Causa Raíz

En un monorepo con TypeScript y proyectos composite, la configuración `rootDir` en los `tsconfig.json` de cada librería restringe el compilador a solo ese directorio, impidiendo imports cross-library.

## Solución Implementada

### 1. Configuración de Path Aliases (tsconfig.json base)

Agregados paths explícitos para todas las librerías:

```json
{
  "paths": {
    "@libs/common": ["libs/common/src"],
    "@libs/common/*": ["libs/common/src/*"],
    "@libs/event-bus": ["libs/event-bus/src"],
    "@libs/event-bus/*": ["libs/event-bus/src/*"],
    "@libs/redis": ["libs/redis/src"],
    "@libs/redis/*": ["libs/redis/src/*"],
    "@libs/database": ["libs/database/src"],
    "@libs/database/*": ["libs/database/src/*"],
    "@libs/decorators": ["libs/decorators/src"],
    "@libs/decorators/*": ["libs/decorators/src/*"],
    "@libs/guards": ["libs/guards/src"],
    "@libs/guards/*": ["libs/guards/src/*"],
    "@libs/filters": ["libs/filters/src"],
    "@libs/filters/*": ["libs/filters/src/*"],
    "@libs/interceptors": ["libs/interceptors/src"],
    "@libs/interceptors/*": ["libs/interceptors/src/*"],
    "@libs/kafka": ["libs/kafka/src"],
    "@libs/kafka/*": ["libs/kafka/src/*"],
    "@libs/notifications": ["libs/notifications/src"],
    "@libs/notifications/*": ["libs/notifications/src/*"]
  }
}
```

### 2. Remoción de rootDir

Removido `"rootDir": "./src"` de todos los archivos `tsconfig.json` en:

- libs/common/
- libs/database/
- libs/decorators/
- libs/event-bus/
- libs/filters/
- libs/guards/
- libs/interceptors/
- libs/kafka/
- libs/notifications/
- libs/redis/

También removido de `libs/event-bus/tsconfig.lib.json`.

### 3. Corrección de Imports

Corregidos todos los imports para usar barrel exports sin `/src/`:

**Antes:**

```typescript
import { EventPayload } from "@libs/common/src/interfaces";
import { createLogger } from "@libs/common/src/utils/logger.util";
import { RedisService } from "@libs/redis/src";
import { CurrentUser } from "@libs/decorators/src/current-user.decorator";
```

**Después:**

```typescript
import { EventPayload, createLogger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { CurrentUser } from "@libs/decorators";
```

## Scripts Creados

### fix-tsconfig-rootdir.sh

Remueve automáticamente `rootDir` de todos los `tsconfig.json` en `libs/`.

### fix-imports.sh

Corrige automáticamente todos los imports en el proyecto para usar los barrel exports correctos.

## ¿Por Qué Funciona?

En un monorepo con composite projects:

- **`composite: true`**: Habilita project references y builds incrementales
- **`include`**: Especifica qué archivos pertenecen a esta librería
- **`outDir`**: Controla dónde van los archivos compilados
- **`rootDir` (cuando está configurado)**: RESTRINGE el compilador solo a ese directorio, rompiendo imports cross-library

Al remover `rootDir`, TypeScript puede resolver imports desde `@libs/*` mientras solo compila los archivos especificados en `include`.

## Verificación

Ejecutar:

```bash
npm run build
```

Debe compilar sin errores de "file not under rootDir".

## Archivos Modificados

- tsconfig.json (base): Paths agregados para todas las librerías
- libs/\*/tsconfig.json: rootDir removido (10 archivos)
- libs/event-bus/tsconfig.lib.json: rootDir removido
- **392 archivos .ts**: Imports corregidos para usar barrel exports

## Fecha de Aplicación

2025-11-19
