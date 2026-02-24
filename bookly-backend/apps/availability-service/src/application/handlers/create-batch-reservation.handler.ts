import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBatchReservationCommand } from "../commands/create-batch-reservation.command";
import { ReservationService } from "../services/reservation.service";

const logger = createLogger("CreateBatchReservationHandler");

/**
 * Handler para crear reservas múltiples de forma atómica (RF-19)
 */
@CommandHandler(CreateBatchReservationCommand)
export class CreateBatchReservationHandler
  implements ICommandHandler<CreateBatchReservationCommand>
{
  constructor(private readonly reservationService: ReservationService) {}

  async execute(command: CreateBatchReservationCommand): Promise<any> {
    logger.info("Executing CreateBatchReservationCommand", {
      userId: command.userId,
      count: command.reservations.length,
      failOnConflict: command.failOnConflict,
    });

    const results: Array<{ resourceId: string; success: boolean; reservation?: any; error?: string }> = [];
    const created: any[] = [];

    for (const item of command.reservations) {
      try {
        const reservation = await this.reservationService.createReservation({
          resourceId: item.resourceId,
          userId: command.userId,
          startDate: item.startDate,
          endDate: item.endDate,
          purpose: item.purpose,
          notes: item.notes,
          createdBy: command.createdBy,
        });

        created.push(reservation);
        results.push({
          resourceId: item.resourceId,
          success: true,
          reservation,
        });
      } catch (error: any) {
        if (command.failOnConflict) {
          // Rollback: cancelar todas las reservas creadas hasta ahora
          for (const res of created) {
            try {
              await this.reservationService.cancelReservation(
                res.id,
                command.userId,
                "Batch reservation rollback due to conflict"
              );
            } catch (rollbackError) {
              logger.error("Failed to rollback reservation", rollbackError as Error, {
                reservationId: res.id,
              });
            }
          }

          throw new Error(
            `Batch reservation failed at resource ${item.resourceId}: ${error.message}. All reservations rolled back.`
          );
        }

        results.push({
          resourceId: item.resourceId,
          success: false,
          error: error.message,
        });
      }
    }

    logger.info("Batch reservation completed", {
      total: command.reservations.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });

    return {
      total: command.reservations.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }
}
