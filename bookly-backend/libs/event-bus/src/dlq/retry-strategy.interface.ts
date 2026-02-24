import { DeadLetterQueue } from "./dead-letter-queue.schema";

/**
 * Retry Strategy Interface
 * Define la estrategia de retry para eventos en DLQ
 */
export interface IRetryStrategy {
  /**
   * Calcula el próximo momento de retry
   */
  calculateNextRetry(attemptCount: number): Date;

  /**
   * Determina si se debe reintentar
   */
  shouldRetry(dlqEvent: DeadLetterQueue): boolean;

  /**
   * Obtiene el delay en milisegundos para el intento actual
   */
  getDelayMs(attemptCount: number): number;
}

/**
 * Exponential Backoff Strategy
 * Aumenta exponencialmente el tiempo entre reintentos
 */
export class ExponentialBackoffStrategy implements IRetryStrategy {
  constructor(
    private readonly baseDelayMs: number = 1000,
    private readonly maxDelayMs: number = 60000,
    private readonly multiplier: number = 2
  ) {}

  calculateNextRetry(attemptCount: number): Date {
    const delayMs = this.getDelayMs(attemptCount);
    return new Date(Date.now() + delayMs);
  }

  shouldRetry(dlqEvent: DeadLetterQueue): boolean {
    return dlqEvent.attemptCount < dlqEvent.maxAttempts;
  }

  getDelayMs(attemptCount: number): number {
    const delay = this.baseDelayMs * Math.pow(this.multiplier, attemptCount);
    return Math.min(delay, this.maxDelayMs);
  }
}

/**
 * Fixed Interval Strategy
 * Reintentos con intervalo fijo
 */
export class FixedIntervalStrategy implements IRetryStrategy {
  constructor(private readonly intervalMs: number = 5000) {}

  calculateNextRetry(attemptCount: number): Date {
    return new Date(Date.now() + this.intervalMs);
  }

  shouldRetry(dlqEvent: DeadLetterQueue): boolean {
    return dlqEvent.attemptCount < dlqEvent.maxAttempts;
  }

  getDelayMs(attemptCount: number): number {
    return this.intervalMs;
  }
}

/**
 * Linear Backoff Strategy
 * Aumenta linealmente el tiempo entre reintentos
 */
export class LinearBackoffStrategy implements IRetryStrategy {
  constructor(
    private readonly baseDelayMs: number = 1000,
    private readonly incrementMs: number = 1000,
    private readonly maxDelayMs: number = 30000
  ) {}

  calculateNextRetry(attemptCount: number): Date {
    const delayMs = this.getDelayMs(attemptCount);
    return new Date(Date.now() + delayMs);
  }

  shouldRetry(dlqEvent: DeadLetterQueue): boolean {
    return dlqEvent.attemptCount < dlqEvent.maxAttempts;
  }

  getDelayMs(attemptCount: number): number {
    const delay = this.baseDelayMs + this.incrementMs * attemptCount;
    return Math.min(delay, this.maxDelayMs);
  }
}
