// Registrar path aliases para runtime
import "tsconfig-paths/register";

import { createLogger } from "@libs/common";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AvailabilityModule } from "./availability.module";

const logger = createLogger("AvailabilityService");

async function bootstrap() {
  const app = await NestFactory.create(AvailabilityModule);

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
    .setTitle("Bookly Availability Service")
    .setDescription(
      "API de gestión de disponibilidad, reservas y lista de espera para el sistema Bookly",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Reservations", "Endpoints para gestión de reservas")
    .addTag("Availabilities", "Endpoints para gestión de disponibilidad")
    .addTag("Waiting Lists", "Endpoints para gestión de lista de espera")
    .addTag("Calendar View", "Vista de calendario con slots y estados")
    .addTag("History", "Historial de reservas y actividad de usuarios")
    .addTag("Maintenance Blocks", "Bloqueos por mantenimiento de recursos")
    .addTag("Reassignment", "Reasignación de reservas a recursos alternativos")
    .addTag(
      "Availability Exceptions",
      "Excepciones de disponibilidad (festivos, eventos)",
    )
    .addTag("Metrics", "Métricas de cache y rendimiento")
    .addTag(
      "Reference Data",
      "Datos de referencia dinámicos del dominio disponibilidad",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Start server
  const port = process.env.AVAILABILITY_PORT || 3003;
  // Habilitar shutdown graceful para todos los providers (EventBus, Redis, DB)
  app.enableShutdownHooks();

  await app.listen(port);

  logger.info(`Availability Service started on port ${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  logger.error("Failed to start Availability Service", error);
  process.exit(1);
});
