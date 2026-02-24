import { DatabaseService } from "@libs/database";
import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

/**
 * Health Controller
 * Controlador para health checks del servicio
 */
@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: "Check Stockpile Service health" })
  @ApiResponse({ status: 200, description: "Stockpile Service is healthy" })
  async check() {
    const dbHealth = await this.databaseService.healthCheck();

    return {
      status: dbHealth.isHealthy ? "ok" : "degraded",
      service: "stockpile-service",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: {
        connected: dbHealth.isHealthy,
        name: dbHealth.database,
        state: dbHealth.state,
        latency: dbHealth.latency,
        error: dbHealth.error,
      },
    };
  }
}
