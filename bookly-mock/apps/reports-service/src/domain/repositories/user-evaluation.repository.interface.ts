import { UserEvaluationEntity } from "../entities/user-evaluation.entity";

/**
 * User Evaluation Repository Interface
 * Contrato para la persistencia de evaluaciones de usuarios (RF-35)
 */
export interface IUserEvaluationRepository {
  /**
   * Guardar una evaluación de usuario
   */
  save(evaluation: UserEvaluationEntity): Promise<UserEvaluationEntity>;

  /**
   * Buscar evaluación por ID
   */
  findById(evaluationId: string): Promise<UserEvaluationEntity | null>;

  /**
   * Buscar evaluaciones de un usuario
   * @param userId - ID del usuario
   * @param page - Página actual (default: 1)
   * @param limit - Registros por página (default: 20)
   */
  findByUser(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<{
    evaluations: UserEvaluationEntity[];
    total: number;
  }>;

  /**
   * Buscar evaluaciones por evaluador
   * @param evaluatorId - ID del evaluador
   * @param page - Página actual (default: 1)
   * @param limit - Registros por página (default: 20)
   */
  findByEvaluator(
    evaluatorId: string,
    page?: number,
    limit?: number
  ): Promise<{
    evaluations: UserEvaluationEntity[];
    total: number;
  }>;

  /**
   * Buscar última evaluación de un usuario
   */
  findLatestByUser(userId: string): Promise<UserEvaluationEntity | null>;

  /**
   * Buscar evaluaciones en un período de tiempo
   * @param startDate - Fecha inicial
   * @param endDate - Fecha final
   * @param page - Página actual
   * @param limit - Registros por página
   */
  findByPeriod(
    startDate: Date,
    endDate: Date,
    page?: number,
    limit?: number
  ): Promise<{
    evaluations: UserEvaluationEntity[];
    total: number;
  }>;

  /**
   * Buscar usuarios con acceso prioritario (score > threshold)
   * @param threshold - Score mínimo para prioridad (default: 80)
   */
  findPriorityUsers(threshold?: number): Promise<UserEvaluationEntity[]>;

  /**
   * Buscar evaluaciones que requieren seguimiento
   * (overallScore < 70 o complianceScore < 60)
   */
  findNeedingFollowUp(): Promise<UserEvaluationEntity[]>;

  /**
   * Actualizar evaluación
   */
  update(
    evaluationId: string,
    data: Partial<{
      complianceScore?: number;
      punctualityScore?: number;
      resourceCareScore?: number;
      overallScore?: number;
      comments?: string;
      recommendations?: string;
    }>
  ): Promise<UserEvaluationEntity>;

  /**
   * Eliminar evaluación
   */
  delete(evaluationId: string): Promise<void>;

  /**
   * Obtener estadísticas de evaluaciones de un usuario
   * @param userId - ID del usuario
   */
  getUserStatistics(userId: string): Promise<{
    totalEvaluations: number;
    averageOverallScore: number;
    averageComplianceScore: number;
    averagePunctualityScore: number;
    averageResourceCareScore: number;
    latestScore: number;
    trend: "improving" | "stable" | "declining";
  }>;

  /**
   * Obtener estadísticas generales de evaluaciones
   */
  getGeneralStatistics(): Promise<{
    totalEvaluations: number;
    averageScore: number;
    excellentCount: number;
    goodCount: number;
    regularCount: number;
    poorCount: number;
    usersWithPriorityAccess: number;
    usersNeedingFollowUp: number;
  }>;
}
