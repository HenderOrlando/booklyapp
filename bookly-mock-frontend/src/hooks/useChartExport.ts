import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useCallback } from "react";
import * as XLSX from "xlsx";

export interface ChartExportOptions {
  filename?: string;
  format: "png" | "pdf" | "excel";
  includeCharts?: boolean;
  chartIds?: string[];
}

export function useChartExport() {
  const exportChartAsPNG = useCallback(
    async (chartId: string, filename: string = "chart") => {
      const element = document.getElementById(chartId);
      if (!element) {
        throw new Error(`Chart element with id "${chartId}" not found`);
      }

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  const exportChartAsPDF = useCallback(
    async (chartIds: string[], filename: string = "report", title?: string) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // Add title
      if (title) {
        pdf.setFontSize(18);
        pdf.text(title, margin, margin);
      }

      let yPosition = title ? margin + 15 : margin;

      for (let i = 0; i < chartIds.length; i++) {
        const element = document.getElementById(chartIds[i]);
        if (!element) continue;

        if (i > 0) {
          pdf.addPage();
          yPosition = margin;
        }

        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2,
        });

        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          margin,
          yPosition,
          imgWidth,
          Math.min(imgHeight, pageHeight - yPosition - margin)
        );
      }

      pdf.save(`${filename}.pdf`);
    },
    []
  );

  const exportDataWithCharts = useCallback(
    async (data: any[], chartIds: string[], filename: string = "report") => {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Add data sheet
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Datos");

      // Add charts as images (base64 embedded)
      for (let i = 0; i < chartIds.length; i++) {
        const element = document.getElementById(chartIds[i]);
        if (!element) continue;

        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 1.5,
        });

        const imageData = canvas.toDataURL("image/png");

        // Create a sheet with chart info
        const chartSheet = XLSX.utils.aoa_to_sheet([
          ["Gráfico", chartIds[i]],
          ["Imagen Base64", imageData],
        ]);
        XLSX.utils.book_append_sheet(wb, chartSheet, `Gráfico ${i + 1}`);
      }

      XLSX.writeFile(wb, `${filename}.xlsx`);
    },
    []
  );

  return {
    exportChartAsPNG,
    exportChartAsPDF,
    exportDataWithCharts,
  };
}
