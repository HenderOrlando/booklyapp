import { useMutation } from "@tanstack/react-query";

export interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  data: any;
  filename?: string;
}

export function useReportExport() {
  const exportMutation = useMutation({
    mutationFn: async ({
      format,
      data,
      filename = "report",
    }: ExportOptions) => {
      switch (format) {
        case "csv":
          return exportToCSV(data, filename);
        case "excel":
          return exportToExcel(data, filename);
        case "pdf":
          return exportToPDF(data, filename);
      }
    },
  });

  return {
    exportReport: exportMutation.mutate,
    exportReportAsync: exportMutation.mutateAsync,
    isExporting: exportMutation.isPending,
    error: exportMutation.error,
  };
}

async function exportToCSV(data: any[], filename: string) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv" });
  downloadBlob(blob, `${filename}.csv`);
}

async function exportToExcel(data: any[], filename: string) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

async function exportToPDF(data: any[], filename: string) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.text("Reporte", 14, 15);
  doc.text(JSON.stringify(data, null, 2), 14, 25);
  doc.save(`${filename}.pdf`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
