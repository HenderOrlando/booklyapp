import { FeedbackStatus } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserFeedbackEntity } from '@reports/domain/entities/user-feedback.entity";
import { IFeedbackRepository } from '@reports/domain/repositories/feedback.repository.interface";
import { UserFeedback } from "../schemas/user-feedback.schema";

const logger = createLogger("FeedbackRepository");

/**
 * Feedback Repository
 * Implementación del repositorio de feedback con Mongoose
 */
@Injectable()
export class FeedbackRepository implements IFeedbackRepository {
  constructor(
    @InjectModel(UserFeedback.name)
    private readonly feedbackModel: Model<UserFeedback>
  ) {}

  /**
   * Guardar feedback
   */
  async save(feedback: UserFeedbackEntity): Promise<UserFeedbackEntity> {
    try {
      const feedbackDoc = new this.feedbackModel(feedback.toObject());
      const saved = await feedbackDoc.save();

      logger.debug("Feedback saved", { feedbackId: saved._id });

      return UserFeedbackEntity.fromObject(saved.toObject());
    } catch (error: any) {
      logger.error("Failed to save feedback", error);
      throw error;
    }
  }

  /**
   * Buscar por ID
   */
  async findById(id: string): Promise<UserFeedbackEntity | null> {
    try {
      const feedback = await this.feedbackModel.findById(id).lean().exec();

      if (!feedback) {
        return null;
      }

      return UserFeedbackEntity.fromObject(feedback);
    } catch (error: any) {
      logger.error("Failed to find feedback by ID", error);
      throw error;
    }
  }

  /**
   * Buscar por usuario
   */
  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ feedbacks: UserFeedbackEntity[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [feedbacks, total] = await Promise.all([
        this.feedbackModel
          .find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.feedbackModel.countDocuments({ userId }),
      ]);

      return {
        feedbacks: feedbacks.map((f) => UserFeedbackEntity.fromObject(f)),
        total,
      };
    } catch (error: any) {
      logger.error("Failed to find feedbacks by user", error);
      throw error;
    }
  }

  /**
   * Buscar por recurso
   */
  async findByResource(
    resourceId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ feedbacks: UserFeedbackEntity[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [feedbacks, total] = await Promise.all([
        this.feedbackModel
          .find({ resourceId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.feedbackModel.countDocuments({ resourceId }),
      ]);

      return {
        feedbacks: feedbacks.map((f) => UserFeedbackEntity.fromObject(f)),
        total,
      };
    } catch (error: any) {
      logger.error("Failed to find feedbacks by resource", error);
      throw error;
    }
  }

  /**
   * Buscar por reserva
   */
  async findByReservation(
    reservationId: string
  ): Promise<UserFeedbackEntity | null> {
    try {
      const feedback = await this.feedbackModel
        .findOne({ reservationId })
        .lean()
        .exec();

      if (!feedback) {
        return null;
      }

      return UserFeedbackEntity.fromObject(feedback);
    } catch (error: any) {
      logger.error("Failed to find feedback by reservation", error);
      throw error;
    }
  }

  /**
   * Buscar por estado
   */
  async findByStatus(
    status: FeedbackStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<{ feedbacks: UserFeedbackEntity[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [feedbacks, total] = await Promise.all([
        this.feedbackModel
          .find({ status })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.feedbackModel.countDocuments({ status }),
      ]);

      return {
        feedbacks: feedbacks.map((f) => UserFeedbackEntity.fromObject(f)),
        total,
      };
    } catch (error: any) {
      logger.error("Failed to find feedbacks by status", error);
      throw error;
    }
  }

  /**
   * Buscar todos con paginación
   */
  async findAll(
    page: number = 1,
    limit: number = 20
  ): Promise<{ feedbacks: UserFeedbackEntity[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [feedbacks, total] = await Promise.all([
        this.feedbackModel
          .find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.feedbackModel.countDocuments(),
      ]);

      return {
        feedbacks: feedbacks.map((f) => UserFeedbackEntity.fromObject(f)),
        total,
      };
    } catch (error: any) {
      logger.error("Failed to find all feedbacks", error);
      throw error;
    }
  }

  /**
   * Actualizar respuesta
   */
  async updateResponse(
    id: string,
    response: string,
    respondedBy: string,
    status: FeedbackStatus
  ): Promise<UserFeedbackEntity | null> {
    try {
      const updated = await this.feedbackModel
        .findByIdAndUpdate(
          id,
          {
            response,
            respondedBy,
            respondedAt: new Date(),
            status,
          },
          { new: true }
        )
        .lean()
        .exec();

      if (!updated) {
        return null;
      }

      logger.debug("Feedback response updated", { feedbackId: id });

      return UserFeedbackEntity.fromObject(updated);
    } catch (error: any) {
      logger.error("Failed to update feedback response", error);
      throw error;
    }
  }

  /**
   * Actualizar estado
   */
  async updateStatus(
    id: string,
    status: FeedbackStatus
  ): Promise<UserFeedbackEntity | null> {
    try {
      const updated = await this.feedbackModel
        .findByIdAndUpdate(id, { status }, { new: true })
        .lean()
        .exec();

      if (!updated) {
        return null;
      }

      logger.debug("Feedback status updated", { feedbackId: id, status });

      return UserFeedbackEntity.fromObject(updated);
    } catch (error: any) {
      logger.error("Failed to update feedback status", error);
      throw error;
    }
  }

  /**
   * Eliminar feedback
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.feedbackModel.findByIdAndDelete(id).exec();

      if (!result) {
        return false;
      }

      logger.debug("Feedback deleted", { feedbackId: id });

      return true;
    } catch (error: any) {
      logger.error("Failed to delete feedback", error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas por recurso
   */
  async getResourceStatistics(resourceId: string): Promise<{
    totalFeedbacks: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    sentimentDistribution: Record<string, number>;
  }> {
    try {
      const feedbacks = await this.feedbackModel
        .find({ resourceId })
        .lean()
        .exec();

      const totalFeedbacks = feedbacks.length;

      if (totalFeedbacks === 0) {
        return {
          totalFeedbacks: 0,
          averageRating: 0,
          ratingDistribution: {},
          sentimentDistribution: {},
        };
      }

      // Calcular rating promedio
      const sumRatings = feedbacks.reduce((sum, f) => sum + f.rating, 0);
      const averageRating = sumRatings / totalFeedbacks;

      // Distribución de ratings
      const ratingDistribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      feedbacks.forEach((f) => {
        ratingDistribution[f.rating]++;
      });

      // Distribución de sentimientos
      const sentimentDistribution: Record<string, number> = {
        POSITIVE: 0,
        NEUTRAL: 0,
        NEGATIVE: 0,
      };
      feedbacks.forEach((f) => {
        const entity = UserFeedbackEntity.fromObject(f);
        const sentiment = entity.getSentiment();
        sentimentDistribution[sentiment]++;
      });

      logger.debug("Resource statistics calculated", {
        resourceId,
        totalFeedbacks,
        averageRating,
      });

      return {
        totalFeedbacks,
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution,
        sentimentDistribution,
      };
    } catch (error: any) {
      logger.error("Failed to get resource statistics", error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales
   */
  async getGeneralStatistics(): Promise<{
    totalFeedbacks: number;
    averageRating: number;
    pendingFeedbacks: number;
    respondedFeedbacks: number;
  }> {
    try {
      const [total, pending, responded, feedbacks] = await Promise.all([
        this.feedbackModel.countDocuments(),
        this.feedbackModel.countDocuments({ status: FeedbackStatus.PENDING }),
        this.feedbackModel.countDocuments({
          status: FeedbackStatus.RESPONDED,
        }),
        this.feedbackModel.find().select("rating").lean().exec(),
      ]);

      const averageRating =
        feedbacks.length > 0
          ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
          : 0;

      logger.debug("General statistics calculated", {
        totalFeedbacks: total,
        averageRating,
      });

      return {
        totalFeedbacks: total,
        averageRating: Math.round(averageRating * 100) / 100,
        pendingFeedbacks: pending,
        respondedFeedbacks: responded,
      };
    } catch (error: any) {
      logger.error("Failed to get general statistics", error);
      throw error;
    }
  }
}
