import { CheckInOutStatus, EventType } from "@libs/common/enums";
import { EventBusService } from "@libs/event-bus";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CheckInOutEntity } from '@stockpile/domain/entities/check-in-out.entity';
import { AuthServiceClient } from '@stockpile/infrastructure/clients/auth-service.client';
import { AvailabilityServiceClient } from '@stockpile/infrastructure/clients/availability-service.client';
import { CheckInCommand } from "../commands/check-in.command";
import { CheckInOutService } from "../services/check-in-out.service";
import { GeolocationService } from "../services/geolocation.service";
import { QRCodeService } from "../services/qr-code.service";

@CommandHandler(CheckInCommand)
export class CheckInHandler implements ICommandHandler<CheckInCommand> {
  constructor(
    private readonly checkInOutService: CheckInOutService,
    private readonly eventBus: EventBusService,
    private readonly authClient: AuthServiceClient,
    private readonly availabilityClient: AvailabilityServiceClient,
    private readonly qrCodeService: QRCodeService,
    private readonly geolocationService: GeolocationService
  ) {}

  async execute(command: CheckInCommand): Promise<CheckInOutEntity> {
    // Verificar que no exista check-in previo
    const existing = await this.checkInOutService.findByReservationId(
      command.reservationId
    );

    if (existing) {
      throw new Error("Ya existe un check-in para esta reserva");
    }

    // Validar QR token si se proporciona
    if (command.qrToken) {
      const validation = await this.qrCodeService.validateQRToken(
        command.qrToken
      );

      if (!validation.valid) {
        throw new Error(`QR inválido: ${validation.reason}`);
      }

      if (validation.reservationId !== command.reservationId) {
        throw new Error("El QR no corresponde a esta reserva");
      }

      // Invalidar token después de uso
      await this.qrCodeService.invalidateToken(command.qrToken);
    }

    // Obtener datos de la reserva desde availability-service
    const reservation = await this.availabilityClient.getReservationById(
      command.reservationId
    );

    if (!reservation) {
      throw new Error("Reserva no encontrada");
    }

    // Validar geolocalización si se proporciona
    if (command.coordinates) {
      const proximityValidation =
        await this.geolocationService.validateProximity(
          reservation.resourceId,
          command.coordinates
        );

      if (!proximityValidation.valid) {
        throw new Error(`Ubicación inválida: ${proximityValidation.reason}`);
      }
    }

    // Obtener datos del usuario desde auth-service
    const user = await this.authClient.getUserById(command.userId);

    // Crear check-in
    const entity = new CheckInOutEntity(
      undefined as any, // id
      command.reservationId, // reservationId
      reservation.resourceId, // resourceId
      command.userId, // userId
      CheckInOutStatus.CHECKED_IN, // status
      new Date(), // checkInTime
      command.userId, // checkInBy
      command.type, // checkInType
      command.notes, // checkInNotes
      undefined, // checkOutTime
      undefined, // checkOutBy
      undefined, // checkOutType
      undefined, // checkOutNotes
      reservation.endTime, // expectedReturnTime
      undefined, // actualReturnTime
      reservation.endTime, // expectedCheckOutTime
      undefined, // resourceCondition
      {
        // metadata
        ...command.metadata,
        qrCode: command.qrToken,
        location: command.coordinates ? `${command.coordinates.latitude},${command.coordinates.longitude}` : undefined,
        qrValidated: !!command.qrToken,
      },
      reservation.startTime, // reservationStartTime
      reservation.endTime, // reservationEndTime
      undefined, // resourceType
      undefined, // resourceName - TODO: obtener del resource-service
      user?.name, // userName
      user?.email // userEmail
    );

    const created = await this.checkInOutService.create(entity);

    // Emitir evento
    await this.eventBus.publish(EventType.CHECK_IN, {
      eventId: created.id,
      eventType: EventType.CHECK_IN_COMPLETED,
      service: "stockpile-service",
      timestamp: new Date(),
      data: created.toObject(),
    });

    return created;
  }
}
