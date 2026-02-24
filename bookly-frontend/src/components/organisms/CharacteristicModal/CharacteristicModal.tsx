"use client";

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
import { Characteristic } from "@/infrastructure/api/characteristics-client";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Modal de Crear/Editar Característica - Bookly
 *
 * Permite gestionar características de recursos:
 * - Nombre
 * - Código (único)
 * - Descripción
 * - Estado activo/inactivo
 */

interface CharacteristicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Characteristic>) => void;
  characteristic?: Characteristic;
  mode: "create" | "edit";
  loading?: boolean;
}

export function CharacteristicModal({
  isOpen,
  onClose,
  onSave,
  characteristic,
  mode,
  loading = false,
}: CharacteristicModalProps) {
  const [formData, setFormData] = React.useState<Partial<Characteristic>>({
    name: "",
    code: "",
    description: "",
    icon: "",
    color: "#3B82F6",
    isActive: true,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const t = useTranslations("characteristics");
  const tCommon = useTranslations("common");

  React.useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && characteristic) {
        setFormData({
          name: characteristic.name,
          code: characteristic.code,
          description: characteristic.description,
          icon: characteristic.icon || "",
          color: characteristic.color || "#3B82F6",
          isActive: characteristic.isActive,
        });
      } else {
        setFormData({
          name: "",
          code: "",
          description: "",
          icon: "",
          color: "#3B82F6",
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, characteristic]);

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
      newErrors.name = t("errors.name_required");
    } else if (formData.name.length < 2) {
      newErrors.name = t("errors.name_min_length");
    }

    if (!formData.code?.trim()) {
      newErrors.code = t("errors.code_required");
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = t("errors.code_invalid_format");
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = t("errors.description_max_length");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  const handleAutoCode = (name: string) => {
    if (mode === "create") {
      const autoCode = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toUpperCase();
      setFormData((prev) => ({ ...prev, name, code: autoCode }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      data-testid="characteristic-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {mode === "create"
              ? t("modal.create_title")
              : t("modal.edit_title")}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? t("modal.create_description")
              : t("modal.edit_description")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                {t("modal.name_label")} <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name || ""}
                onChange={(e) => handleAutoCode(e.target.value)}
                placeholder="Ej: Aire Acondicionado"
                className={errors.name ? "border-red-500" : ""}
                data-testid="characteristic-name-input"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                {t("modal.code_label")} <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="EJ: AIRE_ACONDICIONADO"
                className={errors.code ? "border-red-500" : ""}
                disabled={mode === "edit"}
                data-testid="characteristic-code-input"
              />
              <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
                {t("modal.code_hint")}
              </p>
              {errors.code && (
                <p className="text-xs text-red-500 mt-1">{errors.code}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                {t("modal.description_label")}
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Para qué sirve esta característica..."
                rows={3}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.description
                    ? "border-red-500"
                    : "border-[var(--color-border-subtle)]"
                }`}
                data-testid="characteristic-description-input"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Icono */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  {t("modal.icon_label")}
                </label>
                <Input
                  value={formData.icon || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="Ej: projector"
                  data-testid="characteristic-icon-input"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  {t("modal.color_label")}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.color || "#3B82F6"}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-12 p-1 h-10"
                    data-testid="characteristic-color-picker"
                  />
                  <Input
                    value={formData.color || "#3B82F6"}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder="#000000"
                    className="flex-1"
                    data-testid="characteristic-color-input"
                  />
                </div>
              </div>
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
                    {t("modal.status_label")}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {t("modal.status_hint")}
                  </p>
                </div>
              </label>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                {tCommon("cancel")}
              </Button>
              <ButtonWithLoading
                type="submit"
                isLoading={loading}
                loadingText={
                  mode === "create"
                    ? t("modal.creating_button")
                    : t("modal.saving_button")
                }
                data-testid="save-characteristic-button"
              >
                {mode === "create"
                  ? t("modal.create_title")
                  : t("modal.save_button")}
              </ButtonWithLoading>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
