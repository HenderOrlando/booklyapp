import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Parameter decorator to inject correlationId into controller methods
 * Usage: @CorrelationId() correlationId: string
 */
export const CorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.correlationId || "unknown";
  }
);
