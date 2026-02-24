/**
 * Command para cerrar sesión de usuario
 */
export class LogoutCommand {
  constructor(
    public readonly userId: string,
    public readonly accessToken: string
  ) {}
}
