/**
 * Update User Command
 * Comando para actualizar la información de un usuario
 */
export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      roles?: string[];
      isActive?: boolean;
    },
    public readonly updatedBy: string,
  ) {}
}
