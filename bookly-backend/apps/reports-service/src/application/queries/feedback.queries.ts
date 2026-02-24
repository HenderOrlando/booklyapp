import { FeedbackStatus } from "@libs/common/enums";

/**
 * Query: Obtener Feedback por ID
 */
export class GetFeedbackByIdQuery {
  constructor(public readonly feedbackId: string) {}
}

/**
 * Query: Listar Feedback de Usuario
 */
export class GetUserFeedbackQuery {
  constructor(
    public readonly userId: string,
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}

/**
 * Query: Listar Feedback de Recurso
 */
export class GetResourceFeedbackQuery {
  constructor(
    public readonly resourceId: string,
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}

/**
 * Query: Listar Feedback por Estado
 */
export class GetFeedbackByStatusQuery {
  constructor(
    public readonly status: FeedbackStatus,
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}

/**
 * Query: Listar Todo el Feedback (Staff)
 */
export class GetAllFeedbackQuery {
  constructor(
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}

/**
 * Query: Obtener Estadísticas de Feedback por Recurso
 */
export class GetFeedbackResourceStatisticsQuery {
  constructor(public readonly resourceId: string) {}
}

/**
 * Query: Obtener Estadísticas Generales de Feedback
 */
export class GetFeedbackGeneralStatisticsQuery {}
