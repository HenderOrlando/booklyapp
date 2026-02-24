import { Inject } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { TwoFactorEnabledEvent } from '@auth/domain/events/two-factor-enabled.event';
import { IUserRepository } from '@auth/domain/repositories/user.repository.interface';
import { Enable2FACommand } from "../commands/enable-2fa.command";
import { TwoFactorService } from "../services/two-factor.service";

/**
 * Enable2FAHandler
 * Handler para verificar código TOTP y habilitar 2FA
 * Publica TwoFactorEnabledEvent al completarse exitosamente
 */
@CommandHandler(Enable2FACommand)
export class Enable2FAHandler implements ICommandHandler<Enable2FACommand> {
  constructor(
    private readonly twoFactorService: TwoFactorService,
    private readonly eventBus: EventBus,
    @Inject("IUserRepository")
    private readonly userRepository: IUserRepository
  ) {}

  async execute(command: Enable2FACommand) {
    const result = await this.twoFactorService.enable2FA(
      command.userId,
      command.token,
      command.secret
    );

    // Obtener usuario para publicar evento
    const user = await this.userRepository.findById(command.userId);

    if (user) {
      // Publicar evento de 2FA habilitado
      this.eventBus.publish(
        TwoFactorEnabledEvent.create({ userId: user.id, email: user.email })
      );
    }

    return result;
  }
}
