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
      undefined as any,
      command.reservationId,
      reservation.resourceId,
      command.userId,
      CheckInOutStatus.CHECKED_IN,
      new Date(),
      command.userId,
      command.type,
      command.notes,
      undefined,
      undefined,
      undefined,
      undefined,
      reservation.endTime, // expectedReturnTime desde la reserva
      undefined,
      undefined,
      {
        ...command.metadata,
        userName: user?.name,
        userEmail: user?.email,
        resourceName: reservation.resourceId,
        coordinates: command.coordinates,
        qrValidated: !!command.qrToken,
      }
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
