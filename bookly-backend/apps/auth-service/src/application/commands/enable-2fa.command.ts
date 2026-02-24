/**
 * Enable2FACommand
 * Command para verificar código TOTP y habilitar 2FA
 */
export class Enable2FACommand {
  constructor(
    public readonly userId: string,
    public readonly token: string,
    public readonly secret: string
  ) {}
}
