import { RoleEntity } from "@auth/domain/entities/role.entity";
import { IRoleRepository } from "@auth/domain/repositories/role.repository.interface";
import { createLogger, PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Role, RoleDocument } from "../schemas/role.schema";

/**
 * Role Repository Implementation
 * Implementación del repositorio de roles con Mongoose
 */
@Injectable()
export class RoleRepository implements IRoleRepository {
  private readonly logger = createLogger("RoleRepository");

  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async create(role: RoleEntity): Promise<RoleEntity> {
    const createdRole = new this.roleModel(role.toObject());
    const savedRole = await createdRole.save();

    this.logger.info("Role created", {
      roleId: String(savedRole._id),
      roleName: savedRole.name,
    });

    return RoleEntity.fromObject(savedRole.toObject());
  }

  async findById(id: string): Promise<RoleEntity | null> {
    const role = await this.roleModel.findById(id).exec();
    return role ? RoleEntity.fromObject(role.toObject()) : null;
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const role = await this.roleModel.findOne({ name }).exec();
    return role ? RoleEntity.fromObject(role.toObject()) : null;
  }

  async findMany(
    query: PaginationQuery,
  ): Promise<{ roles: RoleEntity[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      this.roleModel
        .find()
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.roleModel.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      roles: roles.map((role) => RoleEntity.fromObject(role.toObject())),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findActive(): Promise<RoleEntity[]> {
    const roles = await this.roleModel.find({ isActive: true }).exec();
    return roles.map((role) => RoleEntity.fromObject(role.toObject()));
  }

  async findDefaults(): Promise<RoleEntity[]> {
    const roles = await this.roleModel
      .find({ isDefault: true, isActive: true })
      .exec();
    return roles.map((role) => RoleEntity.fromObject(role.toObject()));
  }

  async update(id: string, data: Partial<RoleEntity>): Promise<RoleEntity> {
    const updatedRole = await this.roleModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();

    if (!updatedRole) {
      throw new Error(`Role with ID ${id} not found`);
    }

    this.logger.info("Role updated", { roleId: id });

    return RoleEntity.fromObject(updatedRole.toObject());
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.roleModel.findByIdAndDelete(id).exec();

    if (result) {
      this.logger.info("Role deleted", { roleId: id });
    }

    return !!result;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.roleModel.countDocuments({ name }).exec();
    return count > 0;
  }

  async count(): Promise<number> {
    return await this.roleModel.countDocuments().exec();
  }
}
