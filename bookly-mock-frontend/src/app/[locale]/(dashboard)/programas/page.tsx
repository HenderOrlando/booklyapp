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
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { DataTable } from "@/components/molecules/DataTable";
import { ListLayout } from "@/components/templates/ListLayout";
import { useCreateProgram, useUpdateProgram } from "@/hooks/mutations";
import { usePrograms } from "@/hooks/usePrograms";
import { AcademicProgram } from "@/types/entities/resource";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import * as React from "react";

/**
 * Página de Programas Académicos - Bookly
 *
 * CRUD de programas académicos para asociar con recursos
 */

export default function ProgramasPage() {
  const t = useTranslations("programs");
  const router = useRouter();

  // ✅ MEJORES PRÁCTICAS: Usar hook personalizado
  const { data: programs = [], isLoading: loading } = usePrograms();

  // Mutations
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const [filter, setFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");
  const [showModal, setShowModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");
  const [selectedProgram, setSelectedProgram] = React.useState<
    AcademicProgram | undefined
  >();
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    description: "",
    faculty: "",
    department: "",
    isActive: true,
  });

  // React Query maneja el fetch automáticamente

  // Filtrar programas
  const filteredPrograms = programs.filter((program: AcademicProgram) => {
    if (filter !== "") {
      const searchTerm = filter.toLowerCase();
      const matchesText =
        program.name.toLowerCase().includes(searchTerm) ||
        program.code.toLowerCase().includes(searchTerm) ||
        program.faculty.toLowerCase().includes(searchTerm);
      if (!matchesText) return false;
    }

    if (statusFilter === "active" && !program.isActive) return false;
    if (statusFilter === "inactive" && program.isActive) return false;

    return true;
  });

  // Handlers
  const handleCreate = () => {
    setModalMode("create");
    setSelectedProgram(undefined);
    setFormData({
      code: "",
      name: "",
      description: "",
      faculty: "",
      department: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (program: AcademicProgram) => {
    setModalMode("edit");
    setSelectedProgram(program);
    setFormData({
      code: program.code,
      name: program.name,
      description: program.description || "",
      faculty: program.faculty,
      department: program.department || "",
      isActive: program.isActive,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (modalMode === "create") {
      createProgram.mutate(formData as Parameters<typeof createProgram.mutate>[0], {
        onSuccess: () => {
          setShowModal(false);
        },
        onError: (err: Error) => {
          console.error("Error creating program:", err);
        },
      });
    } else {
      if (!selectedProgram) return;

      updateProgram.mutate(
        {
          id: selectedProgram.id,
          data: formData as Parameters<typeof updateProgram.mutate>[0]["data"],
        },
        {
          onSuccess: () => {
            setShowModal(false);
          },
          onError: (err: Error) => {
            console.error("Error updating program:", err);
          },
        },
      );
    }
  };

  const handleToggleStatus = (program: AcademicProgram) => {
    updateProgram.mutate(
      {
        id: program.id,
        data: { isActive: !program.isActive } as Parameters<typeof updateProgram.mutate>[0]["data"],
      },
      {
        onError: (err: Error) => {
          console.error("Error changing program status:", err);
        },
      },
    );
  };

  // Columnas
  const columns = [
    {
      key: "code",
      header: t("code"),
      cell: (program: AcademicProgram) => (
        <p className="font-mono text-foreground">{program.code}</p>
      ),
    },
    {
      key: "name",
      header: t("name"),
      cell: (program: AcademicProgram) => (
        <div>
          <p className="font-medium text-foreground">{program.name}</p>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {program.description}
          </p>
        </div>
      ),
    },
    {
      key: "faculty",
      header: t("faculty"),
      cell: (program: AcademicProgram) => (
        <div>
          <p className="text-foreground">{program.faculty}</p>
          {program.department && (
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {program.department}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("status"),
      cell: (program: AcademicProgram) =>
        program.isActive ? (
          <Badge variant="success">{t("active")}</Badge>
        ) : (
          <Badge variant="secondary">{t("inactive")}</Badge>
        ),
    },
    {
      key: "actions",
      header: t("actions"),
      cell: (program: AcademicProgram) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => router.push(`/programas/${program.id}`)}
          >
            {t("view_detail")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(program)}
          >
            {t("edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(program)}
          >
            {program.isActive ? t("deactivate") : t("activate")}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-500 mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <ListLayout
      title={t("title")}
      badge={{ text: "Gestión de Programas", variant: "secondary" }}
      onCreate={handleCreate}
      createLabel={t("create")}
    >
      <div className="space-y-6 pb-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-brand-primary-500/5 to-brand-primary-600/5 border-brand-primary-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-600/80 mb-1">
                    {t("total_programs")}
                  </p>
                  <h3 className="text-3xl font-black text-brand-primary-800 dark:text-brand-primary-200 leading-none">
                    {programs.length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-success-500/5 to-state-success-700/5 border-state-success-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-state-success-700/80 dark:text-state-success-200/80 mb-1">
                    {t("active")}
                  </p>
                  <h3 className="text-3xl font-black text-state-success-900 dark:text-state-success-200 leading-none">
                    {programs.filter((p: AcademicProgram) => p.isActive).length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-warning-500/5 to-state-warning-700/5 border-state-warning-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-state-warning-700/80 dark:text-state-warning-200/80 mb-1">
                    {t("inactive")}
                  </p>
                  <h3 className="text-3xl font-black text-state-warning-900 dark:text-state-warning-200 leading-none">
                    {programs.filter((p: AcademicProgram) => !p.isActive).length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>{t("list")}</CardTitle>
                <CardDescription>
                  {t("showing_count", {
                    count: filteredPrograms.length,
                    total: programs.length,
                  })}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Input
                placeholder={t("search_placeholder")}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-md flex-1"
              />

              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  {t("all")}
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  {t("active")}
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("inactive")}
                >
                  {t("inactive")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable data={filteredPrograms} columns={columns} />
          </CardContent>
        </Card>

        {/* Modal Simple */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>
                  {modalMode === "create"
                    ? t("modal_create_title")
                    : t("modal_edit_title")}
                </CardTitle>
                <CardDescription>
                  {modalMode === "create"
                    ? t("modal_create_desc")
                    : t("modal_edit_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        {t("code")} *
                      </label>
                      <Input
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        {t("name")} *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      {t("description_label")}
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        {t("faculty")} *
                      </label>
                      <Input
                        value={formData.faculty}
                        onChange={(e) =>
                          setFormData({ ...formData, faculty: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        {t("department")}
                      </label>
                      <Input
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: !!checked })
                      }
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm text-[var(--color-text-primary)] cursor-pointer"
                    >
                      {t("is_active")}
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowModal(false)}
                    >
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleSave}>
                      {modalMode === "create" ? t("create") : t("save")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ListLayout>
  );
}
