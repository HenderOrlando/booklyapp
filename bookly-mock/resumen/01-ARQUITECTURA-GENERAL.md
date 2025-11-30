# 01 - Arquitectura General de Bookly

## 📋 Objetivo
Garantizar que todos los microservicios sigan los principios arquitectónicos definidos: **Clean Architecture**, **CQRS**, **Event-Driven Architecture (EDA)** y **Hexagonal Architecture**.

---

## ✅ Estado Actual en bookly-mock

### ✓ Implementado Correctamente

1. **Estructura de Carpetas por Microservicio**
   - ✅ `domain/` - Entidades, interfaces, repositorios
   - ✅ `application/` - Commands, queries, handlers, services
   - ✅ `infrastructure/` - Controllers, schemas, repositories, strategies

2. **Separación CQRS**
   - ✅ Commands en `application/commands/`
   - ✅ Queries en `application/queries/`
   - ✅ Handlers en `application/handlers/`

3. **Event-Driven Architecture**
   - ✅ Event Bus implementado en `libs/event-bus/`
   - ✅ Eventos de dominio en `domain/events/`
   - ✅ Event handlers en `application/event-handlers/`

4. **Librerías Compartidas**
   - ✅ `libs/common/` - Utilidades, constantes, enums
   - ✅ `libs/database/` - Conexión MongoDB
   - ✅ `libs/event-bus/` - Sistema de eventos
   - ✅ `libs/redis/` - Cache
   - ✅ `libs/notifications/` - Sistema de notificaciones
   - ✅ `libs/guards/` - Guards de autenticación
   - ✅ `libs/decorators/` - Decoradores personalizados
   - ✅ `libs/filters/` - Exception filters
   - ✅ `libs/interceptors/` - Interceptores
   - ✅ `libs/idempotency/` - Control de idempotencia

---

## 🎯 Tareas por Completar

### Tarea 1.1: Verificar Consistencia de Estructura en Todos los Servicios

**Objetivo**: Asegurar que todos los microservicios tengan la misma estructura de carpetas.

**Servicios a verificar**:
- ✅ auth-service
- ✅ resources-service
- ✅ availability-service
- ⚠️ stockpile-service (verificar completitud)
- ⚠️ reports-service (verificar completitud)
- ⚠️ api-gateway (estructura diferente por naturaleza)

**Checklist por servicio**:
```
src/
├── domain/
│   ├── entities/
│   ├── events/
│   └── repositories/
├── application/
│   ├── commands/
│   ├── queries/
│   ├── handlers/
│   ├── services/
│   └── dtos/
└── infrastructure/
    ├── controllers/
    ├── schemas/
    ├── repositories/
    ├── dto/
    └── strategies/
```

**Acción**: Revisar cada servicio y crear carpetas faltantes si es necesario.

---

### Tarea 1.2: Validar Patrón CQRS en Todos los Handlers

**Objetivo**: Asegurar que los handlers solo ejecuten servicios y no contengan lógica de negocio.

**Regla**: 
```typescript
// ✅ CORRECTO
@CommandHandler(CreateResourceCommand)
export class CreateResourceHandler {
  async execute(command: CreateResourceCommand) {
    return await this.resourceService.create(command);
  }
}

// ❌ INCORRECTO - Lógica de negocio en handler
@CommandHandler(CreateResourceCommand)
export class CreateResourceHandler {
  async execute(command: CreateResourceCommand) {
    if (command.capacity < 0) throw new Error(); // ❌ Validación aquí
    const resource = new Resource(command); // ❌ Creación aquí
    return await this.repository.save(resource); // ❌ Acceso directo a repo
  }
}
```

**Acción**: Auditar todos los handlers en:
- `apps/auth-service/src/application/handlers/`
- `apps/resources-service/src/application/handlers/`
- `apps/availability-service/src/application/handlers/`
- `apps/stockpile-service/src/application/handlers/`
- `apps/reports-service/src/application/handlers/`

---

### Tarea 1.3: Implementar Alias de Importación en Todos los Archivos

**Objetivo**: Usar alias `@libs/`, `@app/` en lugar de rutas relativas.

**Regla**:
```typescript
// ✅ CORRECTO
import { ResponseUtil } from '@libs/common';
import { EventBus } from '@libs/event-bus';
import { ResourceService } from '@app/application/services';

// ❌ INCORRECTO
import { ResponseUtil } from '../../../libs/common';
import { EventBus } from '../../../../libs/event-bus';
```

**Acción**: 
1. Verificar `tsconfig.json` tiene los paths configurados
2. Ejecutar script de fix-imports si existe
3. Auditar imports en todos los servicios

---

### Tarea 1.4: Validar Separación de Responsabilidades

**Objetivo**: Controllers → Handlers → Services → Repositories

**Flujo correcto**:
```
Controller (HTTP)
    ↓
Handler (CQRS)
    ↓
Service (Lógica de negocio)
    ↓
Repository (Persistencia)
```

**Regla**: 
- Controllers solo llaman a handlers
- Handlers solo llaman a services
- Services contienen toda la lógica de negocio
- Repositories solo acceden a la base de datos

**Acción**: Revisar que no existan ciclos como:
- Controller → Service → Handler → Service ❌
- Handler → Repository directo (sin service) ❌

---

### Tarea 1.5: Documentar Arquitectura de Cada Microservicio

**Objetivo**: Cada servicio debe tener su `ARCHITECTURE.md` actualizado.

**Contenido requerido**:
1. Diagrama de capas (Domain, Application, Infrastructure)
2. Flujo de datos (Request → Response)
3. Eventos publicados y consumidos
4. Dependencias con otros servicios
5. Patrones aplicados (CQRS, Event Sourcing, etc.)

**Acción**: Verificar y actualizar:
- `apps/auth-service/docs/ARCHITECTURE.md` ✅
- `apps/resources-service/docs/ARCHITECTURE.md` ✅
- `apps/availability-service/docs/ARCHITECTURE.md` ⚠️
- `apps/stockpile-service/docs/ARCHITECTURE.md` ⚠️
- `apps/reports-service/docs/ARCHITECTURE.md` ⚠️

---

## 📊 Métricas de Cumplimiento

| Aspecto | Estado | Prioridad |
|---------|--------|-----------|
| Estructura de carpetas | 80% | Alta |
| Patrón CQRS | 90% | Alta |
| Alias de imports | 70% | Media |
| Separación de responsabilidades | 85% | Alta |
| Documentación arquitectura | 60% | Media |

---

## 🔗 Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

**Última actualización**: 30 de noviembre de 2024  
**Responsable**: Equipo Bookly  
**Siguiente revisión**: Tarea 1.1
