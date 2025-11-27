import {
  DocumentTemplateFormat,
  DocumentTemplateType,
} from "@libs/common/enums";

/**
 * Document Template Entity
 * Entidad que representa una plantilla de documento para aprobaciones/rechazos (RF-21)
 */
export class DocumentTemplateEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: DocumentTemplateType,
    public readonly description: string,
    public readonly template: string, // HTML template
    public readonly variables: string[], // Variables disponibles en la plantilla
    public readonly isActive: boolean,
    public readonly format?: DocumentTemplateFormat,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly audit?: {
      createdBy: string;
      updatedBy?: string;
    }
  ) {}

  /**
   * Verifica si la plantilla está activa
   */
  isTemplateActive(): boolean {
    return this.isActive;
  }

  /**
   * Verifica si es una plantilla de aprobación
   */
  isApprovalTemplate(): boolean {
    return this.type === DocumentTemplateType.APPROVAL;
  }

  /**
   * Verifica si es una plantilla de rechazo
   */
  isRejectionTemplate(): boolean {
    return this.type === DocumentTemplateType.REJECTION;
  }

  /**
   * Verifica si es una plantilla de certificado
   */
  isCertificateTemplate(): boolean {
    return this.type === DocumentTemplateType.CERTIFICATE;
  }

  /**
   * Verifica si una variable existe en la plantilla
   */
  hasVariable(variableName: string): boolean {
    return this.variables.includes(variableName);
  }

  /**
   * Obtiene el formato de salida
   */
  getOutputFormat(): string {
    return this.format || DocumentTemplateFormat.PDF;
  }

  /**
   * Valida que todas las variables requeridas estén presentes en los datos
   */
  validateVariables(data: Record<string, any>): {
    isValid: boolean;
    missingVariables: string[];
  } {
    const missingVariables = this.variables.filter(
      (variable) => !(variable in data)
    );

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
    };
  }

  /**
   * Reemplaza variables en la plantilla con datos reales
   */
  render(data: Record<string, any>): string {
    let renderedTemplate = this.template;

    for (const variable of this.variables) {
      const value = data[variable] || "";
      const regex = new RegExp(`{{\\s*${variable}\\s*}}`, "g");
      renderedTemplate = renderedTemplate.replace(regex, value);
    }

    return renderedTemplate;
  }

  /**
   * Desactiva la plantilla
   */
  deactivate(updatedBy: string): DocumentTemplateEntity {
    return new DocumentTemplateEntity(
      this.id,
      this.name,
      this.type,
      this.description,
      this.template,
      this.variables,
      false,
      this.format,
      this.metadata,
      this.createdAt,
      new Date(),
      {
        createdBy: this.audit?.createdBy || updatedBy,
        updatedBy,
      }
    );
  }

  /**
   * Activa la plantilla
   */
  activate(updatedBy: string): DocumentTemplateEntity {
    return new DocumentTemplateEntity(
      this.id,
      this.name,
      this.type,
      this.description,
      this.template,
      this.variables,
      true,
      this.format,
      this.metadata,
      this.createdAt,
      new Date(),
      {
        createdBy: this.audit?.createdBy || updatedBy,
        updatedBy,
      }
    );
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      template: this.template,
      variables: this.variables,
      isActive: this.isActive,
      format: this.format,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audit: this.audit,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): DocumentTemplateEntity {
    return new DocumentTemplateEntity(
      obj.id || obj._id?.toString(),
      obj.name,
      obj.type,
      obj.description,
      obj.template,
      obj.variables,
      obj.isActive !== undefined ? obj.isActive : true,
      obj.format,
      obj.metadata,
      obj.createdAt,
      obj.updatedAt,
      obj.audit
    );
  }
}
