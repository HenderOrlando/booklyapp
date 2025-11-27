import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ChangePasswordCommand } from "../commands/change-password.command";
import { AuthService } from "../services/auth.service";

/**
 * Change Password Command Handler
 * Maneja el cambio de contraseña
 */
@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler
  implements ICommandHandler<ChangePasswordCommand, void>
{
  constructor(private readonly authService: AuthService) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const { userId, oldPassword, newPassword } = command;

    await this.authService.changePassword(userId, oldPassword, newPassword);
  }
}
