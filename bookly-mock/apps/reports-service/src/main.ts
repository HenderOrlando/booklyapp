// Registrar path aliases para runtime
import "tsconfig-paths/register";

import { createLogger } from "@libs/common";
import { DatabaseService } from "@libs/database";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ReportsModule } from "./reports.module";

const logger = createLogger("ReportsService");

async function bootstrap() {
  const app = await NestFactory.create(ReportsModule);

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
    })
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Bookly Reports Service")
    .setDescription(
      "API de reportes, análisis y dashboard de auditoría para el sistema Bookly"
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Usage Reports", "Reportes de uso de recursos")
    .addTag("Demand Reports", "Reportes de demanda insatisfecha")
    .addTag("User Reports", "Reportes de actividad de usuarios")
    .addTag(
      "Audit Dashboard",
      "Dashboard en tiempo real con estadísticas, alertas y análisis de auditoría"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Start server
  const port = process.env.REPORTS_PORT || 3005;
  // Habilitar shutdown graceful para base de datos
  const databaseService = app.get(DatabaseService);
  await databaseService.enableShutdownHooks(app);

  await app.listen(port);

  logger.info(`Reports Service started on port ${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  logger.error("Failed to start Reports Service", error);
  process.exit(1);
});
