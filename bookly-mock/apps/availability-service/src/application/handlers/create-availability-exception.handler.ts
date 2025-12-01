import { BadRequestException, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AvailabilityExceptionRepository } from '@availability/infrastructure/repositories/availability-exception.repository";
import { AvailabilityException } from '@availability/infrastructure/schemas/availability-exception.schema";
import { CreateAvailabilityExceptionCommand } from "../commands/create-availability-exception.command";

/**
 * Handler para crear excepción de disponibilidad
 */
@CommandHandler(CreateAvailabilityExceptionCommand)
@Injectable()
export class CreateAvailabilityExceptionHandler
  implements ICommandHandler<CreateAvailabilityExceptionCommand>
{
  constructor(private readonly repository: AvailabilityExceptionRepository) {}

  async execute(
    command: CreateAvailabilityExceptionCommand
  ): Promise<AvailabilityException> {
    const { userId, dto } = command;

    // Validar que no exista una excepción para esta fecha y recurso
    const existing = await this.repository.findByResourceAndDate(
      dto.resourceId,
      dto.exceptionDate
    );

    if (existing) {
      throw new BadRequestException(
        `Ya existe una excepción para el recurso ${dto.resourceId} en la fecha ${dto.exceptionDate.toISOString().split("T")[0]}`
      );
    }

    // Crear la excepción (el repositorio maneja la conversión de tipos)
    return await this.repository.create(dto as any, userId);
  }
}
