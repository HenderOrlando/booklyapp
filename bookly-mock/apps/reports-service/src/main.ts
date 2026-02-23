// Registrar path aliases para runtime
import "tsconfig-paths/register";

import { createLogger, GlobalResponseInterceptor, I18nGlobalExceptionFilter } from "@libs/common";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";
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

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new GlobalResponseInterceptor());
  const i18nService = app.get(I18nService);
  app.useGlobalFilters(new I18nGlobalExceptionFilter(i18nService));

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
    .setTitle("Bookly Reports Service")
    .setDescription(
      "API de reportes, análisis y dashboard de auditoría para el sistema Bookly",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Usage Reports", "Reportes de uso de recursos")
    .addTag("Demand Reports", "Reportes de demanda insatisfecha")
    .addTag("User Reports", "Reportes de actividad de usuarios")
    .addTag(
      "Audit Dashboard",
      "Dashboard en tiempo real con estadísticas, alertas y análisis de auditoría",
    )
    .addTag("Audit Records", "Registros de auditoría detallados")
    .addTag("Dashboard", "Métricas de ocupación y KPIs principales")
    .addTag("Feedback", "Feedback de usuarios sobre reservas")
    .addTag("Evaluations", "Evaluaciones de usuarios por staff")
    .addTag("Export", "Exportación de reportes en múltiples formatos")
    .addTag(
      "Reference Data",
      "Datos de referencia dinámicos del dominio reportes",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Start server
  const port = process.env.PORT || process.env.REPORTS_PORT || 3005;
  // Habilitar shutdown graceful para todos los providers (EventBus, Redis, DB)
  app.enableShutdownHooks();

  await app.listen(port, "0.0.0.0");

  logger.info(`Reports Service started on port ${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  logger.error("Failed to start Reports Service", error);
  process.exit(1);
});
