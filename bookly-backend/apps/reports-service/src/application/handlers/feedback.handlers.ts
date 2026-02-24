import {
  CommandHandler,
  ICommandHandler,
  IQueryHandler,
  QueryHandler,
} from "@nestjs/cqrs";
import {
  CreateFeedbackCommand,
  DeleteFeedbackCommand,
  RespondToFeedbackCommand,
  UpdateFeedbackStatusCommand,
} from "../commands/feedback.commands";
import {
  GetAllFeedbackQuery,
  GetFeedbackByIdQuery,
  GetFeedbackByStatusQuery,
  GetFeedbackGeneralStatisticsQuery,
  GetFeedbackResourceStatisticsQuery,
  GetResourceFeedbackQuery,
  GetUserFeedbackQuery,
} from "../queries/feedback.queries";
import { FeedbackService } from "../services/feedback.service";

/**
 * Handler: Crear Feedback
 */
@CommandHandler(CreateFeedbackCommand)
export class CreateFeedbackHandler
  implements ICommandHandler<CreateFeedbackCommand>
{
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(command: CreateFeedbackCommand) {
    const feedback = await this.feedbackService.createFeedback({
      userId: command.userId,
      userName: command.userName,
      reservationId: command.reservationId,
      resourceId: command.resourceId,
      resourceName: command.resourceName,
      rating: command.rating,
      comments: command.comments,
      category: command.category as any,
      isAnonymous: command.isAnonymous,
    });

    return feedback.toObject();
  }
}

/**
 * Handler: Responder a Feedback
 */
@CommandHandler(RespondToFeedbackCommand)
export class RespondToFeedbackHandler
  implements ICommandHandler<RespondToFeedbackCommand>
{
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(command: RespondToFeedbackCommand) {
    const feedback = await this.feedbackService.respondToFeedback(
      command.feedbackId,
      {
        response: command.response,
        respondedBy: command.respondedBy,
      }
    );

    return feedback.toObject();
  }
}

/**
 * Handler: Actualizar Estado de Feedback
 */
@CommandHandler(UpdateFeedbackStatusCommand)
export class UpdateFeedbackStatusHandler
  implements ICommandHandler<UpdateFeedbackStatusCommand>
{
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(command: UpdateFeedbackStatusCommand) {
    const feedback = await this.feedbackService.updateFeedbackStatus(
      command.feedbackId,
      command.status
    );

    return feedback.toObject();
  }
}

/**
 * Handler: Eliminar Feedback
 */
@CommandHandler(DeleteFeedbackCommand)
export class DeleteFeedbackHandler
  implements ICommandHandler<DeleteFeedbackCommand>
{
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(command: DeleteFeedbackCommand) {
    await this.feedbackService.deleteFeedback(command.feedbackId);

    return { success: true, message: "Feedback deleted successfully" };
  }
}

/**
 * Handler: Obtener Feedback por ID
 */
@QueryHandler(GetFeedbackByIdQuery)
export class GetFeedbackByIdHandler
  implements IQueryHandler<GetFeedbackByIdQuery>
{
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(query: GetFeedbackByIdQuery) {
    const feedback = await this.feedbackService.getFeedbackById(
      query.feedbackId
    );

    return feedback.toObject();
  }
}

/**
 * Handler: Listar Feedback de Usuario
 */
@QueryHandler(GetUserFeedbackQuery)
export class GetUserFeedbackHandler
  implements IQueryHandler<GetUserFeedbackQuery>
{
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(query: GetUserFeedbackQuery) {
    const { feedbacks, total, pages } =
      await this.feedbackService.listUserFeedback(
        query.userId,
        query.page,
        query.limit
      );

    return {
      feedbacks: feedbacks.map((f) => f.toObject()),
      total,
      page: query.page || 1,
      pages,
    };
  }
}

/**
 * Handler: Listar Feedback de Recurso
 */
@QueryHandler(GetResourceFeedbackQuery)
export class GetResourceFeedbackHandler
  implements IQueryHandler<GetResourceFeedbackQuery>
{
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(query: GetResourceFeedbackQuery) {
    const { feedbacks, total, pages } =
      await this.feedbackService.listResourceFeedback(
        query.resourceId,
        query.page,
        query.limit
      );

    return {
      feedbacks: feedbacks.map((f) => f.toObject()),
      total,
      page: query.page || 1,
      pages,
    };
  }
}

/**
 * Handler: Listar Feedback por Estado
 */
@QueryHandler(GetFeedbackByStatusQuery)
export class GetFeedbackByStatusHandler
  implements IQueryHandler<GetFeedbackByStatusQuery>
{
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(query: GetFeedbackByStatusQuery) {
    const { feedbacks, total, pages } =
      await this.feedbackService.listFeedbackByStatus(
        query.status,
        query.page,
        query.limit
      );

    return {
      feedbacks: feedbacks.map((f) => f.toObject()),
      total,
      page: query.page || 1,
      pages,
    };
  }
}

/**
 * Handler: Listar Todo el Feedback
 */
@QueryHandler(GetAllFeedbackQuery)
export class GetAllFeedbackHandler
  implements IQueryHandler<GetAllFeedbackQuery>
{
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(query: GetAllFeedbackQuery) {
    const { feedbacks, total, pages } =
      await this.feedbackService.listAllFeedback(query.page, query.limit);

    return {
      feedbacks: feedbacks.map((f) => f.toObject()),
      total,
      page: query.page || 1,
      pages,
    };
  }
}

/**
 * Handler: Obtener Estadísticas de Recurso
 */
@QueryHandler(GetFeedbackResourceStatisticsQuery)
export class GetFeedbackResourceStatisticsHandler
  implements IQueryHandler<GetFeedbackResourceStatisticsQuery>
{
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(query: GetFeedbackResourceStatisticsQuery) {
    const stats = await this.feedbackService.getResourceStatistics(
      query.resourceId
    );

    return stats;
  }
}

/**
 * Handler: Obtener Estadísticas Generales
 */
@QueryHandler(GetFeedbackGeneralStatisticsQuery)
export class GetFeedbackGeneralStatisticsHandler
  implements IQueryHandler<GetFeedbackGeneralStatisticsQuery>
{
  constructor(private readonly feedbackService: FeedbackService) {}

  async execute(_query: GetFeedbackGeneralStatisticsQuery) {
    const stats = await this.feedbackService.getGeneralStatistics();

    return stats;
  }
}
