/**
 * Command para actualizar un permiso existente
 */
export class UpdatePermissionCommand {
  constructor(
    public readonly permissionId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly isActive?: boolean,
    public readonly updatedBy: string = "system"
  ) {}
}
