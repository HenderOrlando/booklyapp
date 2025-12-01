import { ImportResourceMode, ResourceType } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ValidationResultDto } from '@resources/infrastructure/dto/import-advanced.dto";
import { CategoryRepository } from '@resources/infrastructure/repositories/category.repository";
import { ValidateImportCommand } from "../commands/validate-import.command";

/**
 * Handler para validar CSV sin importar (dry-run)
 */
@CommandHandler(ValidateImportCommand)
export class ValidateImportHandler
  implements ICommandHandler<ValidateImportCommand>
{
  private readonly logger = createLogger("ValidateImportHandler");

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(command: ValidateImportCommand): Promise<ValidationResultDto> {
    this.logger.info(`Validating CSV import (mode: ${command.mode})`);

    const result: ValidationResultDto = {
      isValid: true,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      errors: [],
      warnings: [],
    };

    try {
      const rows = this.parseCSV(command.csvContent);
      result.totalRows = rows.length;

      // Validar cada fila
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 porque empezamos en 1 y hay header

        try {
          await this.validateRow(row, command.mode, rowNumber);
          result.validRows++;
        } catch (error) {
          result.invalidRows++;
          result.errors.push(
            `Fila ${rowNumber}: ${error instanceof Error ? error.message : String(error)}`
          );
          result.isValid = false;
        }
      }

      // Agregar advertencias
      if (result.totalRows > 1000) {
        result.warnings.push(
          `El archivo tiene ${result.totalRows} filas. Se recomienda usar importación asíncrona.`
        );
      }

      if (result.invalidRows > 0) {
        result.warnings.push(
          `${result.invalidRows} filas con errores. Use skipErrors=true para omitirlas.`
        );
      }

      this.logger.info(
        `Validation complete: ${result.validRows}/${result.totalRows} valid rows`
      );

      return result;
    } catch (error) {
      this.logger.error("Error validating CSV", error);
      throw error;
    }
  }

  /**
   * Parse CSV content
   */
  private parseCSV(content: string): any[] {
    const lines = content.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header and one data row");
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
   * Validate a single row
   */
  private async validateRow(
    row: any,
    mode: ImportResourceMode,
    rowNumber: number
  ): Promise<void> {
    // Required fields
    if (!row.code) throw new Error("Missing required field: code");
    if (!row.name) throw new Error("Missing required field: name");
    if (!row.type) throw new Error("Missing required field: type");

    // Validate resource type
    if (!Object.values(ResourceType).includes(row.type as ResourceType)) {
      throw new Error(`Invalid resource type: ${row.type}`);
    }

    // Validate category if provided
    if (row.categoryCode) {
      const category = await this.categoryRepository.findByCode(
        row.categoryCode
      );
      if (!category) {
        throw new Error(`Category not found: ${row.categoryCode}`);
      }
    }

    // Validate JSON fields
    if (row.attributes) {
      try {
        JSON.parse(row.attributes);
      } catch (error) {
        throw new Error("Invalid JSON in attributes field");
      }
    }

    // Validate capacity
    if (row.capacity && isNaN(Number(row.capacity))) {
      throw new Error("Capacity must be a number");
    }
  }
}
