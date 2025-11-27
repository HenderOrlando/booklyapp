import { useToast } from "@/hooks/useToast";
import type { GenerateDocumentDto } from "@/services/documentsClient";
import {
  downloadDocument,
  generateDocument,
  sendDocumentByEmail,
} from "@/services/documentsClient";
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
 * const { generate, download, sendEmail, isGenerating } = useDocumentGeneration();
 *
 * generate.mutate({
 *   templateId: "tpl_001",
 *   approvalRequestId: "apr_001",
 *   type: "approval",
 * });
 * ```
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
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
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

      return await generateDocument(documentData);
    },
    onSuccess: (data) => {
      setGeneratedDocumentUrl(data.fileUrl);
      setLastDocumentId(data.id);

      // Invalidar queries relevantes
      if (data.approvalRequestId) {
        queryClient.invalidateQueries({
          queryKey: ["documents", data.approvalRequestId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["documents"] });

      // Notificación de éxito
      showSuccess("Documento Generado", "El documento se generó correctamente");
      console.log("✅ Documento generado exitosamente", data);
    },
    onError: (error: any) => {
      console.error("❌ Error al generar documento:", error);
      const errorMessage =
        error?.response?.data?.message || "Error al generar el documento";
      showError("Error al Generar", errorMessage);
      console.error(errorMessage);
    },
  });

  // Mutation para descargar documento
  const download = useMutation({
    mutationFn: async (documentId: string) => {
      const blob = await downloadDocument(documentId);

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
    onError: (error: any) => {
      console.error("❌ Error al descargar documento:", error);
      const errorMessage =
        error?.response?.data?.message || "Error al descargar el documento";
      showError("Error al Descargar", errorMessage);
      console.error(errorMessage);
    },
  });

  // Mutation para enviar por email
  const sendEmail = useMutation({
    mutationFn: async ({ documentId, email }: SendEmailParams) => {
      await sendDocumentByEmail(documentId, email);
      return { success: true, email };
    },
    onSuccess: (data) => {
      showSuccess("Documento Enviado", `El documento se envió a ${data.email}`);
      console.log(`✅ Documento enviado exitosamente a: ${data.email}`);
    },
    onError: (error: any) => {
      console.error("❌ Error al enviar email:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Error al enviar el documento por email";
      showError("Error al Enviar Email", errorMessage);
      console.error(errorMessage);
    },
  });

  // Mutation para imprimir
  const print = useMutation({
    mutationFn: async (documentId: string) => {
      // Descargar el documento primero
      const blob = await downloadDocument(documentId);
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
    onError: (error: any) => {
      console.error("❌ Error al imprimir:", error);
      const errorMessage =
        error?.response?.data?.message || "Error al imprimir el documento";
      showError("Error al Imprimir", errorMessage);
      console.error(errorMessage);
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
