import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { CorrelationService } from "../services/correlation.service";

/**
 * Middleware to extract or generate correlation ID from requests
 * Adds correlationId to request object for use in controllers/services
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly correlationService: CorrelationService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extract correlationId from header or generate new one
    const correlationId =
      (req.headers["x-correlation-id"] as string) ||
      (req.headers["x-request-id"] as string) ||
      this.correlationService.generateCorrelationId();

    // Add to request for controllers to access
    (req as any).correlationId = correlationId;

    // Add to response headers
    res.setHeader("X-Correlation-Id", correlationId);

    // Store metadata if this is a new correlation
    if (!req.headers["x-correlation-id"]) {
      this.correlationService
        .addMetadata(correlationId, {
          service: process.env.SERVICE_NAME || "unknown",
          endpoint: `${req.method} ${req.path}`,
          userId: (req as any).user?.id,
          metadata: {
            ip: req.ip,
            userAgent: req.headers["user-agent"],
          },
        })
        .catch((err) => {
          // Non-critical, just log
          console.error("Error storing correlation metadata:", err);
        });
    }

    next();
  }
}
