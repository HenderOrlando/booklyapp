import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResetPasswordCommand } from "../commands/reset-password.command";
import { AuthService } from "../services/auth.service";

/**
 * Reset Password Command Handler
 * Maneja el restablecimiento de contraseña con token
 */
@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand, void>
{
  constructor(private readonly authService: AuthService) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    const { token, newPassword } = command;

    await this.authService.resetPassword(token, newPassword);
  }
}
