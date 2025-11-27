import {
  CommandHandler,
  ICommandHandler,
  IQueryHandler,
  QueryHandler,
} from "@nestjs/cqrs";
import {
  CreateEvaluationCommand,
  DeleteEvaluationCommand,
  UpdateEvaluationCommand,
} from "../commands/evaluation.commands";
import {
  GetEvaluationByIdQuery,
  GetEvaluationsByPeriodQuery,
  GetEvaluationsNeedingFollowUpQuery,
  GetGeneralEvaluationStatisticsQuery,
  GetLatestUserEvaluationQuery,
  GetPriorityUsersQuery,
  GetUserEvaluationsQuery,
  GetUserEvaluationStatisticsQuery,
} from "../queries/evaluation.queries";
import { UserEvaluationService } from "../services/user-evaluation.service";

/**
 * Handler: Crear Evaluación
 */
@CommandHandler(CreateEvaluationCommand)
export class CreateEvaluationHandler
  implements ICommandHandler<CreateEvaluationCommand>
{
  constructor(private readonly userEvaluationService: UserEvaluationService) {}

  async execute(command: CreateEvaluationCommand) {
    const evaluation = await this.userEvaluationService.createEvaluation({
      userId: command.userId,
      userName: command.userName,
      userEmail: command.userEmail,
      evaluatedBy: command.evaluatedBy,
      evaluatorName: command.evaluatorName,
      evaluatorRole: command.evaluatorRole,
      complianceScore: command.complianceScore,
      punctualityScore: command.punctualityScore,
      resourceCareScore: command.resourceCareScore,
      comments: command.comments,
      recommendations: command.recommendations,
      period: command.period,
    });

    return evaluation.toObject();
  }
}

/**
 * Handler: Actualizar Evaluación
 */
@CommandHandler(UpdateEvaluationCommand)
export class UpdateEvaluationHandler
  implements ICommandHandler<UpdateEvaluationCommand>
{
  constructor(private readonly userEvaluationService: UserEvaluationService) {}

  async execute(command: UpdateEvaluationCommand) {
    const evaluation = await this.userEvaluationService.updateEvaluation(
      command.evaluationId,
      {
        complianceScore: command.complianceScore,
        punctualityScore: command.punctualityScore,
        resourceCareScore: command.resourceCareScore,
        overallScore: command.overallScore,
        comments: command.comments,
        recommendations: command.recommendations,
      }
    );

    return evaluation.toObject();
  }
}

/**
 * Handler: Eliminar Evaluación
 */
@CommandHandler(DeleteEvaluationCommand)
export class DeleteEvaluationHandler
  implements ICommandHandler<DeleteEvaluationCommand>
{
  constructor(private readonly userEvaluationService: UserEvaluationService) {}

  async execute(command: DeleteEvaluationCommand) {
    await this.userEvaluationService.deleteEvaluation(command.evaluationId);

    return { success: true };
  }
}

/**
 * Handler: Obtener Evaluación por ID
 */
@QueryHandler(GetEvaluationByIdQuery)
export class GetEvaluationByIdHandler
  implements IQueryHandler<GetEvaluationByIdQuery>
{
  constructor(private readonly userEvaluationService: UserEvaluationService) {}

  async execute(query: GetEvaluationByIdQuery) {
    const evaluation = await this.userEvaluationService.getEvaluationById(
      query.evaluationId
    );

    return evaluation.toObject();
  }
}

/**
 * Handler: Listar Evaluaciones de Usuario
 */
@QueryHandler(GetUserEvaluationsQuery)
export class GetUserEvaluationsHandler
  implements IQueryHandler<GetUserEvaluationsQuery>
{
  constructor(private readonly userEvaluationService: UserEvaluationService) {}

  async execute(query: GetUserEvaluationsQuery) {
    const { evaluations, total, pages } =
      await this.userEvaluationService.listUserEvaluations(
        query.userId,
        query.page,
        query.limit
      );

    return {
      evaluations: evaluations.map((e) => e.toObject()),
      total,
      page: query.page,
      pages,
    };
  }
}

/**
 * Handler: Obtener Última Evaluación de Usuario
 */
@QueryHandler(GetLatestUserEvaluationQuery)
export class GetLatestUserEvaluationHandler
  implements IQueryHandler<GetLatestUserEvaluationQuery>
{
  constructor(private readonly userEvaluationService: UserEvaluationService) {}

  async execute(query: GetLatestUserEvaluationQuery) {
    const evaluation = await this.userEvaluationService.getLatestUserEvaluation(
      query.userId
    );

    return evaluation ? evaluation.toObject() : null;
  }
}

/**
 * Handler: Listar Evaluaciones por Período
 */
@QueryHandler(GetEvaluationsByPeriodQuery)
export class GetEvaluationsByPeriodHandler
  implements IQueryHandler<GetEvaluationsByPeriodQuery>
{
  constructor(private readonly userEvaluationService: UserEvaluationService) {}

  async execute(query: GetEvaluationsByPeriodQuery) {
    const { evaluations, total, pages } =
      await this.userEvaluationService.listEvaluationsByPeriod(
        query.startDate,
        query.endDate,
        query.page,
        query.limit
      );

    return {
      evaluations: evaluations.map((e) => e.toObject()),
      total,
      page: query.page,
      pages,
    };
  }
}

/**
 * Handler: Obtener Usuarios con Acceso Prioritario
 */
@QueryHandler(GetPriorityUsersQuery)
export class GetPriorityUsersHandler
  implements IQueryHandler<GetPriorityUsersQuery>
{
  constructor(private readonly userEvaluationService: UserEvaluationService) {}

  async execute(query: GetPriorityUsersQuery) {
    const users = await this.userEvaluationService.getPriorityUsers(
      query.threshold
    );

    return users.map((u) => u.toObject());
  }
}

/**
 * Handler: Obtener Evaluaciones que Requieren Seguimiento
 */
@QueryHandler(GetEvaluationsNeedingFollowUpQuery)
export class GetEvaluationsNeedingFollowUpHandler
  implements IQueryHandler<GetEvaluationsNeedingFollowUpQuery>
{
  constructor(private readonly userEvaluationService: UserEvaluationService) {}

  async execute(query: GetEvaluationsNeedingFollowUpQuery) {
    const evaluations =
      await this.userEvaluationService.getEvaluationsNeedingFollowUp();

    return evaluations.map((e) => e.toObject());
  }
}

/**
 * Handler: Obtener Estadísticas de Evaluación de Usuario
 */
@QueryHandler(GetUserEvaluationStatisticsQuery)
export class GetUserEvaluationStatisticsHandler
  implements IQueryHandler<GetUserEvaluationStatisticsQuery>
{
  constructor(private readonly userEvaluationService: UserEvaluationService) {}

  async execute(query: GetUserEvaluationStatisticsQuery) {
    return await this.userEvaluationService.getUserStatistics(query.userId);
  }
}

/**
 * Handler: Obtener Estadísticas Generales de Evaluaciones
 */
@QueryHandler(GetGeneralEvaluationStatisticsQuery)
export class GetGeneralEvaluationStatisticsHandler
  implements IQueryHandler<GetGeneralEvaluationStatisticsQuery>
{
  constructor(private readonly userEvaluationService: UserEvaluationService) {}

  async execute(query: GetGeneralEvaluationStatisticsQuery) {
    return await this.userEvaluationService.getGeneralStatistics();
  }
}
