// Registrar path aliases para runtime
import "tsconfig-paths/register";

import { createLogger, GlobalResponseInterceptor, I18nGlobalExceptionFilter } from "@libs/common";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";
import { ResourcesModule } from "./resources.module";

const logger = createLogger("ResourcesService");

async function bootstrap() {
  const app = await NestFactory.create(ResourcesModule);

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

  // Validation pipe
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

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Bookly Resources Service")
    .setDescription(
      "API de gestión de recursos, categorías y mantenimientos para el sistema Bookly",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Resources", "Endpoints para gestión de recursos")
    .addTag("Categories", "Endpoints para gestión de categorías")
    .addTag("Maintenances", "Endpoints para gestión de mantenimientos")
    .addTag("Faculties", "Endpoints para gestión de facultades")
    .addTag("Departments", "Endpoints para gestión de departamentos")
    .addTag("Import", "Endpoints para importación masiva de recursos")
    .addTag(
      "Reference Data",
      "Datos de referencia dinámicos del dominio recursos",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Start server
  const port = process.env.RESOURCES_PORT || 3002;
  // Habilitar shutdown graceful para todos los providers (EventBus, Redis, DB)
  app.enableShutdownHooks();

  await app.listen(port);

  logger.info(`Resources Service started on port ${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  logger.error("Failed to start Resources Service", error);
  process.exit(1);
});
