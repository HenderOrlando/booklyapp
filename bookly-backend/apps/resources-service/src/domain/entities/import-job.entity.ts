import { ImportJobStatus } from "@libs/common/enums";
import { AuditInfo } from "@libs/common";

/**
 * Import Job Entity
 * Entidad para trackear importaciones de recursos
 */
export class ImportJobEntity {
  constructor(
    public readonly id: string,
    public userId: string,
    public fileName: string,
    public fileSize: number,
    public totalRows: number,
    public processedRows: number = 0,
    public successCount: number = 0,
    public errorCount: number = 0,
    public status: ImportJobStatus = ImportJobStatus.PENDING,
    public mode: string = "create",
    public errors: string[] = [],
    public resourceIds: string[] = [],
    public startedAt?: Date,
    public completedAt?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public audit?: AuditInfo
  ) {}

  /**
   * Inicia el procesamiento del job
   */
  start(): void {
    this.status = ImportJobStatus.PROCESSING;
    this.startedAt = new Date();
  }

  /**
   * Completa el job exitosamente
   */
  complete(): void {
    this.status = ImportJobStatus.COMPLETED;
    this.completedAt = new Date();
  }

  /**
   * Marca el job como fallido
   */
  fail(error: string): void {
    this.status = ImportJobStatus.FAILED;
    this.errors.push(error);
    this.completedAt = new Date();
  }

  /**
   * Marca el job como revertido
   */
  rollback(): void {
    this.status = ImportJobStatus.ROLLED_BACK;
    this.resourceIds = [];
  }

  /**
   * Incrementa contador de procesados
   */
  incrementProcessed(success: boolean): void {
    this.processedRows++;
    if (success) {
      this.successCount++;
    } else {
      this.errorCount++;
    }
  }

  /**
   * Agrega un ID de recurso creado
   */
  addResourceId(resourceId: string): void {
    this.resourceIds.push(resourceId);
  }

  /**
   * Verifica si el job está completo
   */
  isCompleted(): boolean {
    return this.status === ImportJobStatus.COMPLETED;
  }

  /**
   * Calcula el progreso en porcentaje
   */
  getProgressPercentage(): number {
    if (this.totalRows === 0) return 0;
    return Math.round((this.processedRows / this.totalRows) * 100);
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      userId: this.userId,
      fileName: this.fileName,
      fileSize: this.fileSize,
      totalRows: this.totalRows,
      processedRows: this.processedRows,
      successCount: this.successCount,
      errorCount: this.errorCount,
      status: this.status,
      mode: this.mode,
      errors: this.errors,
      resourceIds: this.resourceIds,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audit: this.audit,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): ImportJobEntity {
    return new ImportJobEntity(
      obj.id || obj._id?.toString(),
      obj.userId,
      obj.fileName,
      obj.fileSize,
      obj.totalRows,
      obj.processedRows,
      obj.successCount,
      obj.errorCount,
      obj.status,
      obj.mode,
      obj.errors,
      obj.resourceIds,
      obj.startedAt,
      obj.completedAt,
      obj.createdAt,
      obj.updatedAt,
      obj.audit
    );
  }
}
