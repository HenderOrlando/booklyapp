import { MaintenanceStatus } from "@libs/common/enums";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { MaintenanceBlockRepository } from "../../infrastructure/repositories/maintenance-block.repository";
import { MaintenanceBlock } from "../../infrastructure/schemas/maintenance-block.schema";
import { CompleteMaintenanceBlockCommand } from "../commands/complete-maintenance-block.command";

/**
 * Handler para completar mantenimiento
 */
@CommandHandler(CompleteMaintenanceBlockCommand)
@Injectable()
export class CompleteMaintenanceBlockHandler
  implements ICommandHandler<CompleteMaintenanceBlockCommand>
{
  constructor(private readonly repository: MaintenanceBlockRepository) {}

  async execute(
    command: CompleteMaintenanceBlockCommand
  ): Promise<MaintenanceBlock> {
    const { blockId, userId, dto } = command;

    // Verificar que el bloqueo existe
    const block = await this.repository.findById(blockId);
    if (!block) {
      throw new NotFoundException(
        `Bloqueo de mantenimiento con ID ${blockId} no encontrado`
      );
    }

    // Validar que el estado permita completar
    if (
      block.status !== MaintenanceStatus.SCHEDULED &&
      block.status !== MaintenanceStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(
        `No se puede completar un mantenimiento en estado ${block.status}`
      );
    }

    // Completar el mantenimiento
    const updated = await this.repository.complete(blockId, userId, dto?.notes);

    if (!updated) {
      throw new NotFoundException("Error al completar el mantenimiento");
    }

    return updated;
  }
}
