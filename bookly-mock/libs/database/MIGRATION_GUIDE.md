# Guía de Migración a @libs/database

Esta guía explica cómo migrar los microservicios existentes para usar la librería estandarizada `@libs/database`.

## 📋 Cambios Implementados

### 1. DatabaseService Mejorado

**Antes:**

```typescript
export class DatabaseService {
  async isHealthy(): Promise<boolean> {
    const state = this.connection.readyState;
    return state === 1 || state === 2;
  }
}
```

**Después:**

```typescript
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  // ✅ Lifecycle hooks para gestión automática
  async onModuleInit(): Promise<void> {
    /* ... */
  }
  async onModuleDestroy(): Promise<void> {
    /* ... */
  }

  // ✅ Health check simple
  async isHealthy(): Promise<boolean> {
    /* ... */
  }

  // ✅ Health check completo con latencia
  async healthCheck(): Promise<DatabaseHealthCheck> {
    /* ... */
  }

  // ✅ Métodos utilitarios
  getConnectionInfo(): object {
    /* ... */
  }
  getConnectionState(): MongooseConnectionState {
    /* ... */
  }
  isServiceInitialized(): boolean {
    /* ... */
  }

  // ✅ Shutdown graceful
  enableShutdownHooks(app: any): Promise<void> {
    /* ... */
  }
}
```

### 2. DatabaseModule con Validación

**Antes:**

```typescript
MongooseModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>("DATABASE_URI"),
    dbName: configService.get<string>("DATABASE_NAME"),
    // Configuración básica
  }),
});
```

**Después:**

```typescript
MongooseModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    // ✅ Validación de variables obligatorias
    const uri = configService.get<string>("DATABASE_URI");
    if (!uri) throw new Error("DATABASE_URI is required");

    const dbName = configService.get<string>("DATABASE_NAME");
    if (!dbName) throw new Error("DATABASE_NAME is required");

    return {
      uri,
      dbName,
      // ✅ Configuración completa con defaults
      retryAttempts: configService.get<number>("MONGO_RETRY_ATTEMPTS", 5),
      serverSelectionTimeoutMS: configService.get<number>(
        "MONGO_SERVER_SELECTION_TIMEOUT",
        30000
      ),
      maxPoolSize: configService.get<number>("MONGO_MAX_POOL_SIZE", 10),
      // ... más opciones
    };
  },
});
```

### 3. Interfaces TypeScript

**Antes:**

```typescript
enum DatabaseConnectionState {
  DISCONNECTED = 0,
  CONNECTED = 1,
  // ...
}
```

**Después:**

```typescript
// ✅ Type alias compatible con Mongoose
type MongooseConnectionState = 0 | 1 | 2 | 3;

// ✅ Interface completa para health checks
interface DatabaseHealthCheck {
  isHealthy: boolean;
  state: MongooseConnectionState;
  database: string;
  latency?: number;
  error?: string;
}
```

## 🔄 Pasos de Migración

### Paso 1: Actualizar imports

**En tu módulo principal (app.module.ts):**

```typescript
// ❌ Antes
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URI'),
        // ...
      }),
    }),
  ],
})

// ✅ Después
import { DatabaseModule } from '@libs/database';

@Module({
  imports: [
    DatabaseModule, // Simple importación
  ],
})
```

### Paso 2: Actualizar variables de entorno

Copiar las variables del archivo `.env.example` de `@libs/database`:

```bash
# Obligatorias
DATABASE_URI=mongodb://localhost:27017
DATABASE_NAME=bookly
MONGO_INITDB_ROOT_USERNAME=bookly
MONGO_INITDB_ROOT_PASSWORD=bookly123

# Opcionales (con defaults)
MONGO_AUTH_SOURCE=admin
MONGO_RETRY_ATTEMPTS=5
MONGO_MAX_POOL_SIZE=10
# ... etc
```

### Paso 3: Actualizar uso de DatabaseService

**En tus controllers o services:**

```typescript
import { DatabaseService } from "@libs/database";

@Controller("health")
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async check() {
    // ✅ Usar health check completo
    const dbHealth = await this.databaseService.healthCheck();

    return {
      status: dbHealth.isHealthy ? "ok" : "error",
      database: dbHealth,
    };
  }
}
```

### Paso 4: Habilitar shutdown graceful

**En main.ts de cada microservicio:**

```typescript
import { DatabaseService } from "@libs/database";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Habilitar shutdown graceful
  const databaseService = app.get(DatabaseService);
  await databaseService.enableShutdownHooks(app);

  await app.listen(3000);
}
bootstrap();
```

### Paso 5: Actualizar health checks

**Antes:**

```typescript
@Get('health')
async health() {
  const isHealthy = await this.databaseService.isHealthy();
  return { database: isHealthy };
}
```

**Después:**

```typescript
@Get('health')
async health() {
  const healthCheck = await this.databaseService.healthCheck();
  return {
    database: {
      connected: healthCheck.isHealthy,
      name: healthCheck.database,
      state: healthCheck.state,
      latency: healthCheck.latency,
    },
  };
}
```

## 📂 Microservicios a Migrar

### 1. api-gateway ✅

- [ ] Actualizar imports en `api-gateway.module.ts`
- [ ] Copiar variables de entorno
- [ ] Actualizar health endpoint
- [ ] Habilitar shutdown hooks en `main.ts`

### 2. auth-service ✅

- [ ] Actualizar imports en `auth.module.ts`
- [ ] Copiar variables de entorno
- [ ] Actualizar health endpoint
- [ ] Habilitar shutdown hooks en `main.ts`

### 3. availability-service ✅

- [ ] Actualizar imports en `availability.module.ts`
- [ ] Copiar variables de entorno
- [ ] Actualizar health endpoint
- [ ] Habilitar shutdown hooks en `main.ts`

### 4. reports-service ✅

- [ ] Actualizar imports en `reports.module.ts`
- [ ] Copiar variables de entorno
- [ ] Actualizar health endpoint
- [ ] Habilitar shutdown hooks en `main.ts`

### 5. resources-service ✅

- [ ] Actualizar imports en `resources.module.ts`
- [ ] Copiar variables de entorno
- [ ] Actualizar health endpoint
- [ ] Habilitar shutdown hooks en `main.ts`

### 6. stockpile-service ✅

- [ ] Actualizar imports en `stockpile.module.ts`
- [ ] Copiar variables de entorno
- [ ] Actualizar health endpoint
- [ ] Habilitar shutdown hooks en `main.ts`

## 🔍 Verificación Post-Migración

### 1. Compilación

```bash
cd apps/[microservicio]
npm run build
```

### 2. Inicio del servicio

```bash
npm run start:dev
```

### 3. Verificar logs de conexión

Deberías ver:

```
✅ MongoDB connected successfully
✅ Database module initialized successfully
```

### 4. Probar health endpoint

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "name": "bookly",
    "state": 1,
    "latency": 15
  }
}
```

### 5. Verificar shutdown graceful

```bash
# Enviar SIGTERM
kill -TERM [PID]
```

Deberías ver en logs:

```
⚠️ SIGTERM received, closing database connection...
📴 Database connection closed gracefully
```

## ⚠️ Errores Comunes

### Error: DATABASE_URI is required

**Causa**: Falta la variable `DATABASE_URI` en `.env`  
**Solución**: Agregar `DATABASE_URI=mongodb://...` al archivo `.env`

### Error: Cannot find module '@libs/database'

**Causa**: Path alias no configurado  
**Solución**: Verificar que `tsconfig.json` tenga:

```json
{
  "compilerOptions": {
    "paths": {
      "@libs/*": ["libs/*"]
    }
  }
}
```

### Error: MongooseConnectionState not found

**Causa**: Import incorrecto  
**Solución**: Usar:

```typescript
import { DatabaseHealthCheck, MongooseConnectionState } from "@libs/database";
```

## 📊 Beneficios de la Migración

✅ **Configuración centralizada**: Una sola fuente de verdad  
✅ **Health checks mejorados**: Con latencia y estado detallado  
✅ **Lifecycle management**: Conexión y desconexión automática  
✅ **Shutdown graceful**: Cierre ordenado de conexiones  
✅ **Validación de configuración**: Errores tempranos si falta config  
✅ **Logging estructurado**: Eventos de conexión registrados  
✅ **Pool optimizado**: Configuración fine-tuned para producción  
✅ **Type safety**: Interfaces TypeScript completas

## 🎯 Próximos Pasos

1. Migrar un microservicio como prueba (recomendado: api-gateway)
2. Verificar funcionamiento completo
3. Migrar resto de microservicios uno por uno
4. Actualizar documentación de cada microservicio
5. Eliminar código duplicado de configuración de MongoDB

---

**Fecha de creación**: 2025-01-19  
**Autor**: Equipo Bookly  
**Versión**: 1.0.0
