/**
 * Command para crear un nuevo permiso
 */
export class CreatePermissionCommand {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly description: string,
    public readonly resource: string,
    public readonly action: string,
    public readonly isActive: boolean = true,
    public readonly createdBy: string = "system"
  ) {}
}
