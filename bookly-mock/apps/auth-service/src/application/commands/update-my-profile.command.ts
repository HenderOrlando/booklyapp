/**
 * Update My Profile Command
 * Comando para actualizar el perfil del usuario autenticado
 */
export class UpdateMyProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      documentType?: string;
      documentNumber?: string;
    },
  ) {}
}
