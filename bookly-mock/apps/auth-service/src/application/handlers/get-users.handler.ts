import { PaginationMeta } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserEntity } from '@auth/domain/entities/user.entity";
import { GetUsersQuery } from "../queries/get-users.query";
import { UserService } from "../services/user.service";

export interface GetUsersResponse {
  users: UserEntity[];
  meta: PaginationMeta;
}

/**
 * Get Users Query Handler
 * Maneja la obtención de lista de usuarios
 */
@QueryHandler(GetUsersQuery)
export class GetUsersHandler
  implements IQueryHandler<GetUsersQuery, GetUsersResponse>
{
  constructor(private readonly userService: UserService) {}

  async execute(query: GetUsersQuery): Promise<GetUsersResponse> {
    const { pagination, filters } = query;

    return await this.userService.getUsers(pagination, filters);
  }
}
