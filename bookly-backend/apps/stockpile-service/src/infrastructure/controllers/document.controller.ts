import { JwtAuthGuard } from "@libs/guards";
import { ResponseUtil } from "@libs/common";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import { GenerateDocumentCommand } from "@stockpile/application/commands/generate-document.command";
import { DocumentType } from "@stockpile/application/services/document-generation.service";
import { GenerateDocumentDto } from "@stockpile/infrastructure/dtos/generate-document.dto";

/**
 * Document Controller
 * Controlador para generación y descarga de documentos PDF
 */
@ApiTags("Documents")
@ApiBearerAuth()
@Controller("documents")
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Generar documento PDF
   */
  @Post("generate")
  @ApiOperation({
    summary: "Generar documento PDF",
    description:
      "Genera un documento PDF (carta de aprobación, rechazo o confirmación) basado en plantillas HTML",
  })
  @ApiResponse({
    status: 201,
    description: "Documento generado exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos",
  })
  async generateDocument(@Body() dto: GenerateDocumentDto) {
    const command = new GenerateDocumentCommand(
      dto.documentType as DocumentType,
      dto.data,
      dto.requestedBy
    );

    const result = await this.commandBus.execute(command);

    return ResponseUtil.success(
      {
        documentId: result.documentId,
        documentType: result.documentType,
        fileName: result.fileName,
        size: result.size,
        generatedAt: result.generatedAt,
        downloadUrl: `/api/documents/${result.documentId}/download`,
      },
      "Documento generado exitosamente"
    );
  }

  /**
   * Descargar documento PDF
   * Nota: En producción, esto debería servir desde S3/GCS con URLs firmadas
   */
  @Get(":documentId/download")
  @ApiOperation({
    summary: "Descargar documento PDF",
    description: "Descarga un documento PDF previamente generado",
  })
  @ApiResponse({
    status: 200,
    description: "Documento descargado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Documento no encontrado",
  })
  async downloadDocument(
    @Param("documentId") documentId: string,
    @Res() res: Response
  ) {
    // TODO: Implementar recuperación desde almacenamiento (S3/GCS)
    // Por ahora, retornar error indicando que debe implementarse storage

    return res.status(501).json({
      success: false,
      message:
        "Descarga de documentos requiere configuración de almacenamiento en la nube (S3/GCS)",
      error: {
        code: "NOT_IMPLEMENTED",
        details:
          "Esta funcionalidad requiere configurar AWS S3 o Google Cloud Storage",
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generar carta de aprobación (endpoint específico)
   */
  @Post("approval-letter")
  @ApiOperation({
    summary: "Generar carta de aprobación",
    description: "Genera una carta de aprobación de reserva en formato PDF",
  })
  async generateApprovalLetter(@Body() data: any) {
    const command = new GenerateDocumentCommand(
      DocumentType.APPROVAL_LETTER,
      data,
      data.requestedBy || "system"
    );

    const result = await this.commandBus.execute(command);

    return ResponseUtil.success(
      {
        documentId: result.documentId,
        fileName: result.fileName,
        size: result.size,
        downloadUrl: `/api/documents/${result.documentId}/download`,
      },
      "Carta de aprobación generada exitosamente"
    );
  }

  /**
   * Generar carta de rechazo (endpoint específico)
   */
  @Post("rejection-letter")
  @ApiOperation({
    summary: "Generar carta de rechazo",
    description: "Genera una carta de rechazo de reserva en formato PDF",
  })
  async generateRejectionLetter(@Body() data: any) {
    const command = new GenerateDocumentCommand(
      DocumentType.REJECTION_LETTER,
      data,
      data.requestedBy || "system"
    );

    const result = await this.commandBus.execute(command);

    return ResponseUtil.success(
      {
        documentId: result.documentId,
        fileName: result.fileName,
        size: result.size,
        downloadUrl: `/api/documents/${result.documentId}/download`,
      },
      "Carta de rechazo generada exitosamente"
    );
  }
}
