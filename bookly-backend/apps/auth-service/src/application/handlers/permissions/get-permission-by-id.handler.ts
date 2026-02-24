import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PermissionResponseDto } from '@auth/application/dtos/permission/permission-response.dto';
import { GetPermissionByIdQuery } from '@auth/application/queries/permissions/get-permission-by-id.query';
import { PermissionService } from '@auth/application/services/permission.service';

/**
 * Handler para obtener un permiso por ID
 */
@QueryHandler(GetPermissionByIdQuery)
export class GetPermissionByIdHandler
  implements IQueryHandler<GetPermissionByIdQuery, PermissionResponseDto>
{
  constructor(private readonly permissionService: PermissionService) {}

  async execute(query: GetPermissionByIdQuery): Promise<PermissionResponseDto> {
    return this.permissionService.getPermissionById(query.permissionId);
  }
}
