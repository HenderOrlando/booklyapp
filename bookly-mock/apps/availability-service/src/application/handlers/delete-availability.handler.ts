import { IAvailabilityRepository } from "@availability/domain/repositories/availability.repository.interface";
import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteAvailabilityCommand } from "../commands/delete-availability.command";

/**
 * Delete Availability Handler
 * Handler para eliminar una regla de disponibilidad
 */
@CommandHandler(DeleteAvailabilityCommand)
export class DeleteAvailabilityHandler
  implements ICommandHandler<DeleteAvailabilityCommand>
{
  constructor(
    @Inject("IAvailabilityRepository")
    private readonly repository: IAvailabilityRepository,
  ) {}

  async execute(command: DeleteAvailabilityCommand): Promise<void> {
    const availability = await this.repository.findById(command.availabilityId);
    if (!availability) {
      throw new NotFoundException(
        `Availability with ID ${command.availabilityId} not found`,
      );
    }

    await this.repository.delete(command.availabilityId);
  }
}
