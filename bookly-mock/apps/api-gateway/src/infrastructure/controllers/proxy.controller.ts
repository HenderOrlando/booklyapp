import {
  All,
  Body,
  Controller,
  Headers,
  Param,
  Query,
  Req,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Audit, AuditAction } from "@reports/audit-decorators";
import { ProxyService } from '@gateway/application/services/proxy.service';

/**
 * Proxy Controller
 * Controlador que recibe todas las peticiones y las redirige a los microservicios
 */
@ApiTags("API Gateway")
@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All("api/v1/:service/*")
  @Audit({
    entityType: "GATEWAY_REQUEST",
    action: AuditAction.ACCESSED,
  })
  @ApiOperation({
    summary:
      "Proxy request to microservice with Rate Limiting and Circuit Breaker",
  })
  async proxy(
    @Param("service") service: string,
    @Req() req: any,
    @Body() body: any,
    @Headers() headers: any,
    @Query() query: any
  ): Promise<any> {
    // Extraer el path después del servicio
    const basePath = `/api/v1/${service}`;
    const fullPath = req.url.split("?")[0];
    const servicePath = fullPath.replace(basePath, "");

    // Extraer userId del JWT (si está autenticado)
    const userId = req.user?.id || req.user?.sub;

    // Extraer IP del usuario
    const userIp =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "unknown";

    return await this.proxyService.proxyRequest(
      service,
      servicePath,
      req.method,
      body,
      headers,
      query,
      userId,
      userIp
    );
  }
}
