"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { ButtonWithLoading } from "@/components/molecules/ButtonWithLoading";
import { Category } from "@/types/entities/resource";
import * as React from "react";

/**
 * Modal de Crear/Editar Categoría - Bookly
 *
 * Permite crear y editar categorías con:
 * - Nombre
 * - Descripción
 * - Color personalizado (color picker)
 * - Estado activo/inactivo
 */

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<Category>) => void;
  category?: Category;
  mode: "create" | "edit";
  loading?: boolean;
}

const PRESET_COLORS = [
  "#10b981", // green-500
  "#3b82f6", // blue-500
  "#8b5cf6", // purple-500
  "#ec4899", // pink-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#a855f7", // violet-500
];

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  mode,
  loading = false,
}: CategoryModalProps) {
  const [formData, setFormData] = React.useState<Partial<Category>>({
    name: "",
    description: "",
    color: "#10b981",
    isActive: true,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && category) {
        setFormData({
          name: category.name,
          description: category.description,
          color: category.color,
          isActive: category.isActive,
        });
      } else {
        setFormData({
          name: "",
          description: "",
          color: "#10b981",
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, category]);

  // Cerrar con tecla Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es obligatorio";
    } else if (formData.name.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = "La descripción no puede superar 200 caracteres";
    }

    if (!formData.color) {
      newErrors.color = "El color es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSave(formData);
  };

  const handleColorSelect = (color: string) => {
    setFormData({ ...formData, color });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      data-testid="category-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Crear Categoría" : "Editar Categoría"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Crea una nueva categoría para organizar los recursos"
              : "Modifica los datos de la categoría"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Laboratorios de Cómputo"
                className={errors.name ? "border-red-500" : ""}
                data-testid="category-name-input"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción breve de la categoría..."
                rows={3}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.description
                    ? "border-red-500"
                    : "border-[var(--color-border-subtle)]"
                }`}
                data-testid="category-description-input"
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description}</p>
                )}
                <p className="text-xs text-[var(--color-text-tertiary)] ml-auto">
                  {formData.description?.length || 0}/200
                </p>
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Color <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {/* Vista previa del color actual */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-white shadow-lg"
                    style={{ backgroundColor: formData.color }}
                  />
                  <div>
                    <p className="text-sm text-[var(--color-text-primary)] font-medium">
                      Color seleccionado
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)] font-mono">
                      {formData.color}
                    </p>
                    <Badge
                      style={{
                        backgroundColor: formData.color,
                        color: "#fff",
                        marginTop: "4px",
                      }}
                    >
                      {formData.name || "Categoría"}
                    </Badge>
                  </div>
                </div>

                {/* Colores predefinidos */}
                <div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-2">
                    Colores predefinidos
                  </p>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorSelect(color)}
                        className={`w-full h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                          formData.color === color
                            ? "border-white shadow-lg"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Selector de color personalizado */}
                <div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-2">
                    Color personalizado
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color || "#10b981"}
                      onChange={(e) => handleColorSelect(e.target.value)}
                      className="w-20 h-10 rounded-lg border border-[var(--color-border-subtle)] cursor-pointer"
                    />
                    <Input
                      value={formData.color || ""}
                      onChange={(e) => handleColorSelect(e.target.value)}
                      placeholder="#10b981"
                      className="flex-1"
                      data-testid="category-color-input"
                    />
                  </div>
                </div>
              </div>
              {errors.color && (
                <p className="text-xs text-red-500 mt-1">{errors.color}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-[var(--color-border-subtle)] bg-background checked:bg-brand-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    Categoría activa
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Las categorías inactivas no se mostrarán en los formularios
                  </p>
                </div>
              </label>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <ButtonWithLoading
                type="submit"
                isLoading={loading}
                loadingText={mode === "create" ? "Creando..." : "Guardando..."}
                data-testid="save-category-button"
              >
                {mode === "create" ? "Crear Categoría" : "Guardar Cambios"}
              </ButtonWithLoading>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
