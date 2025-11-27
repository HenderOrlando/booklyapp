# Stockpile Service - Índice de Documentación

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Requerimientos Funcionales](#requerimientos-funcionales)
- [Funcionalidades Avanzadas](#funcionalidades-avanzadas)
- [Proveedores de Notificaciones](#proveedores-de-notificaciones)
- [Base de Datos](#base-de-datos)
- [Documentación Archivada](#documentación-archivada)

---

## 📖 Descripción General

### [README.md](./README.md)

**Descripción**: Introducción al Stockpile Service  
**Contenido**:

- Propósito del servicio
- Quick start guide
- Configuración básica

### [STOCKPILE_SERVICE.md](./STOCKPILE_SERVICE.md)

**Descripción**: Documentación principal del servicio  
**Contenido**:

- Descripción completa del servicio
- Responsabilidades y alcance
- Flujos de aprobación
- Integración con otros servicios

### [STOCKPILE_DOCUMENTATION_INDEX.md](./STOCKPILE_DOCUMENTATION_INDEX.md)

**Descripción**: Índice de documentación completo  
**Contenido**:

- Guía de navegación
- Enlaces a documentos principales
- Recursos adicionales

---

## 🏗️ Arquitectura

### [ARCHITECTURE.md](./ARCHITECTURE.md)

**Descripción**: Arquitectura del servicio de aprobaciones  
**Contenido**:

- Clean Architecture + CQRS
- Event-Driven Architecture
- Flujos de aprobación diferenciados
- Sistema de notificaciones

---

## 📋 Requerimientos Funcionales

### [requirements/RF-20_VALIDAR_SOLICITUDES.md](./requirements/RF-20_VALIDAR_SOLICITUDES.md)

**RF-20**: Validar solicitudes de reserva

- Flujo de validación
- Roles de aprobadores
- Criterios de validación

### [requirements/RF-21_GENERAR_DOCUMENTOS.md](./requirements/RF-21_GENERAR_DOCUMENTOS.md)

**RF-21**: Generación automática de documentos

- Plantillas de documentos
- Generación de PDFs
- Cartas de aprobación/rechazo

### [requirements/RF-22_NOTIFICACIONES_AUTOMATICAS.md](./requirements/RF-22_NOTIFICACIONES_AUTOMATICAS.md)

**RF-22**: Notificación automática al solicitante

- Sistema de notificaciones
- Múltiples canales (email, SMS, WhatsApp)
- Templates personalizables

### [requirements/RF-23_PANTALLA_VIGILANCIA.md](./requirements/RF-23_PANTALLA_VIGILANCIA.md)

**RF-23**: Pantalla de control para vigilancia

- Dashboard de vigilancia
- Check-in/Check-out
- Verificación de reservas activas

### [requirements/RF-24_FLUJOS_DIFERENCIADOS.md](./requirements/RF-24_FLUJOS_DIFERENCIADOS.md)

**RF-24**: Configuración de flujos de aprobación diferenciados

- Flujos por tipo de recurso
- Flujos por rol de usuario
- Configuración dinámica

### [requirements/RF-25_TRAZABILIDAD.md](./requirements/RF-25_TRAZABILIDAD.md)

**RF-25**: Registro y trazabilidad de aprobaciones

- Historial completo
- Auditoría de decisiones
- Tracking de cambios

### [requirements/RF-26_CHECK_IN_OUT.md](./requirements/RF-26_CHECK_IN_OUT.md)

**RF-26**: Check-in/Check-out digital

- Sistema de registro de entrada/salida
- Validación de identidad
- Generación de reportes

### [requirements/RF-27_MENSAJERIA.md](./requirements/RF-27_MENSAJERIA.md)

**RF-27**: Integración con sistemas de mensajería

- WhatsApp Business API
- Email (SendGrid/SES)
- SMS (Twilio)

### [requirements/RF-28_NOTIFICACIONES_CAMBIOS.md](./requirements/RF-28_NOTIFICACIONES_CAMBIOS.md)

**RF-28**: Notificaciones automáticas de cambios

- Notificaciones en tiempo real
- WebSocket integration
- Push notifications

---

## 🚀 Funcionalidades Avanzadas

### [STOCKPILE_ADVANCED_FEATURES_COMPLETE.md](./STOCKPILE_ADVANCED_FEATURES_COMPLETE.md)

**Descripción**: Funcionalidades avanzadas completadas  
**Contenido**:

- Features implementadas
- Optimizaciones aplicadas
- Performance improvements

### [APPROVAL_REQUEST_METADATA.md](./APPROVAL_REQUEST_METADATA.md)

**Descripción**: Metadata enriquecida en solicitudes  
**Contenido**:

- Información adicional de solicitudes
- Contexto de aprobación
- Datos agregados

---

## 📨 Proveedores de Notificaciones

### [NOTIFICATION_PROVIDERS.md](./NOTIFICATION_PROVIDERS.md)

**Descripción**: Proveedores de notificaciones configurados  
**Contenido**:

- Email provider (SendGrid/SES)
- SMS provider (Twilio)
- WhatsApp Business API
- Push notifications

---

## ⚡ Redis Cache

### [REDIS_CACHE_SETUP.md](./REDIS_CACHE_SETUP.md)

**Descripción**: Configuración de Redis para cache  
**Contenido**:

- Setup de Redis
- Estrategias de cache
- Invalidación de cache
- Performance optimization

---

## 🗄️ Base de Datos

### [DATABASE.md](./DATABASE.md)

**Descripción**: Esquema de base de datos  
**Contenido**:

- Modelos Prisma
- Relaciones entre entidades
- ApprovalFlow, DocumentTemplate, NotificationTemplate
- Índices y optimizaciones

---

## 🌱 Semillas

### [SEEDS.md](./SEEDS.md)

**Descripción**: Datos iniciales del sistema  
**Contenido**:

- Flujos de aprobación predefinidos
- Plantillas de documentos
- Plantillas de notificaciones
- Configuraciones por defecto

---

## 🔄 Event Bus

### [EVENT_BUS.md](./EVENT_BUS.md)

**Descripción**: Eventos publicados y consumidos  
**Contenido**:

- Eventos de aprobaciones
- Eventos de documentos generados
- Eventos de notificaciones enviadas
- Integración con otros servicios

---

## 🔗 Endpoints

### [ENDPOINTS.md](./ENDPOINTS.md)

**Descripción**: API REST completa  
**Contenido**:

- Gestión de solicitudes de aprobación
- Flujos de aprobación
- Plantillas de documentos
- Notificaciones
- Check-in/Check-out

---

## 📚 Documentación Archivada

### archive/

#### [archive/IMPLEMENTACION_STOCKPILE_COMPLETADA.md](./archive/IMPLEMENTACION_STOCKPILE_COMPLETADA.md)

**Descripción**: Resumen de implementación inicial

#### [archive/IMPLEMENTATION_SUMMARY.md](./archive/IMPLEMENTATION_SUMMARY.md)

**Descripción**: Resumen técnico de implementación

#### [archive/NOTIFICATION_PROVIDERS_ARCHITECTURE.md](./archive/NOTIFICATION_PROVIDERS_ARCHITECTURE.md)

**Descripción**: Arquitectura de proveedores de notificaciones

#### [archive/RF23_EDA_IMPLEMENTACION_FINAL.md](./archive/RF23_EDA_IMPLEMENTACION_FINAL.md)

**Descripción**: Implementación final RF-23 con EDA

#### [archive/RF23_IMPLEMENTACION_COMPLETA.md](./archive/RF23_IMPLEMENTACION_COMPLETA.md)

**Descripción**: Implementación completa del RF-23

#### [archive/RF23_INFORMACION_ENRIQUECIDA_EDA.md](./archive/RF23_INFORMACION_ENRIQUECIDA_EDA.md)

**Descripción**: Información enriquecida con Event-Driven

#### [archive/RF23_MEJORAS_IMPLEMENTADAS.md](./archive/RF23_MEJORAS_IMPLEMENTADAS.md)

**Descripción**: Mejoras del RF-23

#### [archive/RF23_REVISION_IMPLEMENTACION.md](./archive/RF23_REVISION_IMPLEMENTACION.md)

**Descripción**: Revisión de implementación RF-23

#### [archive/STOCKPILE_FINAL_REPORT.md](./archive/STOCKPILE_FINAL_REPORT.md)

**Descripción**: Reporte final del proyecto

#### [archive/STOCKPILE_SERVICE_INTEGRATION_COMPLETE.md](./archive/STOCKPILE_SERVICE_INTEGRATION_COMPLETE.md)

**Descripción**: Integración completa con otros servicios

---

## 📚 Recursos Adicionales

- **Swagger UI**: `http://localhost:3004/api/docs`
- **Health Check**: `http://localhost:3004/api/v1/health`
- **Puerto**: 3004

---

## 🔧 Mantenimiento

Para actualizar esta documentación:

1. Editar archivos correspondientes
2. Actualizar este índice al agregar documentos
3. Mantener estructura consistente
4. Mover documentos obsoletos a archive/
5. Verificar enlaces funcionando

---

**Última actualización**: Noviembre 2024  
**Microservicio**: stockpile-service  
**Puerto**: 3004  
**Mantenido por**: Equipo Bookly
