/**
 * Command para restablecer contraseña con token
 */
export class ResetPasswordCommand {
  constructor(
    public readonly token: string,
    public readonly newPassword: string
  ) {}
}
