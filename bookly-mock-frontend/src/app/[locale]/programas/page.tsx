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
import { DataTable } from "@/components/molecules/DataTable";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
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
      createProgram.mutate(formData as any, {
        onSuccess: () => {
          setShowModal(false);
        },
        onError: (err: any) => {
          console.error("Error creating program:", err);
          alert(t("save_error"));
        },
      });
    } else {
      if (!selectedProgram) return;

      updateProgram.mutate(
        {
          id: selectedProgram.id,
          data: formData as any,
        },
        {
          onSuccess: () => {
            setShowModal(false);
          },
          onError: (err: any) => {
            console.error("Error updating program:", err);
            alert(t("save_error"));
          },
        }
      );
    }
  };

  const handleToggleStatus = (program: AcademicProgram) => {
    updateProgram.mutate(
      {
        id: program.id,
        data: { isActive: !program.isActive } as any,
      },
      {
        onError: (err: any) => {
          console.error("Error changing program status:", err);
          alert(t("status_change_error"));
        },
      }
    );
  };

  // Columnas
  const columns = [
    {
      key: "code",
      header: t("code"),
      cell: (program: AcademicProgram) => (
        <p className="font-mono text-white">{program.code}</p>
      ),
    },
    {
      key: "name",
      header: t("name"),
      cell: (program: AcademicProgram) => (
        <div>
          <p className="font-medium text-white">{program.name}</p>
          <p className="text-sm text-gray-400">{program.description}</p>
        </div>
      ),
    },
    {
      key: "faculty",
      header: t("faculty"),
      cell: (program: AcademicProgram) => (
        <div>
          <p className="text-white">{program.faculty}</p>
          {program.department && (
            <p className="text-sm text-gray-400">{program.department}</p>
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

  const header = <AppHeader title={t("title")} />;
  const sidebar = <AppSidebar />;

  if (loading) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-500 mx-auto mb-4"></div>
            <p className="text-[var(--color-text-secondary)]">{t("loading")}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {t("title")}
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              {t("description")}
            </p>
          </div>
          <Button onClick={handleCreate}>{t("create")}</Button>
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
                      <label className="block text-sm font-medium text-white mb-2">
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
                      <label className="block text-sm font-medium text-white mb-2">
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
                    <label className="block text-sm font-medium text-white mb-2">
                      {t("description_label")}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-[var(--color-border-subtle)] rounded-lg text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
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
                      <label className="block text-sm font-medium text-white mb-2">
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

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-white">{t("is_active")}</span>
                  </label>

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
    </MainLayout>
  );
}
