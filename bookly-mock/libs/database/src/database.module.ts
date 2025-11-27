import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseService } from "./database.service";

/**
 * Módulo global de base de datos para gestión de MongoDB
 *
 * Este módulo configura y proporciona:
 * - Conexión a MongoDB usando Mongoose
 * - Configuración dinámica desde variables de entorno
 * - DatabaseService para operaciones y health checks
 * - Configuración de reconexión automática
 * - Pool de conexiones optimizado
 *
 * @module DatabaseModule
 */

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>("DATABASE_URI");
        const dbName = configService.get<string>("DATABASE_NAME");

        if (!uri) {
          throw new Error("DATABASE_URI is required in environment variables");
        }

        if (!dbName) {
          throw new Error("DATABASE_NAME is required in environment variables");
        }

        return {
          uri,
          dbName,
          user: configService.get<string>("MONGO_INITDB_ROOT_USERNAME"),
          pass: configService.get<string>("MONGO_INITDB_ROOT_PASSWORD"),
          authSource: configService.get<string>("MONGO_AUTH_SOURCE", "admin"),

          // Configuración de reconexión
          retryAttempts: configService.get<number>("MONGO_RETRY_ATTEMPTS", 5),
          retryDelay: configService.get<number>("MONGO_RETRY_DELAY", 3000),

          // Timeouts
          serverSelectionTimeoutMS: configService.get<number>(
            "MONGO_SERVER_SELECTION_TIMEOUT",
            30000
          ),
          socketTimeoutMS: configService.get<number>(
            "MONGO_SOCKET_TIMEOUT",
            45000
          ),
          connectTimeoutMS: configService.get<number>(
            "MONGO_CONNECT_TIMEOUT",
            30000
          ),

          // Pool de conexiones
          maxPoolSize: configService.get<number>("MONGO_MAX_POOL_SIZE", 10),
          minPoolSize: configService.get<number>("MONGO_MIN_POOL_SIZE", 2),

          // Configuración adicional
          autoIndex: configService.get<boolean>("MONGO_AUTO_INDEX", true),

          // Configuración de conexión
          directConnection: configService.get<boolean>(
            "MONGO_DIRECT_CONNECTION",
            false
          ),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, MongooseModule],
})
export class DatabaseModule {}
