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
      preferences?: {
        language?: string;
        theme?: "light" | "dark" | "system";
        timezone?: string;
        notifications?: {
          email?: boolean;
          push?: boolean;
          sms?: boolean;
        };
      };
    },
  ) {}
}
