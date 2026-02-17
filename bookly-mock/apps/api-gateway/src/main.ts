// Registrar path aliases para runtime
import "tsconfig-paths/register";

import { createLogger } from "@libs/common";
import { DatabaseService } from "@libs/database";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ApiGatewayModule } from "./api-gateway.module";

const logger = createLogger("ApiGateway");

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Microservice OpenAPI URLs
  const serviceDocsMap = {
    auth: { port: 3001, name: "Auth Service", path: "auth" },
    resources: { port: 3002, name: "Resources Service", path: "resources" },
    availability: {
      port: 3003,
      name: "Availability Service",
      path: "availability",
    },
    stockpile: { port: 3004, name: "Stockpile Service", path: "stockpile" },
    reports: { port: 3005, name: "Reports Service", path: "reports" },
  };

  const serviceLinksHtml = Object.values(serviceDocsMap)
    .map(
      (s) =>
        `- [${s.name}](http://localhost:${s.port}/api/docs) — Puerto ${s.port}`,
    )
    .join("\n");

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Bookly API Gateway")
    .setDescription(
      [
        "API Gateway unificado para todos los microservicios de Bookly.",
        "",
        "## Documentación de Microservicios",
        "",
        serviceLinksHtml,
        "",
        "## Arquitectura",
        "",
        "- **GET** requests → HTTP directo al microservicio",
        "- **POST/PUT/DELETE** requests → EventBus (fire-and-forget)",
        "- **WebSocket** en `/api/v1/ws` → Notificaciones en tiempo real",
      ].join("\n"),
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Gateway", "Proxy, health y enrutamiento")
    .addTag("Auth", "Autenticación y usuarios (Puerto 3001)")
    .addTag("Resources", "Recursos físicos (Puerto 3002)")
    .addTag("Availability", "Disponibilidad y reservas (Puerto 3003)")
    .addTag("Stockpile", "Aprobaciones y check-in/out (Puerto 3004)")
    .addTag("Reports", "Reportes y análisis (Puerto 3005)")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Start server
  const port = process.env.GATEWAY_PORT || 3000;

  // Endpoint to list all service docs (JSON)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get("/api/docs/services", (_req: any, res: any) => {
    res.json({
      gateway: `http://localhost:${port}/api/docs`,
      services: Object.fromEntries(
        Object.entries(serviceDocsMap).map(([key, s]) => [
          key,
          {
            name: s.name,
            docs: `http://localhost:${s.port}/api/docs`,
            docsJson: `http://localhost:${s.port}/api/docs-json`,
          },
        ]),
      ),
    });
  });

  // Habilitar shutdown graceful para base de datos
  const databaseService = app.get(DatabaseService);
  await databaseService.enableShutdownHooks(app);
  await app.listen(port);

  logger.info(`API Gateway started on port ${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/api/docs`);
  logger.info(`Routing to microservices:`);
  logger.info(`  - Auth Service: http://localhost:3001`);
  logger.info(`  - Resources Service: http://localhost:3002`);
  logger.info(`  - Availability Service: http://localhost:3003`);
  logger.info(`  - Stockpile Service: http://localhost:3004`);
  logger.info(`  - Reports Service: http://localhost:3005`);
}

bootstrap().catch((error) => {
  logger.error("Failed to start API Gateway", error);
  process.exit(1);
});
