import { useToast } from "@/hooks/useToast";
import {
  DocumentsClient,
  type GenerateDocumentDto,
} from "@/infrastructure/api/documents-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

/**
 * useDocumentGeneration - Custom Hook
 *
 * Hook personalizado para manejar generación de documentos PDF,
 * descarga y envío por email.
 *
 * @example
 * ```tsx
 */

export interface GenerateDocumentParams {
  templateId: string;
  approvalRequestId: string;
  type: "approval" | "rejection" | "notification";
  variables?: Record<string, any>;
}

export interface SendEmailParams {
  documentId: string;
  email: string;
  subject?: string;
  message?: string;
}

export function useDocumentGeneration() {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [generatedDocumentUrl, setGeneratedDocumentUrl] = React.useState<
    string | null
  >(null);
  const [lastDocumentId, setLastDocumentId] = React.useState<string | null>(
    null
  );

  // Mutation para generar documento
  const generate = useMutation({
    mutationFn: async (params: GenerateDocumentParams) => {
      const documentData: GenerateDocumentDto = {
        templateId: params.templateId,
        approvalRequestId: params.approvalRequestId,
        variables: params.variables || {},
        format: "PDF",
      };

      const response = await DocumentsClient.generateDocument(documentData);
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedDocumentUrl(data.fileUrl);
      setLastDocumentId(data.id);

      // Invalidar queries de documentos
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      if (data.approvalRequestId) {
        queryClient.invalidateQueries({
          queryKey: ["documents", "approval", data.approvalRequestId],
        });
      }

      showSuccess(
        "Documento Generado",
        `El documento ${data.fileName} se generó correctamente`
      );
      console.log("✅ Documento generado exitosamente", data);
    },
    onError: (error: Error & { mapped?: { fallbackMessage: string } }) => {
      console.error("❌ Error al generar documento:", error);
      const errorMessage =
        error.mapped?.fallbackMessage || error.message || "Error al generar el documento";
      showError("Error al Generar", errorMessage);
    },
  });

  // Mutation para descargar documento
  const download = useMutation({
    mutationFn: async (documentId: string) => {
      const blob = await DocumentsClient.downloadDocument(documentId);

      // Crear URL y descargar automáticamente
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document_${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Limpiar URL temporal
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      return { success: true };
    },
    onSuccess: () => {
      showSuccess(
        "Documento Descargado",
        "El documento se descargó correctamente"
      );
      console.log("✅ Documento descargado exitosamente");
    },
    onError: (error: Error & { mapped?: { fallbackMessage: string } }) => {
      console.error("❌ Error al descargar documento:", error);
      const errorMessage =
        error.mapped?.fallbackMessage || error.message || "Error al descargar el documento";
      showError("Error al Descargar", errorMessage);
    },
  });

  // Mutation para enviar por email
  const sendEmail = useMutation({
    mutationFn: async ({ documentId, email }: SendEmailParams) => {
      await DocumentsClient.sendDocumentByEmail(documentId, email);
      return { success: true, email };
    },
    onSuccess: (data) => {
      showSuccess("Documento Enviado", `El documento se envió a ${data.email}`);
      console.log(`✅ Documento enviado exitosamente a: ${data.email}`);
    },
    onError: (error: Error & { mapped?: { fallbackMessage: string } }) => {
      console.error("❌ Error al enviar email:", error);
      const errorMessage =
        error.mapped?.fallbackMessage || error.message ||
        "Error al enviar el documento por email";
      showError("Error al Enviar Email", errorMessage);
    },
  });

  // Mutation para imprimir
  const print = useMutation({
    mutationFn: async (documentId: string) => {
      // Descargar el documento primero
      const blob = await DocumentsClient.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);

      // Abrir en ventana nueva para imprimir
      const printWindow = window.open(url, "_blank");

      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
          // Limpiar URL después de imprimir
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            printWindow.close();
          }, 1000);
        });
      }

      return { success: true };
    },
    onSuccess: () => {
      showSuccess(
        "Listo para Imprimir",
        "El documento está listo para imprimir"
      );
      console.log("✅ Documento enviado a impresión");
    },
    onError: (error: Error & { mapped?: { fallbackMessage: string } }) => {
      console.error("❌ Error al imprimir:", error);
      const errorMessage =
        error.mapped?.fallbackMessage || error.message || "Error al imprimir el documento";
      showError("Error al Imprimir", errorMessage);
    },
  });

  // Estado de carga combinado
  const isGenerating = generate.isPending;
  const isProcessing =
    generate.isPending ||
    download.isPending ||
    sendEmail.isPending ||
    print.isPending;

  // Estado de error combinado
  const error =
    generate.error || download.error || sendEmail.error || print.error;

  // Limpiar estado
  const clearDocument = () => {
    setGeneratedDocumentUrl(null);
    setLastDocumentId(null);
  };

  return {
    generate,
    download,
    sendEmail,
    print,
    isGenerating,
    isProcessing,
    error,
    generatedDocumentUrl,
    lastDocumentId,
    clearDocument,
  };
}
