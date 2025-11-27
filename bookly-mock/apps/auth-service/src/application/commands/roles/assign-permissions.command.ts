/**
 * Command para asignar permisos a un rol
 */
export class AssignPermissionsCommand {
  constructor(
    public readonly roleId: string,
    public readonly permissionIds: string[],
    public readonly updatedBy: string
  ) {}
}
