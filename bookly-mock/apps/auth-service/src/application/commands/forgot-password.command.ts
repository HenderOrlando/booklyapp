/**
 * Command para solicitar recuperación de contraseña
 */
export class ForgotPasswordCommand {
  constructor(public readonly email: string) {}
}
