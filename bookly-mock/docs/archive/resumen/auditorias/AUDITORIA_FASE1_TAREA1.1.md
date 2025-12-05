# Auditoría Fase 1 - Tarea 1.1: Estructura de Carpetas

**Fecha**: 30 de noviembre de 2024  
**Responsable**: Equipo Bookly  
**Objetivo**: Verificar consistencia de estructura en todos los microservicios

---

## 📋 Estructura Esperada

```text
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

---

## ✅ auth-service

### Estado: **COMPLETO** ✅

**Estructura actual**:
```
src/
├── domain/
│   ├── entities/ ✅
│   ├── events/ ✅
│   └── repositories/ ✅
├── application/
│   ├── commands/ ✅
│   ├── queries/ ✅
│   ├── handlers/ ✅
│   ├── services/ ✅
│   └── dtos/ ✅
└── infrastructure/
    ├── controllers/ ✅
    ├── schemas/ ✅
    ├── repositories/ ✅
    ├── dto/ ✅
    ├── strategies/ ✅
    ├── decorators/ ✅ (extra)
    ├── filters/ ✅ (extra)
    ├── guards/ ✅ (extra)
    └── interceptors/ ✅ (extra)
```

**Tests**:

- ✅ `test/unit/services/` presente

**Notas**:

- Estructura completa y bien organizada
- Incluye carpetas adicionales útiles (decorators, filters, guards, interceptors)
- Tiene tests unitarios

---

## ⚠️ resources-service

### Estado: **INCOMPLETO** ⚠️

**Estructura actual**:
```
src/
├── domain/
│   ├── entities/ ✅
│   ├── events/ ❌ FALTA
│   └── repositories/ ✅
├── application/
│   ├── commands/ ✅
│   ├── queries/ ✅
│   ├── handlers/ ✅
│   ├── services/ ✅
│   ├── dtos/ ❌ FALTA
│   ├── events/ ✅ (debería estar en domain/)
│   └── event-handlers/ ✅
└── infrastructure/
    ├── controllers/ ✅
    ├── schemas/ ✅
    ├── repositories/ ✅
    ├── dto/ ✅
    └── strategies/ ✅
```

**Problemas detectados**:
1. ❌ Falta `domain/events/` - Los eventos están en `application/events/` (debería moverse)
2. ❌ Falta `application/dtos/` - Los DTOs están solo en `infrastructure/dto/`

**Acciones requeridas**:

- [ ] Crear `src/domain/events/`
- [ ] Mover eventos de `application/events/` a `domain/events/`
- [ ] Crear `src/application/dtos/`
- [ ] Evaluar si algunos DTOs de `infrastructure/dto/` deberían estar en `application/dtos/`

---

## ⚠️ availability-service

### Estado: **INCOMPLETO** ⚠️

**Estructura actual**:
```
src/
├── domain/
│   ├── entities/ ✅
│   ├── events/ ✅
│   ├── repositories/ ✅
│   └── interfaces/ ✅ (extra)
├── application/
│   ├── commands/ ✅
│   ├── queries/ ✅
│   ├── handlers/ ✅
│   ├── services/ ✅
│   ├── dtos/ ❌ FALTA
│   └── events/ ✅ (duplicado con domain/events)
└── infrastructure/
    ├── controllers/ ✅
    ├── schemas/ ✅
    ├── repositories/ ✅
    ├── dtos/ ✅ (debería ser dto/)
    ├── strategies/ ✅
    └── cron/ ✅ (extra)
```

**Problemas detectados**:
1. ❌ Falta `application/dtos/`
2. ⚠️ Tiene `application/events/` y `domain/events/` - Posible duplicación
3. ⚠️ `infrastructure/dtos/` debería ser `infrastructure/dto/` (singular)

**Acciones requeridas**:

- [ ] Crear `src/application/dtos/`
- [ ] Verificar si hay duplicación entre `application/events/` y `domain/events/`
- [ ] Renombrar `infrastructure/dtos/` a `infrastructure/dto/`

---

## ⚠️ stockpile-service

### Estado: **INCOMPLETO** ⚠️

**Estructura actual**:
```
src/
├── domain/
│   ├── entities/ ✅
│   ├── events/ ❌ FALTA
│   └── repositories/ ✅
├── application/
│   ├── commands/ ✅
│   ├── queries/ ✅
│   ├── handlers/ ✅
│   ├── services/ ✅
│   └── dto/ ✅ (debería ser dtos/)
└── infrastructure/
    ├── controllers/ ✅
    ├── schemas/ ✅
    ├── repositories/ ✅
    ├── dtos/ ✅ (debería ser dto/)
    ├── strategies/ ✅
    ├── clients/ ✅ (extra)
    ├── event-handlers/ ✅
    ├── gateways/ ✅ (extra)
    ├── handlers/ ⚠️ (duplicado con application/handlers?)
    ├── interceptors/ ✅ (extra)
    └── services/ ⚠️ (duplicado con application/services?)
```

**Problemas detectados**:
1. ❌ Falta `domain/events/`
2. ⚠️ `application/dto/` debería ser `application/dtos/` (plural)
3. ⚠️ `infrastructure/dtos/` debería ser `infrastructure/dto/` (singular)
4. ⚠️ `infrastructure/handlers/` - Posible duplicación con `application/handlers/`
5. ⚠️ `infrastructure/services/` - Posible duplicación con `application/services/`

**Acciones requeridas**:

- [ ] Crear `src/domain/events/`
- [ ] Renombrar `application/dto/` a `application/dtos/`
- [ ] Renombrar `infrastructure/dtos/` a `infrastructure/dto/`
- [ ] Investigar `infrastructure/handlers/` y determinar si debe eliminarse o renombrarse
- [ ] Investigar `infrastructure/services/` y determinar si debe eliminarse o renombrarse

---

## ⚠️ reports-service

### Estado: **INCOMPLETO** ⚠️

**Estructura actual**:
```
src/
├── domain/
│   ├── entities/ ✅
│   ├── events/ ❌ FALTA
│   └── repositories/ ✅
├── application/
│   ├── commands/ ✅
│   ├── queries/ ✅
│   ├── handlers/ ✅
│   ├── services/ ✅
│   └── dtos/ ❌ FALTA
└── infrastructure/
    ├── controllers/ ✅
    ├── schemas/ ✅
    ├── repositories/ ✅
    ├── dto/ ✅
    ├── dtos/ ⚠️ (duplicado con dto/)
    ├── strategies/ ✅
    └── consumers/ ✅ (extra)
```

**Problemas detectados**:
1. ❌ Falta `domain/events/`
2. ❌ Falta `application/dtos/`
3. ⚠️ Tiene `infrastructure/dto/` y `infrastructure/dtos/` - Duplicación

**Acciones requeridas**:

- [ ] Crear `src/domain/events/`
- [ ] Crear `src/application/dtos/`
- [ ] Consolidar `infrastructure/dto/` y `infrastructure/dtos/` en `infrastructure/dto/`

---

## 📊 Resumen de Cumplimiento

| Servicio | Cumplimiento | Problemas Críticos | Problemas Menores |
|----------|--------------|-------------------|-------------------|
| auth-service | 100% ✅ | 0 | 0 |
| resources-service | 85% ⚠️ | 2 | 0 |
| availability-service | 85% ⚠️ | 1 | 2 |
| stockpile-service | 70% ⚠️ | 1 | 4 |
| reports-service | 75% ⚠️ | 2 | 1 |
| **PROMEDIO** | **83%** | **6** | **7** |

---

## 🎯 Prioridades de Corrección

### Prioridad Alta (Crítico)

1. Crear `domain/events/` en todos los servicios que no lo tienen
2. Crear `application/dtos/` en servicios que no lo tienen
3. Eliminar duplicaciones de carpetas

### Prioridad Media

1. Estandarizar nombres (dto vs dtos)
2. Investigar carpetas duplicadas (handlers, services en infrastructure)
3. Mover eventos de application/ a domain/ donde corresponda

### Prioridad Baja

1. Documentar carpetas extras útiles (decorators, filters, guards, etc.)
2. Crear tests/ en servicios que no lo tienen

---

## 📝 Próximos Pasos

1. **Semana 1**: Corregir problemas críticos en resources-service y reports-service
2. **Semana 2**: Corregir problemas en availability-service y stockpile-service
3. **Semana 3**: Estandarizar nombres y eliminar duplicaciones
4. **Semana 4**: Validar y documentar estructura final

---

**Estado de la tarea**: En progreso  
**Última actualización**: 30 de noviembre de 2024
