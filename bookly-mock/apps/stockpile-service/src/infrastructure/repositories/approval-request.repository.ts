import { ApprovalRequestStatus } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ApprovalRequestEntity } from "@stockpile/domain/entities";
import { IApprovalRequestRepository } from "@stockpile/domain/repositories";
import { ApprovalRequest } from "../schemas";

/**
 * Approval Request Repository
 * Implementación con Mongoose del repositorio de solicitudes de aprobación
 */
@Injectable()
export class ApprovalRequestRepository implements IApprovalRequestRepository {
  constructor(
    @InjectModel(ApprovalRequest.name)
    private readonly model: Model<ApprovalRequest>
  ) {}

  /**
   * Crea una nueva solicitud de aprobación
   */
  async create(request: ApprovalRequestEntity): Promise<ApprovalRequestEntity> {
    const doc = new this.model({
      reservationId: new Types.ObjectId(request.reservationId),
      requesterId: new Types.ObjectId(request.requesterId),
      approvalFlowId: new Types.ObjectId(request.approvalFlowId),
      status: request.status,
      currentStepIndex: request.currentStepIndex,
      submittedAt: request.submittedAt,
      completedAt: request.completedAt,
      metadata: request.metadata,
      approvalHistory: request.approvalHistory?.map((item) => ({
        stepName: item.stepName,
        approverId: new Types.ObjectId(item.approverId),
        decision: item.decision,
        comment: item.comment,
        approvedAt: item.approvedAt,
      })),
      createdBy: new Types.ObjectId(request.audit?.createdBy || ""),
      updatedBy: request.audit?.updatedBy
        ? new Types.ObjectId(request.audit.updatedBy)
        : undefined,
      cancelledBy: request.audit?.cancelledBy
        ? new Types.ObjectId(request.audit.cancelledBy)
        : undefined,
      cancelledAt: request.audit?.cancelledAt,
    });

    const saved = await doc.save();
    return this.toEntity(saved);
  }

  /**
   * Busca una solicitud por ID
   */
  async findById(id: string): Promise<ApprovalRequestEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Busca múltiples solicitudes con paginación y filtros
   */
  async findMany(
    query: PaginationQuery,
    filters?: {
      requesterId?: string;
      approvalFlowId?: string;
      status?: ApprovalRequestStatus;
      reservationId?: string;
    }
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const mongoQuery: any = {};

    if (filters?.requesterId) {
      mongoQuery.requesterId = new Types.ObjectId(filters.requesterId);
    }
    if (filters?.approvalFlowId) {
      mongoQuery.approvalFlowId = new Types.ObjectId(filters.approvalFlowId);
    }
    if (filters?.status) {
      mongoQuery.status = filters.status;
    }
    if (filters?.reservationId) {
      mongoQuery.reservationId = new Types.ObjectId(filters.reservationId);
    }

    const [docs, total] = await Promise.all([
      this.model
        .find(mongoQuery)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.model.countDocuments(mongoQuery).exec(),
    ]);

    return {
      requests: docs.map((doc) => this.toEntity(doc)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca solicitudes por solicitante
   */
  async findByRequester(
    requesterId: string,
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { requesterId });
  }

  /**
   * Busca solicitudes por flujo de aprobación
   */
  async findByApprovalFlow(
    approvalFlowId: string,
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { approvalFlowId });
  }

  /**
   * Busca solicitudes por estado
   */
  async findByStatus(
    status: ApprovalRequestStatus,
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { status });
  }

  /**
   * Busca solicitudes pendientes
   */
  async findPending(
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { status: ApprovalRequestStatus.PENDING });
  }

  /**
   * Busca solicitudes en revisión
   */
  async findInReview(
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { status: ApprovalRequestStatus.IN_REVIEW });
  }

  /**
   * Busca solicitud por reserva
   */
  async findByReservation(
    reservationId: string
  ): Promise<ApprovalRequestEntity | null> {
    const doc = await this.model
      .findOne({ reservationId: new Types.ObjectId(reservationId) })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Busca solicitudes que requieren aprobación de un rol específico
   */
  async findRequiringApprovalFromRole(
    role: string,
    query: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }> {
    // Esta implementación requiere lookup con approval_flows
    // Por ahora retornamos solicitudes en revisión
    return this.findInReview(query);
  }

  /**
   * Actualiza una solicitud
   */
  async update(
    id: string,
    data: Partial<ApprovalRequestEntity>
  ): Promise<ApprovalRequestEntity> {
    const updateData: any = {};

    if (data.status) updateData.status = data.status;
    if (data.currentStepIndex !== undefined)
      updateData.currentStepIndex = data.currentStepIndex;
    if (data.completedAt) updateData.completedAt = data.completedAt;
    if (data.metadata) updateData.metadata = data.metadata;
    if (data.approvalHistory) {
      updateData.approvalHistory = data.approvalHistory.map((item) => ({
        stepName: item.stepName,
        approverId: new Types.ObjectId(item.approverId),
        decision: item.decision,
        comment: item.comment,
        approvedAt: item.approvedAt,
      }));
    }
    if (data.audit?.updatedBy) {
      updateData.updatedBy = new Types.ObjectId(data.audit.updatedBy);
    }
    if (data.audit?.cancelledBy) {
      updateData.cancelledBy = new Types.ObjectId(data.audit.cancelledBy);
      updateData.cancelledAt = data.audit.cancelledAt || new Date();
    }

    const doc = await this.model
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!doc) {
      throw new Error(`Approval request with ID ${id} not found`);
    }

    return this.toEntity(doc);
  }

  /**
   * Elimina una solicitud
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  /**
   * Cuenta solicitudes con filtros opcionales
   */
  async count(filters?: {
    requesterId?: string;
    status?: ApprovalRequestStatus;
    approvalFlowId?: string;
  }): Promise<number> {
    const mongoQuery: any = {};

    if (filters?.requesterId) {
      mongoQuery.requesterId = new Types.ObjectId(filters.requesterId);
    }
    if (filters?.status) {
      mongoQuery.status = filters.status;
    }
    if (filters?.approvalFlowId) {
      mongoQuery.approvalFlowId = new Types.ObjectId(filters.approvalFlowId);
    }

    return await this.model.countDocuments(mongoQuery).exec();
  }

  /**
   * Obtiene estadísticas de aprobaciones
   */
  async getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    approvalFlowId?: string;
  }): Promise<{
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    averageApprovalTime: number;
  }> {
    const mongoQuery: any = {};

    if (filters?.startDate || filters?.endDate) {
      mongoQuery.submittedAt = {};
      if (filters.startDate) mongoQuery.submittedAt.$gte = filters.startDate;
      if (filters.endDate) mongoQuery.submittedAt.$lte = filters.endDate;
    }
    if (filters?.approvalFlowId) {
      mongoQuery.approvalFlowId = new Types.ObjectId(filters.approvalFlowId);
    }

    const [total, approved, rejected, pending, completedRequests] =
      await Promise.all([
        this.model.countDocuments(mongoQuery).exec(),
        this.model
          .countDocuments({
            ...mongoQuery,
            status: ApprovalRequestStatus.APPROVED,
          })
          .exec(),
        this.model
          .countDocuments({
            ...mongoQuery,
            status: ApprovalRequestStatus.REJECTED,
          })
          .exec(),
        this.model
          .countDocuments({
            ...mongoQuery,
            status: ApprovalRequestStatus.PENDING,
          })
          .exec(),
        this.model
          .find({
            ...mongoQuery,
            status: {
              $in: [
                ApprovalRequestStatus.APPROVED,
                ApprovalRequestStatus.REJECTED,
              ],
            },
            completedAt: { $exists: true },
          })
          .select("submittedAt completedAt")
          .exec(),
      ]);

    // Calcular tiempo promedio de aprobación
    let averageApprovalTime = 0;
    if (completedRequests.length > 0) {
      const totalTime = completedRequests.reduce((sum, req) => {
        if (req.completedAt && req.submittedAt) {
          return (
            sum +
            (req.completedAt.getTime() - req.submittedAt.getTime()) / 1000 / 60
          ); // en minutos
        }
        return sum;
      }, 0);
      averageApprovalTime = totalTime / completedRequests.length;
    }

    return {
      total,
      approved,
      rejected,
      pending,
      averageApprovalTime,
    };
  }

  /**
   * Busca aprobaciones activas para un rango de fechas específico
   * RF-23: Para visualización de vigilantes con paginación y filtros
   *
   * Filtra aprobaciones que:
   * 1. Tienen estado APPROVED
   * 2. La fecha de la reserva (almacenada en metadata.reservationStartDate) está dentro del rango
   * 3. Aplica filtros adicionales (resourceId, programId, resourceType)
   */
  async findActiveByDateRange(
    startDate: Date,
    endDate: Date,
    pagination: PaginationQuery,
    filters?: {
      resourceId?: string;
      programId?: string;
      resourceType?: string;
    }
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }> {
    const query: any = {
      status: ApprovalRequestStatus.APPROVED,
      "metadata.reservationStartDate": {
        $gte: startDate,
        $lte: endDate,
      },
    };

    // Aplicar filtros adicionales
    if (filters?.resourceId) {
      query["metadata.resourceId"] = filters.resourceId;
    }
    if (filters?.programId) {
      query["metadata.programId"] = filters.programId;
    }
    if (filters?.resourceType) {
      query["metadata.resourceType"] = filters.resourceType;
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ "metadata.reservationStartDate": 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      requests: docs.map((doc) => this.toEntity(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Convierte un documento de Mongoose a entidad de dominio
   */
  private toEntity(doc: ApprovalRequest): ApprovalRequestEntity {
    return new ApprovalRequestEntity(
      (doc._id as Types.ObjectId).toString(),
      (doc.reservationId as Types.ObjectId).toString(),
      (doc.requesterId as Types.ObjectId).toString(),
      (doc.approvalFlowId as Types.ObjectId).toString(),
      doc.status,
      doc.currentStepIndex,
      doc.submittedAt,
      doc.completedAt,
      doc.metadata,
      doc.approvalHistory?.map((item) => ({
        stepName: item.stepName,
        approverId: (item.approverId as Types.ObjectId).toString(),
        decision: item.decision,
        comment: item.comment,
        approvedAt: item.approvedAt,
      })),
      (doc as any).createdAt,
      (doc as any).updatedAt,
      {
        createdBy: (doc.createdBy as Types.ObjectId).toString(),
        updatedBy: doc.updatedBy
          ? (doc.updatedBy as Types.ObjectId).toString()
          : undefined,
        cancelledBy: doc.cancelledBy
          ? (doc.cancelledBy as Types.ObjectId).toString()
          : undefined,
        cancelledAt: doc.cancelledAt,
      }
    );
  }
}
