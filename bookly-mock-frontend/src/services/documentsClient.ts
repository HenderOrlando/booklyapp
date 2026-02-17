/**
 * @deprecated Migrate to a `DocumentsClient` class in `@/infrastructure/api/`.
 * This file will be replaced when the documents-client is created in the API layer.
 */

import { httpClient } from "@/infrastructure/http/httpClient";

/**
 * Cliente HTTP para el servicio de Documentos (Stockpile Service)
 *
 * Endpoints base: /api/v1/documents, /api/v1/document-templates
 */

const DOCS_PATH = "/api/v1/documents";
const TEMPLATES_PATH = "/api/v1/document-templates";

/**
 * Tipos para documentos
 */
export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  type: "APPROVAL_LETTER" | "REJECTION_LETTER" | "NOTIFICATION" | "REPORT";
  templateContent: string;
  variables: string[]; // Variables disponibles: {userName}, {resourceName}, etc.
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
  variables: Record<string, any>;
}

export interface GenerateDocumentDto {
  templateId: string;
  approvalRequestId?: string;
  variables: Record<string, any>;
  format?: "PDF" | "DOCX";
}

/**
 * Obtener lista de templates de documentos
 */
export async function getDocumentTemplates(): Promise<DocumentTemplate[]> {
  const response = await httpClient.get<DocumentTemplate[]>(TEMPLATES_PATH);
  return response.data;
}

/**
 * Obtener un template específico
 */
export async function getDocumentTemplateById(
  id: string,
): Promise<DocumentTemplate> {
  const response = await httpClient.get<DocumentTemplate>(
    `${TEMPLATES_PATH}/${id}`,
  );
  return response.data;
}

/**
 * Crear un nuevo template
 */
export async function createDocumentTemplate(
  data: Omit<DocumentTemplate, "id" | "createdAt" | "updatedAt">,
): Promise<DocumentTemplate> {
  const response = await httpClient.post<DocumentTemplate>(
    TEMPLATES_PATH,
    data,
  );
  return response.data;
}

/**
 * Actualizar template existente
 */
export async function updateDocumentTemplate(
  id: string,
  data: Partial<DocumentTemplate>,
): Promise<DocumentTemplate> {
  const response = await httpClient.patch<DocumentTemplate>(
    `${TEMPLATES_PATH}/${id}`,
    data,
  );
  return response.data;
}

/**
 * Eliminar template
 */
export async function deleteDocumentTemplate(id: string): Promise<void> {
  await httpClient.delete(`${TEMPLATES_PATH}/${id}`);
}

/**
 * Generar documento PDF a partir de un template
 */
export async function generateDocument(
  data: GenerateDocumentDto,
): Promise<GeneratedDocument> {
  const response = await httpClient.post<GeneratedDocument>(
    `${DOCS_PATH}/generate`,
    data,
  );
  return response.data;
}

/**
 * Obtener documento generado por ID
 */
export async function getGeneratedDocument(
  id: string,
): Promise<GeneratedDocument> {
  const response = await httpClient.get<GeneratedDocument>(
    `${DOCS_PATH}/${id}`,
  );
  return response.data;
}

/**
 * Descargar documento PDF
 */
export async function downloadDocument(id: string): Promise<Blob> {
  const response = await httpClient.get(`${DOCS_PATH}/${id}/download`, {
    responseType: "blob",
  });
  return response.data;
}

/**
 * Enviar documento por email
 */
export async function sendDocumentByEmail(
  documentId: string,
  email: string,
): Promise<void> {
  await httpClient.post(`${DOCS_PATH}/${documentId}/send-email`, { email });
}

/**
 * Obtener lista de documentos generados para una solicitud
 */
export async function getDocumentsByApprovalRequest(
  approvalRequestId: string,
): Promise<GeneratedDocument[]> {
  const response = await httpClient.get<GeneratedDocument[]>(
    `${DOCS_PATH}/by-approval/${approvalRequestId}`,
  );
  return response.data;
}
