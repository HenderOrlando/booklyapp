# 📚 Índice de Documentación - Bookly Frontend

> Guía completa de toda la documentación disponible  
> **Última actualización**: Nov 2025

---

## 🎯 Documentación Principal (Activa)

### Esenciales

1. **[README.md](../README.md)** 📖
   - Documentación principal del proyecto
   - Stack tecnológico
   - Inicio rápido
   - Scripts disponibles
   - Estado del proyecto (100% completo)

2. **[ARCHITECTURE.md](./architecture-and-standards/ARCHITECTURE.md)** 🏗️
   - Principios de diseño (9 aspectos de calidad)
   - Estructura del proyecto
   - Atomic Design pattern
   - Flujo de datos
   - Patrones de componentes

3. **[BEST_PRACTICES.md](./architecture-and-standards/BEST_PRACTICES.md)** ✅
   - Componentes React
   - TypeScript
   - Hooks
   - Estado y Data Fetching
   - Estilos con TailwindCSS
   - Performance
   - Accesibilidad
   - Testing
   - Git y Commits

4. **[TESTING.md](./architecture-and-standards/TESTING.md)** 🧪
   - Estrategia de testing
   - Tests unitarios
   - Tests de integración
   - Tests E2E
   - Coverage
   - Utilidades y mocks

5. **[PERFORMANCE.md](./architecture-and-standards/PERFORMANCE.md)** ⚡
   - Core Web Vitals
   - Code splitting
   - Memoization
   - Virtual scrolling
   - Image optimization
   - Bundle optimization

6. **[PENDIENTES.md](./project-management/PENDIENTES.md)** 📋
   - 106 TODOs consolidados
   - Priorización por categoría
   - Análisis de impacto
   - Roadmap de implementación

---

## 📑 Documentación de Planificación

### Planes de Implementación por Servicio

7. **[00_PLAN_GENERAL.md](./archive/plans/00_PLAN_GENERAL.md)** 🗺️
   - Visión general del proyecto
   - Arquitectura del sistema
   - Stack tecnológico
   - Roadmap completo

8. **[01_AUTH_SERVICE.md](./api-integration/01_AUTH_SERVICE.md)** 🔐
   - RF-41 a RF-45
   - Autenticación tradicional y SSO
   - Gestión de usuarios, roles y permisos
   - Sistema de auditoría
   - 2FA

9. **[02_RESOURCES_SERVICE.md](./api-integration/02_RESOURCES_SERVICE.md)** 🏢
   - RF-01 a RF-06
   - CRUD de recursos físicos
   - Gestión de categorías
   - Importación/exportación CSV
   - Sistema de mantenimiento

10. **[03_AVAILABILITY_SERVICE.md](./api-integration/03_AVAILABILITY_SERVICE.md)** 📅
    - RF-07 a RF-19
    - Gestión de reservas
    - Calendario y visualización
    - Reservas recurrentes
    - Lista de espera
    - Reasignación de recursos

11. **[04_STOCKPILE_SERVICE.md](./api-integration/04_STOCKPILE_SERVICE.md)** ✅
    - RF-20 a RF-28
    - Flujos de aprobación
    - Check-in/Check-out digital
    - Generación de documentos PDF
    - Notificaciones multi-canal
    - Panel de vigilancia

12. **[05_REPORTS_SERVICE.md](./api-integration/05_REPORTS_SERVICE.md)** 📊
    - RF-31 a RF-37
    - Reportes de uso
    - Dashboards interactivos
    - Exportación de datos
    - Sistema de feedback

13. **[06_API_GATEWAY.md](./api-integration/06_API_GATEWAY.md)** 🌐
    - WebSocket tiempo real
    - Sistema de notificaciones
    - Event streaming
    - Health checks
    - Métricas de sistema
    - [CONFIGURACION_BACKEND.md](./api-integration/CONFIGURACION_BACKEND.md) - Guía para conexión.
    - [API_RESPONSE_STRUCTURE.md](./api-integration/API_RESPONSE_STRUCTURE.md) - Estructura global.

---

### Documentación Archivada

> Documentos de procesos completados - Movidos a `/docs/archive/`

#### Planes completados (`archive/plans/`)

- LIMPIEZA_COMPLETADA.md
- TODOS_CRITICOS_IMPLEMENTADOS.md

#### Soluciones a errores críticos (`archive/fixes/`)

- FIX_MISSING_SIDENAV.md
- FIX_ROLE_VALIDATION.md
- FIX_SESSION_PERSISTENCE.md

---

## 🔍 Guía de Uso por Tipo de Usuario

### Para Nuevos Desarrolladores

**Orden de lectura recomendado:**

1. **README.md** - Empezar aquí
2. **ARCHITECTURE.md** - Entender la estructura
3. **BEST_PRACTICES.md** - Aprender las convenciones
4. **00_PLAN_GENERAL.md** - Ver el panorama completo
5. **TESTING.md** - Cómo hacer tests

**Tiempo estimado**: 2-3 horas

---

### Para Product Owners

**Documentos clave:**

1. **README.md** - Estado del proyecto
2. **00_PLAN_GENERAL.md** - Roadmap y features
3. **PENDIENTES.md** - Backlog de TODOs
4. **01-06\_\*\_SERVICE.md** - Detalles por módulo

**Tiempo estimado**: 1-2 horas

---

### Para Tech Leads

**Revisión técnica:**

1. **ARCHITECTURE.md** - Decisiones arquitectónicas
2. **BEST_PRACTICES.md** - Estándares de código
3. **PERFORMANCE.md** - Optimizaciones
4. **TESTING.md** - Estrategia de testing
5. **PENDIENTES.md** - Deuda técnica

**Tiempo estimado**: 3-4 horas

---

### Para QA/Testers

**Testing focus:**

1. **TESTING.md** - Estrategia completa
2. **01-06\_\*\_SERVICE.md** - Funcionalidades por servicio
3. **PENDIENTES.md** - Features pendientes
4. **BEST_PRACTICES.md** - Comportamientos esperados

**Tiempo estimado**: 2 horas

---

## 📊 Estadísticas de Documentación

### Documentación Activa

| Categoría        | Archivos | Páginas Est. | Estado      |
| ---------------- | -------- | ------------ | ----------- |
| Principal        | 6        | ~150         | ✅ Completo |
| Planificación    | 7        | ~200         | ✅ Completo |
| **Total Activa** | **13**   | **~350**     | **✅ 100%** |

### Documentación Archivada

| Categoría         | Archivos | Estado           |
| ----------------- | -------- | ---------------- |
| Implementaciones  | 8        | ✅ Completado    |
| Procesos          | 19       | ✅ Completado    |
| **Total Archivo** | **27**   | **✅ Archivado** |

---

## 🔄 Mantenimiento de Documentación

### Cada Sprint

- [ ] Revisar PENDIENTES.md
- [ ] Actualizar README.md si hay cambios mayores
- [ ] Archivar documentos de procesos completados

### Cada Release

- [ ] Actualizar ARCHITECTURE.md si hay cambios estructurales
- [ ] Revisar BEST_PRACTICES.md
- [ ] Actualizar estadísticas en README.md
- [ ] Revisar PERFORMANCE.md con métricas reales

### Cada Quarter

- [ ] Auditoría completa de documentación
- [ ] Eliminar documentos obsoletos
- [ ] Consolidar información duplicada
- [ ] Actualizar todos los índices

---

## 📝 Plantillas de Documentación

### Para Nuevas Features

```markdown
# Feature: [Nombre]

## Objetivo

[Descripción breve]

## Requerimientos

- [ ] RF-XX: [Descripción]
- [ ] RNF-XX: [Descripción]

## Implementación

[Detalles técnicos]

## Tests

[Estrategia de testing]

## Referencias

- [Link a documentación relevante]
```

### Para Fixes/Bugs

```markdown
# Fix: [Descripción Breve]

## Problema

[Descripción del bug]

## Causa Raíz

[Análisis técnico]

## Solución

[Implementación del fix]

## Prevención

[Cómo evitar en el futuro]
```

---

## 🎯 Próximos Pasos de Documentación

### Q1 2026

- [ ] Agregar ADRs (Architecture Decision Records)
- [ ] Crear guías de troubleshooting
- [ ] Documentar flujos de CI/CD
- [ ] Agregar diagramas de arquitectura

### Q2 2026

- [ ] Completar Storybook con todos los componentes
- [ ] Crear videos tutoriales
- [ ] Documentar patrones de migración
- [ ] API documentation completa

---

## 🔗 Enlaces Útiles

### Documentación Externa

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Repositorio

- [GitHub](https://github.com/tu-org/bookly-monorepo)
- [Issues](https://github.com/tu-org/bookly-monorepo/issues)
- [Pull Requests](https://github.com/tu-org/bookly-monorepo/pulls)

### Backend API

- **Swagger UI**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/v1/health`

---

## ❓ FAQ

### ¿Dónde encuentro la arquitectura del proyecto?

Ver [ARCHITECTURE.md](./architecture-and-standards/ARCHITECTURE.md)

### ¿Cómo hago tests?

Ver [TESTING.md](./architecture-and-standards/TESTING.md)

### ¿Cuáles son las convenciones de código?

Ver [BEST_PRACTICES.md](./architecture-and-standards/BEST_PRACTICES.md)

### ¿Qué TODOs hay pendientes?

Ver [PENDIENTES.md](./project-management/PENDIENTES.md)

### ¿Cómo mejoro la performance?

Ver [PERFORMANCE.md](./architecture-and-standards/PERFORMANCE.md)

---

**Mantenido por**: Tech Lead  
**Última revisión**: Nov 2025  
**Próxima revisión**: Dic 2025
