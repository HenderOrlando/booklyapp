"use client";

import { QRCodeDisplay } from "@/components/atoms/QRCodeDisplay";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/Dialog";
import { Button } from "@/components/atoms/Button";
import { QrCode, Download, Printer, X } from "lucide-react";
import * as React from "react";

/**
 * QRViewerModal - Organism Component
 * 
 * Modal para visualizar, descargar e imprimir el código QR de una reserva.
 * Utilizado por el personal de vigilancia y el usuario final.
 */
export interface QRViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrValue: string;
  title: string;
  description?: string;
}

export const QRViewerModal: React.FC<QRViewerModalProps> = ({
  isOpen,
  onClose,
  qrValue,
  title,
  description,
}) => {
  const handleDownload = () => {
    // Buscar el SVG generado por QRCodeDisplay
    const svg = document.querySelector(".qr-container svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${title.replace(/\s+/g, "-")}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-brand-primary-500" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="qr-container p-4 bg-white rounded-2xl shadow-inner border-4 border-slate-50">
            <QRCodeDisplay value={qrValue} size={240} />
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Escanea para validar el acceso
            </p>
            <p className="text-xs text-slate-500">
              ID: {qrValue.slice(0, 12)}...
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 print:hidden">
          <Button variant="outline" className="gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Descargar
          </Button>
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>

        <button
          onClick={onClose}
          title="Cerrar"
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors print:hidden"
        >
          <X className="h-5 w-5 text-slate-400" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

QRViewerModal.displayName = "QRViewerModal";
