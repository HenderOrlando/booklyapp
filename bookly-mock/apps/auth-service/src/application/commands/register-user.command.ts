import { UserRole } from "@libs/common/enums";

/**
 * Register User Command
 * Comando para registrar un nuevo usuario en el sistema
 */
export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly roles: UserRole[] = [UserRole.STUDENT],
    public readonly permissions: string[] = []
  ) {}
}
