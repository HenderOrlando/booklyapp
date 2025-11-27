import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateAvailabilityCommand } from "../commands/create-availability.command";
import { AvailabilityService } from "../services/availability.service";

const logger = createLogger("CreateAvailabilityHandler");

/**
 * Create Availability Handler
 * Handler para el comando de crear disponibilidad
 */
@CommandHandler(CreateAvailabilityCommand)
export class CreateAvailabilityHandler
  implements ICommandHandler<CreateAvailabilityCommand>
{
  constructor(private readonly availabilityService: AvailabilityService) {}

  async execute(command: CreateAvailabilityCommand): Promise<any> {
    logger.info("Executing CreateAvailabilityCommand", {
      resourceId: command.resourceId,
      dayOfWeek: command.dayOfWeek,
    });

    const availability = await this.availabilityService.createAvailability({
      resourceId: command.resourceId,
      dayOfWeek: command.dayOfWeek,
      startTime: command.startTime,
      endTime: command.endTime,
      isAvailable: command.isAvailable,
      maxConcurrentReservations: command.maxConcurrentReservations,
      effectiveFrom: command.effectiveFrom,
      effectiveUntil: command.effectiveUntil,
      notes: command.notes,
      createdBy: command.createdBy,
    });

    logger.info("Availability created successfully", {
      availabilityId: availability.id,
    });

    return availability;
  }
}
