import { DocumentType } from "../services/document-generation.service";

/**
 * Generate Document Command
 * Comando para generar un documento PDF
 */
export class GenerateDocumentCommand {
  constructor(
    public readonly documentType: DocumentType,
    public readonly data: Record<string, any>,
    public readonly requestedBy: string
  ) {}
}
