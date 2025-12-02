import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GenerateDocumentCommand } from "../commands/generate-document.command";
import {
  DocumentGenerationService,
  DocumentGenerationResult,
  DocumentType,
  ApprovalDocumentData,
  RejectionDocumentData,
  ConfirmationDocumentData,
} from "../services/document-generation.service";

const logger = createLogger("GenerateDocumentHandler");

/**
 * Generate Document Handler
 * Handler para generar documentos PDF
 */
@CommandHandler(GenerateDocumentCommand)
export class GenerateDocumentHandler
  implements ICommandHandler<GenerateDocumentCommand>
{
  constructor(
    private readonly documentGenerationService: DocumentGenerationService
  ) {}

  async execute(
    command: GenerateDocumentCommand
  ): Promise<DocumentGenerationResult> {
    logger.info("Executing GenerateDocumentCommand", {
      documentType: command.documentType,
      requestedBy: command.requestedBy,
    });

    switch (command.documentType) {
      case DocumentType.APPROVAL_LETTER:
        return await this.documentGenerationService.generateApprovalLetter(
          command.data as ApprovalDocumentData
        );

      case DocumentType.REJECTION_LETTER:
        return await this.documentGenerationService.generateRejectionLetter(
          command.data as RejectionDocumentData
        );

      case DocumentType.CONFIRMATION:
        return await this.documentGenerationService.generateConfirmation(
          command.data as ConfirmationDocumentData
        );

      default:
        throw new Error(`Unsupported document type: ${command.documentType}`);
    }
  }
}
