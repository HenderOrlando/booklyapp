/**
 * Change Password Command
 * Comando para cambiar la contraseña de un usuario
 */
export class ChangePasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly oldPassword: string,
    public readonly newPassword: string
  ) {}
}
