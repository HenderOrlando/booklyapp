import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { WaitingListEntity } from "../../domain/entities/waiting-list.entity";
import { IWaitingListRepository } from "../../domain/repositories/waiting-list.repository.interface";

const logger = createLogger("WaitingListService");

/**
 * Waiting List Service
 * Servicio de aplicación para gestión de lista de espera
 */
@Injectable()
export class WaitingListService {
  constructor(
    @Inject("IWaitingListRepository")
    private readonly waitingListRepository: IWaitingListRepository
  ) {}

  /**
   * Agrega una solicitud a la lista de espera
   */
  async addToWaitingList(data: {
    resourceId: string;
    userId: string;
    requestedStartDate: Date;
    requestedEndDate: Date;
    priority?: number;
    purpose?: string;
    expiresAt?: Date;
    createdBy?: string;
  }): Promise<WaitingListEntity> {
    logger.info("Adding to waiting list", {
      resourceId: data.resourceId,
      userId: data.userId,
    });

    // Verificar si ya existe una solicitud activa
    const exists = await this.waitingListRepository.existsForUser(
      data.userId,
      data.resourceId,
      data.requestedStartDate,
      data.requestedEndDate
    );

    if (exists) {
      throw new Error(
        "User already has an active waiting list request for this period"
      );
    }

    // Crear entidad
    const waitingList = new WaitingListEntity(
      undefined as any,
      data.resourceId,
      data.userId,
      data.requestedStartDate,
      data.requestedEndDate,
      data.priority || 0,
      data.purpose,
      true,
      undefined,
      data.expiresAt,
      undefined,
      new Date(),
      new Date(),
      {
        createdBy: data.createdBy || data.userId,
      }
    );

    // Guardar
    const saved = await this.waitingListRepository.create(waitingList);

    logger.info("Added to waiting list successfully", {
      waitingListId: saved.id,
    });

    return saved;
  }

  /**
   * Obtiene la lista de espera de un recurso
   */
  async getWaitingList(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ waitingLists: WaitingListEntity[]; meta: PaginationMeta }> {
    logger.info("Getting waiting list", { resourceId });

    return await this.waitingListRepository.findByResource(resourceId, query);
  }

  /**
   * Obtiene solicitudes activas ordenadas por prioridad
   */
  async getActiveByResource(resourceId: string): Promise<WaitingListEntity[]> {
    logger.info("Getting active waiting list", { resourceId });

    return await this.waitingListRepository.findActiveByResource(resourceId);
  }

  /**
   * Obtiene la siguiente solicitud en la cola
   */
  async getNext(resourceId: string): Promise<WaitingListEntity | null> {
    logger.info("Getting next in waiting list", { resourceId });

    return await this.waitingListRepository.findNext(resourceId);
  }

  /**
   * Marca una solicitud como notificada
   */
  async markAsNotified(id: string): Promise<WaitingListEntity> {
    logger.info("Marking as notified", { id });

    const waitingList = await this.findById(id);

    const notified = waitingList.markAsNotified();

    await this.waitingListRepository.update(id, {
      notifiedAt: notified.notifiedAt,
      updatedAt: notified.updatedAt,
    } as Partial<WaitingListEntity>);

    logger.info("Marked as notified successfully", { id });

    return notified;
  }

  /**
   * Convierte una solicitud de espera en reserva
   */
  async convertToReservation(
    id: string,
    reservationId: string
  ): Promise<WaitingListEntity> {
    logger.info("Converting to reservation", { id, reservationId });

    const waitingList = await this.findById(id);

    const converted = waitingList.convertToReservation(reservationId);

    await this.waitingListRepository.update(id, {
      isActive: converted.isActive,
      convertedToReservationId: converted.convertedToReservationId,
      updatedAt: converted.updatedAt,
    } as Partial<WaitingListEntity>);

    logger.info("Converted to reservation successfully", {
      id,
      reservationId,
    });

    return converted;
  }

  /**
   * Cancela una solicitud de lista de espera
   */
  async cancel(id: string, cancelledBy: string): Promise<WaitingListEntity> {
    logger.info("Cancelling waiting list request", { id, cancelledBy });

    const waitingList = await this.findById(id);

    const cancelled = waitingList.cancel(cancelledBy);

    await this.waitingListRepository.update(id, {
      isActive: cancelled.isActive,
      updatedAt: cancelled.updatedAt,
      audit: cancelled.audit,
    } as Partial<WaitingListEntity>);

    logger.info("Waiting list request cancelled successfully", { id });

    return cancelled;
  }

  /**
   * Busca una solicitud por ID
   */
  async findById(id: string): Promise<WaitingListEntity> {
    logger.info("Finding waiting list by ID", { id });

    const waitingList = await this.waitingListRepository.findById(id);

    if (!waitingList) {
      throw new NotFoundException(
        `Waiting list request with ID ${id} not found`
      );
    }

    return waitingList;
  }

  /**
   * Busca solicitudes expiradas
   */
  async findExpired(): Promise<WaitingListEntity[]> {
    logger.info("Finding expired waiting list requests");

    return await this.waitingListRepository.findExpired();
  }
}
