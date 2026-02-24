/**
 * Login User Command
 * Comando para autenticar un usuario
 */
export class LoginUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string
  ) {}
}
