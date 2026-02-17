import { Inject } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { IUserRepository } from "@auth/domain/repositories/user.repository.interface";
import { UpdateUserCommand } from "../commands/update-user.command";

/**
 * Update User Handler
 * Maneja la actualización de información de un usuario
 */
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject("IUserRepository")
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateUserCommand) {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error(`User with id ${command.userId} not found`);
    }

    const updateData: Record<string, any> = {};
    if (command.data.firstName !== undefined) updateData.firstName = command.data.firstName;
    if (command.data.lastName !== undefined) updateData.lastName = command.data.lastName;
    if (command.data.phone !== undefined) updateData.phone = command.data.phone;
    if (command.data.roles !== undefined) updateData.roles = command.data.roles;
    if (command.data.isActive !== undefined) updateData.isActive = command.data.isActive;
    updateData["audit.updatedBy"] = command.updatedBy;

    const updated = await this.userRepository.update(command.userId, updateData);

    return updated;
  }
}
