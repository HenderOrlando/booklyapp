/**
 * Register User Command
 * Comando para registrar un nuevo usuario en el sistema
 */
export class RegisterUserCommand {
  constructor(
    public readonly data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      roles?: string[];
      permissions?: string[];
      username?: string;
      phone?: string;
      documentType?: string;
      documentNumber?: string;
      tenantId?: string;
      programId?: string;
      coordinatedProgramId?: string;
    },
    public readonly createdBy: string = "system",
  ) {}
}
