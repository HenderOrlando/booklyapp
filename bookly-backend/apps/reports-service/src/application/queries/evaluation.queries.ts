/**
 * Evaluation Queries
 * Consultas CQRS para evaluaciones de usuarios (RF-35)
 */

/**
 * Query: Obtener Evaluación por ID
 */
export class GetEvaluationByIdQuery {
  constructor(public readonly evaluationId: string) {}
}

/**
 * Query: Obtener Evaluaciones de Usuario
 */
export class GetUserEvaluationsQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20
  ) {}
}

/**
 * Query: Obtener Última Evaluación de Usuario
 */
export class GetLatestUserEvaluationQuery {
  constructor(public readonly userId: string) {}
}

/**
 * Query: Obtener Evaluaciones por Período
 */
export class GetEvaluationsByPeriodQuery {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly page: number = 1,
    public readonly limit: number = 20
  ) {}
}

/**
 * Query: Obtener Usuarios con Acceso Prioritario
 */
export class GetPriorityUsersQuery {
  constructor(public readonly threshold: number = 80) {}
}

/**
 * Query: Obtener Evaluaciones que Requieren Seguimiento
 */
export class GetEvaluationsNeedingFollowUpQuery {
  constructor() {}
}

/**
 * Query: Obtener Estadísticas de Evaluación de Usuario
 */
export class GetUserEvaluationStatisticsQuery {
  constructor(public readonly userId: string) {}
}

/**
 * Query: Obtener Estadísticas Generales de Evaluaciones
 */
export class GetGeneralEvaluationStatisticsQuery {
  constructor() {}
}
