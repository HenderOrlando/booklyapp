# Availability Service - Índice de Documentación

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Requerimientos Funcionales](#requerimientos-funcionales)
- [Implementaciones Detalladas](#implementaciones-detalladas)
- [Base de Datos](#base-de-datos)
- [Resúmenes de Sprint](#resúmenes-de-sprint)

---

## 🏗️ Arquitectura

### [ARCHITECTURE.md](./ARCHITECTURE.md)

**Descripción**: Arquitectura del servicio de disponibilidad y reservas  
**Contenido**:

- Clean Architecture + CQRS
- Gestión de disponibilidad de recursos
- Sistema de reservas
- Integración con calendarios externos

### [AVAILABILITY_SERVICE.md](./AVAILABILITY_SERVICE.md)

**Descripción**: Documentación principal del servicio  
**Contenido**:

- Descripción general
- Responsabilidades
- APIs principales
- Flujos de negocio

---

## 📋 Requerimientos Funcionales

### [requirements/RF-07_CONFIGURAR_DISPONIBILIDAD.md](./requirements/RF-07_CONFIGURAR_DISPONIBILIDAD.md)

**RF-07**: Configurar horarios disponibles

- Definición de horarios de recursos
- Excepciones y bloqueos
- Reglas de disponibilidad

### [requirements/RF-08_INTEGRACION_CALENDARIOS.md](./requirements/RF-08_INTEGRACION_CALENDARIOS.md)

**RF-08**: Integración con calendarios externos

- Google Calendar
- Outlook Calendar
- Sincronización bidireccional

### [requirements/RF-09_BUSQUEDA_AVANZADA.md](./requirements/RF-09_BUSQUEDA_AVANZADA.md)

**RF-09**: Búsqueda avanzada de disponibilidad

- Filtros múltiples
- Búsqueda por criterios
- Optimización de queries

### [requirements/RF-10_VISUALIZACION_CALENDARIO.md](./requirements/RF-10_VISUALIZACION_CALENDARIO.md)

**RF-10**: Visualización en formato calendario

- Vista mensual/semanal/diaria
- Exportación de calendarios
- Formatos iCal

### [requirements/RF-11_HISTORIAL_USO.md](./requirements/RF-11_HISTORIAL_USO.md)

**RF-11**: Registro del historial de uso

- Auditoría de reservas
- Historial completo
- Trazabilidad

### [requirements/RF-12_RESERVAS_PERIODICAS.md](./requirements/RF-12_RESERVAS_PERIODICAS.md)

**RF-12**: Reservas periódicas/recurrentes

- Patrones de recurrencia
- Excepciones
- Gestión de series

### [requirements/RF-13_MODIFICACION_CANCELACION.md](./requirements/RF-13_MODIFICACION_CANCELACION.md)

**RF-13**: Modificación y cancelación de reservas

- Políticas de cancelación
- Notificaciones automáticas
- Penalizaciones

### [requirements/RF-14_LISTA_ESPERA.md](./requirements/RF-14_LISTA_ESPERA.md)

**RF-14**: Sistema de lista de espera

- Cola de espera
- Notificaciones automáticas
- Asignación automática

### [requirements/RF-15_REASIGNACION.md](./requirements/RF-15_REASIGNACION.md)

**RF-15**: Reasignación automática de recursos

- Equivalencias de recursos
- Algoritmo de reasignación
- Notificación a usuarios

---

## 🚀 Implementaciones Detalladas

### RF-07: Configurar Disponibilidad

#### [RF-07_IMPLEMENTATION.md](./RF-07_IMPLEMENTATION.md)

**Descripción**: Implementación completa del RF-07  
**Contenido**:

- Schedule entities y DTOs
- Commands y Queries CQRS
- Validaciones de horarios
- Testing

### RF-09: Búsqueda Avanzada

#### [RF09_BUSQUEDA_AVANZADA_DISPONIBILIDAD.md](./RF09_BUSQUEDA_AVANZADA_DISPONIBILIDAD.md)

**Descripción**: Búsqueda avanzada de disponibilidad  
**Contenido**:

- Filtros implementados
- Optimización de queries MongoDB
- Índices de búsqueda

#### [RF09_IMPLEMENTACION_LOGICA_MONGODB.md](./RF09_IMPLEMENTACION_LOGICA_MONGODB.md)

**Descripción**: Lógica MongoDB para búsquedas  
**Contenido**:

- Agregación pipelines
- Queries optimizados
- Performance tuning

#### [RF09_OPTIMIZACIONES_AVANZADAS.md](./RF09_OPTIMIZACIONES_AVANZADAS.md)

**Descripción**: Optimizaciones de rendimiento  
**Contenido**:

- Cache con Redis
- Índices compuestos
- Query optimization

#### [RF09_RESUMEN_FINAL.md](./RF09_RESUMEN_FINAL.md)

**Descripción**: Resumen de implementación RF-09

### RF-10: Visualización Calendario

#### [RF-10_IMPLEMENTATION.md](./RF-10_IMPLEMENTATION.md)

**Descripción**: Implementación de visualización en calendario  
**Contenido**:

- Formatos de exportación
- Generación iCal
- Integración con clientes

### RF-11: Historial

#### [RF-11_IMPLEMENTATION.md](./RF-11_IMPLEMENTATION.md)

**Descripción**: Sistema de historial de uso  
**Contenido**:

- ReservationHistory entity
- Tracking de cambios
- Auditoría completa

### RF-12: Reservas Recurrentes

#### [RF12_RESERVAS_RECURRENTES.md](./RF12_RESERVAS_RECURRENTES.md)

**Descripción**: Implementación de reservas periódicas  
**Contenido**:

- Patrón de recurrencia
- Excepciones y overrides
- Gestión de series

#### [RF12_API_ENDPOINTS.md](./RF12_API_ENDPOINTS.md)

**Descripción**: Endpoints para reservas recurrentes  
**Contenido**:

- CRUD de series
- Actualización de instancias
- Cancelación masiva

#### [RF12_DIAGRAMAS_FLUJO.md](./RF12_DIAGRAMAS_FLUJO.md)

**Descripción**: Diagramas de flujo del RF-12

#### [RF12_MEJORAS_OPTIMIZACIONES.md](./RF12_MEJORAS_OPTIMIZACIONES.md)

**Descripción**: Mejoras y optimizaciones implementadas

#### [RF12_RESUMEN_IMPLEMENTACION.md](./RF12_RESUMEN_IMPLEMENTACION.md)

**Descripción**: Resumen completo de implementación

### RF-15: Reasignación

#### [RF-15_IMPLEMENTATION.md](./RF-15_IMPLEMENTATION.md)

**Descripción**: Sistema de reasignación automática  
**Contenido**:

- ResourceEquivalence entity
- Algoritmo de reasignación
- Notificaciones automáticas

---

## 🗄️ Base de Datos

### [DATABASE.md](./DATABASE.md)

**Descripción**: Esquema de base de datos  
**Contenido**:

- Modelos Prisma
- Relaciones entre entidades
- Índices y optimizaciones
- Estrategias de consulta

---

## 🌱 Semillas

### [SEEDS.md](./SEEDS.md)

**Descripción**: Datos iniciales del sistema  
**Contenido**:

- Horarios de ejemplo
- Reservas de prueba
- Configuraciones por defecto

---

## 🔄 Event Bus

### [EVENT_BUS.md](./EVENT_BUS.md)

**Descripción**: Eventos publicados y consumidos  
**Contenido**:

- Eventos de reservas
- Eventos de disponibilidad
- Eventos de reasignación
- Estructura de eventos

---

## 🔗 Endpoints

### [ENDPOINTS.md](./ENDPOINTS.md)

**Descripción**: API REST completa  
**Contenido**:

- Gestión de disponibilidad
- CRUD de reservas
- Búsqueda avanzada
- Lista de espera
- Reasignación

---

## 📊 Resúmenes de Sprint

### [SPRINT_SUMMARY.md](./SPRINT_SUMMARY.md)

**Descripción**: Resumen de implementaciones por sprint  
**Contenido**:

- Objetivos alcanzados
- Funcionalidades completadas
- Métricas de progreso

### [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

**Descripción**: Resumen general de implementación  
**Contenido**:

- Estado actual del servicio
- Funcionalidades implementadas
- Pendientes y roadmap

### [PENDING_FEATURES_PLAN.md](./PENDING_FEATURES_PLAN.md)

**Descripción**: Plan de funcionalidades pendientes  
**Contenido**:

- Features por implementar
- Priorización
- Timeline estimado

---

## 📚 Recursos Adicionales

- **Swagger UI**: `http://localhost:3003/api/docs`
- **Health Check**: `http://localhost:3003/api/v1/health`
- **Puerto**: 3003

---

## 🔧 Mantenimiento

Para actualizar esta documentación:

1. Editar archivos correspondientes
2. Actualizar este índice al agregar documentos
3. Mantener estructura consistente
4. Verificar enlaces funcionando

---

**Última actualización**: Noviembre 2024  
**Microservicio**: availability-service  
**Puerto**: 3003  
**Mantenido por**: Equipo Bookly
