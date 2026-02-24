/**
 * Evaluation Commands
 * Comandos CQRS para evaluaciones de usuarios (RF-35)
 */

/**
 * Command: Crear Evaluación de Usuario
 */
export class CreateEvaluationCommand {
  constructor(
    public readonly userId: string,
    public readonly userName: string,
    public readonly userEmail: string,
    public readonly evaluatedBy: string,
    public readonly evaluatorName: string,
    public readonly evaluatorRole: string,
    public readonly complianceScore: number,
    public readonly punctualityScore: number,
    public readonly resourceCareScore: number,
    public readonly comments?: string,
    public readonly recommendations?: string,
    public readonly period?: {
      startDate: Date;
      endDate: Date;
    }
  ) {}
}

/**
 * Command: Actualizar Evaluación
 */
export class UpdateEvaluationCommand {
  constructor(
    public readonly evaluationId: string,
    public readonly complianceScore?: number,
    public readonly punctualityScore?: number,
    public readonly resourceCareScore?: number,
    public readonly overallScore?: number,
    public readonly comments?: string,
    public readonly recommendations?: string
  ) {}
}

/**
 * Command: Eliminar Evaluación
 */
export class DeleteEvaluationCommand {
  constructor(public readonly evaluationId: string) {}
}
