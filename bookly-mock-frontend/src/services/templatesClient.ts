/**
 * @deprecated Migrate to a `TemplatesClient` class in `@/infrastructure/api/`.
 * This file will be replaced when the templates-client is created in the API layer.
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  Template,
  TemplateFilters,
  TemplatePreview,
} from "@/types/entities/template";

const TEMPLATES_PATH = "/api/v1/document-templates";

export async function getTemplates(
  filters?: TemplateFilters,
): Promise<Template[]> {
  const response = await httpClient.get<Template[]>(TEMPLATES_PATH, {
    params: filters,
  });
  return response.data;
}

export async function getTemplateById(id: string): Promise<Template> {
  const response = await httpClient.get<Template>(`${TEMPLATES_PATH}/${id}`);
  return response.data;
}

export async function createTemplate(
  template: Omit<Template, "id" | "createdAt" | "updatedAt">,
): Promise<Template> {
  const response = await httpClient.post<Template>(TEMPLATES_PATH, template);
  return response.data;
}

export async function updateTemplate(
  id: string,
  template: Partial<Template>,
): Promise<Template> {
  const response = await httpClient.put<Template>(
    `${TEMPLATES_PATH}/${id}`,
    template,
  );
  return response.data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await httpClient.delete(`${TEMPLATES_PATH}/${id}`);
}

export async function previewTemplate(
  id: string,
  variables: Record<string, string>,
): Promise<TemplatePreview> {
  const response = await httpClient.post<TemplatePreview>(
    `${TEMPLATES_PATH}/${id}/preview`,
    { variables },
  );
  return response.data;
}

export async function renderTemplate(
  templateId: string,
  variables: Record<string, string>,
): Promise<string> {
  const response = await httpClient.post<{ rendered: string }>(
    `${TEMPLATES_PATH}/${templateId}/render`,
    { variables },
  );
  return response.data!.rendered;
}
