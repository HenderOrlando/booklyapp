"use client";

import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";
import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/Alert/Alert";
import { Badge } from "@/components/atoms/Badge/Badge";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { Upload, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";
import * as React from "react";

import type { ImportResourceMode, ImportResult } from "@/types/entities/resource";

/**
 * ImportResourcesModal — RF-04: Importación masiva de recursos vía CSV
 *
 * Permite subir un archivo CSV, seleccionar modo (CREATE, UPDATE, UPSERT),
 * previsualizar datos y ejecutar la importación.
 */

interface ImportResourcesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File, mode: ImportResourceMode, skipErrors: boolean) => Promise<ImportResult>;
}

export function ImportResourcesModal({
  open,
  onOpenChange,
  onImport,
}: ImportResourcesModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [mode, setMode] = React.useState<ImportResourceMode>("CREATE" as ImportResourceMode);
  const [skipErrors, setSkipErrors] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith(".csv")) {
        setError("Solo se permiten archivos CSV");
        return;
      }
      setFile(selected);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const importResult = await onImport(file, mode, skipErrors);
      setResult(importResult);
    } catch (err: any) {
      setError(err?.message || "Error al importar recursos");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-[var(--color-bg-surface)] p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-[var(--color-text-primary)]">
            Importar Recursos desde CSV
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Sube un archivo CSV con los datos de los recursos a importar.
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            {/* File Upload */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="csv-upload"
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border-2 border-dashed px-4 py-3 text-sm transition-colors",
                  "border-[var(--color-border-subtle)] hover:border-brand-primary-500",
                  file && "border-brand-primary-500 bg-brand-primary-50/10"
                )}
              >
                {file ? <FileText className="h-5 w-5 text-brand-primary-500" /> : <Upload className="h-5 w-5" />}
                <span>{file ? file.name : "Seleccionar archivo CSV"}</span>
              </label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Mode Selection */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
                Modo de importación
              </label>
              <div className="flex gap-2">
                {(["CREATE", "UPDATE", "UPSERT"] as ImportResourceMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      mode === m
                        ? "bg-brand-primary-500 text-white"
                        : "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]/80"
                    )}
                  >
                    {m === "CREATE" ? "Crear" : m === "UPDATE" ? "Actualizar" : "Crear/Actualizar"}
                  </button>
                ))}
              </div>
            </div>

            {/* Skip Errors */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={skipErrors}
                onChange={(e) => setSkipErrors(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-[var(--color-text-secondary)]">
                Continuar importación si hay errores en filas individuales
              </span>
            </label>

            {/* Error */}
            {error && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Result */}
            {result && (
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Importación completada</AlertTitle>
                <AlertDescription>
                  <div className="flex gap-3 mt-1">
                    <Badge variant="success">{result.successCount} creados</Badge>
                    <Badge variant="primary">{result.updatedCount} actualizados</Badge>
                    {result.errorCount > 0 && (
                      <Badge variant="error">{result.errorCount} errores</Badge>
                    )}
                  </div>
                  {result.errors.length > 0 && (
                    <ul className="mt-2 text-xs space-y-1">
                      {result.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>Fila {err.row}: {err.error}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>... y {result.errors.length - 5} errores más</li>
                      )}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || loading}
            >
              {loading ? "Importando..." : "Importar"}
            </Button>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
