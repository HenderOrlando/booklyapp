import { DatabaseService } from "@libs/database";
import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

/**
 * Health Controller
 * Controlador para verificar el estado del API Gateway y microservicios
 */
@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService
  ) {}

  @Get()
  @ApiOperation({ summary: "Check API Gateway health" })
  @ApiResponse({ status: 200, description: "API Gateway is healthy" })
  async getHealth() {
    const dbHealth = await this.databaseService.healthCheck();

    return {
      status: dbHealth.isHealthy ? "ok" : "degraded",
      service: "api-gateway",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get<string>("NODE_ENV") || "development",
      database: {
        connected: dbHealth.isHealthy,
        name: dbHealth.database,
        state: dbHealth.state,
        latency: dbHealth.latency,
        error: dbHealth.error,
      },
    };
  }

  @Get("services")
  @ApiOperation({ summary: "Get microservices configuration" })
  @ApiResponse({ status: 200, description: "Microservices URLs" })
  getServices() {
    return {
      services: {
        auth: {
          url:
            this.configService.get<string>("AUTH_SERVICE_URL") ||
            "http://localhost:3001",
          port: 3001,
        },
        resources: {
          url:
            this.configService.get<string>("RESOURCES_SERVICE_URL") ||
            "http://localhost:3002",
          port: 3002,
        },
        availability: {
          url:
            this.configService.get<string>("AVAILABILITY_SERVICE_URL") ||
            "http://localhost:3003",
          port: 3003,
        },
        stockpile: {
          url:
            this.configService.get<string>("STOCKPILE_SERVICE_URL") ||
            "http://localhost:3004",
          port: 3004,
        },
        reports: {
          url:
            this.configService.get<string>("REPORTS_SERVICE_URL") ||
            "http://localhost:3005",
          port: 3005,
        },
      },
    };
  }
}
