/**
 * Tipos para Templates/Plantillas
 */

export type TemplateType =
  | "NOTIFICATION"
  | "APPROVAL"
  | "REJECTION"
  | "DOCUMENT"
  | "EMAIL";

export type TemplateCategory =
  | "RESERVATION"
  | "APPROVAL"
  | "CHECK_IN"
  | "REPORT"
  | "GENERAL";

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  category: TemplateCategory;
  subject?: string;
  body: string;
  variables: TemplateVariable[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: string;
  example?: string;
}

export interface TemplateFilters {
  type?: TemplateType;
  category?: TemplateCategory;
  isActive?: boolean;
  search?: string;
}

export interface TemplatePreview {
  rendered: string;
  variables: Record<string, string>;
}
