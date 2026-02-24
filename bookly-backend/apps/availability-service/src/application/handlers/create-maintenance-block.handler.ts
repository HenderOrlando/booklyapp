import { BadRequestException, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { MaintenanceBlockRepository } from '@availability/infrastructure/repositories/maintenance-block.repository';
import { MaintenanceBlock } from '@availability/infrastructure/schemas/maintenance-block.schema';
import { CreateMaintenanceBlockCommand } from "../commands/create-maintenance-block.command";

/**
 * Handler para crear bloqueo por mantenimiento
 */
@CommandHandler(CreateMaintenanceBlockCommand)
@Injectable()
export class CreateMaintenanceBlockHandler
  implements ICommandHandler<CreateMaintenanceBlockCommand>
{
  constructor(private readonly repository: MaintenanceBlockRepository) {}

  async execute(
    command: CreateMaintenanceBlockCommand
  ): Promise<MaintenanceBlock> {
    const { userId, dto } = command;

    // Validar que endDate sea posterior a startDate
    if (dto.endDate <= dto.startDate) {
      throw new BadRequestException(
        "La fecha de fin debe ser posterior a la fecha de inicio"
      );
    }

    // Verificar conflictos con otros mantenimientos
    const conflicts = await this.repository.findConflicts(
      dto.resourceId,
      dto.startDate,
      dto.endDate
    );

    if (conflicts.length > 0) {
      throw new BadRequestException(
        `Ya existe un mantenimiento programado para el recurso en este período`
      );
    }

    // Crear el bloqueo (el repositorio maneja la conversión de tipos)
    return await this.repository.create(dto as any, userId);
  }
}
