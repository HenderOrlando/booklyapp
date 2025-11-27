/**
 * Configuración de conexión a MongoDB
 */
export interface DatabaseConfig {
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

/**
 * Estados de conexión de Mongoose
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */
export type MongooseConnectionState = 0 | 1 | 2 | 3;

/**
 * Resultado del health check de la base de datos
 */
export interface DatabaseHealthCheck {
  isHealthy: boolean;
  state: MongooseConnectionState;
  database: string;
  latency?: number;
  error?: string;
}
