import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import type { Template } from "@/types/entities/template";
import { Eye, Save, X } from "lucide-react";
import * as React from "react";

export interface TemplateEditorProps {
  template?: Template;
  onSave: (template: Partial<Template>) => void;
  onCancel: () => void;
  onPreview: (variables: Record<string, string>) => void;
  className?: string;
}

export const TemplateEditor = React.memo<TemplateEditorProps>(
  ({ template, onSave, onCancel, onPreview, className = "" }) => {
    const [name, setName] = React.useState(template?.name || "");
    const [subject, setSubject] = React.useState(template?.subject || "");
    const [body, setBody] = React.useState(template?.body || "");
    const [type, setType] = React.useState(template?.type || "NOTIFICATION");
    const [category, setCategory] = React.useState(
      template?.category || "GENERAL",
    );
    const [isActive, setIsActive] = React.useState(template?.isActive ?? true);
    const [showPreview, setShowPreview] = React.useState(false);

    const PREVIEW_DATA = {
      username: "juand",
      firstname: "Juan",
      lastname: "Pérez",
      email: "juan@example.com",
      resource_availability: "Disponible",
      resource_program: "Ingeniería de Sistemas",
      resource_name: "Sala de Conferencias A",
      reservation_id: "RES-12345",
      reservation_status: "Confirmada",
      reservation_reasson: "Reunión de equipo mensual", // Mantenemos el typo del requerimiento por compatibilidad o lo corregimos visualmente
      // Compatibilidad con variables existentes en mocks
      userName: "Juan Pérez",
      resourceName: "Sala de Conferencias A",
      date: "2025-11-25",
      time: "10:00 AM",
      status: "Confirmada",
      reason: "Mantenimiento no programado",
    };

    const replaceVariables = (
      text: string,
      variables: Record<string, string>,
    ) => {
      let result = text || "";
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        result = result.replace(regex, value);
      });
      return result;
    };

    const handleSave = () => {
      onSave({
        name,
        subject,
        body,
        type,
        category,
        isActive,
      });
    };

    const handlePreview = () => {
      setShowPreview(true);
      onPreview(PREVIEW_DATA);
    };

    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Nombre de la Plantilla *
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Notificación de Aprobación"
              />
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Tipo *
                </label>
                <Select
                  value={type}
                  onValueChange={(val: "NOTIFICATION" | "APPROVAL" | "REJECTION" | "DOCUMENT" | "EMAIL") => setType(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOTIFICATION">Notificación</SelectItem>
                    <SelectItem value="APPROVAL">Aprobación</SelectItem>
                    <SelectItem value="REJECTION">Rechazo</SelectItem>
                    <SelectItem value="DOCUMENT">Documento</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Categoría *
                </label>
                <Select
                  value={category}
                  onValueChange={(val: "RESERVATION" | "APPROVAL" | "CHECK_IN" | "REPORT" | "GENERAL") => setCategory(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESERVATION">Reserva</SelectItem>
                    <SelectItem value="APPROVAL">Aprobación</SelectItem>
                    <SelectItem value="CHECK_IN">Check-in</SelectItem>
                    <SelectItem value="REPORT">Reporte</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject (for emails) */}
            {(type === "EMAIL" || type === "NOTIFICATION") && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Asunto
                </label>
                <Input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Tu solicitud ha sido aprobada"
                />
              </div>
            )}

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Contenido *
              </label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder="Usa variables como {{userName}}, {{resourceName}}, {{date}}"
              />
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Variables disponibles:{" "}
                {`{{userName}}, {{resourceName}}, {{date}}, {{time}}, {{status}}`}
              </p>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
              />
              <label
                htmlFor="isActive"
                className="text-sm text-[var(--color-text-primary)] cursor-pointer"
              >
                Plantilla activa
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={!name || !body}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!body}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Vista Previa
              </Button>
              <Button
                variant="ghost"
                onClick={onCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                      Vista Previa: {name || "Sin título"}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(type === "EMAIL" || type === "NOTIFICATION") && (
                      <div className="border-b border-[var(--color-border-subtle)] pb-4">
                        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                          Asunto
                        </p>
                        <p className="text-[var(--color-text-primary)] font-medium mt-1">
                          {replaceVariables(subject, PREVIEW_DATA)}
                        </p>
                      </div>
                    )}

                    <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border-subtle)]">
                      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Contenido
                      </p>
                      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm text-[var(--color-text-primary)]">
                        {replaceVariables(body, PREVIEW_DATA)}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        variant="secondary"
                        onClick={() => setShowPreview(false)}
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

TemplateEditor.displayName = "TemplateEditor";
