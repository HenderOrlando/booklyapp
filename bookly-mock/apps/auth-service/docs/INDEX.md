# Auth Service - Índice de Documentación

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Funcionalidades Principales](#funcionalidades-principales)
- [Requerimientos Funcionales](#requerimientos-funcionales)
- [Implementaciones por Sprint](#implementaciones-por-sprint)
- [Base de Datos](#base-de-datos)
- [Semillas](#semillas)

---

## 🏗️ Arquitectura

### [ARCHITECTURE.md](./ARCHITECTURE.md)

**Descripción**: Arquitectura del servicio de autenticación  
**Contenido**:

- Clean Architecture + CQRS
- Capas del sistema (Domain, Application, Infrastructure)
- Flujo de autenticación
- Integración con Event Bus

### [AUTH_SERVICE.md](./AUTH_SERVICE.md)

**Descripción**: Documentación principal del servicio  
**Contenido**:

- Descripción general del servicio
- Responsabilidades y alcance
- APIs disponibles
- Diagramas de flujo

---

## 🔐 Funcionalidades Principales

### [SSO_GOOGLE_WORKSPACE.md](./SSO_GOOGLE_WORKSPACE.md)

**Descripción**: Integración con Google Workspace SSO  
**Contenido**:

- Configuración OAuth2
- Flujo de autenticación SSO
- Mapeo de roles por dominio
- Variables de entorno requeridas

### [TWO_FACTOR_AUTH.md](./TWO_FACTOR_AUTH.md)

**Descripción**: Autenticación de dos factores (2FA)  
**Contenido**:

- Implementación de TOTP
- Configuración de 2FA
- Códigos de recuperación
- Flujo de verificación

---

## 📋 Requerimientos Funcionales

### [requirements/RF-41_GESTION_ROLES_PERMISOS.md](./requirements/RF-41_GESTION_ROLES_PERMISOS.md)

**RF-41**: Gestión granular de roles y permisos

- CRUD de roles y permisos
- Asignación de permisos a roles
- Sistema de permisos granulares

### [requirements/RF-42_RESTRICCION_MODIFICACION.md](./requirements/RF-42_RESTRICCION_MODIFICACION.md)

**RF-42**: Restricción de modificación de recursos

- Guards de protección
- Validación de roles
- Auditoría de intentos

### [requirements/RF-43_SSO_AUTENTICACION.md](./requirements/RF-43_SSO_AUTENTICACION.md)

**RF-43**: Autenticación segura y SSO

- Integración Google Workspace
- OAuth2 flow
- Gestión de sesiones

### [requirements/RF-44_AUDITORIA_ACCESOS.md](./requirements/RF-44_AUDITORIA_ACCESOS.md)

**RF-44**: Auditoría completa de accesos

- Logging estructurado
- Tracking de sesiones
- Reportes de auditoría

### [requirements/RF-45_AUTENTICACION_2FA.md](./requirements/RF-45_AUTENTICACION_2FA.md)

**RF-45**: Autenticación de dos factores

- TOTP implementation
- Backup codes
- Recovery flow

---

## 🚀 Implementaciones por Sprint

### Sprint 1 - RF-41: Roles y Permisos

#### [fase1-sprint1-rf41-roles-permisos/PLAN_IMPLEMENTACION.md](./fase1-sprint1-rf41-roles-permisos/PLAN_IMPLEMENTACION.md)

Plan general de implementación del RF-41

#### [fase1-sprint1-rf41-roles-permisos/PASO1_SEEDS_COMPLETADO.md](./fase1-sprint1-rf41-roles-permisos/PASO1_SEEDS_COMPLETADO.md)

Semillas de roles y permisos predefinidos

#### [fase1-sprint1-rf41-roles-permisos/PASO2_CQRS_ROLES_COMPLETADO.md](./fase1-sprint1-rf41-roles-permisos/PASO2_CQRS_ROLES_COMPLETADO.md)

Implementación CQRS para gestión de roles

#### [fase1-sprint1-rf41-roles-permisos/PASO3_CQRS_PERMISOS_COMPLETADO.md](./fase1-sprint1-rf41-roles-permisos/PASO3_CQRS_PERMISOS_COMPLETADO.md)

Implementación CQRS para gestión de permisos

#### [fase1-sprint1-rf41-roles-permisos/PASO4_REGISTRO_AUTHMODULE_COMPLETADO.md](./fase1-sprint1-rf41-roles-permisos/PASO4_REGISTRO_AUTHMODULE_COMPLETADO.md)

Registro de handlers en AuthModule

#### [fase1-sprint1-rf41-roles-permisos/RF41_RESUMEN_FINAL.md](./fase1-sprint1-rf41-roles-permisos/RF41_RESUMEN_FINAL.md)

Resumen completo de la implementación

#### [fase1-sprint1-rf41-roles-permisos/VALIDACION_COMPLETA.md](./fase1-sprint1-rf41-roles-permisos/VALIDACION_COMPLETA.md)

Validación y testing del RF-41

#### [fase1-sprint1-rf41-roles-permisos/VERIFICACION_FINAL_RF41.md](./fase1-sprint1-rf41-roles-permisos/VERIFICACION_FINAL_RF41.md)

Verificación final de funcionalidades

### Sprint 1 - RF-42: Restricciones

#### [fase1-sprint1-rf42-restricciones/PLAN_IMPLEMENTACION_RF42.md](./fase1-sprint1-rf42-restricciones/PLAN_IMPLEMENTACION_RF42.md)

Plan de implementación del RF-42

#### [fase1-sprint1-rf42-restricciones/AUDIT_SYSTEM_COMPLETE.md](./fase1-sprint1-rf42-restricciones/AUDIT_SYSTEM_COMPLETE.md)

Sistema de auditoría completado

#### [fase1-sprint1-rf42-restricciones/FASE3_INTEGRACION_COMPLETA.md](./fase1-sprint1-rf42-restricciones/FASE3_INTEGRACION_COMPLETA.md)

Integración completa del sistema

#### [fase1-sprint1-rf42-restricciones/INTEGRACION_EVENT_BUS.md](./fase1-sprint1-rf42-restricciones/INTEGRACION_EVENT_BUS.md)

Integración con Event Bus para auditoría

### Sprint 1 - RF-44: Auditoría

#### [fase1-sprint1-rf44-auditoria/RF44_SISTEMA_AUDITORIA_COMPLETO.md](./fase1-sprint1-rf44-auditoria/RF44_SISTEMA_AUDITORIA_COMPLETO.md)

Sistema completo de auditoría de accesos

---

## 🗄️ Base de Datos

### [DATABASE.md](./DATABASE.md)

**Descripción**: Esquema y gestión de base de datos  
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

- Roles predefinidos (6 roles)
- Permisos base
- Usuarios de prueba
- Programas académicos

---

## 🔄 Event Bus

### [EVENT_BUS.md](./EVENT_BUS.md)

**Descripción**: Eventos publicados y consumidos  
**Contenido**:

- Eventos de autenticación
- Eventos de roles y permisos
- Eventos de auditoría
- Estructura de eventos

---

## 🔗 Endpoints

### [ENDPOINTS.md](./ENDPOINTS.md)

**Descripción**: API REST completa  
**Contenido**:

- Autenticación (login, register, logout)
- Gestión de usuarios
- Roles y permisos
- OAuth2 endpoints
- 2FA endpoints

---

## 📚 Recursos Adicionales

- **Swagger UI**: `http://localhost:3001/api/docs`
- **Health Check**: `http://localhost:3001/api/v1/health`
- **Puerto**: 3001

---

## 🔧 Mantenimiento

Para actualizar esta documentación:

1. Editar los archivos correspondientes
2. Actualizar este índice cuando se agreguen documentos
3. Mantener enlaces funcionando
4. Seguir estructura establecida

---

**Última actualización**: Noviembre 2024  
**Microservicio**: auth-service  
**Puerto**: 3001  
**Mantenido por**: Equipo Bookly
