import { ImportJobStatus } from "@libs/common/enums";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ImportJobEntity } from "../../domain/entities/import-job.entity";
import { ImportJob, ImportJobDocument } from "../schemas/import-job.schema";

/**
 * Repository para gestión de jobs de importación
 */
@Injectable()
export class ImportJobRepository {
  constructor(
    @InjectModel(ImportJob.name)
    private readonly importJobModel: Model<ImportJobDocument>
  ) {}

  /**
   * Crea un nuevo job de importación
   */
  async create(job: Partial<ImportJobEntity>): Promise<ImportJobEntity> {
    const created = await this.importJobModel.create(job);
    return ImportJobEntity.fromObject(created.toObject());
  }

  /**
   * Busca un job por ID
   */
  async findById(id: string): Promise<ImportJobEntity | null> {
    const job = await this.importJobModel.findById(id).exec();
    return job ? ImportJobEntity.fromObject(job.toObject()) : null;
  }

  /**
   * Actualiza un job
   */
  async update(
    id: string,
    data: Partial<ImportJobEntity>
  ): Promise<ImportJobEntity> {
    const updated = await this.importJobModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();

    if (!updated) {
      throw new Error(`ImportJob with ID ${id} not found`);
    }

    return ImportJobEntity.fromObject(updated.toObject());
  }

  /**
   * Lista jobs de un usuario
   */
  async findByUserId(
    userId: string,
    limit: number = 20
  ): Promise<ImportJobEntity[]> {
    const jobs = await this.importJobModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return jobs.map((job) => ImportJobEntity.fromObject(job.toObject()));
  }

  /**
   * Lista jobs pendientes o en proceso
   */
  async findPending(): Promise<ImportJobEntity[]> {
    const jobs = await this.importJobModel
      .find({
        status: {
          $in: [ImportJobStatus.PENDING, ImportJobStatus.PROCESSING],
        },
      })
      .exec();

    return jobs.map((job) => ImportJobEntity.fromObject(job.toObject()));
  }

  /**
   * Elimina un job
   */
  async delete(id: string): Promise<void> {
    await this.importJobModel.findByIdAndDelete(id).exec();
  }
}
