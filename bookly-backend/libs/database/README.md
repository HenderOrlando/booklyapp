# @libs/database

Librería centralizada para gestión de conexión a MongoDB usando Mongoose en todos los microservicios de Bookly.

## 📋 Características

- ✅ Conexión global a MongoDB con Mongoose
- ✅ Configuración dinámica desde variables de entorno
- ✅ Health checks completos con latencia
- ✅ Lifecycle hooks (OnModuleInit, OnModuleDestroy)
- ✅ Logging estructurado de eventos de conexión
- ✅ Reconexión automática
- ✅ Pool de conexiones optimizado
- ✅ Shutdown graceful
- ✅ Tipos TypeScript completos

## 🚀 Instalación y Uso

### 1. Importar el módulo en tu microservicio

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@libs/database";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DatabaseModule, // Importar DatabaseModule
  ],
})
export class AppModule {}
```

### 2. Configurar variables de entorno

Crear archivo `.env` con las siguientes variables:

```bash
# Configuración obligatoria
DATABASE_URI=mongodb://localhost:27017,localhost:27018,localhost:27019
DATABASE_NAME=bookly
MONGO_INITDB_ROOT_USERNAME=bookly
MONGO_INITDB_ROOT_PASSWORD=bookly123

# Configuración opcional
MONGO_AUTH_SOURCE=admin
MONGO_RETRY_ATTEMPTS=5
MONGO_RETRY_DELAY=3000

# Timeouts (en milisegundos)
MONGO_SERVER_SELECTION_TIMEOUT=30000
MONGO_SOCKET_TIMEOUT=45000
MONGO_CONNECT_TIMEOUT=30000

# Pool de conexiones
MONGO_MAX_POOL_SIZE=10
MONGO_MIN_POOL_SIZE=2

# Otras opciones
MONGO_AUTO_INDEX=true
MONGO_DIRECT_CONNECTION=false
```

### 3. Usar DatabaseService en tus servicios

```typescript
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@libs/database";

@Injectable()
export class YourService {
  constructor(private readonly databaseService: DatabaseService) {}

  async checkDatabaseHealth() {
    // Health check simple
    const isHealthy = await this.databaseService.isHealthy();

    // Health check completo con latencia
    const healthCheck = await this.databaseService.healthCheck();
    console.log("Database health:", healthCheck);

    return healthCheck;
  }

  async getDatabaseInfo() {
    // Obtener información de la conexión
    const info = this.databaseService.getConnectionInfo();
    console.log("Database info:", info);

    return info;
  }

  async pingDatabase() {
    // Hacer ping a la base de datos
    const pingResult = await this.databaseService.ping();
    console.log("Ping result:", pingResult);

    return pingResult;
  }
}
```

### 4. Usar Mongoose directamente con esquemas

```typescript
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./schemas/user.schema";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
```

### 5. Integrar con health checks del microservicio

```typescript
import { Controller, Get } from "@nestjs/common";
import { DatabaseService } from "@libs/database";

@Controller("health")
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async check() {
    const dbHealth = await this.databaseService.healthCheck();

    return {
      status: dbHealth.isHealthy ? "ok" : "error",
      database: {
        connected: dbHealth.isHealthy,
        name: dbHealth.database,
        state: dbHealth.state,
        latency: dbHealth.latency,
        error: dbHealth.error,
      },
    };
  }
}
```

### 6. Habilitar shutdown graceful en main.ts

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DatabaseService } from "@libs/database";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar shutdown hooks
  const databaseService = app.get(DatabaseService);
  await databaseService.enableShutdownHooks(app);

  await app.listen(3000);
}
bootstrap();
```

## 📚 API Reference

### DatabaseService

#### Métodos principales

##### `isHealthy(): Promise<boolean>`

Verifica si la conexión está saludable (conectada o conectando).

```typescript
const isHealthy = await databaseService.isHealthy();
// Returns: true | false
```

##### `healthCheck(): Promise<DatabaseHealthCheck>`

Realiza un health check completo con medición de latencia.

```typescript
const health = await databaseService.healthCheck();
// Returns: {
//   isHealthy: boolean,
//   state: MongooseConnectionState,
//   database: string,
//   latency?: number,
//   error?: string
// }
```

##### `ping(): Promise<boolean>`

Hace ping a la base de datos para verificar conectividad.

```typescript
const pingResult = await databaseService.ping();
// Returns: true | false
```

##### `getConnection(): Connection`

Obtiene la instancia de conexión de Mongoose.

```typescript
const connection = databaseService.getConnection();
```

##### `getDatabaseName(): string`

Obtiene el nombre de la base de datos conectada.

```typescript
const dbName = databaseService.getDatabaseName();
// Returns: "bookly"
```

##### `getConnectionState(): MongooseConnectionState`

Obtiene el estado actual de la conexión.

```typescript
const state = databaseService.getConnectionState();
// Returns: 0 | 1 | 2 | 3
// 0 = DISCONNECTED
// 1 = CONNECTED
// 2 = CONNECTING
// 3 = DISCONNECTING
```

##### `isServiceInitialized(): boolean`

Verifica si el servicio está completamente inicializado.

```typescript
const isInit = databaseService.isServiceInitialized();
// Returns: true | false
```

##### `getConnectionInfo(): object`

Obtiene información completa de la conexión.

```typescript
const info = databaseService.getConnectionInfo();
// Returns: {
//   database: string,
//   host: string,
//   port: number,
//   state: string,
//   isInitialized: boolean
// }
```

##### `enableShutdownHooks(app: any): Promise<void>`

Habilita hooks de apagado graceful para la aplicación.

```typescript
await databaseService.enableShutdownHooks(app);
```

## 🔧 Interfaces y Tipos

### DatabaseHealthCheck

```typescript
interface DatabaseHealthCheck {
  isHealthy: boolean;
  state: MongooseConnectionState;
  database: string;
  latency?: number;
  error?: string;
}
```

### MongooseConnectionState

```typescript
type MongooseConnectionState = 0 | 1 | 2 | 3;
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
```

### DatabaseConfig

```typescript
interface DatabaseConfig {
  uri: string;
  dbName: string;
  user?: string;
  pass?: string;
  authSource?: string;
  retryAttempts?: number;
  retryDelay?: number;
  connectionTimeout?: number;
  socketTimeout?: number;
  maxPoolSize?: number;
  minPoolSize?: number;
}
```

## 📝 Eventos de Conexión

El `DatabaseService` registra automáticamente los siguientes eventos:

- **connected**: Cuando se establece la conexión inicial
- **disconnected**: Cuando se pierde la conexión
- **reconnected**: Cuando se restablece la conexión
- **error**: Cuando ocurre un error de conexión
- **close**: Cuando se cierra la conexión

Todos los eventos son registrados con logging estructurado.

## 🏗️ Arquitectura

Esta librería sigue los principios de:

- **Clean Architecture**: Separación de responsabilidades
- **Dependency Injection**: Usando el sistema de NestJS
- **Global Module**: Disponible en todos los módulos sin necesidad de importar
- **Lifecycle Hooks**: Gestión automática de conexión/desconexión

## 🔍 Troubleshooting

### Error: DATABASE_URI is required

Asegúrate de tener la variable `DATABASE_URI` en tu archivo `.env`:

```bash
DATABASE_URI=mongodb://localhost:27017
```

### Error: DATABASE_NAME is required

Asegúrate de tener la variable `DATABASE_NAME` en tu archivo `.env`:

```bash
DATABASE_NAME=bookly
```

### Conexión lenta o timeouts

Ajusta los timeouts en el `.env`:

```bash
MONGO_SERVER_SELECTION_TIMEOUT=60000
MONGO_SOCKET_TIMEOUT=60000
MONGO_CONNECT_TIMEOUT=60000
```

### Pool de conexiones agotado

Aumenta el tamaño del pool:

```bash
MONGO_MAX_POOL_SIZE=20
MONGO_MIN_POOL_SIZE=5
```

## 📦 Exports

```typescript
export * from "./database.module";
export * from "./database.service";
export * from "./interfaces/database-config.interface";
```

## 🤝 Integración con otros microservicios

Esta librería está diseñada para ser usada en todos los microservicios de Bookly:

- **api-gateway**
- **auth-service**
- **availability-service**
- **reports-service**
- **resources-service**
- **stockpile-service**

Simplemente importa `DatabaseModule` en el módulo principal de cada microservicio.

## ⚡ Mejores Prácticas

1. **Siempre usar ConfigModule**: Asegúrate de que ConfigModule esté configurado como global
2. **Validar variables de entorno**: DATABASE_URI y DATABASE_NAME son obligatorias
3. **Habilitar shutdown hooks**: Para garantizar cierre graceful de conexiones
4. **Monitorear health checks**: Integrar con endpoints de salud del microservicio
5. **Ajustar pool según carga**: Configura maxPoolSize según las necesidades del servicio
6. **Usar logging estructurado**: Todos los eventos se registran automáticamente

---

**Mantenido por**: Equipo Bookly  
**Versión**: 1.0.0  
**Licencia**: MIT
