import { Inject } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { TwoFactorDisabledEvent } from "../../domain/events/two-factor-disabled.event";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { Disable2FACommand } from "../commands/disable-2fa.command";
import { TwoFactorService } from "../services/two-factor.service";

/**
 * Disable2FAHandler
 * Handler para deshabilitar 2FA
 * Publica TwoFactorDisabledEvent al completarse exitosamente
 */
@CommandHandler(Disable2FACommand)
export class Disable2FAHandler implements ICommandHandler<Disable2FACommand> {
  constructor(
    private readonly twoFactorService: TwoFactorService,
    private readonly eventBus: EventBus,
    @Inject("IUserRepository")
    private readonly userRepository: IUserRepository
  ) {}

  async execute(command: Disable2FACommand) {
    // Obtener usuario antes de deshabilitar para tener el email
    const user = await this.userRepository.findById(command.userId);

    const result = await this.twoFactorService.disable2FA(command.userId);

    if (user) {
      // Publicar evento de 2FA deshabilitado
      this.eventBus.publish(new TwoFactorDisabledEvent(user.id, user.email));
    }

    return result;
  }
}
