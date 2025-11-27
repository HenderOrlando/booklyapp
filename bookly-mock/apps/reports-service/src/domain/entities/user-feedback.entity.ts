import {
  FeedbackCategory,
  FeedbackSentiment,
  FeedbackStatus,
} from "@libs/common/enums";

/**
 * User Feedback Entity
 * Entidad que representa el feedback de un usuario sobre una reserva (RF-34)
 */
export class UserFeedbackEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly reservationId: string,
    public readonly resourceId: string,
    public readonly resourceName: string,
    public readonly rating: number, // 1-5
    public readonly status: FeedbackStatus,
    public readonly comments?: string,
    public readonly feedbackDate?: Date,
    public readonly category?: FeedbackCategory,
    public readonly isAnonymous?: boolean,
    public readonly response?: string,
    public readonly respondedBy?: string,
    public readonly respondedAt?: Date,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validateRating();
  }

  /**
   * Valida que el rating esté en el rango permitido (1-5)
   */
  private validateRating(): void {
    if (this.rating < 1 || this.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
  }

  /**
   * Verifica si el feedback es positivo (rating >= 4)
   */
  isPositive(): boolean {
    return this.rating >= 4;
  }

  /**
   * Verifica si el feedback es negativo (rating <= 2)
   */
  isNegative(): boolean {
    return this.rating <= 2;
  }

  /**
   * Verifica si el feedback es neutral (rating = 3)
   */
  isNeutral(): boolean {
    return this.rating === 3;
  }

  /**
   * Verifica si el feedback tiene comentarios
   */
  hasComments(): boolean {
    return !!this.comments && this.comments.trim().length > 0;
  }

  /**
   * Obtiene el sentimiento del feedback
   */
  getSentiment(): FeedbackSentiment {
    if (this.isPositive()) return FeedbackSentiment.POSITIVE;
    if (this.isNegative()) return FeedbackSentiment.NEGATIVE;
    return FeedbackSentiment.NEUTRAL;
  }

  /**
   * Verifica si el feedback ha sido respondido
   */
  hasResponse(): boolean {
    return !!this.response && this.response.trim().length > 0;
  }

  /**
   * Verifica si el feedback está pendiente
   */
  isPending(): boolean {
    return this.status === FeedbackStatus.PENDING;
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      userId: this.userId,
      userName: this.userName,
      reservationId: this.reservationId,
      resourceId: this.resourceId,
      resourceName: this.resourceName,
      rating: this.rating,
      status: this.status,
      sentiment: this.getSentiment(),
      comments: this.comments,
      feedbackDate: this.feedbackDate,
      category: this.category,
      isAnonymous: this.isAnonymous,
      response: this.response,
      respondedBy: this.respondedBy,
      respondedAt: this.respondedAt,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): UserFeedbackEntity {
    return new UserFeedbackEntity(
      obj.id || obj._id?.toString(),
      obj.userId,
      obj.userName,
      obj.reservationId,
      obj.resourceId,
      obj.resourceName,
      obj.rating,
      obj.status || FeedbackStatus.PENDING,
      obj.comments,
      obj.feedbackDate,
      obj.category,
      obj.isAnonymous,
      obj.response,
      obj.respondedBy,
      obj.respondedAt,
      obj.metadata,
      obj.createdAt,
      obj.updatedAt
    );
  }
}
