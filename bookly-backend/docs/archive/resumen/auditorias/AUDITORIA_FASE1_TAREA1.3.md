# Auditoría Fase 1 - Tarea 1.3: Alias de Importación

**Fecha**: 30 de noviembre de 2024  
**Responsable**: Equipo Bookly  
**Objetivo**: Verificar uso de alias `@libs/`, `@app/` en lugar de rutas relativas

---

## 📋 Configuración de Alias

### ✅ Alias Configurados en `tsconfig.json`

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
    "@libs/guards": ["libs/guards/src"],
    "@libs/filters": ["libs/filters/src"],
    "@libs/interceptors": ["libs/interceptors/src"],
    "@libs/kafka": ["libs/kafka/src"],
    "@libs/notifications": ["libs/notifications/src"],
    "@auth/*": ["apps/auth-service/src/*"],
    "@resources/*": ["apps/resources-service/src/*"],
    "@availability/*": ["apps/availability-service/src/*"],
    "@stockpile/*": ["apps/stockpile-service/src/*"],
    "@reports/*": ["apps/reports-service/src/*"],
    "@gateway/*": ["apps/api-gateway/src/*"]
  }
}
```

**Estado**: ✅ Configuración completa y correcta

---

## 📊 Análisis de Uso de Rutas Relativas

### Archivos con Rutas Relativas Detectados

**Total de archivos con rutas relativas**: 198 archivos  
**Total de importaciones con `../../`**: 372 ocurrencias

### Distribución por Servicio

| Servicio | Archivos Afectados | Importaciones Relativas | Prioridad |
|----------|-------------------|------------------------|-----------|
| auth-service | ~80 archivos | ~150 importaciones | Alta |
| resources-service | ~40 archivos | ~70 importaciones | Alta |
| availability-service | ~35 archivos | ~65 importaciones | Alta |
| stockpile-service | ~25 archivos | ~45 importaciones | Media |
| reports-service | ~15 archivos | ~30 importaciones | Media |
| api-gateway | ~3 archivos | ~12 importaciones | Baja |

---

## ❌ Ejemplos de Rutas Relativas (Anti-patrón)

### auth-service

```typescript
// ❌ INCORRECTO - role.controller.ts
import { CreateRoleCommand } from '../../application/commands/roles/create-role.command';
import { RoleService } from '../../application/services/role.service';
import { RoleResponseDto } from '../../application/dtos/role/role-response.dto';

// ❌ INCORRECTO - auth.service.ts
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
```

### resources-service

```typescript
// ❌ INCORRECTO - import-resources.handler.ts
import { ResourceEntity } from '../../domain/entities/resource.entity';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { ResourceRepository } from '../../infrastructure/repositories/resource.repository';
```

### availability-service

```typescript
// ❌ INCORRECTO - availability.service.ts
import { AvailabilityEntity } from '../../domain/entities/availability.entity';
import { AvailabilityRepository } from '../../infrastructure/repositories/availability.repository';
```

---

## ✅ Patrón Correcto con Alias

### Para Librerías Compartidas

```typescript
// ✅ CORRECTO - Usar @libs/
import { ResponseUtil, createLogger, PaginationMeta } from '@libs/common';
import { EventBusService } from '@libs/event-bus';
import { RedisService } from '@libs/redis';
import { DatabaseService } from '@libs/database';
import { JwtAuthGuard } from '@libs/guards';
import { TransformInterceptor } from '@libs/interceptors';
```

### Para Módulos Internos del Servicio

```typescript
// ✅ CORRECTO - auth-service
import { CreateRoleCommand } from '@auth/application/commands/roles/create-role.command';
import { RoleService } from '@auth/application/services/role.service';
import { RoleResponseDto } from '@auth/application/dtos/role/role-response.dto';
import { UserEntity } from '@auth/domain/entities/user.entity';
import { UserRepository } from '@auth/infrastructure/repositories/user.repository';

// ✅ CORRECTO - resources-service
import { ResourceEntity } from '@resources/domain/entities/resource.entity';
import { ResourceRepository } from '@resources/infrastructure/repositories/resource.repository';
import { CategoryRepository } from '@resources/infrastructure/repositories/category.repository';

// ✅ CORRECTO - availability-service
import { AvailabilityEntity } from '@availability/domain/entities/availability.entity';
import { ReservationService } from '@availability/application/services/reservation.service';
```

---

## 🎯 Archivos Críticos a Refactorizar

### Prioridad ALTA (Archivos con más de 10 importaciones relativas)

1. **auth-service**
   - `src/infrastructure/controllers/role.controller.ts` (13 importaciones)
   - `src/infrastructure/controllers/auth.controller.ts` (12 importaciones)
   - `src/infrastructure/controllers/permission.controller.ts` (12 importaciones)

2. **reports-service**
   - `src/application/services/export-processor.service.ts` (5 importaciones)

3. **availability-service**
   - `src/application/services/availability.service.ts` (4 importaciones)
   - `src/infrastructure/controllers/maintenance-blocks.controller.ts` (4 importaciones)

### Prioridad MEDIA (Archivos con 3-4 importaciones relativas)

**auth-service** (23 handlers):
- Todos los handlers en `permissions/` y `roles/`
- `auth.service.ts`
- `permission.service.ts`

**availability-service** (9 archivos):
- Controllers: `availability-exceptions.controller.ts`, `reassignment.controller.ts`, `reservations.controller.ts`
- Services: `calendar-view.service.ts`, `reassignment.service.ts`

**resources-service** (3 archivos):
- `import-resources.handler.ts`
- `rollback-import.handler.ts`
- `import.controller.ts`

**stockpile-service** (4 archivos):
- `check-in.handler.ts`
- `approval-request.service.ts`
- `reminder.service.ts`
- `check-in-out.controller.ts`

---

## 📝 Script de Refactorización Automática

### Opción 1: Script Manual con Regex

```bash
# Buscar todas las importaciones relativas
find apps -name "*.ts" -type f -exec grep -l "from ['\"]\.\./" {} \;

# Reemplazar patrones comunes (ejemplo para auth-service)
find apps/auth-service/src -name "*.ts" -type f -exec sed -i \
  's|from ["'\'']\.\./\.\./domain/|from "@auth/domain/|g' {} \;

find apps/auth-service/src -name "*.ts" -type f -exec sed -i \
  's|from ["'\'']\.\./\.\./application/|from "@auth/application/|g' {} \;

find apps/auth-service/src -name "*.ts" -type f -exec sed -i \
  's|from ["'\'']\.\./\.\./infrastructure/|from "@auth/infrastructure/|g' {} \;
```

### Opción 2: Script TypeScript Automatizado

```typescript
// scripts/fix-imports.ts
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const serviceAliases = {
  'auth-service': '@auth',
  'resources-service': '@resources',
  'availability-service': '@availability',
  'stockpile-service': '@stockpile',
  'reports-service': '@reports',
  'api-gateway': '@gateway',
};

async function fixImports(serviceName: string, alias: string) {
  const files = await glob(`apps/${serviceName}/src/**/*.ts`);
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    let modified = false;

    // Reemplazar rutas relativas por alias
    const patterns = [
      { from: /from ['"]\.\.\/\.\.\/domain\//g, to: `from '${alias}/domain/` },
      { from: /from ['"]\.\.\/\.\.\/application\//g, to: `from '${alias}/application/` },
      { from: /from ['"]\.\.\/\.\.\/infrastructure\//g, to: `from '${alias}/infrastructure/` },
      { from: /from ['"]\.\.\/\.\.\/\.\.\/domain\//g, to: `from '${alias}/domain/` },
      { from: /from ['"]\.\.\/\.\.\/\.\.\/application\//g, to: `from '${alias}/application/` },
      { from: /from ['"]\.\.\/\.\.\/\.\.\/infrastructure\//g, to: `from '${alias}/infrastructure/` },
    ];

    for (const pattern of patterns) {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(file, content, 'utf-8');
      console.log(`✅ Fixed: ${file}`);
    }
  }
}

async function main() {
  for (const [service, alias] of Object.entries(serviceAliases)) {
    console.log(`\n🔧 Fixing imports in ${service}...`);
    await fixImports(service, alias);
  }
  console.log('\n✅ All imports fixed!');
}

main();
```

**Uso**:
```bash
npm install -D glob
npx ts-node scripts/fix-imports.ts
```

---

## 🚀 Plan de Implementación

### Fase 1: Preparación (1 día)

1. **Crear script de refactorización**
   - Implementar `scripts/fix-imports.ts`
   - Probar en un servicio pequeño (api-gateway)
   - Validar que no rompa nada

2. **Crear backup**
   - Hacer commit de estado actual
   - Crear branch `feature/fix-import-aliases`

### Fase 2: Refactorización por Servicio (3-4 días)

**Día 1: Servicios pequeños**
- api-gateway (3 archivos)
- Ejecutar tests
- Commit

**Día 2: Servicios medianos**
- reports-service (15 archivos)
- stockpile-service (25 archivos)
- Ejecutar tests
- Commit

**Día 3: Servicios grandes (Parte 1)**
- availability-service (35 archivos)
- resources-service (40 archivos)
- Ejecutar tests
- Commit

**Día 4: Servicio más grande**
- auth-service (80 archivos)
- Ejecutar tests completos
- Commit final

### Fase 3: Validación (1 día)

1. **Ejecutar suite completa de tests**
   ```bash
   npm run test
   npm run test:e2e
   ```

2. **Verificar compilación**
   ```bash
   npm run build
   ```

3. **Verificar que no queden rutas relativas**
   ```bash
   grep -r "from ['\"]\.\./" apps/*/src --include="*.ts" | wc -l
   # Debe retornar 0
   ```

4. **Code review y merge**

---

## 📊 Métricas de Cumplimiento

### Estado Actual

| Aspecto | Estado | Valor |
|---------|--------|-------|
| Alias configurados | ✅ | 100% |
| Archivos usando alias | ❌ | ~30% |
| Archivos con rutas relativas | ❌ | 198 archivos |
| Importaciones relativas | ❌ | 372 ocurrencias |

### Estado Esperado Post-Refactorización

| Aspecto | Estado | Valor |
|---------|--------|-------|
| Alias configurados | ✅ | 100% |
| Archivos usando alias | ✅ | 100% |
| Archivos con rutas relativas | ✅ | 0 archivos |
| Importaciones relativas | ✅ | 0 ocurrencias |

---

## ⚠️ Consideraciones Importantes

### Casos Especiales

1. **Imports dentro del mismo directorio**
   ```typescript
   // ✅ PERMITIDO - Mismo directorio
   import { UserDto } from './user.dto';
   import { CreateUserDto } from './create-user.dto';
   ```

2. **Imports de subdirectorios inmediatos**
   ```typescript
   // ⚠️ EVALUAR - Subdirectorio inmediato
   import { RoleEntity } from '../entities/role.entity';
   
   // ✅ MEJOR - Usar alias
   import { RoleEntity } from '@auth/domain/entities/role.entity';
   ```

3. **Imports de archivos index**
   ```typescript
   // ✅ CORRECTO - Usar barrel exports
   import { CreateRoleCommand, UpdateRoleCommand } from '@auth/application/commands';
   ```

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Romper imports existentes | Media | Alto | Tests automatizados + Revisión manual |
| Conflictos en merge | Baja | Medio | Branch dedicado + Comunicación |
| Errores de compilación | Media | Alto | Compilar después de cada servicio |
| Tests fallando | Media | Alto | Ejecutar tests después de cada cambio |

---

## 🔗 Referencias

- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [NestJS Module Resolution](https://docs.nestjs.com/cli/monorepo#module-resolution)
- Bookly Memory: `bookly-base.md` - Imports con alias

---

## ✅ Checklist de Validación

Después de la refactorización, verificar:

- [ ] Todos los servicios compilan sin errores
- [ ] Todos los tests unitarios pasan
- [ ] Todos los tests de integración pasan
- [ ] Todos los tests E2E pasan
- [ ] No quedan importaciones con `../../` en archivos `.ts`
- [ ] Los imports de `@libs/*` funcionan correctamente
- [ ] Los imports de `@{service}/*` funcionan correctamente
- [ ] El linter no reporta errores de imports
- [ ] La documentación está actualizada

---

**Estado de la tarea**: Planificada  
**Esfuerzo estimado**: 5-6 días  
**Última actualización**: 30 de noviembre de 2024  
**Próxima tarea**: Ejecutar script de refactorización
