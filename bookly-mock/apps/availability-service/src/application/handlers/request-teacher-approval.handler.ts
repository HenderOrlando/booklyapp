import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { RequestTeacherApprovalCommand } from "../commands/request-teacher-approval.command";
import { IReservationRepository } from '@availability/domain/repositories/reservation.repository.interface';

const logger = createLogger("RequestTeacherApprovalHandler");

/**
 * Handler para solicitar VoBo docente (RF-13)
 * Crea una solicitud de aprobación docente con timeout configurable
 */
@CommandHandler(RequestTeacherApprovalCommand)
export class RequestTeacherApprovalHandler
  implements ICommandHandler<RequestTeacherApprovalCommand>
{
  constructor(
    @Inject("IReservationRepository")
    private readonly reservationRepository: IReservationRepository
  ) {}

  async execute(command: RequestTeacherApprovalCommand): Promise<any> {
    logger.info("Executing RequestTeacherApprovalCommand", {
      reservationId: command.reservationId,
      studentId: command.studentId,
      teacherId: command.teacherId,
      timeoutMinutes: command.timeoutMinutes,
    });

    // Verificar que la reserva existe
    const reservation = await this.reservationRepository.findById(
      command.reservationId
    );

    if (!reservation) {
      throw new NotFoundException(
        `Reservation ${command.reservationId} not found`
      );
    }

    // Calcular fecha de expiración del timeout
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + command.timeoutMinutes);

    // Crear solicitud de aprobación docente
    const approvalRequest = {
      reservationId: command.reservationId,
      studentId: command.studentId,
      teacherId: command.teacherId,
      reason: command.reason,
      status: "pending",
      expiresAt,
      createdAt: new Date(),
      createdBy: command.createdBy || command.studentId,
    };

    // Actualizar la reserva con el estado de aprobación pendiente
    await this.reservationRepository.update(command.reservationId, {
      metadata: {
        ...((reservation as any).metadata || {}),
        teacherApproval: approvalRequest,
      },
    } as any);

    logger.info("Teacher approval requested", {
      reservationId: command.reservationId,
      teacherId: command.teacherId,
      expiresAt,
    });

    return approvalRequest;
  }
}
