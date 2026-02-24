import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ReferenceDataRepository } from "./repositories/reference-data.repository";
import {
  ReferenceData,
  ReferenceDataSchema,
} from "./schemas/reference-data.schema";

/**
 * ReferenceDataModule
 * Módulo reutilizable que registra el schema y repositorio de ReferenceData.
 * Cada microservicio importa este módulo para tener su propia colección
 * `reference_data` en su base de datos de dominio.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [DatabaseModule, ReferenceDataModule],
 * })
 * export class MyServiceModule {}
 * ```
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReferenceData.name, schema: ReferenceDataSchema },
    ]),
  ],
  providers: [ReferenceDataRepository],
  exports: [ReferenceDataRepository, MongooseModule],
})
export class ReferenceDataModule {}
