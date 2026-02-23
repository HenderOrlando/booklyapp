# Calidad, Testing y DevOps

## Análisis para Tesis de Grado — CI/CD, Testing, Infraestructura como Código

---

## 1. Contexto

La capa de calidad y DevOps de Bookly abarca el ciclo completo de entrega de software: desde las pruebas automatizadas hasta el despliegue en producción. Incluye pipelines de CI/CD con GitHub Actions, contenedorización con Docker, infraestructura como código con Pulumi, gestión del monorepo con Nx, y una estrategia de testing multinivel.

---

## 2. Monorepo con Nx

### 2.1 Estructura

Bookly utiliza Nx como gestor de monorepo, centralizando 6 microservicios backend, 1 frontend y 10+ librerías compartidas en un solo repositorio.

**Ventajas demostradas**:

- **Dependency graph**: Nx calcula automáticamente qué servicios se ven afectados por un cambio
- **Cache de builds**: Reutilización de compilaciones previas cuando el código no cambia
- **Comandos centralizados**: `npm run start:all`, `npm run test:all`, `npm run build:all`
- **Librerías compartidas**: Código reutilizado entre servicios sin duplicación
- **Versionado atómico**: Un commit puede actualizar frontend + backend + libs de forma coordinada

### 2.2 Servicios Gestionados

```text
apps/
├── api-gateway/          # Puerto 3000
├── auth-service/         # Puerto 3001
├── resources-service/    # Puerto 3002
├── availability-service/ # Puerto 3003
├── stockpile-service/    # Puerto 3004
├── reports-service/      # Puerto 3005
└── bookly-web/           # Frontend Next.js

libs/
├── common/        # ResponseUtil, constants, enums, decorators
├── event-bus/     # EventBusService, EventStore, DLQ
├── redis/         # RedisModule, CacheMetrics
├── database/      # DatabaseModule (Mongoose)
├── security/      # AuthClientModule
├── guards/        # JwtAuth, Roles, Permissions
├── decorators/    # @Roles, @Permissions, @CurrentUser
├── idempotency/   # IdempotencyService, CorrelationService
├── notifications/ # Email, SMS, WhatsApp, Push
└── storage/       # Local/S3/GCS
```

---

## 3. CI/CD con GitHub Actions

### 3.1 Pipelines Implementados

15 archivos de workflow en `.github/workflows/`:

| Pipeline | Trigger | Función |
|----------|---------|---------|
| **build-and-push-image.yml** | Reusable | Build Docker multi-stage + push a registry |
| **api-gateway.yml** | push main/develop | CI/CD del API Gateway |
| **auth-service.yml** | push main/develop | CI/CD del auth-service |
| **resources-service.yml** | push main/develop | CI/CD del resources-service |
| **availability-service.yml** | push main/develop | CI/CD del availability-service |
| **stockpile-service.yml** | push main/develop | CI/CD del stockpile-service |
| **reports-service.yml** | push main/develop | CI/CD del reports-service |
| **sonar-analysis.yml** | PR | Análisis estático SonarQube |

### 3.2 Pipeline Estándar por Servicio

```text
1. Static checks (lint, format)
2. Tests (unit + integration)
3. Build (artifact + container image)
4. Security (SCA, secret scanning)
5. Publish (GHCR/Docker Hub)
6. Deploy (staging → prod con approvals)
```

### 3.3 Patrón de Workflow Reutilizable

Centraliza la lógica de build en un solo workflow reutilizado por todos los servicios:

```yaml
jobs:
  build:
    uses: ./.github/workflows/build-and-push-image.yml
    with:
      service-name: auth-service
      dockerfile-path: ./ci-cd/bookly-mock/dockerfiles/Dockerfile.auth
    secrets:
      DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
      DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
```

---

## 4. Seguridad del Pipeline

### 4.1 Medidas Implementadas

| Medida | Estado | Detalle |
|--------|--------|---------|
| **Explicit permissions** | ✅ | Least privilege en cada job |
| **Secret management** | ✅ | Encrypted en GitHub, nunca en logs |
| **Dependency security** | ✅ | Base images oficiales, Alpine para superficie mínima |
| **Action versions** | ✅ | Pinned a versiones específicas (v3, v4, v5) |
| **Input validation** | ✅ | Inputs strongly typed en workflow_call |
| **Cache security** | ✅ | GitHub built-in cache, scoped al repo |
| **CodeQL analysis** | ✅ | 0 alertas de seguridad |

### 4.2 Resultados de Seguridad

- **CodeQL Alerts**: 0 (inicialmente 16, todos remediados)
- **Secret scanning**: Activo
- **Dependabot**: Recomendado y configurado
- **Permisos explícitos**: En todos los workflows y jobs

---

## 5. Contenedorización con Docker

### 5.1 Multi-Stage Builds

```dockerfile
FROM node:20-alpine AS builder
# Build stage: compile TypeScript, install dependencies
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runtime
# Production stage: minimal image
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
```

**Características**:

- **Alpine Linux**: Superficie de ataque mínima
- **Node 20**: Versión LTS específica (no `latest`)
- **Multi-stage**: Imagen final sin devDependencies ni source code
- **SBOM**: Recomendado para compliance

### 5.2 Docker Compose para Desarrollo

Entorno local completo con:

- 6 microservicios NestJS
- MongoDB
- Redis
- RabbitMQ
- Frontend Next.js

---

## 6. Infraestructura como Código (IaC) con Pulumi

### 6.1 Estructura

```text
infrastructure/pulumi/
├── index.ts           # Entrada principal
├── kubernetes.ts      # Clúster EKS/GKE/AKS
├── redis.ts           # Redis Cluster
├── database.ts        # MongoDB Atlas
└── api-gateway.ts     # Configuración del Gateway
```

### 6.2 Características

- **TypeScript nativo**: IaC en el mismo lenguaje que el backend
- **Estado remoto**: Backend state con locking
- **Multi-entorno**: Stacks para dev/staging/prod
- **Secretos**: Gestionados fuera del repo via KMS

---

## 7. Estrategia de Testing

### 7.1 Pirámide de Tests

| Nivel | Herramientas | Cobertura |
|-------|-------------|-----------|
| **Unit** | Jasmine (BDD) + Vitest | Dominio, VOs, invariantes, utils, hooks |
| **Integration** | Jest + Supertest | Use cases con BD, repositorios, CQRS handlers |
| **Component** | Testing Library | Estados de UI, forms, interacciones |
| **E2E** | Playwright | 9+ specs: auth, admin, resources, reservations, characteristics, etc. |
| **Contract** | AsyncAPI specs + OpenAPI lint | Contratos entre servicios |
| **Security** | CodeQL + SCA | Vulnerabilidades, permisos, secrets |

### 7.2 BDD con Jasmine (Given-When-Then)

```typescript
describe('ReservationService', () => {
  describe('create reservation', () => {
    it('should create reservation when resource is available', () => {
      // Given: a resource with available slots
      // When: user requests a reservation
      // Then: reservation is created and event published
    });

    it('should reject when resource has conflict', () => {
      // Given: a resource with existing reservation
      // When: user requests overlapping reservation
      // Then: conflict error is returned
    });
  });
});
```

### 7.3 E2E Tests con Playwright

9+ archivos de spec en `e2e/`:

- `auth.spec.ts` — Login, registro, logout
- `admin.spec.ts` — Panel de administración
- `resources.spec.ts` — CRUD de recursos
- `reservations.spec.ts` — Flujo completo de reservas
- `characteristics.spec.ts` — Gestión de características
- `roles.spec.ts` — Gestión de roles y permisos
- `approvals.spec.ts` — Flujos de aprobación
- `reports.spec.ts` — Generación de reportes
- `dashboard.spec.ts` — Dashboard principal

### 7.4 Cobertura

- **Objetivo**: > 80% para permitir despliegue
- **Generación**: `npm run test:cov` en cada commit
- **Reporte**: Integrado en CI/CD pipeline

---

## 8. Kubernetes y Despliegue

### 8.1 Estructura K8s

```text
infrastructure/k8s/
├── deployments/     # YAML por microservicio
├── services/        # Exposición de servicios
└── ingress/         # Reglas de entrada pública
```

### 8.2 Características

- **Requests/limits**: Definidos por servicio
- **Readiness/liveness probes**: Health checks configurados
- **HPA**: Auto-scaling horizontal según carga
- **ConfigMaps/Secrets**: Configuración externalizada

### 8.3 Guías de Despliegue

4 guías documentadas:

- `DEPLOY_LOCAL.md` — Desarrollo local
- `DEPLOY_DOCKER.md` — Docker Compose
- `DEPLOY_GH_ACTIONS.md` — CI/CD con GitHub Actions
- `DEPLOY_PULUMI.md` — IaC con Pulumi

---

## 9. Aspectos Destacables para Tesis

### 9.1 Innovación Técnica

- **Monorepo con Nx**: Gestión unificada de 6 microservicios + frontend + 10 librerías en un solo repositorio con dependency graph automático y cache de builds.
- **Pipeline reutilizable**: Un solo workflow de CI/CD es reutilizado por 6 servicios, reduciendo duplicación y centralizando la lógica de seguridad.
- **IaC con Pulumi en TypeScript**: La infraestructura se define en el mismo lenguaje que el backend, permitiendo compartir tipos y validaciones.
- **0 alertas CodeQL**: Seguridad del pipeline verificada y remediada proactivamente.

### 9.2 Contribución Académica

- **DevOps aplicado a proyectos académicos**: Demuestra que prácticas de ingeniería de software empresarial (CI/CD, IaC, containerización) son aplicables y beneficiosas incluso en contextos universitarios.
- **BDD como metodología de testing**: Los tests estructurados con Given-When-Then sirven como documentación viva de los requisitos del sistema.
- **Testing multinivel**: Implementación práctica de la pirámide de tests desde unitarios hasta E2E con Playwright.

### 9.3 Impacto Institucional

- **Despliegue reproducible**: Cualquier miembro del equipo puede desplegar el sistema completo con un solo comando.
- **Calidad verificable**: Los pipelines de CI/CD actúan como gate de calidad automatizado que previene regresiones.
- **Documentación como código**: Swagger, AsyncAPI y ADRs se generan/mantienen junto con el código, siempre actualizados.

---

## 10. Skills y Rules Aplicadas

- **Skills**: `plataforma-build-deploy-operate-observe`, `qa-calidad`, `operacion-interna-equipo`, `gestion-ingenieria-delivery`
- **Rules**: Reglas transversales de CI/CD, testing, deployment

---

**Monorepo**: Nx con 7 apps + 10 libs
**CI/CD**: 15 workflows GitHub Actions
**Seguridad**: 0 CodeQL alerts
**Testing**: Unit + Integration + Component + E2E + Contract + Security
**IaC**: Pulumi (TypeScript) + Kubernetes
**Contenedores**: Docker multi-stage con Alpine
