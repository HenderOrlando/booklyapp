"use client";

import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar/AppSidebar";
import { TemplateEditor } from "@/components/organisms/TemplateEditor";
import { MainLayout } from "@/components/templates/MainLayout";
import { mockTemplates } from "@/infrastructure/mock/mockData";
import type { Template } from "@/types/entities/template";
import { Copy, Edit, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

export default function TemplatesPage() {
  const t = useTranslations("admin.templates");
  const [templates, setTemplates] = React.useState<Template[]>(mockTemplates);
  const [isEditing, setIsEditing] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<
    Template | undefined
  >();

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleNew = () => {
    setSelectedTemplate(undefined);
    setIsEditing(true);
  };

  const handleSave = (template: Partial<Template>) => {
    if (selectedTemplate) {
      // Actualizar
      setTemplates(
        templates.map((t) =>
          t.id === selectedTemplate.id ? { ...t, ...template } : t
        )
      );
    } else {
      // Crear nuevo
      const newTemplate: Template = {
        id: String(templates.length + 1),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "admin",
        variables: [],
        isDefault: false,
        ...template,
      } as Template;
      setTemplates([...templates, newTemplate]);
    }
    setIsEditing(false);
    setSelectedTemplate(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("delete_confirm"))) {
      setTemplates(templates.filter((t) => t.id !== id));
    }
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: String(templates.length + 1),
      name: `${template.name} ${t("copy_suffix")}`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates([...templates, newTemplate]);
  };

  return (
    <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t("title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("subtitle")}
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-base)] text-white rounded-lg hover:bg-[var(--color-primary-dark)]"
            >
              <Plus className="h-5 w-5" />
              {t("create")}
            </button>
          )}
        </div>

        {/* Editor o Lista */}
        {isEditing ? (
          <TemplateEditor
            template={selectedTemplate}
            onSave={handleSave}
            onCancel={() => {
              setIsEditing(false);
              setSelectedTemplate(undefined);
            }}
            onPreview={() => {}}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {template.name}
                      </h3>
                      {template.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          {t("default")}
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          template.isActive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {template.isActive ? t("active") : t("inactive")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.subject}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {t("type")}: {template.type}
                      </span>
                      <span>
                        {t("category")}: {template.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      title={t("edit")}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      title={t("duplicate")}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {!template.isDefault && (
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title={t("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
