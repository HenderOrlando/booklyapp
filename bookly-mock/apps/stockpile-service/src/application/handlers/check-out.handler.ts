import { EventType } from "@libs/common/enums";
import { EventBusService } from "@libs/event-bus";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CheckInOutEntity } from '@stockpile/domain/entities/check-in-out.entity";
import { CheckOutCommand } from "../commands/check-out.command";
import { CheckInOutService } from "../services/check-in-out.service";
import { DigitalSignatureService } from "../services/digital-signature.service";

@CommandHandler(CheckOutCommand)
export class CheckOutHandler implements ICommandHandler<CheckOutCommand> {
  constructor(
    private readonly checkInOutService: CheckInOutService,
    private readonly eventBus: EventBusService,
    private readonly digitalSignatureService: DigitalSignatureService
  ) {}

  async execute(command: CheckOutCommand): Promise<CheckInOutEntity> {
    const existing = await this.checkInOutService.findById(command.checkInId);

    if (!existing) {
      throw new Error("Check-in no encontrado");
    }

    if (!existing.isCheckedIn()) {
      throw new Error("No se puede hacer check-out de una reserva no activa");
    }

    // Validar y registrar firma digital si se proporciona
    if (command.digitalSignature) {
      const signatureValidation = this.digitalSignatureService.validateSignatureFormat(
        command.digitalSignature
      );

      if (!signatureValidation.valid) {
        throw new Error(`Firma inválida: ${signatureValidation.reason}`);
      }

      await this.digitalSignatureService.registerSignature(
        command.checkInId,
        command.digitalSignature,
        command.userId,
        command.signatureMetadata
      );
    }

    // Realizar check-out
    const updated = existing.checkOut(
      command.userId,
      command.type,
      command.notes,
      command.resourceCondition,
      command.damageReported,
      command.damageDescription,
      {
        ...command.metadata,
        hasDigitalSignature: !!command.digitalSignature,
      }
    );

    const result = await this.checkInOutService.update(
      command.checkInId,
      updated
    );

    // Emitir evento
    await this.eventBus.publish(EventType.CHECK_OUT, {
      eventId: result.id,
      eventType: result.isOverdue()
        ? EventType.CHECK_OUT_OVERDUE
        : EventType.CHECK_OUT_COMPLETED,
      service: "stockpile-service",
      timestamp: new Date(),
      data: result.toObject(),
      metadata: {
        isOverdue: result.isOverdue(),
        delayMinutes: result.getDelayMinutes(),
        hasDamage: result.hasDamageReported(),
      },
    });

    return result;
  }
}
