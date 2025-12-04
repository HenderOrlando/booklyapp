import { UserRole } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserEntity } from '@auth/domain/entities/user.entity';
import { IUserRepository } from '@auth/domain/repositories/user.repository.interface';
import { User, UserDocument } from "../schemas/user.schema";

/**
 * User Repository Implementation
 * Implementación del repositorio de usuarios con Mongoose
 */
@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = createLogger("UserRepository");

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const createdUser = new this.userModel(user.toObject());
    const savedUser = await createdUser.save();

    this.logger.info("User created", {
      userId: String(savedUser._id),
    });

    return UserEntity.fromObject(savedUser.toObject());
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? UserEntity.fromObject(user.toObject()) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .exec();
    return user ? UserEntity.fromObject(user.toObject()) : null;
  }

  async findBySSOProvider(
    provider: string,
    providerId: string
  ): Promise<UserEntity | null> {
    const user = await this.userModel
      .findOne({ ssoProvider: provider, ssoProviderId: providerId })
      .exec();
    return user ? UserEntity.fromObject(user.toObject()) : null;
  }

  async findMany(
    query: PaginationQuery,
    filters?: Partial<UserEntity>
  ): Promise<{ users: UserEntity[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const mongoFilters: any = {};
    if (filters?.email) {
      mongoFilters.email = new RegExp(filters.email, "i");
    }
    if (filters?.isActive !== undefined) {
      mongoFilters.isActive = filters.isActive;
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(mongoFilters)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(mongoFilters).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map((user) => UserEntity.fromObject(user.toObject())),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findByRole(
    role: UserRole,
    query: PaginationQuery
  ): Promise<{ users: UserEntity[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find({ roles: role })
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments({ roles: role }).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map((user) => UserEntity.fromObject(user.toObject())),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    this.logger.info("User updated", { userId: id });

    return UserEntity.fromObject(updatedUser.toObject());
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();

    if (result) {
      this.logger.info("User deleted", { userId: id });
    }

    return !!result;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel
      .countDocuments({ email: email.toLowerCase() })
      .exec();
    return count > 0;
  }

  async count(filters?: Partial<UserEntity>): Promise<number> {
    const mongoFilters: any = {};
    if (filters?.isActive !== undefined) {
      mongoFilters.isActive = filters.isActive;
    }
    return await this.userModel.countDocuments(mongoFilters).exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { $set: { lastLogin: new Date() } })
      .exec();

    this.logger.debug("User last login updated", { userId: id });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, {
        $set: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
        },
      })
      .exec();

    this.logger.info("User password updated", { userId: id });
  }
}
