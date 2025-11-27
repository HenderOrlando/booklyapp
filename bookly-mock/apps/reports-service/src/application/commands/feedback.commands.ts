import { FeedbackCategory, FeedbackStatus } from "@libs/common/enums";

/**
 * Command: Crear Feedback
 * RF-34: Registro de feedback de usuarios
 */
export class CreateFeedbackCommand {
  constructor(
    public readonly userId: string,
    public readonly userName: string,
    public readonly reservationId: string,
    public readonly resourceId: string,
    public readonly resourceName: string,
    public readonly rating: number,
    public readonly comments?: string,
    public readonly category?: FeedbackCategory,
    public readonly isAnonymous?: boolean
  ) {}
}

/**
 * Command: Responder a Feedback
 * RF-34: Staff responde a feedback de usuarios
 */
export class RespondToFeedbackCommand {
  constructor(
    public readonly feedbackId: string,
    public readonly response: string,
    public readonly respondedBy: string
  ) {}
}

/**
 * Command: Actualizar Estado de Feedback
 */
export class UpdateFeedbackStatusCommand {
  constructor(
    public readonly feedbackId: string,
    public readonly status: FeedbackStatus
  ) {}
}

/**
 * Command: Eliminar Feedback
 */
export class DeleteFeedbackCommand {
  constructor(public readonly feedbackId: string) {}
}
