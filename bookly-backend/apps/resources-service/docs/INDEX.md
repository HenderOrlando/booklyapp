# Resources Service - Índice de Documentación

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Requerimientos Funcionales](#requerimientos-funcionales)
- [Implementaciones Detalladas](#implementaciones-detalladas)
- [Base de Datos](#base-de-datos)
- [Auditoría](#auditoría)

---

## 🏗️ Arquitectura

### [ARCHITECTURE.md](./ARCHITECTURE.md)

**Descripción**: Arquitectura del servicio de recursos  
**Contenido**:

- Clean Architecture + CQRS
- Gestión de recursos físicos
- Categorización y programas académicos
- Ciclo de vida de recursos

### [RESOURCES_SERVICE.md](./RESOURCES_SERVICE.md)

**Descripción**: Documentación principal del servicio  
**Contenido**:

- Descripción general
- Responsabilidades del servicio
- APIs principales
- Flujos de negocio

---

## 📋 Requerimientos Funcionales

### [requirements/RF-01_CRUD_RECURSOS.md](./requirements/RF-01_CRUD_RECURSOS.md)

**RF-01**: Crear, editar y eliminar recursos

- CRUD completo de recursos
- Validaciones de negocio
- Soft delete

### [requirements/RF-02_ASOCIAR_CATEGORIA_PROGRAMA.md](./requirements/RF-02_ASOCIAR_CATEGORIA_PROGRAMA.md)

**RF-02**: Asociar recursos a categoría y programas

- Múltiples categorías por recurso
- Un programa académico por recurso
- Categorías mínimas no eliminables

### [requirements/RF-03_ATRIBUTOS_CLAVE.md](./requirements/RF-03_ATRIBUTOS_CLAVE.md)

**RF-03**: Definir atributos clave del recurso

- Capacidad, ubicación, descripción
- Atributos técnicos
- Equipamiento

### [requirements/RF-04_IMPORTACION_MASIVA.md](./requirements/RF-04_IMPORTACION_MASIVA.md)

**RF-04**: Importación masiva de recursos

- Formato CSV
- Validación de datos
- Reporte de errores

### [requirements/RF-05_REGLAS_DISPONIBILIDAD.md](./requirements/RF-05_REGLAS_DISPONIBILIDAD.md)

**RF-05**: Configuración de reglas de disponibilidad

- Horarios disponibles
- Excepciones y bloqueos
- Sincronización con availability-service

### [requirements/RF-06_MANTENIMIENTO_RECURSOS.md](./requirements/RF-06_MANTENIMIENTO_RECURSOS.md)

**RF-06**: Gestión de mantenimiento de recursos

- Tipos de mantenimiento
- Programación de mantenimiento
- Bloqueo de recursos durante mantenimiento

---

## 🚀 Implementaciones Detalladas

### RF-04: Importación Masiva

#### [RF04_IMPORTACION_CSV.md](./RF04_IMPORTACION_CSV.md)

**Descripción**: Implementación de importación CSV  
**Contenido**:

- Formato CSV estándar
- Parser y validaciones
- Manejo de errores
- Reporte de resultados

#### [RF04_IMPORTACION_CSV_ADVANCED.md](./RF04_IMPORTACION_CSV_ADVANCED.md)

**Descripción**: Funcionalidades avanzadas de importación  
**Contenido**:

- Validación de duplicados
- Actualización masiva
- Rollback en caso de error
- Procesamiento asíncrono

### RF-05: Reglas de Disponibilidad

#### [RF05_SINCRONIZACION_AVAILABILITY_RULES.md](./RF05_SINCRONIZACION_AVAILABILITY_RULES.md)

**Descripción**: Sincronización con availability-service  
**Contenido**:

- Eventos de sincronización
- Actualización de horarios
- Propagación de cambios

#### [RF05_SINCRONIZACION_AVAILABILITY_RULES_COMPLETE.md](./RF05_SINCRONIZACION_AVAILABILITY_RULES_COMPLETE.md)

**Descripción**: Implementación completa de sincronización  
**Contenido**:

- Event-Driven Architecture
- Consistencia eventual
- Manejo de conflictos

#### [RF05_EXTENSION_RESOURCE_LIFECYCLE.md](./RF05_EXTENSION_RESOURCE_LIFECYCLE.md)

**Descripción**: Extensión del ciclo de vida de recursos  
**Contenido**:

- Estados del recurso
- Transiciones de estado
- Validaciones por estado

### Resumen de Funcionalidades

#### [RF_COMPLETE_RESOURCES_SERVICE.md](./RF_COMPLETE_RESOURCES_SERVICE.md)

**Descripción**: Resumen completo de RFs implementados  
**Contenido**:

- Estado de cada RF
- Funcionalidades completadas
- Pendientes

#### [TODOS_COMPLETADOS.md](./TODOS_COMPLETADOS.md)

**Descripción**: Lista de TODOs completados  
**Contenido**:

- Tareas finalizadas
- Features implementadas
- Validaciones realizadas

---

## 🔍 Auditoría

### [PLAN_AUDITORIA_IMPLEMENTACION.md](./PLAN_AUDITORIA_IMPLEMENTACION.md)

**Descripción**: Plan de implementación de auditoría  
**Contenido**:

- Sistema de auditoría
- Decoradores @Audit
- Eventos de auditoría
- Tracking de cambios

### [PLAN_AUDITORIA_COMPLETADO.md](./PLAN_AUDITORIA_COMPLETADO.md)

**Descripción**: Auditoría implementada completamente  
**Contenido**:

- Resultados de implementación
- Validaciones realizadas
- Testing de auditoría

---

## 🗄️ Base de Datos

### [DATABASE.md](./DATABASE.md)

**Descripción**: Esquema de base de datos  
**Contenido**:

- Modelos Prisma
- Relaciones entre entidades
- Índices y optimizaciones
- Migraciones

---

## 🌱 Semillas

### [SEEDS.md](./SEEDS.md)

**Descripción**: Datos iniciales del sistema  
**Contenido**:

- Categorías de recursos
- Tipos de mantenimiento
- Recursos de ejemplo
- Programas académicos

---

## 🔄 Event Bus

### [EVENT_BUS.md](./EVENT_BUS.md)

**Descripción**: Eventos publicados y consumidos  
**Contenido**:

- Eventos de recursos (created, updated, deleted)
- Eventos de mantenimiento
- Eventos de importación
- Estructura de eventos

---

## 🔗 Endpoints

### [ENDPOINTS.md](./ENDPOINTS.md)

**Descripción**: API REST completa  
**Contenido**:

- CRUD de recursos
- Gestión de categorías
- Importación CSV
- Mantenimiento
- Disponibilidad

---

## 📚 Recursos Adicionales

- **Swagger UI**: `http://localhost:3002/api/docs`
- **Health Check**: `http://localhost:3002/api/v1/health`
- **Puerto**: 3002

---

## 🔧 Mantenimiento

Para actualizar esta documentación:

1. Editar archivos correspondientes
2. Actualizar este índice al agregar documentos
3. Mantener estructura consistente
4. Verificar enlaces funcionando

---

**Última actualización**: Noviembre 2024  
**Microservicio**: resources-service  
**Puerto**: 3002  
**Mantenido por**: Equipo Bookly
