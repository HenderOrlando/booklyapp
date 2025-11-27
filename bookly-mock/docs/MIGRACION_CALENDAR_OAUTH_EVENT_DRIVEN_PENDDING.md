# 🔄 Migración Calendar Integration a Event-Driven

**Fecha**: 19 de noviembre de 2025  
**Estado**: 📋 **PLAN DE MIGRACIÓN**  
**Prioridad**: Media (funcionalidad opcional)

---

## 🎯 Objetivo

Migrar `CalendarIntegrationService` a arquitectura event-driven para integrar calendarios externos (Google Calendar, Outlook) usando OAuth centralizado en `auth-service`.

---

## 📊 Análisis de Servicios Comentados

### **1. ResourceMetadataSyncService** ❌ NO REQUIERE MIGRACIÓN

**Estado**: El comentario puede eliminarse

**Razón**: La funcionalidad de sincronización de metadatos de recursos **YA ESTÁ IMPLEMENTADA** a través de:

- ✅ `ResourcesEventService` - Comunicación event-driven con resources-service
- ✅ `ResourceSyncHandler` - Handler de eventos de sincronización
- ✅ Request-Reply Pattern - Para obtener datos de recursos en tiempo real

**Evidencia**:

```typescript
// apps/availability-service/src/application/services/resources-event.service.ts
export class ResourcesEventService {
  async getResourceById(resourceId: string): Promise<ResourceData | null> {
    // Usa Request-Reply pattern hacia resources-service
  }

  async getCandidateResources(...): Promise<ResourceData[]> {
    // Obtiene recursos candidatos para reasignación
  }
}
```

**Recomendación**: ✅ **Eliminar comentario de `ResourceMetadataSyncService`** - Ya no es necesario.

---

### **2. CalendarIntegrationService** ⚠️ REQUIERE MIGRACIÓN

**Estado**: Deshabilitado (archivo renombrado a `.disabled`)

**Razón**: Depende de OAuth providers que fueron migrados a `auth-service`

**Funcionalidad Actual** (deshabilitada):

- ✅ Integración con Google Calendar
- ✅ Integración con Microsoft Outlook/Calendar
- ✅ Gestión de tokens OAuth
- ✅ Sincronización bidireccional de eventos
- ✅ Encriptación de tokens

**Archivo**: `calendar-integration.service.ts.disabled` (220 líneas)

---

## 🏗️ Arquitectura Event-Driven Propuesta

### **Flujo Actual (Deshabilitado)**

```
availability-service
  ↓ CalendarIntegrationService
  ↓ GoogleOAuthProvider (desde @libs/oauth)
  ↓ Llamada directa a Google API
```

### **Flujo Event-Driven (Propuesto)**

```
availability-service
  ↓ Emite: CalendarAuthRequested
  ↓ EventBus (RabbitMQ)
  ↓ auth-service
  ↓ OAuthService.handleCalendarAuth()
  ↓ Google/Microsoft OAuth
  ↓ Emite: CalendarAuthCompleted
  ↓ EventBus
  ↓ availability-service
  ↓ Handler: CalendarAuthCompletedHandler
  ↓ Guarda tokens encriptados
  ↓ Sincroniza calendario
```

---

## 📋 Eventos Necesarios

### **1. Eventos de Autenticación**

#### **CalendarAuthRequestedEvent**

```typescript
// Emitido por: availability-service
// Consumido por: auth-service
interface CalendarAuthRequestedEvent {
  eventName: "calendar.auth.requested";
  userId: string;
  provider: "google" | "microsoft";
  purpose: "calendar";
  redirectUri: string;
  state: string; // Para validación CSRF
  correlationId: string;
  timestamp: Date;
}
```

#### **CalendarAuthCompletedEvent**

```typescript
// Emitido por: auth-service
// Consumido por: availability-service
interface CalendarAuthCompletedEvent {
  eventName: "calendar.auth.completed";
  userId: string;
  provider: "google" | "microsoft";
  tokens: {
    accessToken: string; // Encriptado
    refreshToken: string; // Encriptado
    expiresAt: Date;
    scope: string[];
  };
  userInfo: {
    email: string;
    name: string;
  };
  correlationId: string;
  timestamp: Date;
}
```

#### **CalendarAuthFailedEvent**

```typescript
// Emitido por: auth-service
// Consumido por: availability-service
interface CalendarAuthFailedEvent {
  eventName: "calendar.auth.failed";
  userId: string;
  provider: "google" | "microsoft";
  error: string;
  errorCode: string;
  correlationId: string;
  timestamp: Date;
}
```

---

### **2. Eventos de Sincronización**

#### **CalendarSyncRequestedEvent**

```typescript
// Emitido por: availability-service
// Consumido por: auth-service
interface CalendarSyncRequestedEvent {
  eventName: "calendar.sync.requested";
  userId: string;
  provider: "google" | "microsoft";
  operation: "import" | "export" | "bidirectional";
  dateRange: {
    start: Date;
    end: Date;
  };
  correlationId: string;
  timestamp: Date;
}
```

#### **CalendarEventCreatedEvent**

```typescript
// Emitido por: availability-service → auth-service → Calendar API
// Consumido por: availability-service (confirmación)
interface CalendarEventCreatedEvent {
  eventName: "calendar.event.created";
  userId: string;
  provider: "google" | "microsoft";
  calendarEventId: string; // ID externo del calendario
  reservationId: string; // ID interno de Bookly
  eventData: {
    summary: string;
    description: string;
    startTime: Date;
    endTime: Date;
    location: string;
  };
  correlationId: string;
  timestamp: Date;
}
```

---

### **3. Eventos de Gestión de Tokens**

#### **CalendarTokenRefreshRequested**

```typescript
// Emitido por: availability-service (cuando token expira)
// Consumido por: auth-service
interface CalendarTokenRefreshRequested {
  eventName: "calendar.token.refresh.requested";
  userId: string;
  provider: "google" | "microsoft";
  refreshToken: string; // Encriptado
  correlationId: string;
  timestamp: Date;
}
```

#### **CalendarTokenRefreshedEvent**

```typescript
// Emitido por: auth-service
// Consumido por: availability-service
interface CalendarTokenRefreshedEvent {
  eventName: "calendar.token.refreshed";
  userId: string;
  provider: "google" | "microsoft";
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
  correlationId: string;
  timestamp: Date;
}
```

---

## 🔧 Implementación Propuesta

### **Paso 1: Crear Eventos en @libs/common**

```typescript
// libs/common/src/events/calendar.events.ts
export namespace CalendarEvents {
  // Event names
  export const AUTH_REQUESTED = "calendar.auth.requested";
  export const AUTH_COMPLETED = "calendar.auth.completed";
  export const AUTH_FAILED = "calendar.auth.failed";
  export const SYNC_REQUESTED = "calendar.sync.requested";
  export const EVENT_CREATED = "calendar.event.created";
  export const TOKEN_REFRESH_REQUESTED = "calendar.token.refresh.requested";
  export const TOKEN_REFRESHED = "calendar.token.refreshed";

  // Interfaces (las definidas arriba)
}
```

---

### **Paso 2: Handler en auth-service**

```typescript
// apps/auth-service/src/modules/oauth/handlers/calendar-auth-requested.handler.ts
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { CalendarEvents } from "@libs/common/src/events";
import { OAuthService } from "../services/oauth.service";
import { EventBusService } from "@libs/event-bus";

@EventsHandler(CalendarEvents.CalendarAuthRequestedEvent)
export class CalendarAuthRequestedHandler
  implements IEventHandler<CalendarEvents.CalendarAuthRequestedEvent>
{
  constructor(
    private readonly oauthService: OAuthService,
    private readonly eventBus: EventBusService
  ) {}

  async handle(event: CalendarEvents.CalendarAuthRequestedEvent) {
    try {
      // 1. Generar URL de autorización OAuth
      const authUrl = await this.oauthService.getAuthorizationUrl(
        event.provider,
        event.redirectUri,
        event.state
      );

      // 2. Guardar estado en Redis (para validación CSRF)
      await this.oauthService.saveAuthState(event.state, {
        userId: event.userId,
        provider: event.provider,
        correlationId: event.correlationId,
      });

      // 3. Emitir evento con URL de autorización
      await this.eventBus.publish({
        eventName: "calendar.auth.url.generated",
        userId: event.userId,
        authUrl,
        correlationId: event.correlationId,
      });
    } catch (error) {
      // Emitir evento de error
      await this.eventBus.publish({
        eventName: CalendarEvents.AUTH_FAILED,
        userId: event.userId,
        provider: event.provider,
        error: error.message,
        errorCode: "AUTH_URL_GENERATION_FAILED",
        correlationId: event.correlationId,
      });
    }
  }
}
```

---

### **Paso 3: Callback Handler en auth-service**

```typescript
// apps/auth-service/src/modules/oauth/controllers/calendar-oauth.controller.ts
@Controller("calendar/oauth")
export class CalendarOAuthController {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly eventBus: EventBusService
  ) {}

  @Get(":provider/callback")
  async handleCallback(
    @Param("provider") provider: "google" | "microsoft",
    @Query("code") code: string,
    @Query("state") state: string
  ) {
    try {
      // 1. Validar estado CSRF
      const authState = await this.oauthService.validateAuthState(state);

      // 2. Intercambiar código por tokens
      const tokens = await this.oauthService.exchangeCodeForTokens(
        provider,
        code
      );

      // 3. Obtener información del usuario
      const userInfo = await this.oauthService.getUserInfo(
        provider,
        tokens.accessToken
      );

      // 4. Encriptar tokens
      const encryptedTokens = {
        accessToken: await this.oauthService.encryptToken(tokens.accessToken),
        refreshToken: await this.oauthService.encryptToken(tokens.refreshToken),
        expiresAt: tokens.expiresAt,
        scope: tokens.scope,
      };

      // 5. Emitir evento de autenticación completada
      await this.eventBus.publish({
        eventName: CalendarEvents.AUTH_COMPLETED,
        userId: authState.userId,
        provider,
        tokens: encryptedTokens,
        userInfo,
        correlationId: authState.correlationId,
        timestamp: new Date(),
      });

      // 6. Redirigir a frontend
      return { success: true, message: "Calendar connected successfully" };
    } catch (error) {
      await this.eventBus.publish({
        eventName: CalendarEvents.AUTH_FAILED,
        userId: authState?.userId,
        provider,
        error: error.message,
        errorCode: "TOKEN_EXCHANGE_FAILED",
        correlationId: authState?.correlationId,
        timestamp: new Date(),
      });
      throw error;
    }
  }
}
```

---

### **Paso 4: Handler en availability-service**

```typescript
// apps/availability-service/src/application/handlers/calendar-auth-completed.handler.ts
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { CalendarEvents } from "@libs/common/src/events";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@EventsHandler(CalendarEvents.CalendarAuthCompletedEvent)
export class CalendarAuthCompletedHandler
  implements IEventHandler<CalendarEvents.CalendarAuthCompletedEvent>
{
  constructor(
    @InjectModel("CalendarIntegration")
    private readonly calendarModel: Model<any>
  ) {}

  async handle(event: CalendarEvents.CalendarAuthCompletedEvent) {
    // 1. Guardar tokens en MongoDB (ya encriptados)
    await this.calendarModel.create({
      userId: event.userId,
      provider: event.provider,
      accessToken: event.tokens.accessToken,
      refreshToken: event.tokens.refreshToken,
      expiresAt: event.tokens.expiresAt,
      scope: event.tokens.scope,
      userEmail: event.userInfo.email,
      isActive: true,
      lastSync: null,
      createdAt: new Date(),
    });

    // 2. Iniciar sincronización inicial (opcional)
    // await this.syncCalendar(event.userId, event.provider);
  }
}
```

---

### **Paso 5: Servicio de Calendar en availability-service**

```typescript
// apps/availability-service/src/application/services/calendar-event-driven.service.ts
import { Injectable } from "@nestjs/common";
import { EventBusService } from "@libs/event-bus";
import { CalendarEvents } from "@libs/common/src/events";

@Injectable()
export class CalendarEventDrivenService {
  constructor(private readonly eventBus: EventBusService) {}

  /**
   * Solicitar autenticación con calendario
   */
  async requestCalendarAuth(
    userId: string,
    provider: "google" | "microsoft",
    redirectUri: string
  ): Promise<string> {
    const correlationId = this.generateCorrelationId();
    const state = this.generateState();

    await this.eventBus.publish({
      eventName: CalendarEvents.AUTH_REQUESTED,
      userId,
      provider,
      purpose: "calendar",
      redirectUri,
      state,
      correlationId,
      timestamp: new Date(),
    });

    return correlationId;
  }

  /**
   * Crear evento en calendario externo
   */
  async createCalendarEvent(
    userId: string,
    provider: "google" | "microsoft",
    reservationId: string,
    eventData: {
      summary: string;
      description: string;
      startTime: Date;
      endTime: Date;
      location: string;
    }
  ): Promise<void> {
    await this.eventBus.publish({
      eventName: CalendarEvents.EVENT_CREATED,
      userId,
      provider,
      reservationId,
      eventData,
      correlationId: this.generateCorrelationId(),
      timestamp: new Date(),
    });
  }

  private generateCorrelationId(): string {
    return `cal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
```

---

## 📁 Archivos a Crear/Modificar

### **Crear**

1. ✅ `libs/common/src/events/calendar.events.ts` - Definición de eventos
2. ✅ `apps/auth-service/src/modules/oauth/handlers/calendar-auth-requested.handler.ts`
3. ✅ `apps/auth-service/src/modules/oauth/controllers/calendar-oauth.controller.ts`
4. ✅ `apps/availability-service/src/application/handlers/calendar-auth-completed.handler.ts`
5. ✅ `apps/availability-service/src/application/handlers/calendar-auth-failed.handler.ts`
6. ✅ `apps/availability-service/src/application/handlers/calendar-token-refreshed.handler.ts`
7. ✅ `apps/availability-service/src/application/services/calendar-event-driven.service.ts`
8. ✅ `apps/availability-service/src/infrastructure/schemas/calendar-integration.schema.ts`

### **Modificar**

9. ✅ `apps/availability-service/src/availability.module.ts` - Eliminar comentarios, agregar nuevo servicio
10. ✅ `apps/auth-service/src/modules/oauth/oauth.module.ts` - Registrar handlers y controller

### **Eliminar**

11. ❌ `calendar-integration.service.ts.disabled` - Ya no es necesario

---

## ⚠️ Consideraciones de Seguridad

1. **Tokens Encriptados**: Todos los tokens OAuth deben encriptarse antes de guardarse
2. **CSRF Protection**: Validar state parameter en callbacks
3. **Token Rotation**: Implementar refresh automático de tokens
4. **Scope Mínimo**: Solo solicitar permisos necesarios (calendar.readonly)
5. **Timeout**: Establecer timeout en eventos (5-10 segundos)
6. **Retry Logic**: Implementar reintentos en caso de fallo

---

## 🎯 Plan de Implementación

### **Fase 1: Infraestructura** (1-2 días)

- [ ] Crear eventos en `@libs/common`
- [ ] Crear schemas de MongoDB
- [ ] Configurar variables de entorno

### **Fase 2: auth-service** (2-3 días)

- [ ] Implementar handlers de OAuth
- [ ] Crear controller de callbacks
- [ ] Implementar encriptación de tokens
- [ ] Testing unitario

### **Fase 3: availability-service** (2-3 días)

- [ ] Implementar handlers de eventos
- [ ] Crear servicio event-driven
- [ ] Actualizar controllers existentes
- [ ] Testing unitario

### **Fase 4: Integración** (1-2 días)

- [ ] Testing end-to-end
- [ ] Documentación de API
- [ ] Despliegue a staging

**Total estimado**: 6-10 días de desarrollo

---

## ✅ Beneficios de la Migración

1. ✅ **Desacoplamiento**: availability-service no depende directamente de OAuth
2. ✅ **Centralización**: Toda la lógica OAuth en auth-service
3. ✅ **Escalabilidad**: Cada servicio puede escalar independientemente
4. ✅ **Seguridad**: Tokens manejados solo por auth-service
5. ✅ **Trazabilidad**: Todos los eventos quedan registrados
6. ✅ **Resiliencia**: Si auth-service falla, availability-service sigue funcionando

---

## 🚀 Próximos Pasos Inmediatos

1. **Limpiar comentarios innecesarios** en `availability.module.ts`:

   ```typescript
   // ELIMINAR estas líneas:
   // import { ResourceMetadataSyncService } from "./application/services/resource-metadata-sync.service";
   // ResourceMetadataSyncService,
   ```

2. **Decidir prioridad** de Calendar Integration:
   - ¿Es crítico para MVP?
   - ¿Cuántos usuarios usarán esta funcionalidad?
   - ¿Hay alternativas más simples?

3. **Si se decide implementar**, seguir el plan de implementación de arriba

---

**Última actualización**: 19 de noviembre de 2025  
**Estado**: 📋 **Propuesta lista para aprobación**  
**Requiere**: Aprobación del Product Owner antes de iniciar
