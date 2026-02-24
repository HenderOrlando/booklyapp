import { PerformanceLevel } from "@libs/common/enums";

/**
 * User Evaluation Entity
 * Entidad que representa la evaluación administrativa de un usuario (RF-35)
 */
export class UserEvaluationEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly userEmail: string,
    public readonly evaluatedBy: string,
    public readonly evaluatorName: string,
    public readonly evaluatorRole: string,
    public readonly evaluationDate: Date,
    public readonly complianceScore: number, // 0-100
    public readonly punctualityScore: number, // 0-100
    public readonly resourceCareScore: number, // 0-100
    public readonly overallScore: number, // 0-100
    public readonly comments?: string,
    public readonly recommendations?: string,
    public readonly period?: {
      startDate: Date;
      endDate: Date;
    },
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validateScores();
  }

  /**
   * Valida que todos los scores estén en el rango permitido (0-100)
   */
  private validateScores(): void {
    const scores = [
      this.complianceScore,
      this.punctualityScore,
      this.resourceCareScore,
      this.overallScore,
    ];

    for (const score of scores) {
      if (score < 0 || score > 100) {
        throw new Error("Scores must be between 0 and 100");
      }
    }
  }

  /**
   * Calcula el promedio de los scores individuales
   */
  calculateAverageScore(): number {
    return (
      (this.complianceScore + this.punctualityScore + this.resourceCareScore) /
      3
    );
  }

  /**
   * Verifica si la evaluación es excelente (>= 90)
   */
  isExcellent(): boolean {
    return this.overallScore >= 90;
  }

  /**
   * Verifica si la evaluación es buena (>= 70 y < 90)
   */
  isGood(): boolean {
    return this.overallScore >= 70 && this.overallScore < 90;
  }

  /**
   * Verifica si la evaluación es regular (>= 50 y < 70)
   */
  isRegular(): boolean {
    return this.overallScore >= 50 && this.overallScore < 70;
  }

  /**
   * Verifica si la evaluación es deficiente (< 50)
   */
  isPoor(): boolean {
    return this.overallScore < 50;
  }

  /**
   * Obtiene el nivel de desempeño
   */
  getPerformanceLevel(): PerformanceLevel {
    if (this.isExcellent()) return PerformanceLevel.EXCELLENT;
    if (this.isGood()) return PerformanceLevel.GOOD;
    if (this.isRegular()) return PerformanceLevel.REGULAR;
    return PerformanceLevel.POOR;
  }

  /**
   * Verifica si necesita seguimiento
   */
  needsFollowUp(): boolean {
    return this.overallScore < 70 || this.complianceScore < 60;
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      userId: this.userId,
      userName: this.userName,
      userEmail: this.userEmail,
      evaluatedBy: this.evaluatedBy,
      evaluatorName: this.evaluatorName,
      evaluatorRole: this.evaluatorRole,
      evaluationDate: this.evaluationDate,
      complianceScore: this.complianceScore,
      punctualityScore: this.punctualityScore,
      resourceCareScore: this.resourceCareScore,
      overallScore: this.overallScore,
      comments: this.comments,
      recommendations: this.recommendations,
      period: this.period,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): UserEvaluationEntity {
    return new UserEvaluationEntity(
      obj.id || obj._id?.toString(),
      obj.userId,
      obj.userName,
      obj.userEmail,
      obj.evaluatedBy,
      obj.evaluatorName,
      obj.evaluatorRole,
      obj.evaluationDate,
      obj.complianceScore,
      obj.punctualityScore,
      obj.resourceCareScore,
      obj.overallScore,
      obj.comments,
      obj.recommendations,
      obj.period,
      obj.metadata,
      obj.createdAt,
      obj.updatedAt
    );
  }
}
