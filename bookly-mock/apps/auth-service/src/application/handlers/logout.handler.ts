import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LogoutCommand } from "../commands/logout.command";
import { AuthService } from "../services/auth.service";

/**
 * Logout Command Handler
 * Maneja el cierre de sesión de usuarios
 */
@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { userId, accessToken } = command;

    await this.authService.logout(userId, accessToken);
  }
}
