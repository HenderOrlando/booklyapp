import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserEvaluationEntity } from "../../domain/entities/user-evaluation.entity";
import { IUserEvaluationRepository } from "../../domain/repositories/user-evaluation.repository.interface";
import { UserEvaluation } from "../schemas/user-evaluation.schema";

const logger = createLogger("UserEvaluationRepository");

/**
 * User Evaluation Repository
 * Implementación de persistencia de evaluaciones de usuarios con Mongoose (RF-35)
 */
@Injectable()
export class UserEvaluationRepository implements IUserEvaluationRepository {
  constructor(
    @InjectModel(UserEvaluation.name)
    private readonly evaluationModel: Model<UserEvaluation>
  ) {}

  /**
   * Guardar una evaluación de usuario
   */
  async save(evaluation: UserEvaluationEntity): Promise<UserEvaluationEntity> {
    try {
      logger.debug("Saving user evaluation", {
        userId: evaluation.userId,
        evaluatorId: evaluation.evaluatedBy,
      });

      const evaluationData = {
        userId: evaluation.userId,
        userName: evaluation.userName,
        userEmail: evaluation.userEmail,
        evaluatedBy: evaluation.evaluatedBy,
        evaluatorName: evaluation.evaluatorName,
        evaluatorRole: evaluation.evaluatorRole,
        evaluationDate: evaluation.evaluationDate,
        complianceScore: evaluation.complianceScore,
        punctualityScore: evaluation.punctualityScore,
        resourceCareScore: evaluation.resourceCareScore,
        overallScore: evaluation.overallScore,
        comments: evaluation.comments,
        recommendations: evaluation.recommendations,
        period: evaluation.period,
        metadata: evaluation.metadata,
      };

      const saved = await this.evaluationModel.create(evaluationData);

      logger.info("User evaluation saved successfully", {
        evaluationId: saved.id.toString(),
        userId: evaluation.userId,
      });

      const savedObj = saved.toObject() as any;
      return UserEvaluationEntity.fromObject({
        id: saved.id.toString(),
        userId: saved.userId.toString(),
        userName: saved.userName,
        userEmail: saved.userEmail,
        evaluatedBy: saved.evaluatedBy.toString(),
        evaluatorName: saved.evaluatorName,
        evaluatorRole: saved.evaluatorRole,
        evaluationDate: saved.evaluationDate,
        complianceScore: saved.complianceScore,
        punctualityScore: saved.punctualityScore,
        resourceCareScore: saved.resourceCareScore,
        overallScore: saved.overallScore,
        comments: saved.comments,
        recommendations: saved.recommendations,
        period: saved.period,
        metadata: saved.metadata,
        createdAt: savedObj.createdAt,
        updatedAt: savedObj.updatedAt,
      });
    } catch (error: any) {
      logger.error(`Error saving user evaluation ${evaluation.userId}`, error);
      throw error;
    }
  }

  /**
   * Buscar evaluación por ID
   */
  async findById(evaluationId: string): Promise<UserEvaluationEntity | null> {
    try {
      logger.debug("Finding evaluation by ID", { evaluationId });

      const evaluation = await this.evaluationModel.findById(evaluationId);

      if (!evaluation) {
        logger.debug("Evaluation not found", { evaluationId });
        return null;
      }

      const evalObj = evaluation.toObject() as any;
      return UserEvaluationEntity.fromObject({
        id: evaluation.id.toString(),
        userId: evaluation.userId.toString(),
        userName: evaluation.userName,
        userEmail: evaluation.userEmail,
        evaluatedBy: evaluation.evaluatedBy.toString(),
        evaluatorName: evaluation.evaluatorName,
        evaluatorRole: evaluation.evaluatorRole,
        evaluationDate: evaluation.evaluationDate,
        complianceScore: evaluation.complianceScore,
        punctualityScore: evaluation.punctualityScore,
        resourceCareScore: evaluation.resourceCareScore,
        overallScore: evaluation.overallScore,
        comments: evaluation.comments,
        recommendations: evaluation.recommendations,
        period: evaluation.period,
        metadata: evaluation.metadata,
        createdAt: evalObj.createdAt,
        updatedAt: evalObj.updatedAt,
      });
    } catch (error: any) {
      logger.error(`Error finding evaluation by ID ${evaluationId}`, error);
      throw error;
    }
  }

  /**
   * Buscar evaluaciones de un usuario
   */
  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    evaluations: UserEvaluationEntity[];
    total: number;
  }> {
    try {
      logger.debug("Finding evaluations by user", { userId, page, limit });

      const skip = (page - 1) * limit;

      const [evaluations, total] = await Promise.all([
        this.evaluationModel
          .find({ userId })
          .sort({ evaluationDate: -1 })
          .skip(skip)
          .limit(limit),
        this.evaluationModel.countDocuments({ userId }),
      ]);

      return {
        evaluations: evaluations.map((ev: UserEvaluation) => {
          const evObj = ev.toObject() as any;
          return UserEvaluationEntity.fromObject({
            id: ev.id.toString(),
            userId: ev.userId.toString(),
            userName: ev.userName,
            userEmail: ev.userEmail,
            evaluatedBy: ev.evaluatedBy.toString(),
            evaluatorName: ev.evaluatorName,
            evaluatorRole: ev.evaluatorRole,
            evaluationDate: ev.evaluationDate,
            complianceScore: ev.complianceScore,
            punctualityScore: ev.punctualityScore,
            resourceCareScore: ev.resourceCareScore,
            overallScore: ev.overallScore,
            comments: ev.comments,
            recommendations: ev.recommendations,
            period: ev.period,
            metadata: ev.metadata,
            createdAt: evObj.createdAt,
            updatedAt: evObj.updatedAt,
          });
        }),
        total,
      };
    } catch (error: any) {
      logger.error(`Error finding evaluations by user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Buscar evaluaciones por evaluador
   */
  async findByEvaluator(
    evaluatorId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    evaluations: UserEvaluationEntity[];
    total: number;
  }> {
    try {
      logger.debug("Finding evaluations by evaluator", {
        evaluatorId,
        page,
        limit,
      });

      const skip = (page - 1) * limit;

      const [evaluations, total] = await Promise.all([
        this.evaluationModel
          .find({ evaluatedBy: evaluatorId })
          .sort({ evaluationDate: -1 })
          .skip(skip)
          .limit(limit),
        this.evaluationModel.countDocuments({ evaluatedBy: evaluatorId }),
      ]);

      return {
        evaluations: evaluations.map((ev: UserEvaluation) =>
          UserEvaluationEntity.fromObject({
            id: ev.id.toString(),
            ...ev.toObject(),
          })
        ),
        total,
      };
    } catch (error: any) {
      logger.error(
        `Error finding evaluations by evaluator ${evaluatorId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Buscar última evaluación de un usuario
   */
  async findLatestByUser(userId: string): Promise<UserEvaluationEntity | null> {
    try {
      logger.debug("Finding latest evaluation by user", { userId });

      const evaluation = await this.evaluationModel
        .findOne({ userId })
        .sort({ evaluationDate: -1 });

      if (!evaluation) {
        logger.debug("No evaluation found for user", { userId });
        return null;
      }

      const evalObj = evaluation.toObject() as any;
      return UserEvaluationEntity.fromObject({
        id: evaluation.id.toString(),
        userId: evaluation.userId.toString(),
        userName: evaluation.userName,
        userEmail: evaluation.userEmail,
        evaluatedBy: evaluation.evaluatedBy.toString(),
        evaluatorName: evaluation.evaluatorName,
        evaluatorRole: evaluation.evaluatorRole,
        evaluationDate: evaluation.evaluationDate,
        complianceScore: evaluation.complianceScore,
        punctualityScore: evaluation.punctualityScore,
        resourceCareScore: evaluation.resourceCareScore,
        overallScore: evaluation.overallScore,
        comments: evaluation.comments,
        recommendations: evaluation.recommendations,
        period: evaluation.period,
        metadata: evaluation.metadata,
        createdAt: evalObj.createdAt,
        updatedAt: evalObj.updatedAt,
      });
    } catch (error: any) {
      logger.error(`Error finding latest evaluation by user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Buscar evaluaciones en un período de tiempo
   */
  async findByPeriod(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    evaluations: UserEvaluationEntity[];
    total: number;
  }> {
    try {
      logger.debug("Finding evaluations by period", {
        startDate,
        endDate,
        page,
        limit,
      });

      const skip = (page - 1) * limit;

      const query = {
        evaluationDate: { $gte: startDate, $lte: endDate },
      };

      const [evaluations, total] = await Promise.all([
        this.evaluationModel
          .find(query)
          .sort({ evaluationDate: -1 })
          .skip(skip)
          .limit(limit),
        this.evaluationModel.countDocuments(query),
      ]);

      return {
        evaluations: evaluations.map((ev: UserEvaluation) => {
          const evObj = ev.toObject() as any;
          return UserEvaluationEntity.fromObject({
            id: ev.id.toString(),
            userId: ev.userId.toString(),
            userName: ev.userName,
            userEmail: ev.userEmail,
            evaluatedBy: ev.evaluatedBy.toString(),
            evaluatorName: ev.evaluatorName,
            evaluatorRole: ev.evaluatorRole,
            evaluationDate: ev.evaluationDate,
            complianceScore: ev.complianceScore,
            punctualityScore: ev.punctualityScore,
            resourceCareScore: ev.resourceCareScore,
            overallScore: ev.overallScore,
            comments: ev.comments,
            recommendations: ev.recommendations,
            period: ev.period,
            metadata: ev.metadata,
            createdAt: evObj.createdAt,
            updatedAt: evObj.updatedAt,
          });
        }),
        total,
      };
    } catch (error: any) {
      logger.error(
        `Error finding evaluations by period ${startDate} - ${endDate}`,
        error
      );
      throw error;
    }
  }

  /**
   * Buscar usuarios con acceso prioritario (score > threshold)
   */
  async findPriorityUsers(
    threshold: number = 80
  ): Promise<UserEvaluationEntity[]> {
    try {
      logger.debug("Finding priority users", { threshold });

      // Obtener la última evaluación de cada usuario con score >= threshold
      const evaluations = await this.evaluationModel.aggregate([
        {
          $sort: { userId: 1, evaluationDate: -1 },
        },
        {
          $group: {
            _id: "$userId",
            latestEvaluation: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latestEvaluation" },
        },
        {
          $match: { overallScore: { $gte: threshold } },
        },
        {
          $sort: { overallScore: -1 },
        },
      ]);

      return evaluations.map((ev: any) => {
        return UserEvaluationEntity.fromObject({
          id: ev._id.toString(),
          userId: ev.userId.toString(),
          userName: ev.userName,
          userEmail: ev.userEmail,
          evaluatedBy: ev.evaluatedBy.toString(),
          evaluatorName: ev.evaluatorName,
          evaluatorRole: ev.evaluatorRole,
          evaluationDate: ev.evaluationDate,
          complianceScore: ev.complianceScore,
          punctualityScore: ev.punctualityScore,
          resourceCareScore: ev.resourceCareScore,
          overallScore: ev.overallScore,
          comments: ev.comments,
          recommendations: ev.recommendations,
          period: ev.period,
          metadata: ev.metadata,
          createdAt: ev.createdAt,
          updatedAt: ev.updatedAt,
        });
      });
    } catch (error: any) {
      logger.error(`Error finding priority users ${threshold}`, error);
      throw error;
    }
  }

  /**
   * Buscar evaluaciones que requieren seguimiento
   */
  async findNeedingFollowUp(): Promise<UserEvaluationEntity[]> {
    try {
      logger.debug("Finding evaluations needing follow-up");

      // Última evaluación de cada usuario que necesita seguimiento
      const evaluations = await this.evaluationModel.aggregate([
        {
          $sort: { userId: 1, evaluationDate: -1 },
        },
        {
          $group: {
            _id: "$userId",
            latestEvaluation: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latestEvaluation" },
        },
        {
          $match: {
            $or: [
              { overallScore: { $lt: 70 } },
              { complianceScore: { $lt: 60 } },
            ],
          },
        },
        {
          $sort: { overallScore: 1 },
        },
      ]);

      return evaluations.map((ev: any) => {
        return UserEvaluationEntity.fromObject({
          id: ev._id.toString(),
          userId: ev.userId.toString(),
          userName: ev.userName,
          userEmail: ev.userEmail,
          evaluatedBy: ev.evaluatedBy.toString(),
          evaluatorName: ev.evaluatorName,
          evaluatorRole: ev.evaluatorRole,
          evaluationDate: ev.evaluationDate,
          complianceScore: ev.complianceScore,
          punctualityScore: ev.punctualityScore,
          resourceCareScore: ev.resourceCareScore,
          overallScore: ev.overallScore,
          comments: ev.comments,
          recommendations: ev.recommendations,
          period: ev.period,
          metadata: ev.metadata,
          createdAt: ev.createdAt,
          updatedAt: ev.updatedAt,
        });
      });
    } catch (error: any) {
      logger.error(`Error finding evaluations needing follow-up`, error);
      throw error;
    }
  }

  /**
   * Actualizar evaluación
   */
  async update(
    evaluationId: string,
    data: Partial<{
      complianceScore?: number;
      punctualityScore?: number;
      resourceCareScore?: number;
      overallScore?: number;
      comments?: string;
      recommendations?: string;
    }>
  ): Promise<UserEvaluationEntity> {
    try {
      logger.debug("Updating evaluation", { evaluationId, data });

      const updated = await this.evaluationModel.findByIdAndUpdate(
        evaluationId,
        { $set: data },
        { new: true }
      );

      if (!updated) {
        throw new Error(`Evaluation with ID ${evaluationId} not found`);
      }

      logger.info("Evaluation updated successfully", { evaluationId });

      const updatedObj = updated.toObject() as any;
      return UserEvaluationEntity.fromObject({
        id: updated.id.toString(),
        userId: updated.userId.toString(),
        userName: updated.userName,
        userEmail: updated.userEmail,
        evaluatedBy: updated.evaluatedBy.toString(),
        evaluatorName: updated.evaluatorName,
        evaluatorRole: updated.evaluatorRole,
        evaluationDate: updated.evaluationDate,
        complianceScore: updated.complianceScore,
        punctualityScore: updated.punctualityScore,
        resourceCareScore: updated.resourceCareScore,
        overallScore: updated.overallScore,
        comments: updated.comments,
        recommendations: updated.recommendations,
        period: updated.period,
        metadata: updated.metadata,
        createdAt: updatedObj.createdAt,
        updatedAt: updatedObj.updatedAt,
      });
    } catch (error: any) {
      logger.error(`Error updating evaluation ${evaluationId}`, error);
      throw error;
    }
  }

  /**
   * Eliminar evaluación
   */
  async delete(evaluationId: string): Promise<void> {
    try {
      logger.debug("Deleting evaluation", { evaluationId });

      const result = await this.evaluationModel.findByIdAndDelete(evaluationId);

      if (!result) {
        throw new Error(`Evaluation with ID ${evaluationId} not found`);
      }

      logger.info("Evaluation deleted successfully", { evaluationId });
    } catch (error: any) {
      logger.error(`Error deleting evaluation ${evaluationId}`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de evaluaciones de un usuario
   */
  async getUserStatistics(userId: string): Promise<{
    totalEvaluations: number;
    averageOverallScore: number;
    averageComplianceScore: number;
    averagePunctualityScore: number;
    averageResourceCareScore: number;
    latestScore: number;
    trend: "improving" | "stable" | "declining";
  }> {
    try {
      logger.debug("Getting user evaluation statistics", { userId });

      const stats = await this.evaluationModel.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalEvaluations: { $sum: 1 },
            averageOverallScore: { $avg: "$overallScore" },
            averageComplianceScore: { $avg: "$complianceScore" },
            averagePunctualityScore: { $avg: "$punctualityScore" },
            averageResourceCareScore: { $avg: "$resourceCareScore" },
          },
        },
      ]);

      // Obtener última evaluación y segunda última para calcular tendencia
      const latestEvaluations = await this.evaluationModel
        .find({ userId })
        .sort({ evaluationDate: -1 })
        .limit(2);

      const latestScore = latestEvaluations[0]?.overallScore || 0;
      let trend: "improving" | "stable" | "declining" = "stable";

      if (latestEvaluations.length === 2) {
        const diff =
          latestEvaluations[0].overallScore - latestEvaluations[1].overallScore;
        if (diff > 5) trend = "improving";
        else if (diff < -5) trend = "declining";
      }

      return {
        totalEvaluations: stats[0]?.totalEvaluations || 0,
        averageOverallScore: Math.round(stats[0]?.averageOverallScore || 0),
        averageComplianceScore: Math.round(
          stats[0]?.averageComplianceScore || 0
        ),
        averagePunctualityScore: Math.round(
          stats[0]?.averagePunctualityScore || 0
        ),
        averageResourceCareScore: Math.round(
          stats[0]?.averageResourceCareScore || 0
        ),
        latestScore,
        trend,
      };
    } catch (error: any) {
      logger.error(`Error getting user evaluation statistics ${userId}`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales de evaluaciones
   */
  async getGeneralStatistics(): Promise<{
    totalEvaluations: number;
    averageScore: number;
    excellentCount: number;
    goodCount: number;
    regularCount: number;
    poorCount: number;
    usersWithPriorityAccess: number;
    usersNeedingFollowUp: number;
  }> {
    try {
      logger.debug("Getting general evaluation statistics");

      const [stats, priorityUsers, followUpUsers] = await Promise.all([
        this.evaluationModel.aggregate([
          {
            $group: {
              _id: null,
              totalEvaluations: { $sum: 1 },
              averageScore: { $avg: "$overallScore" },
              excellentCount: {
                $sum: { $cond: [{ $gte: ["$overallScore", 90] }, 1, 0] },
              },
              goodCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gte: ["$overallScore", 70] },
                        { $lt: ["$overallScore", 90] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              regularCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gte: ["$overallScore", 50] },
                        { $lt: ["$overallScore", 70] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              poorCount: {
                $sum: { $cond: [{ $lt: ["$overallScore", 50] }, 1, 0] },
              },
            },
          },
        ]),
        this.findPriorityUsers(),
        this.findNeedingFollowUp(),
      ]);

      return {
        totalEvaluations: stats[0]?.totalEvaluations || 0,
        averageScore: Math.round(stats[0]?.averageScore || 0),
        excellentCount: stats[0]?.excellentCount || 0,
        goodCount: stats[0]?.goodCount || 0,
        regularCount: stats[0]?.regularCount || 0,
        poorCount: stats[0]?.poorCount || 0,
        usersWithPriorityAccess: priorityUsers.length,
        usersNeedingFollowUp: followUpUsers.length,
      };
    } catch (error: any) {
      logger.error(`Error getting general evaluation statistics`, error);
      throw error;
    }
  }
}
