import { MaintenanceStatus, MaintenanceType } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Injectable, NotFoundException } from "@nestjs/common";
import { MaintenanceEntity } from "../../domain/entities/maintenance.entity";
import { IMaintenanceRepository } from "../../domain/repositories/maintenance.repository.interface";

/**
 * Maintenance Service
 * Servicio para gestión de mantenimientos
 */
@Injectable()
export class MaintenanceService {
  private readonly logger = createLogger("MaintenanceService");

  constructor(private readonly maintenanceRepository: IMaintenanceRepository) {}

  /**
   * Programar un nuevo mantenimiento
   */
  async scheduleMaintenance(
    data: Partial<MaintenanceEntity>
  ): Promise<MaintenanceEntity> {
    const maintenance = new MaintenanceEntity(
      "",
      data.resourceId!,
      data.type!,
      data.title!,
      data.description!,
      data.scheduledStartDate!,
      data.scheduledEndDate!,
      undefined,
      undefined,
      MaintenanceStatus.SCHEDULED,
      data.performedBy,
      data.cost,
      data.notes,
      data.affectsAvailability ?? true,
      undefined,
      undefined,
      data.audit
    );

    const createdMaintenance =
      await this.maintenanceRepository.create(maintenance);

    this.logger.info("Maintenance scheduled", {
      maintenanceId: createdMaintenance.id,
      resourceId: createdMaintenance.resourceId,
    });

    return createdMaintenance;
  }

  /**
   * Obtener mantenimiento por ID
   */
  async getMaintenanceById(id: string): Promise<MaintenanceEntity> {
    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) {
      throw new NotFoundException(`Maintenance with ID ${id} not found`);
    }
    return maintenance;
  }

  /**
   * Obtener lista de mantenimientos con paginación y filtros
   */
  async getMaintenances(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      type?: MaintenanceType;
      status?: MaintenanceStatus;
    }
  ): Promise<{ maintenances: MaintenanceEntity[]; meta: PaginationMeta }> {
    return await this.maintenanceRepository.findMany(query, filters);
  }

  /**
   * Obtener mantenimientos por recurso
   */
  async getMaintenancesByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ maintenances: MaintenanceEntity[]; meta: PaginationMeta }> {
    return await this.maintenanceRepository.findByResource(resourceId, query);
  }

  /**
   * Obtener mantenimientos programados
   */
  async getScheduledMaintenances(query: PaginationQuery): Promise<{
    maintenances: MaintenanceEntity[];
    meta: PaginationMeta;
  }> {
    return await this.maintenanceRepository.findScheduled(query);
  }

  /**
   * Obtener mantenimientos en progreso
   */
  async getMaintenancesInProgress(): Promise<MaintenanceEntity[]> {
    return await this.maintenanceRepository.findInProgress();
  }

  /**
   * Obtener mantenimientos en un rango de fechas
   */
  async getMaintenancesByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQuery
  ): Promise<{ maintenances: MaintenanceEntity[]; meta: PaginationMeta }> {
    return await this.maintenanceRepository.findByDateRange(
      startDate,
      endDate,
      query
    );
  }

  /**
   * Obtener próximos mantenimientos para un recurso
   */
  async getUpcomingMaintenancesByResource(
    resourceId: string
  ): Promise<MaintenanceEntity[]> {
    return await this.maintenanceRepository.findUpcomingByResource(resourceId);
  }

  /**
   * Iniciar mantenimiento
   */
  async startMaintenance(id: string): Promise<MaintenanceEntity> {
    const maintenance = await this.getMaintenanceById(id);
    maintenance.start();

    const updated = await this.maintenanceRepository.update(id, {
      status: MaintenanceStatus.IN_PROGRESS,
      actualStartDate: new Date(),
    });

    this.logger.info("Maintenance started", {
      maintenanceId: id,
      resourceId: maintenance.resourceId,
    });

    return updated;
  }

  /**
   * Completar mantenimiento
   */
  async completeMaintenance(id: string): Promise<MaintenanceEntity> {
    const maintenance = await this.getMaintenanceById(id);
    maintenance.complete();

    const updated = await this.maintenanceRepository.update(id, {
      status: MaintenanceStatus.COMPLETED,
      actualEndDate: new Date(),
    });

    this.logger.info("Maintenance completed", {
      maintenanceId: id,
      resourceId: maintenance.resourceId,
    });

    return updated;
  }

  /**
   * Cancelar mantenimiento
   */
  async cancelMaintenance(id: string): Promise<MaintenanceEntity> {
    const maintenance = await this.getMaintenanceById(id);
    maintenance.cancel();

    const updated = await this.maintenanceRepository.update(id, {
      status: MaintenanceStatus.CANCELLED,
    });

    this.logger.info("Maintenance cancelled", {
      maintenanceId: id,
      resourceId: maintenance.resourceId,
    });

    return updated;
  }

  /**
   * Actualizar mantenimiento
   */
  async updateMaintenance(
    id: string,
    data: Partial<MaintenanceEntity>
  ): Promise<MaintenanceEntity> {
    // Verificar que el mantenimiento existe
    await this.getMaintenanceById(id);

    const updated = await this.maintenanceRepository.update(id, data);

    this.logger.info("Maintenance updated", { maintenanceId: id });

    return updated;
  }

  /**
   * Eliminar mantenimiento
   */
  async deleteMaintenance(id: string): Promise<boolean> {
    // Verificar que el mantenimiento existe
    await this.getMaintenanceById(id);

    const deleted = await this.maintenanceRepository.delete(id);

    if (deleted) {
      this.logger.info("Maintenance deleted", { maintenanceId: id });
    }

    return deleted;
  }

  /**
   * Contar mantenimientos
   */
  async countMaintenances(filters?: {
    status?: MaintenanceStatus;
  }): Promise<number> {
    return await this.maintenanceRepository.count(filters);
  }

  /**
   * Actualizar estado de mantenimiento
   */
  async updateMaintenanceStatus(
    id: string,
    status: MaintenanceStatus
  ): Promise<void> {
    // Verificar que el mantenimiento existe
    await this.getMaintenanceById(id);

    await this.maintenanceRepository.updateStatus(id, status);

    this.logger.info("Maintenance status updated", {
      maintenanceId: id,
      status,
    });
  }
}
