import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RegenerateBackupCodesCommand } from "../commands/regenerate-backup-codes.command";
import { TwoFactorService } from "../services/two-factor.service";

/**
 * RegenerateBackupCodesHandler
 * Handler para regenerar códigos de backup 2FA
 */
@CommandHandler(RegenerateBackupCodesCommand)
export class RegenerateBackupCodesHandler
  implements ICommandHandler<RegenerateBackupCodesCommand>
{
  constructor(private readonly twoFactorService: TwoFactorService) {}

  async execute(command: RegenerateBackupCodesCommand) {
    return this.twoFactorService.regenerateBackupCodes(command.userId);
  }
}
