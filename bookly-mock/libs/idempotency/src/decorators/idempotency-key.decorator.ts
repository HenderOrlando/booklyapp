import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Parameter decorator to inject idempotencyKey into controller methods
 * Usage: @IdempotencyKey() idempotencyKey: string
 */
export const IdempotencyKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers["idempotency-key"] as string;
  }
);
