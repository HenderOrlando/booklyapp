import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

/**
 * Health Controller
 * Controlador para health checks del servicio
 */
@ApiTags("Health")
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      service: "stockpile-service",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    };
  }
}
