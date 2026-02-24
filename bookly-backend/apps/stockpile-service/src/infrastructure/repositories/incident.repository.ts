import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IncidentEntity } from "@stockpile/domain/entities/incident.entity";
import {
  IIncidentRepository,
  IncidentFilters,
} from "@stockpile/domain/repositories/incident.repository.interface";
import { Incident } from "@stockpile/infrastructure/schemas/incident.schema";

/**
 * Implementación del repositorio de incidencias con MongoDB
 */
@Injectable()
export class IncidentRepository implements IIncidentRepository {
  private readonly logger = new Logger(IncidentRepository.name);

  constructor(
    @InjectModel(Incident.name)
    private readonly model: Model<Incident>,
  ) {}

  /**
   * Crea una nueva incidencia
   */
  async create(incident: IncidentEntity): Promise<IncidentEntity> {
    this.logger.debug('Creating incident', {
      resourceId: incident.resourceId,
      severity: incident.severity,
    });

    const doc = new this.model(incident.toObject());
    const saved = await doc.save();

    this.logger.log(`Incident created: ${saved._id}`);
    return IncidentEntity.fromObject(saved.toObject());
  }

  /**
   * Busca una incidencia por ID
   */
  async findById(id: string): Promise<IncidentEntity | null> {
    this.logger.debug('Finding incident by ID', { id });

    const doc = await this.model.findById(id).lean();

    if (!doc) {
      this.logger.debug(`Incident not found: ${id}`);
      return null;
    }

    return IncidentEntity.fromObject(doc);
  }

  /**
   * Busca múltiples incidencias con filtros
   */
  async findMany(filters: IncidentFilters): Promise<IncidentEntity[]> {
    this.logger.debug('Finding incidents with filters', filters);

    const query: any = {};

    if (filters.checkInOutId) {
      query.checkInOutId = filters.checkInOutId;
    }

    if (filters.resourceId) {
      query.resourceId = filters.resourceId;
    }

    if (filters.reportedBy) {
      query.reportedBy = filters.reportedBy;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.severity) {
      query.severity = filters.severity;
    }

    if (filters.startDate || filters.endDate) {
      query.reportedAt = {};
      if (filters.startDate) {
        query.reportedAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.reportedAt.$lte = filters.endDate;
      }
    }

    const docs = await this.model
      .find(query)
      .sort({ reportedAt: -1 })
      .lean();

    this.logger.debug(`Found ${docs.length} incidents`);
    return docs.map(doc => IncidentEntity.fromObject(doc));
  }

  /**
   * Actualiza una incidencia
   */
  async update(
    id: string,
    incident: Partial<IncidentEntity>,
  ): Promise<IncidentEntity> {
    this.logger.debug('Updating incident', { id });

    const doc = await this.model
      .findByIdAndUpdate(id, incident, { new: true })
      .lean();

    if (!doc) {
      throw new Error(`Incident ${id} not found`);
    }

    this.logger.log(`Incident updated: ${id}`);
    return IncidentEntity.fromObject(doc);
  }

  /**
   * Elimina una incidencia
   */
  async delete(id: string): Promise<boolean> {
    this.logger.debug('Deleting incident', { id });

    const result = await this.model.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      this.logger.warn(`Incident not found for deletion: ${id}`);
      return false;
    }

    this.logger.log(`Incident deleted: ${id}`);
    return true;
  }

  /**
   * Cuenta incidencias por filtros
   */
  async count(filters: IncidentFilters): Promise<number> {
    this.logger.debug('Counting incidents with filters', filters);

    const query: any = {};

    if (filters.checkInOutId) {
      query.checkInOutId = filters.checkInOutId;
    }

    if (filters.resourceId) {
      query.resourceId = filters.resourceId;
    }

    if (filters.reportedBy) {
      query.reportedBy = filters.reportedBy;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.severity) {
      query.severity = filters.severity;
    }

    if (filters.startDate || filters.endDate) {
      query.reportedAt = {};
      if (filters.startDate) {
        query.reportedAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.reportedAt.$lte = filters.endDate;
      }
    }

    const count = await this.model.countDocuments(query);

    this.logger.debug(`Counted ${count} incidents`);
    return count;
  }
}
