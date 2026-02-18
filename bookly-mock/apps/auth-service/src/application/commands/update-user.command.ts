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
      documentType?: string;
      documentNumber?: string;
      roles?: string[];
      isActive?: boolean;
      isEmailVerified?: boolean;
      isPhoneVerified?: boolean;
    },
    public readonly updatedBy: string,
  ) {}
}
