/**
 * OAuth Module - auth-service
 * Migrado desde @libs/oauth
 */

// Module
export * from "./oauth.module";

// Interfaces
export * from "./interfaces/oauth.interface";

// Providers
export * from "./providers/google-oauth.provider";
export * from "./providers/microsoft-oauth.provider";

// Utils
export * from "./utils/token-encryption.util";

// Events (para futuro event-driven)
export * from "./events/oauth-authorization-requested.event";
export * from "./events/oauth-callback-received.event";
