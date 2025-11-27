import { CategoryType } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CategoryEntity } from "../../domain/entities/category.entity";
import { ICategoryRepository } from "../../domain/repositories/category.repository.interface";
import { Category, CategoryDocument } from "../schemas/category.schema";

/**
 * Category Repository Implementation
 * Implementación del repositorio de categorías con Mongoose
 */
@Injectable()
export class CategoryRepository implements ICategoryRepository {
  private readonly logger = createLogger("CategoryRepository");

  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>
  ) {}

  async create(category: CategoryEntity): Promise<CategoryEntity> {
    const createdCategory = new this.categoryModel(category.toObject());
    const savedCategory = await createdCategory.save();

    this.logger.info("Category created", {
      categoryId: String(savedCategory._id),
      code: savedCategory.code,
    });

    return CategoryEntity.fromObject(savedCategory.toObject());
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const category = await this.categoryModel.findById(id).exec();
    return category ? CategoryEntity.fromObject(category.toObject()) : null;
  }

  async findByCode(code: string): Promise<CategoryEntity | null> {
    const category = await this.categoryModel
      .findOne({ code: code.toUpperCase() })
      .exec();
    return category ? CategoryEntity.fromObject(category.toObject()) : null;
  }

  async findMany(query: PaginationQuery): Promise<{
    categories: CategoryEntity[];
    meta: PaginationMeta;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      this.categoryModel
        .find()
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      categories: categories.map((category) =>
        CategoryEntity.fromObject(category.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findByType(type: CategoryType): Promise<CategoryEntity[]> {
    const categories = await this.categoryModel.find({ type }).exec();
    return categories.map((category) =>
      CategoryEntity.fromObject(category.toObject())
    );
  }

  async findActive(): Promise<CategoryEntity[]> {
    const categories = await this.categoryModel.find({ isActive: true }).exec();
    return categories.map((category) =>
      CategoryEntity.fromObject(category.toObject())
    );
  }

  async findRootCategories(): Promise<CategoryEntity[]> {
    const categories = await this.categoryModel
      .find({ parentId: { $exists: false } })
      .exec();
    return categories.map((category) =>
      CategoryEntity.fromObject(category.toObject())
    );
  }

  async findByParent(parentId: string): Promise<CategoryEntity[]> {
    const categories = await this.categoryModel.find({ parentId }).exec();
    return categories.map((category) =>
      CategoryEntity.fromObject(category.toObject())
    );
  }

  async update(
    id: string,
    data: Partial<CategoryEntity>
  ): Promise<CategoryEntity> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new Error(`Category with ID ${id} not found`);
    }

    this.logger.info("Category updated", { categoryId: id });

    return CategoryEntity.fromObject(updatedCategory.toObject());
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();

    if (result) {
      this.logger.info("Category deleted", { categoryId: id });
    }

    return !!result;
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.categoryModel
      .countDocuments({ code: code.toUpperCase() })
      .exec();
    return count > 0;
  }

  async count(): Promise<number> {
    return await this.categoryModel.countDocuments().exec();
  }
}
