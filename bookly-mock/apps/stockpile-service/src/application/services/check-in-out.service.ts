import { CheckInOutStatus } from "@libs/common/enums";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as crypto from "crypto";
import { Model, Types } from "mongoose";
import { CheckInOutEntity } from "../../domain/entities/check-in-out.entity";
import { CheckInOut } from "../../infrastructure/schemas/check-in-out.schema";

@Injectable()
export class CheckInOutService {
  constructor(
    @InjectModel(CheckInOut.name)
    private readonly model: Model<CheckInOut>
  ) {}

  /**
   * Genera un código QR único para check-in/check-out
   */
  private generateQRCode(reservationId: string): string {
    const timestamp = Date.now();
    const randomPart = crypto.randomBytes(8).toString("hex");
    return `CHECKIN-${reservationId}-${timestamp}-${randomPart}`;
  }

  async create(entity: Partial<CheckInOutEntity>): Promise<CheckInOutEntity> {
    // Generar QR code automáticamente
    const qrCode = this.generateQRCode(entity.reservationId!);

    const created = await this.model.create({
      reservationId: new Types.ObjectId(entity.reservationId),
      resourceId: new Types.ObjectId(entity.resourceId),
      userId: new Types.ObjectId(entity.userId),
      status: entity.status,
      checkInTime: entity.checkInTime,
      checkInBy: entity.checkInBy
        ? new Types.ObjectId(entity.checkInBy)
        : undefined,
      checkInType: entity.checkInType,
      checkInNotes: entity.checkInNotes,
      expectedReturnTime: entity.expectedReturnTime,
      metadata: {
        ...entity.metadata,
        qrCode, // QR code almacenado en metadata
      },
    });

    return CheckInOutEntity.fromObject(created.toObject());
  }

  async findById(id: string): Promise<CheckInOutEntity | null> {
    const doc = await this.model.findById(id).lean();
    return doc ? CheckInOutEntity.fromObject(doc) : null;
  }

  async findByReservationId(
    reservationId: string
  ): Promise<CheckInOutEntity | null> {
    const doc = await this.model
      .findOne({ reservationId: new Types.ObjectId(reservationId) })
      .lean();
    return doc ? CheckInOutEntity.fromObject(doc) : null;
  }

  async update(
    id: string,
    updates: Partial<CheckInOutEntity>
  ): Promise<CheckInOutEntity> {
    const doc = await this.model
      .findByIdAndUpdate(
        id,
        {
          ...updates,
          checkOutBy: updates.checkOutBy
            ? new Types.ObjectId(updates.checkOutBy)
            : undefined,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .lean();

    if (!doc) {
      throw new Error("CheckInOut not found");
    }

    return CheckInOutEntity.fromObject(doc);
  }

  async findOverdue(): Promise<CheckInOutEntity[]> {
    const docs = await this.model
      .find({
        status: CheckInOutStatus.CHECKED_IN,
        expectedReturnTime: { $lt: new Date() },
      })
      .lean();

    return docs.map((doc) => CheckInOutEntity.fromObject(doc));
  }

  async findByUserId(userId: string): Promise<CheckInOutEntity[]> {
    const docs = await this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => CheckInOutEntity.fromObject(doc));
  }

  async findActive(): Promise<CheckInOutEntity[]> {
    const docs = await this.model
      .find({ status: CheckInOutStatus.CHECKED_IN })
      .sort({ checkInTime: -1 })
      .lean();

    return docs.map((doc) => CheckInOutEntity.fromObject(doc));
  }

  /**
   * Buscar check-ins por rango de fechas
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<CheckInOutEntity[]> {
    const docs = await this.model
      .find({
        checkInTime: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ checkInTime: -1 })
      .lean();

    return docs.map((doc) => CheckInOutEntity.fromObject(doc));
  }

  /**
   * Buscar check-ins por recurso específico y rango de fechas
   */
  async findByResourceId(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CheckInOutEntity[]> {
    const docs = await this.model
      .find({
        resourceId: new Types.ObjectId(resourceId),
        checkInTime: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ checkInTime: -1 })
      .lean();

    return docs.map((doc) => CheckInOutEntity.fromObject(doc));
  }
}
