import { ImportResourceMode, ResourceType } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResourceEntity } from "../../domain/entities/resource.entity";
import { CategoryRepository } from "../../infrastructure/repositories/category.repository";
import { ResourceRepository } from "../../infrastructure/repositories/resource.repository";
import { ImportResourcesCommand } from "../commands/import-resources.command";

/**
 * Handler para importar recursos desde CSV
 */
@CommandHandler(ImportResourcesCommand)
export class ImportResourcesHandler
  implements ICommandHandler<ImportResourcesCommand>
{
  private readonly logger = createLogger("ImportResourcesHandler");

  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(command: ImportResourcesCommand): Promise<{
    totalRows: number;
    successCount: number;
    updatedCount: number;
    errorCount: number;
    errors: Array<{ row: number; code?: string; error: string }>;
    processingTime: number;
  }> {
    const startTime = Date.now();
    this.logger.info("Starting CSV import", {
      mode: command.mode,
      skipErrors: command.skipErrors,
    });

    const errors: Array<{ row: number; code?: string; error: string }> = [];
    let successCount = 0;
    let updatedCount = 0;

    try {
      // Parse CSV
      const rows = this.parseCSV(command.csvContent);
      const totalRows = rows.length;

      this.logger.info(`Processing ${totalRows} rows`);

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 porque row 1 es header y empezamos en 0

        try {
          await this.processRow(
            row,
            command.mode,
            command.userId,
            rowNumber,
            successCount,
            updatedCount
          );

          if (row._isUpdate) {
            updatedCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          errors.push({
            row: rowNumber,
            code: row.code,
            error: error.message || "Unknown error",
          });

          if (!command.skipErrors) {
            throw new Error(
              `Import failed at row ${rowNumber}: ${error.message}`
            );
          }
        }
      }

      const processingTime = Date.now() - startTime;

      this.logger.info("CSV import completed", {
        totalRows,
        successCount,
        updatedCount,
        errorCount: errors.length,
        processingTime,
      });

      return {
        totalRows,
        successCount,
        updatedCount,
        errorCount: errors.length,
        errors,
        processingTime,
      };
    } catch (error) {
      this.logger.error("CSV import failed", error);
      throw error;
    }
  }

  /**
   * Parse CSV content to array of objects
   */
  private parseCSV(csvContent: string): any[] {
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV file is empty or has no data rows");
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      rows.push(row);
    }

    return rows;
  }

  /**
   * Process a single CSV row
   */
  private async processRow(
    row: any,
    mode: ImportResourceMode,
    userId: string,
    rowNumber: number,
    successCount: number,
    updatedCount: number
  ): Promise<void> {
    // Validate required fields
    if (!row.code) {
      throw new Error("Field 'code' is required");
    }
    if (!row.name) {
      throw new Error("Field 'name' is required");
    }
    if (!row.type) {
      throw new Error("Field 'type' is required");
    }

    // Validate type
    if (!Object.values(ResourceType).includes(row.type as ResourceType)) {
      throw new Error(
        `Invalid resource type: ${row.type}. Valid values: ${Object.values(ResourceType).join(", ")}`
      );
    }

    // Check if resource exists
    const existing = await this.resourceRepository.findByCode(row.code);

    if (mode === ImportResourceMode.CREATE && existing) {
      throw new Error(`Resource with code ${row.code} already exists`);
    }

    if (mode === ImportResourceMode.UPDATE && !existing) {
      throw new Error(`Resource with code ${row.code} not found`);
    }

    // Validate category if provided
    let categoryId: string | undefined;
    if (row.categoryCode) {
      const category = await this.categoryRepository.findByCode(
        row.categoryCode
      );
      if (!category) {
        throw new Error(`Category not found: ${row.categoryCode}`);
      }
      categoryId = category.id;
    }

    // Parse arrays from CSV
    const attributes = row.attributes ? JSON.parse(row.attributes) : undefined;
    const programIds = row.programIds ? row.programIds.split(";") : [];

    if (
      existing &&
      (mode === ImportResourceMode.UPDATE || mode === ImportResourceMode.UPSERT)
    ) {
      // Update existing resource
      // TODO: Implement update logic
      this.logger.warn(`Update mode not fully implemented yet for ${row.code}`);
      row._isUpdate = true;
    } else {
      // Create new resource
      const resource = new ResourceEntity(
        "", // id will be generated
        row.code,
        row.name,
        row.description || "",
        row.type as ResourceType,
        categoryId || "",
        row.capacity ? Number(row.capacity) : 0,
        row.location || "",
        row.floor,
        row.building,
        attributes || {},
        programIds,
        undefined, // status (will use default)
        true, // isActive
        undefined, // maintenanceSchedule
        undefined, // availabilityRules
        new Date(), // createdAt
        new Date(), // updatedAt
        { createdBy: userId, updatedBy: userId } // audit
      );

      await this.resourceRepository.create(resource);
      row._isUpdate = false;
    }
  }
}
