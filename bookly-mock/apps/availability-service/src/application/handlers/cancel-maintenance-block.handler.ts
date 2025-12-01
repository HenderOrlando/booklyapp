import { MaintenanceStatus } from "@libs/common/enums";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { MaintenanceBlockRepository } from '@availability/infrastructure/repositories/maintenance-block.repository";
import { MaintenanceBlock } from '@availability/infrastructure/schemas/maintenance-block.schema";
import { CancelMaintenanceBlockCommand } from "../commands/cancel-maintenance-block.command";

/**
 * Handler para cancelar mantenimiento
 */
@CommandHandler(CancelMaintenanceBlockCommand)
@Injectable()
export class CancelMaintenanceBlockHandler
  implements ICommandHandler<CancelMaintenanceBlockCommand>
{
  constructor(private readonly repository: MaintenanceBlockRepository) {}

  async execute(
    command: CancelMaintenanceBlockCommand
  ): Promise<MaintenanceBlock> {
    const { blockId, userId, dto } = command;

    // Verificar que el bloqueo existe
    const block = await this.repository.findById(blockId);
    if (!block) {
      throw new NotFoundException(
        `Bloqueo de mantenimiento con ID ${blockId} no encontrado`
      );
    }

    // Validar que el estado permita cancelar
    if (block.status === MaintenanceStatus.COMPLETED) {
      throw new BadRequestException(
        "No se puede cancelar un mantenimiento ya completado"
      );
    }

    if (block.status === MaintenanceStatus.CANCELLED) {
      throw new BadRequestException("El mantenimiento ya está cancelado");
    }

    // Cancelar el mantenimiento
    const updated = await this.repository.cancel(blockId, userId, dto.reason);

    if (!updated) {
      throw new NotFoundException("Error al cancelar el mantenimiento");
    }

    return updated;
  }
}
