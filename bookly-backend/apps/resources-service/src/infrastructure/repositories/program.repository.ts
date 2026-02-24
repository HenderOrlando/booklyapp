import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  IProgramRepository,
  ProgramEntity,
} from "@resources/domain/repositories/program.repository.interface";
import { Program, ProgramDocument } from "../schemas/program.schema";

/**
 * Program Repository Implementation
 * Implementación del repositorio de programas académicos con Mongoose
 */
@Injectable()
export class ProgramRepository implements IProgramRepository {
  private readonly logger = createLogger("ProgramRepository");

  constructor(
    @InjectModel(Program.name)
    private readonly programModel: Model<ProgramDocument>
  ) {}

  async findById(id: string): Promise<ProgramEntity | null> {
    const program = await this.programModel.findById(id).exec();
    return program ? this.toEntity(program) : null;
  }

  async findByCode(code: string): Promise<ProgramEntity | null> {
    const program = await this.programModel
      .findOne({ code: code.toUpperCase(), isActive: true })
      .exec();
    return program ? this.toEntity(program) : null;
  }

  async findByName(name: string): Promise<ProgramEntity[]> {
    const programs = await this.programModel
      .find({
        name: { $regex: name, $options: "i" },
        isActive: true,
      })
      .exec();
    return programs.map((p) => this.toEntity(p));
  }

  async findMany(query: PaginationQuery): Promise<{
    programs: ProgramEntity[];
    meta: PaginationMeta;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const [programs, total] = await Promise.all([
      this.programModel
        .find({ isActive: true })
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.programModel.countDocuments({ isActive: true }).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      programs: programs.map((p) => this.toEntity(p)),
      meta: { total, page, limit, totalPages },
    };
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.programModel
      .countDocuments({ code: code.toUpperCase() })
      .exec();
    return count > 0;
  }

  private toEntity(doc: any): ProgramEntity {
    return {
      id: String(doc._id),
      code: doc.code,
      name: doc.name,
      isActive: doc.isActive,
    };
  }
}
