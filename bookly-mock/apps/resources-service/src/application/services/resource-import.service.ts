import { ImportResourceMode, ResourceType } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { ResourceEntity } from '@resources/domain/entities/resource.entity';
import { ICategoryRepository } from '@resources/domain/repositories/category.repository.interface';
import { IResourceRepository } from '@resources/domain/repositories/resource.repository.interface';

/**
 * DTO para resultado de importación
 */
export interface ImportResult {
  totalRows: number;
  successCount: number;
  updatedCount: number;
  errorCount: number;
  errors: Array<{ row: number; code?: string; error: string }>;
  processingTime: number;
}

/**
 * DTO para resultado de rollback
 */
export interface RollbackResult {
  jobId: string;
  deletedCount: number;
  deletedResourceIds: string[];
  success: boolean;
}

/**
 * DTO para fila de CSV parseada
 */
interface ParsedRow {
  code: string;
  name: string;
  description?: string;
  type: string;
  categoryCode?: string;
  capacity?: string;
  location?: string;
  floor?: string;
  building?: string;
  attributes?: string;
  programIds?: string;
  _isUpdate?: boolean;
}

/**
 * Resource Import Service
 * Servicio para gestión de importación masiva de recursos desde CSV
 */
@Injectable()
export class ResourceImportService {
  private readonly logger = createLogger("ResourceImportService");

  constructor(
    private readonly resourceRepository: IResourceRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  /**
   * Importar recursos desde contenido CSV
   */
  async importFromCSV(
    csvContent: string,
    mode: ImportResourceMode,
    userId: string,
    skipErrors: boolean = false
  ): Promise<ImportResult> {
    const startTime = Date.now();
    
    this.logger.info("Starting CSV import", {
      mode,
      skipErrors,
    });

    const errors: Array<{ row: number; code?: string; error: string }> = [];
    let successCount = 0;
    let updatedCount = 0;

    try {
      // Parse CSV
      const rows = this.parseCSV(csvContent);
      const totalRows = rows.length;

      this.logger.info(`Processing ${totalRows} rows`);

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 porque row 1 es header y empezamos en 0

        try {
          const isUpdate = await this.processRow(row, mode, userId);

          if (isUpdate) {
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

          if (!skipErrors) {
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
  private parseCSV(csvContent: string): ParsedRow[] {
    const lines = csvContent.trim().split("\n");
    
    if (lines.length < 2) {
      throw new Error("CSV file is empty or has no data rows");
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const rows: ParsedRow[] = [];

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
   * @returns true if updated, false if created
   */
  private async processRow(
    row: ParsedRow,
    mode: ImportResourceMode,
    userId: string
  ): Promise<boolean> {
    // Validate required fields
    this.validateRequiredFields(row);

    // Validate type
    this.validateResourceType(row.type);

    // Check if resource exists
    const existing = await this.resourceRepository.findByCode(row.code);

    // Validate mode
    this.validateMode(mode, existing, row.code);

    // Validate and get category
    const categoryId = await this.validateAndGetCategory(row.categoryCode);

    // Parse arrays from CSV
    const attributes = row.attributes ? JSON.parse(row.attributes) : undefined;
    const programIds = row.programIds ? row.programIds.split(";") : [];

    if (
      existing &&
      (mode === ImportResourceMode.UPDATE || mode === ImportResourceMode.UPSERT)
    ) {
      // Update existing resource
      await this.updateResource(existing.id, row, categoryId, attributes, programIds, userId);
      return true;
    } else {
      // Create new resource
      await this.createResource(row, categoryId, attributes, programIds, userId);
      return false;
    }
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(row: ParsedRow): void {
    if (!row.code) {
      throw new Error("Field 'code' is required");
    }
    if (!row.name) {
      throw new Error("Field 'name' is required");
    }
    if (!row.type) {
      throw new Error("Field 'type' is required");
    }
  }

  /**
   * Validate resource type
   */
  private validateResourceType(type: string): void {
    if (!Object.values(ResourceType).includes(type as ResourceType)) {
      throw new Error(
        `Invalid resource type: ${type}. Valid values: ${Object.values(ResourceType).join(", ")}`
      );
    }
  }

  /**
   * Validate import mode
   */
  private validateMode(
    mode: ImportResourceMode,
    existing: ResourceEntity | null,
    code: string
  ): void {
    if (mode === ImportResourceMode.CREATE && existing) {
      throw new Error(`Resource with code ${code} already exists`);
    }

    if (mode === ImportResourceMode.UPDATE && !existing) {
      throw new Error(`Resource with code ${code} not found`);
    }
  }

  /**
   * Validate and get category ID
   */
  private async validateAndGetCategory(
    categoryCode?: string
  ): Promise<string | undefined> {
    if (!categoryCode) {
      return undefined;
    }

    const category = await this.categoryRepository.findByCode(categoryCode);
    
    if (!category) {
      throw new Error(`Category not found: ${categoryCode}`);
    }

    return category.id;
  }

  /**
   * Create new resource
   */
  private async createResource(
    row: ParsedRow,
    categoryId: string | undefined,
    attributes: any,
    programIds: string[],
    userId: string
  ): Promise<ResourceEntity> {
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

    const created = await this.resourceRepository.create(resource);
    
    this.logger.info("Resource created from CSV", {
      code: row.code,
      resourceId: created.id,
    });

    return created;
  }

  /**
   * Update existing resource
   */
  private async updateResource(
    resourceId: string,
    row: ParsedRow,
    categoryId: string | undefined,
    attributes: any,
    programIds: string[],
    userId: string
  ): Promise<ResourceEntity> {
    const updates: Partial<ResourceEntity> = {
      name: row.name,
      description: row.description || "",
      type: row.type as ResourceType,
      categoryId: categoryId || "",
      capacity: row.capacity ? Number(row.capacity) : 0,
      location: row.location || "",
      floor: row.floor,
      building: row.building,
      attributes: attributes || {},
      programIds,
      updatedAt: new Date(),
    };

    const updated = await this.resourceRepository.update(resourceId, updates);
    
    this.logger.info("Resource updated from CSV", {
      code: row.code,
      resourceId,
    });

    return updated;
  }

  /**
   * Validate CSV format
   */
  validateCSVFormat(csvContent: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      const lines = csvContent.trim().split("\n");

      if (lines.length < 1) {
        errors.push("CSV file is empty");
        return { isValid: false, errors };
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const requiredHeaders = ["code", "name", "type"];

      requiredHeaders.forEach((required) => {
        if (!headers.includes(required)) {
          errors.push(`Missing required header: ${required}`);
        }
      });

      if (lines.length < 2) {
        errors.push("CSV file has no data rows");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push(`Invalid CSV format: ${error.message}`);
      return { isValid: false, errors };
    }
  }
}
