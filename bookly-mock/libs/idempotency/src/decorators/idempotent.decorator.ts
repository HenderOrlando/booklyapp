import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { IdempotencyInterceptor } from "../interceptors/idempotency.interceptor";

/**
 * Method decorator to apply idempotency automatically
 * Combines UseInterceptors(IdempotencyInterceptor) in a cleaner way
 *
 * @example
 * ```typescript
 * @Post()
 * @Idempotent()
 * async create(@Body() dto: CreateDto) {
 *   // Automáticamente manejado con idempotencia
 * }
 * ```
 */
export function Idempotent() {
  return applyDecorators(UseInterceptors(IdempotencyInterceptor));
}
