"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/Dialog";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Textarea } from "@/components/atoms/Textarea";
import {
  type ApprovalFlowConfig,
} from "@/types/entities/approval";
import { Plus, Trash2, GitBranch, Clock } from "lucide-react";
import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const stepSchema = z.object({
  name: z.string().min(3, "El nombre del paso es requerido"),
  approverRoles: z.array(z.string()).min(1, "Al menos un rol es requerido"),
  order: z.number().min(1),
  isRequired: z.boolean().default(true),
  allowParallel: z.boolean().default(false),
  timeoutHours: z.number().optional(),
});

const flowSchema = z.object({
  name: z.string().min(3, "El nombre del flujo es requerido"),
  description: z.string().min(10, "La descripción es requerida"),
  resourceTypes: z.array(z.string()).min(1, "Al menos un tipo de recurso es requerido"),
  steps: z.array(stepSchema).min(1, "Al menos un paso es requerido"),
  autoApproveConditions: z.object({
    roleWhitelist: z.array(z.string()).optional(),
    maxDurationMinutes: z.number().optional(),
    maxAdvanceDays: z.number().optional(),
  }).optional(),
});

type FlowFormValues = z.infer<typeof flowSchema>;

export interface ApprovalFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FlowFormValues) => Promise<void>;
  initialData?: ApprovalFlowConfig;
  isLoading?: boolean;
}

const RESOURCE_TYPES = [
  { value: "CLASSROOM", label: "Aula" },
  { value: "LAB", label: "Laboratorio" },
  { value: "MEETING_ROOM", label: "Sala de reuniones" },
  { value: "AUDITORIUM", label: "Auditorio" },
  { value: "CONFERENCE_HALL", label: "Sala de conferencias" },
  { value: "OUTDOOR_SPACE", label: "Espacio abierto" },
];

const ROLES = [
  { value: "TEACHER", label: "Docente" },
  { value: "PROGRAM_ADMIN", label: "Admin. de Programa" },
  { value: "PROGRAM_DIRECTOR", label: "Director de Programa" },
  { value: "GENERAL_ADMIN", label: "Admin. General" },
  { value: "SECURITY", label: "Seguridad" },
];

export function ApprovalFlowModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading,
}: ApprovalFlowModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FlowFormValues>({
    resolver: zodResolver(flowSchema),
    defaultValues: {
      name: "",
      description: "",
      resourceTypes: [],
      steps: [
        {
          name: "Primer Nivel",
          approverRoles: [],
          order: 1,
          isRequired: true,
          allowParallel: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps",
  });

  React.useEffect(() => {
    if (initialData && isOpen) {
      reset({
        name: initialData.name,
        description: initialData.description || "",
        resourceTypes: initialData.resourceTypes || [],
        steps: initialData.steps.map((s) => ({
          name: s.name,
          approverRoles: s.approverRoles,
          order: s.order,
          isRequired: s.isRequired,
          allowParallel: s.allowParallel,
          timeoutHours: s.timeoutHours,
        })),
        autoApproveConditions: initialData.autoApproveConditions,
      });
    } else if (!initialData && isOpen) {
      reset({
        name: "",
        description: "",
        resourceTypes: [],
        steps: [
          {
            name: "Primer Nivel",
            approverRoles: [],
            order: 1,
            isRequired: true,
            allowParallel: false,
          },
        ],
      });
    }
  }, [initialData, isOpen, reset]);

  const selectedResourceTypes = watch("resourceTypes");

  const onSubmit = async (data: FlowFormValues) => {
    await onSave(data);
    onClose();
  };

  const toggleResourceType = (type: string) => {
    const current = watch("resourceTypes") || [];
    if (current.includes(type)) {
      setValue("resourceTypes", current.filter((t) => t !== type));
    } else {
      setValue("resourceTypes", [...current, type]);
    }
  };

  const toggleRole = (stepIndex: number, role: string) => {
    const current = watch(`steps.${stepIndex}.approverRoles`) || [];
    if (current.includes(role)) {
      setValue(`steps.${stepIndex}.approverRoles`, current.filter((r) => r !== role));
    } else {
      setValue(`steps.${stepIndex}.approverRoles`, [...current, role]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-brand-primary-500" />
              {initialData ? "Editar Flujo de Aprobación" : "Nuevo Flujo de Aprobación"}
            </DialogTitle>
            <DialogDescription>
              Configura los niveles y condiciones para este flujo de aprobación.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Información Básica */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Flujo</Label>
                <Input
                  id="name"
                  placeholder="Ej: Flujo Estándar Auditorios"
                  error={errors.name?.message}
                  {...register("name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe cuándo se aplica este flujo..."
                  error={errors.description?.message}
                  {...register("description")}
                />
              </div>
            </div>

            {/* Tipos de Recurso */}
            <div className="space-y-3">
              <Label>Tipos de Recurso Aplicables</Label>
              <div className="flex flex-wrap gap-2">
                {RESOURCE_TYPES.map((rt) => (
                  <Badge
                    key={rt.value}
                    variant={selectedResourceTypes.includes(rt.value) ? "primary" : "outline"}
                    className="cursor-pointer py-1.5 px-3"
                    onClick={() => toggleResourceType(rt.value)}
                  >
                    {rt.label}
                  </Badge>
                ))}
              </div>
              {errors.resourceTypes && (
                <p className="text-sm text-state-error-500">{errors.resourceTypes.message}</p>
              )}
            </div>

            {/* Pasos de Aprobación */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Pasos de Aprobación</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() =>
                    append({
                      name: `Paso ${fields.length + 1}`,
                      approverRoles: [],
                      order: fields.length + 1,
                      isRequired: true,
                      allowParallel: false,
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Agregar Paso
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative rounded-lg border border-[var(--color-border-subtle)] p-4 space-y-4 bg-[var(--color-bg-secondary)]/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary-500 text-xs font-bold text-white">
                          {index + 1}
                        </div>
                        <Input
                          placeholder="Nombre del paso"
                          className="h-8 w-64"
                          {...register(`steps.${index}.name`)}
                        />
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-state-error-500"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs">Roles Aprobadores</Label>
                      <div className="flex flex-wrap gap-2">
                        {ROLES.map((role) => (
                          <div
                            key={role.value}
                            className="flex items-center space-x-2 rounded-md border p-2 bg-[var(--color-bg-surface)]"
                          >
                            <Checkbox
                              id={`step-${index}-role-${role.value}`}
                              checked={watch(`steps.${index}.approverRoles`)?.includes(role.value)}
                              onCheckedChange={() => toggleRole(index, role.value)}
                            />
                            <Label
                              htmlFor={`step-${index}-role-${role.value}`}
                              className="text-xs cursor-pointer"
                            >
                              {role.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {errors.steps?.[index]?.approverRoles && (
                        <p className="text-xs text-state-error-500">
                          {errors.steps[index].approverRoles?.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`step-${index}-required`}
                          {...register(`steps.${index}.isRequired`)}
                        />
                        <Label htmlFor={`step-${index}-required`} className="text-xs">
                          Es obligatorio
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                        <Input
                          type="number"
                          placeholder="Timeout (horas)"
                          className="h-8 w-24 text-xs"
                          {...register(`steps.${index}.timeoutHours`, { valueAsNumber: true })}
                        />
                        <span className="text-xs text-[var(--color-text-tertiary)]">hrs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.steps?.root && (
                <p className="text-sm text-state-error-500">{errors.steps.root.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Flujo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
