/**
 * Approval Step
 * Paso dentro de un flujo de aprobación
 */
export interface ApprovalStep {
  name: string;
  approverRoles: string[];
  order: number;
  isRequired: boolean;
  allowParallel: boolean;
}

/**
 * Approval Flow Entity
 * Entidad de dominio para flujos de aprobación
 */
export class ApprovalFlowEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly resourceTypes: string[],
    public readonly steps: ApprovalStep[],
    public readonly isActive: boolean,
    public readonly autoApproveConditions?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly audit?: {
      createdBy: string;
      updatedBy?: string;
    }
  ) {}

  /**
   * Verifica si el flujo está activo
   */
  isFlowActive(): boolean {
    return this.isActive;
  }

  /**
   * Verifica si aplica a un tipo de recurso
   */
  appliesTo(resourceType: string): boolean {
    return this.resourceTypes.includes(resourceType);
  }

  /**
   * Obtiene el número total de pasos
   */
  getTotalSteps(): number {
    return this.steps.length;
  }

  /**
   * Obtiene un paso por índice
   */
  getStep(index: number): ApprovalStep | undefined {
    return this.steps[index];
  }

  /**
   * Obtiene los pasos requeridos
   */
  getRequiredSteps(): ApprovalStep[] {
    return this.steps.filter((step) => step.isRequired);
  }

  /**
   * Verifica si todos los pasos son paralelos
   */
  hasParallelSteps(): boolean {
    return this.steps.some((step) => step.allowParallel);
  }

  /**
   * Valida que los pasos estén correctamente ordenados
   */
  validateStepOrder(): boolean {
    const orders = this.steps.map((s) => s.order);
    const sortedOrders = [...orders].sort((a, b) => a - b);
    return JSON.stringify(orders) === JSON.stringify(sortedOrders);
  }

  /**
   * Desactiva el flujo
   */
  deactivate(updatedBy: string): ApprovalFlowEntity {
    return new ApprovalFlowEntity(
      this.id,
      this.name,
      this.description,
      this.resourceTypes,
      this.steps,
      false,
      this.autoApproveConditions,
      this.createdAt,
      new Date(),
      {
        createdBy: this.audit?.createdBy || updatedBy,
        updatedBy,
      }
    );
  }

  /**
   * Activa el flujo
   */
  activate(updatedBy: string): ApprovalFlowEntity {
    return new ApprovalFlowEntity(
      this.id,
      this.name,
      this.description,
      this.resourceTypes,
      this.steps,
      true,
      this.autoApproveConditions,
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
      description: this.description,
      resourceTypes: this.resourceTypes,
      steps: this.steps,
      isActive: this.isActive,
      autoApproveConditions: this.autoApproveConditions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audit: this.audit,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): ApprovalFlowEntity {
    return new ApprovalFlowEntity(
      obj.id || obj._id?.toString(),
      obj.name,
      obj.description,
      obj.resourceTypes,
      obj.steps,
      obj.isActive !== undefined ? obj.isActive : true,
      obj.autoApproveConditions,
      obj.createdAt,
      obj.updatedAt,
      obj.audit
    );
  }
}
