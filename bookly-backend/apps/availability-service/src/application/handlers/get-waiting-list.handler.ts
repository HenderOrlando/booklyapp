import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetWaitingListQuery } from "../queries/get-waiting-list.query";
import { WaitingListService } from "../services/waiting-list.service";

const logger = createLogger("GetWaitingListHandler");

/**
 * Get Waiting List Handler
 * Handler para la query de obtener lista de espera de un recurso
 */
@QueryHandler(GetWaitingListQuery)
export class GetWaitingListHandler
  implements IQueryHandler<GetWaitingListQuery>
{
  constructor(private readonly waitingListService: WaitingListService) {}

  async execute(query: GetWaitingListQuery): Promise<any> {
    logger.info("Executing GetWaitingListQuery", {
      resourceId: query.resourceId,
      pagination: query.pagination,
    });

    const result = await this.waitingListService.getWaitingList(
      query.resourceId,
      query.pagination
    );

    logger.info("Waiting list retrieved successfully", {
      resourceId: query.resourceId,
      count: result.waitingLists.length,
      total: result.meta.total,
    });

    return result;
  }
}
