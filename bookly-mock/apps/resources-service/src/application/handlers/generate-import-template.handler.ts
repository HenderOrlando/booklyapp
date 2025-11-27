import { ResourceType } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CategoryRepository } from "../../infrastructure/repositories/category.repository";
import { GenerateImportTemplateQuery } from "../queries/generate-import-template.query";

/**
 * Handler para generar template CSV dinámico
 */
@QueryHandler(GenerateImportTemplateQuery)
export class GenerateImportTemplateHandler
  implements IQueryHandler<GenerateImportTemplateQuery>
{
  private readonly logger = createLogger("GenerateImportTemplateHandler");

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(query: GenerateImportTemplateQuery): Promise<string> {
    this.logger.info("Generating import template CSV");

    // Headers
    const headers = [
      "code",
      "name",
      "description",
      "type",
      "categoryCode",
      "capacity",
      "location",
      "floor",
      "building",
      "attributes",
      "programIds",
    ];

    let csv = headers.join(",") + "\n";

    // Agregar comentarios con opciones válidas
    csv += `# Tipos válidos: ${Object.values(ResourceType).join(", ")}\n`;

    // Obtener categorías disponibles
    let categories;
    if (query.categoryCode) {
      const category = await this.categoryRepository.findByCode(
        query.categoryCode
      );
      categories = category ? [category] : [];
    } else {
      categories = await this.categoryRepository.findActive();
    }

    if (categories.length > 0) {
      csv += `# Categorías disponibles: ${categories.map((c) => c.code).join(", ")}\n`;
    }

    // Agregar ejemplos si se solicita
    if (query.includeExamples) {
      const examples = this.generateExamples(
        query.categoryCode || (categories[0]?.code ?? "LAB")
      );
      csv += examples.map((ex) => ex.join(",")).join("\n");
    }

    return csv;
  }

  /**
   * Genera filas de ejemplo para el template
   */
  private generateExamples(categoryCode: string): string[][] {
    return [
      [
        "LAB-001",
        "Laboratorio de Química 1",
        "Lab equipado para prácticas básicas de química",
        ResourceType.LABORATORY,
        categoryCode,
        "30",
        "Edificio de Ciencias",
        "2",
        "Bloque A",
        '{"equipos":["microscopios","tubos_ensayo"],"requiere_supervisor":true}',
        "PROG-QUIM;PROG-BIO",
      ],
      [
        "AUD-001",
        "Auditorio Principal",
        "Auditorio con capacidad para eventos institucionales",
        ResourceType.AUDITORIUM,
        categoryCode,
        "200",
        "Edificio Administrativo",
        "1",
        "Bloque Central",
        '{"proyector":true,"sonido_profesional":true,"tarima":true}',
        "",
      ],
    ];
  }
}
