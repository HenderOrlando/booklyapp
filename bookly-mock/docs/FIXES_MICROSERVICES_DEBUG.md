# Fixes de Errores en Microservicios - Debug Mode

**Fecha**: Noviembre 19, 2024  
**Contexto**: Resolución de errores de inyección de dependencias al ejecutar microservicios en modo debug

---

## 🎯 Objetivo

Resolver errores de inyección de dependencias que impedían el inicio de los microservicios en modo debug:

- `npm run start:auth:debug`
- `npm run start:availability:debug`
- `npm run start:stockpile:debug`
- `npm run start:reports:debug`

---

## ✅ 1. Auth Service (Puerto 3001)

### **Error Identificado**

```
Nest can't resolve dependencies of the RoleService (?).
Please make sure that the argument "RoleEntityModel" at index [0] is available
```

### **Causa Raíz**

- `RoleService` y `PermissionService` inyectaban modelos con nombres incorrectos
- Usaban `@InjectModel(RoleEntity.name)` y `@InjectModel(PermissionEntity.name)`
- Los schemas correctos son `Role` y `Permission` (no las entidades del dominio)

### **Solución Aplicada**

#### Archivo: `apps/auth-service/src/application/services/role.service.ts`

```typescript
// ANTES
import { RoleEntity } from "../../domain/entities/role.entity";
@InjectModel(RoleEntity.name)
private readonly roleModel: Model<RoleEntity>

// DESPUÉS
import { Role } from "../../infrastructure/schemas/role.schema";
@InjectModel(Role.name)
private readonly roleModel: Model<Role>
```

#### Archivo: `apps/auth-service/src/application/services/permission.service.ts`

```typescript
// ANTES
import { PermissionEntity } from "../../domain/entities/permission.entity";
@InjectModel(PermissionEntity.name)
private readonly permissionModel: Model<PermissionEntity>

// DESPUÉS
import { Permission } from "../../infrastructure/schemas/permission.schema";
@InjectModel(Permission.name)
private readonly permissionModel: Model<Permission>
```

### **Error Secundario - GoogleStrategy**

```
OAuth2Strategy requires a clientID option
```

### **Solución**

```typescript
// apps/auth-service/src/infrastructure/strategies/google.strategy.ts
super({
  clientID: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
  // ...
});

// Advertir si no están configuradas
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("[GoogleStrategy] Google OAuth credentials not configured.");
}
```

### **Estado Final**

✅ Auth service inicia correctamente  
✅ GoogleStrategy no bloquea el inicio sin credenciales OAuth  
✅ Advertencia visible si faltan credenciales de Google

---

## ✅ 2. Availability Service (Puerto 3003)

### **Error Identificado**

```
Nest can't resolve dependencies of the RecurringReservationService (?, ...).
Please make sure that the argument Object at index [0] is available
```

### **Causa Raíz**

- `RecurringReservationService` inyectaba `IReservationRepository` sin decorador `@Inject`
- Otros servicios (ReservationService, CalendarViewService) usaban `@Inject("IReservationRepository")` correctamente

### **Solución Aplicada**

#### Archivo: `apps/availability-service/src/application/services/recurring-reservation.service.ts`

```typescript
// ANTES
import { Injectable, Optional } from "@nestjs/common";
constructor(
  private readonly reservationRepository: IReservationRepository,
  @Optional() private readonly eventPublisher?: ...,
  @Optional() private readonly cacheService?: ...
) {}

// DESPUÉS
import { Inject, Injectable, Optional } from "@nestjs/common";
constructor(
  @Inject("IReservationRepository")
  private readonly reservationRepository: IReservationRepository,
  @Optional() private readonly eventPublisher?: ...,
  @Optional() private readonly cacheService?: ...
) {}
```

### **Estado Final**

✅ Availability service inicia correctamente  
✅ RecurringReservationService con inyección de dependencias correcta  
✅ Patrón consistente con otros servicios del módulo

---

## ✅ 3. Stockpile Service (Puerto 3004)

### **Error Identificado**

```
Nest can't resolve dependencies of the ReminderService (..., ?, ...).
Please make sure that the argument AuthServiceClient at index [4] is available
```

### **Causa Raíz**

- `ReminderService` y `CheckInHandler` requerían `AuthServiceClient` y `AvailabilityServiceClient`
- También requerían `QRCodeService` y `GeolocationService`
- Ninguno de estos providers estaba registrado en `StockpileModule`

### **Solución Aplicada**

#### Archivo: `apps/stockpile-service/src/stockpile.module.ts`

**1. Agregar imports de clientes:**

```typescript
// Clients
import { AuthServiceClient } from "./infrastructure/clients/auth-service.client";
import { AvailabilityServiceClient } from "./infrastructure/clients/availability-service.client";
```

**2. Agregar servicios a imports:**

```typescript
// Services
import {
  // ... otros servicios
  QRCodeService,
  GeolocationService,
} from "./application/services";
```

**3. Registrar en providers:**

```typescript
providers: [
  // ... otros providers
  QRCodeService,
  GeolocationService,

  // Clients
  AuthServiceClient,
  AvailabilityServiceClient,
  // ...
];
```

#### Archivo: `apps/stockpile-service/src/application/services/index.ts`

```typescript
// Agregar exports faltantes
export * from "./qr-code.service";
export * from "./geolocation.service";
```

### **Estado Final**

✅ Stockpile service con todas las dependencias resueltas  
✅ Clientes de comunicación entre servicios registrados  
✅ Servicios auxiliares (QR, Geolocation) disponibles

---

## ✅ 4. Reports Service (Puerto 3005)

### **Error Identificado**

```
Nest can't resolve dependencies of the DashboardService (?, ...).
Please make sure that the argument Object at index [0] is available
```

### **Causa Raíz**

- `DashboardService` inyectaba `IDashboardMetricRepository` sin decorador `@Inject`
- Patrón inconsistente con otros repositorios en el servicio

### **Solución Aplicada**

#### Archivo: `apps/reports-service/src/application/services/dashboard.service.ts`

```typescript
// ANTES
import { Injectable } from "@nestjs/common";
constructor(
  private readonly dashboardMetricRepository: IDashboardMetricRepository,
  private readonly metricsAggregationService: MetricsAggregationService,
  private readonly trendAnalysisService: TrendAnalysisService
) {}

// DESPUÉS
import { Inject, Injectable } from "@nestjs/common";
constructor(
  @Inject("IDashboardMetricRepository")
  private readonly dashboardMetricRepository: IDashboardMetricRepository,
  private readonly metricsAggregationService: MetricsAggregationService,
  private readonly trendAnalysisService: TrendAnalysisService
) {}
```

### **Estado Final**

✅ Reports service inicia correctamente  
✅ DashboardService con inyección de dependencias consistente  
✅ Patrón alineado con el resto del proyecto

---

## 📊 Resumen de Cambios

### Por Tipo de Error

| Tipo de Error                       | Servicios Afectados   | Solución                                  |
| ----------------------------------- | --------------------- | ----------------------------------------- |
| **Inyección de Modelo Incorrecto**  | auth-service          | Usar schemas en lugar de entidades domain |
| **Falta de @Inject en Repositorio** | availability, reports | Agregar `@Inject("IRepositoryName")`      |
| **Providers No Registrados**        | stockpile             | Registrar clientes y servicios en module  |
| **Credenciales OAuth Faltantes**    | auth-service          | Valores por defecto + advertencia         |

### Archivos Modificados

#### Auth Service (3 archivos)

- ✅ `application/services/role.service.ts`
- ✅ `application/services/permission.service.ts`
- ✅ `infrastructure/strategies/google.strategy.ts`

#### Availability Service (1 archivo)

- ✅ `application/services/recurring-reservation.service.ts`

#### Stockpile Service (2 archivos)

- ✅ `stockpile.module.ts`
- ✅ `application/services/index.ts`

#### Reports Service (1 archivo)

- ✅ `application/services/dashboard.service.ts`

**Total**: 7 archivos modificados

---

## 🎓 Lecciones Aprendidas

### **1. Patrón de Inyección de Interfaces**

Cuando se usa una interfaz como tipo de dependencia, **SIEMPRE** usar `@Inject` con el token de string:

```typescript
@Inject("IRepositoryName")
private readonly repository: IRepositoryName
```

### **2. Diferencia entre Domain Entities y Schemas**

- **Domain Entities**: Clases de lógica de negocio (no para MongoDB)
- **Schemas**: Clases decoradas con `@Schema()` de Mongoose (para MongoDB)
- **Regla**: `@InjectModel()` SIEMPRE usa schemas, NO entities

### **3. Registro de Providers**

Todos los servicios/clientes usados como dependencias DEBEN estar en:

1. Importados en el archivo del módulo
2. Registrados en el array `providers` del `@Module()`
3. Exportados desde su barrel file (`index.ts`) si están en carpeta

### **4. Configuración Opcional vs Obligatoria**

Para configuraciones opcionales (como OAuth):

- Proporcionar valores por defecto "dummy"
- Emitir advertencia visible si no están configuradas
- No bloquear el inicio de la aplicación

---

## ✅ Verificación de Fixes

### Comandos de Verificación

```bash
# Auth Service
npm run start:auth:debug
# Debe iniciar en puerto 3001 sin errores

# Availability Service
npm run start:availability:debug
# Debe iniciar en puerto 3003 sin errores

# Stockpile Service
npm run start:stockpile:debug
# Debe iniciar en puerto 3004 sin errores

# Reports Service
npm run start:reports:debug
# Debe iniciar en puerto 3005 sin errores
```

### Salida Esperada

```
[Nest] XXXX - LOG [NestApplication] Nest application successfully started
```

### Advertencias Aceptables

- ⚠️ Mongoose duplicate index warnings (no críticas)
- ⚠️ GoogleStrategy credentials not configured (esperado sin .env)
- ⚠️ Kafka partitioner warning (información)

---

## 🚀 Próximos Pasos

1. **Configurar variables de entorno** para Google OAuth si se requiere SSO
2. **Revisar warnings de Mongoose** y eliminar índices duplicados en schemas
3. **Testing completo** de funcionalidades CQRS en cada servicio
4. **Documentar** patrón de inyección de dependencias en guía de contribución

---

**Documentado por**: Cascade AI  
**Estado**: ✅ Todos los servicios funcionando  
**Última verificación**: Noviembre 19, 2024
