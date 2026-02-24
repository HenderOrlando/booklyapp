/**
 * Command para actualizar un rol existente
 */
export class UpdateRoleCommand {
  constructor(
    public readonly roleId: string,
    public readonly displayName?: string,
    public readonly description?: string,
    public readonly permissionIds?: string[],
    public readonly isActive?: boolean,
    public readonly updatedBy: string = "system"
  ) {}
}
