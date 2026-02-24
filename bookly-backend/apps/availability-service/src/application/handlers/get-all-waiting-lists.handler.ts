import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllWaitingListsQuery } from "../queries/get-all-waiting-lists.query";
import { WaitingListService } from "../services/waiting-list.service";

const logger = createLogger("GetAllWaitingListsHandler");

/**
 * Get All Waiting Lists Handler
 * Handler para la query de obtener todas las entradas de lista de espera
 */
@QueryHandler(GetAllWaitingListsQuery)
export class GetAllWaitingListsHandler
  implements IQueryHandler<GetAllWaitingListsQuery>
{
  constructor(private readonly waitingListService: WaitingListService) {}

  async execute(query: GetAllWaitingListsQuery): Promise<any> {
    logger.info("Executing GetAllWaitingListsQuery", {
      filters: query.filters,
      pagination: query.pagination,
    });

    const result = await this.waitingListService.findAll(
      query.pagination,
      query.filters
    );

    logger.info("Waiting lists retrieved successfully", {
      count: result.waitingLists.length,
      total: result.meta.total,
    });

    return result;
  }
}
