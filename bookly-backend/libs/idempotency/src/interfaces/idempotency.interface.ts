/**
 * Idempotency Interfaces
 */

export interface IdempotencyRecord {
  key: string;
  messageId: string;
  correlationId: string;
  status: "processing" | "completed" | "failed";
  result?: any;
  error?: string;
  createdAt: Date;
  expiresAt: Date;
  retryCount?: number;
}

export interface EventChainNode {
  messageId: string;
  causationId: string | null;
  eventType: string;
  service: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CausalTree {
  [messageId: string]: {
    messageId: string;
    causationId: string | null;
    eventType: string;
    service: string;
    timestamp: Date;
    children: CausalTree;
  };
}

export interface IdempotencyOptions {
  ttl?: number;
  keyGenerator?: (...args: any[]) => string;
  cacheResult?: boolean;
}

export interface CorrelationMetadata {
  correlationId: string;
  startTime: Date;
  service: string;
  endpoint?: string;
  userId?: string;
  metadata?: Record<string, any>;
}
