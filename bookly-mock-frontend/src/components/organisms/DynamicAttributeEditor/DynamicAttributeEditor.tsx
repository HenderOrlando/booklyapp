"use client";

import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";
import { cn } from "@/lib/utils";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import * as React from "react";

/**
 * DynamicAttributeEditor — RF-03: Definir atributos clave del recurso
 *
 * Editor de atributos dinámicos para recursos.
 * Permite agregar, editar y eliminar pares clave-valor
 * con tipos: texto, número, booleano, selección.
 */

type AttributeType = "text" | "number" | "boolean" | "select";

interface AttributeEntry {
  key: string;
  value: any;
  type: AttributeType;
  options?: string[];
}

interface DynamicAttributeEditorProps {
  attributes: Record<string, any>;
  onChange: (attributes: Record<string, any>) => void;
  className?: string;
}

export function DynamicAttributeEditor({
  attributes,
  onChange,
  className,
}: DynamicAttributeEditorProps) {
  const [entries, setEntries] = React.useState<AttributeEntry[]>(() =>
    Object.entries(attributes).map(([key, value]) => ({
      key,
      value,
      type:
        typeof value === "boolean"
          ? "boolean"
          : typeof value === "number"
            ? "number"
            : "text",
    })),
  );

  const syncToParent = (updated: AttributeEntry[]) => {
    const result: Record<string, any> = {};
    updated.forEach((entry) => {
      if (entry.key.trim()) {
        result[entry.key.trim()] = entry.value;
      }
    });
    onChange(result);
  };

  const addEntry = () => {
    const updated = [
      ...entries,
      { key: "", value: "", type: "text" as AttributeType },
    ];
    setEntries(updated);
  };

  const removeEntry = (index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    syncToParent(updated);
  };

  const updateEntry = (
    index: number,
    field: keyof AttributeEntry,
    val: any,
  ) => {
    const updated = entries.map((entry, i) => {
      if (i !== index) return entry;
      const newEntry = { ...entry, [field]: val };
      if (field === "type") {
        switch (val) {
          case "boolean":
            newEntry.value = false;
            break;
          case "number":
            newEntry.value = 0;
            break;
          default:
            newEntry.value = "";
            break;
        }
      }
      return newEntry;
    });
    setEntries(updated);
    syncToParent(updated);
  };

  return (
    <div className={cn("space-y-3 rounded-lg border p-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Atributos del recurso
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={addEntry}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="py-3 text-center text-sm text-[var(--color-text-tertiary)]">
          Sin atributos definidos. Agrega uno para empezar.
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)] cursor-grab" />

              {/* Key */}
              <Input
                placeholder="Nombre"
                value={entry.key}
                onChange={(e) => updateEntry(index, "key", e.target.value)}
                className="w-36"
              />

              {/* Type */}
              <select
                value={entry.type}
                onChange={(e) => updateEntry(index, "type", e.target.value)}
                className="h-10 rounded-md border bg-background px-2 text-sm"
              >
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="boolean">Sí/No</option>
              </select>

              {/* Value */}
              {entry.type === "boolean" ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!entry.value}
                  onClick={() => updateEntry(index, "value", !entry.value)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                    entry.value
                      ? "bg-brand-primary-500"
                      : "bg-[var(--color-bg-muted)]",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                      entry.value ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              ) : (
                <Input
                  type={entry.type === "number" ? "number" : "text"}
                  placeholder="Valor"
                  value={entry.value}
                  onChange={(e) =>
                    updateEntry(
                      index,
                      "value",
                      entry.type === "number"
                        ? parseFloat(e.target.value) || 0
                        : e.target.value,
                    )
                  }
                  className="flex-1"
                />
              )}

              {/* Delete */}
              <button
                onClick={() => removeEntry(index)}
                className="rounded p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)] hover:text-state-error-500"
                aria-label="Eliminar atributo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
