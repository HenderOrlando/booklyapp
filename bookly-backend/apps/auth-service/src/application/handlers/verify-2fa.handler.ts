import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Verify2FACommand } from "../commands/verify-2fa.command";
import { TwoFactorService } from "../services/two-factor.service";

/**
 * Verify2FAHandler
 * Handler para verificar código 2FA durante login
 */
@CommandHandler(Verify2FACommand)
export class Verify2FAHandler implements ICommandHandler<Verify2FACommand> {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  async execute(command: Verify2FACommand) {
    return this.twoFactorService.verify2FA(command.userId, command.token);
  }
}
