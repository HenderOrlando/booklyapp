import { UpdateMyProfileCommand } from "@auth/application/commands/update-my-profile.command";
import { UserEntity } from "@auth/domain/entities/user.entity";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserService } from "../services/user.service";

/**
 * Update My Profile Command Handler
 * Maneja la actualización del perfil del usuario autenticado
 */
@CommandHandler(UpdateMyProfileCommand)
export class UpdateMyProfileHandler
  implements ICommandHandler<UpdateMyProfileCommand, UserEntity>
{
  constructor(private readonly userService: UserService) {}

  async execute(command: UpdateMyProfileCommand): Promise<UserEntity> {
    return this.userService.updateMyProfile(command.userId, command.data);
  }
}
