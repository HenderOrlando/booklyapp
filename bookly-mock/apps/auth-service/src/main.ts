// Registrar path aliases para runtime
import "tsconfig-paths/register";

import { createLogger, GlobalResponseInterceptor, I18nGlobalExceptionFilter } from "@libs/common";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";
import { AuthModule } from "./auth.module";

const logger = createLogger("AuthService");

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

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
    .setTitle("Bookly Auth Service")
    .setDescription(
      "API de autenticación, gestión de usuarios, roles, permisos y auditoría para el sistema Bookly",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Autenticación", "Endpoints para autenticación de usuarios")
    .addTag("Usuarios", "Endpoints para gestión de usuarios")
    .addTag("Roles", "Endpoints para gestión de roles y asignación de permisos")
    .addTag(
      "Permissions",
      "Endpoints para gestión de permisos granulares (resource:action)",
    )
    .addTag(
      "Audit",
      "Endpoints para consulta y exportación de logs de auditoría (solo administradores)",
    )
    .addTag("Health", "Endpoints para health checks del servicio")
    .addTag(
      "OAuth / SSO",
      "Endpoints para autenticación corporativa con Google",
    )
    .addTag(
      "App Configuration",
      "Configuración global de la aplicación (solo admin)",
    )
    .addTag("Reference Data", "Datos de referencia dinámicos del dominio auth")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Habilitar shutdown graceful para todos los providers (EventBus, Redis, DB)
  app.enableShutdownHooks();

  // Start server
  const port = process.env.AUTH_PORT || 3001;
  await app.listen(port);

  logger.info(`Auth Service started on port ${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  logger.error("Failed to start Auth Service", error);
  process.exit(1);
});
