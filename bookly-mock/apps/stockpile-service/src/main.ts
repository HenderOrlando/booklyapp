// Registrar path aliases para runtime
import "tsconfig-paths/register";

import { createLogger } from "@libs/common";
import { DatabaseService } from "@libs/database";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { StockpileModule } from "./stockpile.module";

const logger = createLogger("StockpileService");

async function bootstrap() {
  const app = await NestFactory.create(StockpileModule);

  // EventBus se inicializa automáticamente en el módulo
  logger.info("Event Bus initialized via EventBusModule");

  // Global prefix
  app.setGlobalPrefix("api/v1");

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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Bookly Stockpile Service")
    .setDescription(
      "API de gestión de aprobaciones y flujos de trabajo para el sistema Bookly",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag(
      "Approval Requests",
      "Endpoints para gestión de solicitudes de aprobación",
    )
    .addTag("Approval Flows", "Endpoints para gestión de flujos de aprobación")
    .addTag("Check-In/Out", "Endpoints para check-in y check-out digital")
    .addTag("Documents", "Generación y descarga de documentos de aprobación")
    .addTag("Monitoring", "Dashboard de vigilancia y control de accesos")
    .addTag("Notifications", "Configuración y métricas de notificaciones")
    .addTag(
      "Reference Data",
      "Datos de referencia dinámicos del dominio aprobaciones",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Start server
  const port = process.env.STOCKPILE_PORT || 3004;
  // Habilitar shutdown graceful para base de datos
  const databaseService = app.get(DatabaseService);
  await databaseService.enableShutdownHooks(app);

  await app.listen(port);

  logger.info(`Stockpile Service started on port ${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  logger.error("Failed to start Stockpile Service", error);
  process.exit(1);
});
