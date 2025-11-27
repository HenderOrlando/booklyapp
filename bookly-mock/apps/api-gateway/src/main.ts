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
    })
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Bookly API Gateway")
    .setDescription(
      "API Gateway unificado para todos los microservicios de Bookly"
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("API Gateway", "Enrutamiento a microservicios")
    .addTag("Auth", "Servicio de autenticación (Puerto 3001)")
    .addTag("Resources", "Servicio de recursos (Puerto 3002)")
    .addTag("Availability", "Servicio de disponibilidad (Puerto 3003)")
    .addTag("Stockpile", "Servicio de aprobaciones (Puerto 3004)")
    .addTag("Reports", "Servicio de reportes (Puerto 3005)")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Habilitar shutdown graceful para base de datos
  const databaseService = app.get(DatabaseService);
  await databaseService.enableShutdownHooks(app);

  // Start server
  const port = process.env.GATEWAY_PORT || 3000;
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
