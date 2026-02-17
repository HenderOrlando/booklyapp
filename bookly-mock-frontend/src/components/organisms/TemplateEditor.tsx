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
      <div
        className={`bg-white dark:bg-[var(--color-bg-inverse)] border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] rounded-lg p-6 ${className}`}
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-2">
              Nombre de la Plantilla *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)] rounded-lg bg-white dark:bg-[var(--color-bg-inverse)] text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]"
              placeholder="Ej: Notificación de Aprobación"
            />
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-2">
                Tipo *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)] rounded-lg bg-white dark:bg-[var(--color-bg-inverse)] text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]"
              >
                <option value="NOTIFICATION">Notificación</option>
                <option value="APPROVAL">Aprobación</option>
                <option value="REJECTION">Rechazo</option>
                <option value="DOCUMENT">Documento</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-2">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)] rounded-lg bg-white dark:bg-[var(--color-bg-inverse)] text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]"
              >
                <option value="RESERVATION">Reserva</option>
                <option value="APPROVAL">Aprobación</option>
                <option value="CHECK_IN">Check-in</option>
                <option value="REPORT">Reporte</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>

          {/* Subject (for emails) */}
          {(type === "EMAIL" || type === "NOTIFICATION") && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-2">
                Asunto
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)] rounded-lg bg-white dark:bg-[var(--color-bg-inverse)] text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]"
                placeholder="Ej: Tu solicitud ha sido aprobada"
              />
            </div>
          )}

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mb-2">
              Contenido *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)] rounded-lg bg-white dark:bg-[var(--color-bg-inverse)] text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] font-mono text-sm"
              placeholder="Usa variables como {{userName}}, {{resourceName}}, {{date}}"
            />
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Variables disponibles:{" "}
              {`{{userName}}, {{resourceName}}, {{date}}, {{time}}, {{status}}`}
            </p>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-[var(--color-border-strong)] text-[var(--color-primary-base)] focus:ring-[var(--color-primary-base)]"
            />
            <label
              htmlFor="isActive"
              className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]"
            >
              Plantilla activa
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={!name || !body}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-base)] text-foreground rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              Guardar
            </button>
            <button
              onClick={handlePreview}
              disabled={!body}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)] rounded-lg hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-elevated)]"
            >
              <Eye className="h-4 w-4" />
              Vista Previa
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-elevated)] rounded-lg"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[var(--color-bg-inverse)] rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                  Vista Previa: {name || "Sin título"}
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] dark:hover:text-[var(--color-text-inverse)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {(type === "EMAIL" || type === "NOTIFICATION") && (
                  <div className="border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] pb-4">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                      Asunto
                    </p>
                    <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] font-medium mt-1">
                      {replaceVariables(subject, PREVIEW_DATA)}
                    </p>
                  </div>
                )}

                <div className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] p-4 rounded-lg border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-2">
                    Contenido
                  </p>
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                    {replaceVariables(body, PREVIEW_DATA)}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] rounded-lg hover:bg-[var(--color-bg-muted)] dark:hover:bg-[var(--color-bg-elevated)]"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

TemplateEditor.displayName = "TemplateEditor";
