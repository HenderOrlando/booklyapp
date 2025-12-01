import { Injectable, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AvailabilityExceptionRepository } from '@availability/infrastructure/repositories/availability-exception.repository";
import { DeleteAvailabilityExceptionCommand } from "../commands/delete-availability-exception.command";

/**
 * Handler para eliminar excepción de disponibilidad
 */
@CommandHandler(DeleteAvailabilityExceptionCommand)
@Injectable()
export class DeleteAvailabilityExceptionHandler
  implements ICommandHandler<DeleteAvailabilityExceptionCommand>
{
  constructor(private readonly repository: AvailabilityExceptionRepository) {}

  async execute(command: DeleteAvailabilityExceptionCommand): Promise<void> {
    const { exceptionId } = command;

    // Verificar que existe
    const exception = await this.repository.findById(exceptionId);
    if (!exception) {
      throw new NotFoundException(
        `Excepción con ID ${exceptionId} no encontrada`
      );
    }

    // Eliminar
    await this.repository.delete(exceptionId);
  }
}
