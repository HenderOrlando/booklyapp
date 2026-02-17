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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { ButtonWithLoading } from "@/components/molecules/ButtonWithLoading";
import { Maintenance, Resource } from "@/types/entities/resource";
import * as React from "react";

/**
 * Modal de Programación de Mantenimiento - Bookly
 *
 * Permite programar y editar mantenimientos:
 * - Tipo: Preventivo, Correctivo, Emergencia
 * - Fecha programada
 * - Descripción y notas
 * - Técnico responsable
 * - Costo estimado/real
 */

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (maintenance: Partial<Maintenance>) => void;
  maintenance?: Maintenance;
  resources: Resource[];
  mode: "create" | "edit";
  loading?: boolean;
}

export function MaintenanceModal({
  isOpen,
  onClose,
  onSave,
  maintenance,
  resources,
  mode,
  loading = false,
}: MaintenanceModalProps) {
  const [formData, setFormData] = React.useState<Partial<Maintenance>>({
    resourceId: "",
    type: "PREVENTIVE",
    status: "SCHEDULED",
    scheduledDate: "",
    description: "",
    technician: "",
    cost: undefined,
    notes: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && maintenance) {
        setFormData({
          resourceId: maintenance.resourceId,
          type: maintenance.type,
          status: maintenance.status,
          scheduledDate: maintenance.scheduledDate,
          completedDate: maintenance.completedDate,
          description: maintenance.description,
          technician: maintenance.technician,
          cost: maintenance.cost,
          notes: maintenance.notes,
        });
      } else {
        setFormData({
          resourceId: "",
          type: "PREVENTIVE",
          status: "SCHEDULED",
          scheduledDate: "",
          description: "",
          technician: "",
          cost: undefined,
          notes: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, maintenance]);

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

    if (!formData.resourceId) {
      newErrors.resourceId = "Debes seleccionar un recurso";
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = "La fecha es obligatoria";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (formData.cost && formData.cost < 0) {
      newErrors.cost = "El costo no puede ser negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSave(formData);
    onClose();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "PREVENTIVE":
        return "Preventivo";
      case "CORRECTIVE":
        return "Correctivo";
      case "EMERGENCY":
        return "Emergencia";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "Programado";
      case "IN_PROGRESS":
        return "En Progreso";
      case "COMPLETED":
        return "Completado";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {mode === "create"
              ? "Programar Mantenimiento"
              : "Editar Mantenimiento"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Programa un nuevo mantenimiento para un recurso"
              : "Modifica los datos del mantenimiento"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recurso */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Recurso <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.resourceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, resourceId: value })
                }
              >
                <SelectTrigger
                  className={errors.resourceId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecciona un recurso" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name} ({resource.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.resourceId && (
                <p className="text-xs text-red-500 mt-1">{errors.resourceId}</p>
              )}
            </div>

            {/* Tipo y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREVENTIVE">Preventivo</SelectItem>
                    <SelectItem value="CORRECTIVE">Correctivo</SelectItem>
                    <SelectItem value="EMERGENCY">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode === "edit" && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Estado
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Programado</SelectItem>
                      <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                      <SelectItem value="COMPLETED">Completado</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Fecha Programada <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                  className={errors.scheduledDate ? "border-red-500" : ""}
                />
                {errors.scheduledDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.scheduledDate}
                  </p>
                )}
              </div>

              {mode === "edit" &&
                (formData.status === "COMPLETED" || formData.completedDate) && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Fecha de Completado
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.completedDate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          completedDate: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe el mantenimiento a realizar..."
                rows={3}
                className={`w-full px-3 py-2 bg-[var(--color-bg-inverse)] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 ${
                  errors.description
                    ? "border-red-500"
                    : "border-[var(--color-border-subtle)]"
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Técnico y Costo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Técnico Responsable
                </label>
                <Input
                  value={formData.technician || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, technician: e.target.value })
                  }
                  placeholder="Nombre del técnico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Costo {mode === "edit" && "(Real/Estimado)"}
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cost: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="0.00"
                  className={errors.cost ? "border-red-500" : ""}
                />
                {errors.cost && (
                  <p className="text-xs text-red-500 mt-1">{errors.cost}</p>
                )}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Notas, observaciones o comentarios..."
                rows={3}
                className="w-full px-3 py-2 bg-[var(--color-bg-inverse)] border border-[var(--color-border-subtle)] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              />
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
                loadingText={
                  mode === "create" ? "Programando..." : "Guardando..."
                }
              >
                {mode === "create" ? "Programar" : "Guardar Cambios"}
              </ButtonWithLoading>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
