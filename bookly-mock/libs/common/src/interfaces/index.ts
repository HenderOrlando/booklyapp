/**
 * Common Interfaces for Bookly Mock
 * Aligned with bookly-backend standard (ApiResponseBookly)
 */

import { ResponseContextPriority, ResponseContextType } from "../enums";

/**
 * Metadata for paginated responses
 */
export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/**
 * Metadata for advanced search paginated responses
 */
export interface AdvancedSearchPaginationMeta {
  pagination: PaginationMeta;
  executionTimeMs: number;
  timestamp: Date;
  filters: any;
}

/**
 * Context metadata for different response types
 * Includes idempotency and distributed tracing support
 */
export interface ResponseContext {
  type: ResponseContextType;
  timestamp: string | Date;

  // HTTP/WebSocket specific
  path?: string;
  method?: string;
  statusCode?: number;

  // Events/Messaging specific
  eventType?: string;
  service?: string;

  // Distributed tracing and correlation
  correlationId?: string; // Request correlation across services
  messageId?: string; // Unique message identifier
  causationId?: string; // ID of the message that caused this message

  // Idempotency support
  idempotencyKey?: string; // Client-provided idempotency key

  // Retry and reliability
  retryCount?: number; // Number of retry attempts
  maxRetries?: number; // Maximum retry attempts allowed
  ttl?: number; // Time to live in milliseconds
  expiresAt?: Date | string; // Expiration timestamp

  // Additional metadata
  version?: string; // Message/Event version for evolution
  priority?: ResponseContextPriority;
}

/**
 * Standard API Response Interface
 * Unified format for HTTP, WebSocket, Events, and RPC
 * Compatible with bookly-backend ApiResponseBookly
 */
export interface ApiResponseBookly<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta | AdvancedSearchPaginationMeta;
  timestamp?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  context?: ResponseContext;
}

/**
 * @deprecated Use ApiResponseBookly instead
 * Kept for backward compatibility
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]> | ApiError[];
  meta?: PaginationMeta | AdvancedSearchPaginationMeta;
  timestamp: Date | string;
  path?: string;
  method?: string;
  statusCode?: number;
  context?: ResponseContext;
}

/**
 * @deprecated Use Record<string, string[]> in ApiResponseBookly.errors instead
 * Kept for backward compatibility
 */
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  type?: "validation" | "business" | "system" | "network";
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface AuditInfo {
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
}

export interface EventPayload<T = any> {
  eventId: string;
  eventType: string;
  timestamp: Date;
  service: string;
  data: T;
  metadata?: Record<string, any>;
}

export interface KafkaMessage<T = any> {
  key: string;
  value: T;
  headers?: Record<string, string>;
  partition?: number;
  offset?: string;
}

export interface CacheOptions {
  ttl?: number;
  key: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  username?: string;
  tenantId?: string;
  roles: string[];
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface RequestContext {
  userId: string;
  roles: string[];
  permissions?: string[];
  ip?: string;
  userAgent?: string;
}

export interface HealthCheckResult {
  status: "up" | "down" | "degraded";
  timestamp: Date;
  uptime: number;
  service: string;
  checks: {
    database: CheckStatus;
    cache: CheckStatus;
    kafka: CheckStatus;
  };
}

export interface CheckStatus {
  status: "up" | "down";
  message?: string;
  latency?: number;
}

export interface NetworkSimulation {
  enabled: boolean;
  minLatency: number;
  maxLatency: number;
  errorRate: number;
}

export interface ValidationRule {
  field: string;
  rules: string[];
  message?: string;
}

export interface SearchFilter {
  field: string;
  operator:
    | "eq"
    | "ne"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "in"
    | "like"
    | "between";
  value: any;
}

export interface BulkOperationResult<T = any> {
  success: number;
  failed: number;
  errors: Array<{
    index: number;
    item: T;
    error: string;
  }>;
}

export interface FileUpload {
  originalName: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  encoding: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  variables?: Record<string, string>;
}

export interface NotificationPayload {
  recipient: string;
  channel: string;
  subject?: string;
  message: string;
  data?: Record<string, any>;
}
