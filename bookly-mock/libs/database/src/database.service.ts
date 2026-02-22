import { createLogger } from "@libs/common";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import {
  DatabaseHealthCheck,
  MongooseConnectionState,
} from "./interfaces/database-config.interface";

/**
 * Servicio centralizado para gestión de conexión a MongoDB
 *
 * Proporciona:
 * - Gestión de conexión con lifecycle hooks
 * - Health checks completos
 * - Logging estructurado de eventos de conexión
 * - Métodos utilitarios para operaciones de base de datos
 *
 * @class DatabaseService
 * @implements {OnModuleInit}
 * @implements {OnModuleDestroy}
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = createLogger("DatabaseService");
  private isInitialized = false;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.setupConnectionHandlers();
  }

  /**
   * Inicializa el servicio de base de datos cuando el módulo se carga
   */
  async onModuleInit(): Promise<void> {
    try {
      // Verificar estado de conexión
      // 1 = connected
      if (this.connection.readyState === 1) {
        this.isInitialized = true;
        this.logger.info("✅ Database module initialized successfully", {
          database: this.connection.name,
          host: this.connection.host,
          state: this.getConnectionStateName(this.connection.readyState),
        });
      } else {
        this.logger.warn(
          "⚠️ Database connection not ready during module init",
          {
            state: this.getConnectionStateName(this.connection.readyState),
          },
        );
      }
    } catch (error) {
      this.logger.error(
        "❌ Failed to initialize database module",
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Limpia recursos cuando el módulo se destruye
   */
  async onModuleDestroy(): Promise<void> {
    try {
      // 0 = disconnected
      if (this.connection.readyState !== 0) {
        await this.connection.close();
        this.logger.info("📴 Database connection closed gracefully", {
          database: this.connection.name,
        });
      }
      this.isInitialized = false;
    } catch (error) {
      this.logger.error("❌ Error closing database connection", error as Error);
    }
  }

  /**
   * Configura listeners para eventos de conexión de MongoDB
   */
  private setupConnectionHandlers(): void {
    this.connection.on("connected", () => {
      this.isInitialized = true;
      this.logger.info("✅ MongoDB connected successfully", {
        database: this.connection.name,
        host: this.connection.host,
        port: this.connection.port,
      });
    });

    this.connection.on("error", (error) => {
      this.logger.error("❌ MongoDB connection error", error, {
        database: this.connection.name,
        state: this.getConnectionStateName(this.connection.readyState),
      });
    });

    this.connection.on("disconnected", () => {
      this.isInitialized = false;
      this.logger.warn("⚠️ MongoDB disconnected", {
        database: this.connection.name,
      });
    });

    this.connection.on("reconnected", () => {
      this.isInitialized = true;
      this.logger.info("🔄 MongoDB reconnected", {
        database: this.connection.name,
      });
    });

    this.connection.on("close", () => {
      this.logger.info("📴 MongoDB connection closed", {
        database: this.connection.name,
      });
    });
  }

  /**
   * Verifica el estado de salud de la conexión a la base de datos
   * @returns {Promise<boolean>} true si la conexión está saludable
   */
  async isHealthy(): Promise<boolean> {
    try {
      const state = this.connection.readyState;
      // 1 = connected, 2 = connecting
      return state === 1 || state === 2;
    } catch (error) {
      this.logger.error("❌ Health check failed", error as Error);
      return false;
    }
  }

  /**
   * Realiza un health check completo de la base de datos
   * @returns {Promise<DatabaseHealthCheck>} Información detallada del estado
   */
  async healthCheck(): Promise<DatabaseHealthCheck> {
    const startTime = Date.now();

    try {
      const state = this.connection.readyState;
      const isHealthy = state === 1; // 1 = connected

      let latency: number | undefined;

      if (isHealthy && this.connection.db) {
        await this.connection.db.admin().ping();
        latency = Date.now() - startTime;
      }

      return {
        isHealthy,
        state: state as MongooseConnectionState,
        database: this.connection.name,
        latency,
      };
    } catch (error) {
      this.logger.error("❌ Health check failed", error as Error);
      return {
        isHealthy: false,
        state: this.connection.readyState as MongooseConnectionState,
        database: this.connection.name,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Realiza un ping a la base de datos para verificar conectividad
   * @returns {Promise<boolean>} true si el ping fue exitoso
   */
  async ping(): Promise<boolean> {
    try {
      if (!this.connection.db) {
        this.logger.warn("⚠️ Database connection not available for ping");
        return false;
      }
      await this.connection.db.admin().ping();
      return true;
    } catch (error) {
      this.logger.error("❌ Ping failed", error as Error);
      return false;
    }
  }

  /**
   * Obtiene el nombre del estado de conexión actual
   * @param {number} state - Estado numérico de la conexión
   * @returns {string} Nombre del estado
   */
  private getConnectionStateName(state: number): string {
    const states: Record<number, string> = {
      0: "DISCONNECTED",
      1: "CONNECTED",
      2: "CONNECTING",
      3: "DISCONNECTING",
    };
    return states[state] || "UNKNOWN";
  }

  /**
   * Obtiene la instancia de conexión de Mongoose
   * @returns {Connection} Conexión de Mongoose
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Obtiene el nombre de la base de datos conectada
   * @returns {string} Nombre de la base de datos
   */
  getDatabaseName(): string {
    return this.connection.name;
  }

  /**
   * Obtiene el estado actual de la conexión
   * @returns {ConnectionStates} Estado de la conexión
   */
  getConnectionState(): MongooseConnectionState {
    return this.connection.readyState as MongooseConnectionState;
  }

  /**
   * Verifica si el servicio está inicializado
   * @returns {boolean} true si está inicializado
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtiene información de la conexión actual
   * @returns {object} Información de la conexión
   */
  getConnectionInfo(): {
    database: string;
    host: string;
    port: number;
    state: string;
    isInitialized: boolean;
  } {
    return {
      database: this.connection.name,
      host: this.connection.host,
      port: this.connection.port,
      state: this.getConnectionStateName(this.connection.readyState),
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Habilita hooks de apagado graceful para la aplicación
   * @param {any} app - Instancia de la aplicación NestJS
   */
  async enableShutdownHooks(app: any): Promise<void> {
    process.on("SIGTERM", async () => {
      this.logger.info("⚠️ SIGTERM received, closing database connection...");
      await app.close();
    });

    process.on("SIGINT", async () => {
      this.logger.info("⚠️ SIGINT received, closing database connection...");
      await app.close();
    });
  }
}
