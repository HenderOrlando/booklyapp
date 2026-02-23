# Dominio de Autenticación y Control de Accesos

## Análisis para Tesis de Grado — auth-service

---

## 1. Contexto del Dominio

El módulo de autenticación (`auth-service`) es el pilar de seguridad de Bookly. Opera como **fuente única de verdad (Single Source of Truth)** para identidad, roles y permisos en todo el ecosistema de microservicios, decisión formalizada en el ADR-001.

**Puerto**: 3001
**Responsabilidades**: Usuarios, roles, permisos, JWT, OAuth/SSO, 2FA, token introspection, evaluación de permisos, configuración de aplicación.

---

## 2. Requerimientos Funcionales Implementados

| RF | Nombre | Estado | Descripción |
|----|--------|--------|-------------|
| RF-41 | Gestión de roles y permisos | ✅ Implementado | CRUD completo de roles con permisos granulares por recurso:acción |
| RF-42 | Restricción de modificación | ✅ Implementado | Control de acceso basado en roles para operaciones sensibles |
| RF-43 | Autenticación segura y SSO | ✅ Implementado | JWT + OAuth2 con Google Workspace y Microsoft |
| RF-44 | Auditoría de accesos | ✅ Implementado | Registro estructurado de cada intento de acceso |
| RF-45 | Verificación por 2FA | ✅ Implementado | Doble factor de autenticación opcional |

## 3. Historias de Usuario Cubiertas

- **HU-33**: Gestión de roles y permisos
- **HU-34**: Restricción de modificación
- **HU-35**: Autenticación segura y SSO
- **HU-36**: Auditoría de accesos
- **HU-37**: Verificación por 2FA

## 4. Casos de Uso

- **CU-001**: Registrarse
- **CU-002**: Iniciar sesión
- **CU-003**: Cerrar sesión
- **CU-004**: Recuperar clave
- **CU-005**: Gestionar perfil
- **CU-006**: Gestionar roles
- **CU-007**: Asignar roles a usuarios

---

## 5. Arquitectura Técnica

### 5.1 Patrón CQRS Aplicado

El servicio implementa CQRS (Command Query Responsibility Segregation) con NestJS:

```
AuthController → CommandBus / QueryBus → Handlers → Services → Repositories → MongoDB
```

- **Commands**: `RegisterUser`, `Login`, `AssignRole`, `Enable2FA`, `BlacklistToken`
- **Queries**: `IntrospectToken`, `EvaluatePermissions`, `GetUsers`, `GetRoles`
- **Handlers**: Orquestan la lógica delegando a servicios de dominio

### 5.2 Decisión Arquitectónica ADR-001: auth-service como SOT

**Problema resuelto**: Antes, cada microservicio validaba JWT localmente con secretos inconsistentes, permisos desactualizados y sin mecanismo de revocación.

**Solución implementada**:

1. **Endpoints de contrato interno**:
   - `POST /api/v1/auth/introspect` — Valida JWT y retorna identidad completa desde BD
   - `POST /api/v1/auth/evaluate-permissions` — Evalúa permisos `recurso:acción` desde BD

2. **SDK compartido** (`libs/security/`):
   - `AuthClientModule` — Módulo dinámico NestJS importado por todos los servicios
   - `AuthClientService` — Cliente HTTP con cache Redis, retry exponencial y degradación graciosa

3. **Estrategia de cache con Redis**:
   - Introspección: 60s en `auth:introspect:{userId}`
   - Permisos: 30s en `auth:authz:{userId}:{resource}:{action}`
   - Invalidación por evento en cambios de rol/permiso

4. **Revocación de tokens**:
   - Blacklist en Redis con TTL de 24h
   - Verificación en `JwtStrategy` antes de validar usuario
   - Logout agrega token a blacklist inmediatamente

### 5.3 Seguridad Multi-Capa

| Capa | Mecanismo | Detalle |
|------|-----------|---------|
| **Autenticación** | JWT + OAuth2/OIDC | Tokens firmados, SSO con Google/Microsoft |
| **Autorización** | RBAC granular | Permisos por `recurso:acción` evaluados en BD |
| **Revocación** | Redis blacklist | Invalidación inmediata de tokens |
| **2FA** | TOTP | Segundo factor para acciones críticas |
| **Rate Limiting** | Por IP y por usuario | Protección contra fuerza bruta |
| **Auditoría** | Winston estructurado | Log de cada intento con actor, recurso, resultado |

### 5.4 API Endpoints Principales

| Grupo | Endpoints |
|-------|-----------|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/introspect` |
| **Users** | `GET /users`, `POST /users`, `PATCH /users/:id` |
| **Roles** | `GET /roles`, `POST /roles`, `PATCH /roles/:id` |
| **Permissions** | `GET /permissions`, `POST /permissions`, `POST /auth/evaluate-permissions` |
| **SSO** | `GET /auth/google`, `GET /auth/microsoft` |
| **2FA** | `POST /auth/2fa/enable`, `POST /auth/2fa/verify` |

### 5.5 Eventos Asincrónicos (AsyncAPI)

8 canales documentados en `auth-events.asyncapi.yaml`:

- `user.created`, `user.updated`, `user.deleted`
- `role.assigned`, `role.revoked`
- `login.success`, `login.failed`
- `token.blacklisted`

---

## 6. Requerimientos No Funcionales

| RNF | Requisito | Implementación |
|-----|-----------|---------------|
| RNF-13 | Seguridad en sesiones activas | JWT con refresh tokens, blacklist en Redis |
| RNF-14 | Protección contra fuerza bruta | Rate limiting por IP/usuario, lockout progresivo |
| RNF-15 | Registro de intentos no autorizados | Log estructurado con Winston + Sentry |

---

## 7. KPIs Operativos del Dominio

| KPI | Fuente | Umbral de Alerta |
|-----|--------|-----------------|
| Login success rate | auth-service | < 95% en 5 min |
| Login latency (p95) | OTel HTTP span | > 500ms |
| Token introspection latency (p95) | OTel HTTP span | > 100ms |
| Failed login attempts per user | Audit log | > 10/hora |
| Active sessions | Redis | Informacional |

---

## 8. Aspectos Destacables para Tesis

### 8.1 Innovación Técnica

- **Degradación graciosa**: Si auth-service cae, los demás servicios degradan a validación local de JWT con claims embebidos, manteniendo operatividad parcial.
- **Cache jerárquica con invalidación por eventos**: Combina rendimiento (cache 30-60s) con consistencia (invalidación en cambios de permisos).
- **SDK centralizado**: Un solo módulo (`AuthClientModule`) importado por 6 microservicios asegura comportamiento uniforme.

### 8.2 Contribución Académica

- Implementación práctica de **Zero Trust Architecture** en contexto universitario: cada servicio verifica identidad y permisos contra la fuente autorizada.
- Demostración de cómo **CQRS + Event-Driven** permiten separar reads intensivos (introspección) de writes críticos (registro, cambio de roles).
- Modelo de **RBAC granular** aplicado a gestión de recursos institucionales con permisos por `recurso:acción`.

### 8.3 Impacto Institucional

- **SSO con Google Workspace**: Integración directa con cuentas universitarias existentes, eliminando fricción de adopción.
- **Auditoría completa**: Cumplimiento de políticas institucionales de trazabilidad y rendición de cuentas.
- **2FA opcional**: Protección adicional para roles administrativos que gestionan recursos institucionales de alto valor.

---

## 9. Skills y Rules Aplicadas

- **Skills**: `backend`, `seguridad-privacidad-compliance`, `seguridad-avanzada`, `gobierno-de-arquitectura-diseno`
- **Rules**: `bookly-auth-rf41-gestion-de-roles`, `bookly-auth-rf42-restriccion-de-modificacion`, `bookly-auth-rf43-autenticacion-y-sso`

---

**Dominio**: Identidad y Control de Accesos
**Servicio**: auth-service (Puerto 3001)
**Swagger**: 9 controllers documentados
**AsyncAPI**: 8 canales de eventos
