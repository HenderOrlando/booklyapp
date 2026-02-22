// Registrar path aliases para runtime
import "tsconfig-paths/register";

import { createLogger } from "@libs/common";
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
            docs: `http://localhost:${port}/api/docs/${s.path}`,
            docsJson: `http://localhost:${port}/api/docs/${s.path}/json`,
            directDocs: `http://localhost:${s.port}/api/docs`,
            directDocsJson: `http://localhost:${s.port}/api/docs-json`,
          },
        ]),
      ),
    });
  });

  // Proxy endpoints for each microservice's OpenAPI JSON via Gateway
  for (const [, svc] of Object.entries(serviceDocsMap)) {
    httpAdapter.get(
      `/api/docs/${svc.path}/json`,
      async (_req: any, res: any) => {
        try {
          const response = await fetch(
            `http://localhost:${svc.port}/api/docs-json`,
          );
          if (!response.ok) {
            return res.status(response.status).json({
              error: `${svc.name} docs unavailable (HTTP ${response.status})`,
            });
          }
          const spec = await response.json();
          res.json(spec);
        } catch {
          res.status(503).json({
            error: `${svc.name} is not reachable at port ${svc.port}`,
          });
        }
      },
    );

    // HTML redirect to the microservice's Swagger UI
    httpAdapter.get(`/api/docs/${svc.path}`, (_req: any, res: any) => {
      res.redirect(`http://localhost:${svc.port}/api/docs`);
    });
  }

  // Habilitar shutdown graceful para todos los providers (EventBus, Redis, DB)
  app.enableShutdownHooks();
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
