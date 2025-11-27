import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserEntity } from "../../domain/entities/user.entity";
import { GetUserByIdQuery } from "../queries/get-user-by-id.query";
import { UserService } from "../services/user.service";

/**
 * Get User By ID Query Handler
 * Maneja la obtención de un usuario por ID
 */
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler
  implements IQueryHandler<GetUserByIdQuery, UserEntity>
{
  constructor(private readonly userService: UserService) {}

  async execute(query: GetUserByIdQuery): Promise<UserEntity> {
    return await this.userService.getUserById(query.userId);
  }
}
