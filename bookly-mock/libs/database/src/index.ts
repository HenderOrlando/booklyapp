/**
 * Database Library - Librería centralizada para gestión de MongoDB con Mongoose
 *
 * Esta librería proporciona una abstracción estandarizada para la conexión
 * y gestión de la base de datos MongoDB en todos los microservicios de Bookly.
 *
 * @module @libs/database
 */

export * from "./database.module";
export * from "./database.service";
export * from "./interfaces/database-config.interface";
export * from "./reference-data.module";
export * from "./repositories/reference-data.repository";
export * from "./schemas/reference-data.schema";
