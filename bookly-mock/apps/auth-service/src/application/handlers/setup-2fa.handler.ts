import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Setup2FACommand } from "../commands/setup-2fa.command";
import { TwoFactorService } from "../services/two-factor.service";

/**
 * Setup2FAHandler
 * Handler para generar configuración 2FA
 */
@CommandHandler(Setup2FACommand)
export class Setup2FAHandler implements ICommandHandler<Setup2FACommand> {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  async execute(command: Setup2FACommand) {
    return this.twoFactorService.setup2FA(command.userId);
  }
}
