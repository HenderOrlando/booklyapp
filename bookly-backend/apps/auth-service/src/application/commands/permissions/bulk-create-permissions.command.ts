import { CreatePermissionDto } from '@auth/application/dtos/permission/create-permission.dto';

/**
 * Command para crear múltiples permisos
 */
export class BulkCreatePermissionsCommand {
  constructor(
    public readonly permissions: CreatePermissionDto[],
    public readonly createdBy: string
  ) {}
}
