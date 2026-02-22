/**
 * Cliente HTTP Type-Safe para el servicio de Documentos (Stockpile Service)
 *
 * Integración con backend Bookly Stockpile Service via API Gateway
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import { STOCKPILE_ENDPOINTS } from "./endpoints";

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  type: "APPROVAL_LETTER" | "REJECTION_LETTER" | "NOTIFICATION" | "REPORT";
  templateContent: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedDocument {
  id: string;
  approvalRequestId?: string;
  templateId: string;
  templateName: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  generatedAt: string;
  generatedBy: string;
  variables: Record<string, unknown>;
}

export interface GenerateDocumentDto {
  templateId: string;
  approvalRequestId?: string;
  variables: Record<string, unknown>;
  format?: "PDF" | "DOCX";
}

export class DocumentsClient {
  /**
   * Generar documento PDF a partir de un template
   */
  static async generateDocument(
    data: GenerateDocumentDto
  ): Promise<ApiResponse<GeneratedDocument>> {
    return httpClient.post<GeneratedDocument>(
      `${STOCKPILE_ENDPOINTS.DOCUMENTS}/generate`,
      data
    );
  }

  /**
   * Obtener documento generado por ID
   */
  static async getGeneratedDocument(
    id: string
  ): Promise<ApiResponse<GeneratedDocument>> {
    return httpClient.get<GeneratedDocument>(
      STOCKPILE_ENDPOINTS.DOCUMENT_BY_ID(id)
    );
  }

  /**
   * Descargar documento PDF
   * (Nota: Los blobs no se envuelven en el GlobalResponseInterceptor, por ende retornan Blob directo)
   */
  static async downloadDocument(id: string): Promise<Blob> {
    const response = await httpClient.get<Blob>(
      STOCKPILE_ENDPOINTS.DOWNLOAD_DOCUMENT(id),
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  /**
   * Enviar documento por email
   */
  static async sendDocumentByEmail(
    documentId: string,
    email: string
  ): Promise<ApiResponse<void>> {
    return httpClient.post<void>(
      `${STOCKPILE_ENDPOINTS.DOCUMENT_BY_ID(documentId)}/send-email`,
      { email }
    );
  }

  /**
   * Obtener lista de documentos generados para una solicitud
   */
  static async getDocumentsByApprovalRequest(
    approvalRequestId: string
  ): Promise<ApiResponse<GeneratedDocument[]>> {
    return httpClient.get<GeneratedDocument[]>(
      `${STOCKPILE_ENDPOINTS.DOCUMENTS}/by-approval/${approvalRequestId}`
    );
  }
}
