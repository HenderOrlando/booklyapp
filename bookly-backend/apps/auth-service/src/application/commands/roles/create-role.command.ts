/**
 * Command para crear un nuevo rol
 */
export class CreateRoleCommand {
  constructor(
    public readonly name: string,
    public readonly displayName: string,
    public readonly description: string,
    public readonly permissionIds: string[],
    public readonly isActive: boolean = true,
    public readonly isDefault: boolean = false,
    public readonly createdBy: string = "system",
  ) {}
}
