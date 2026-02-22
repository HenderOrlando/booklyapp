import { createLogger } from "@libs/common";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";

const logger = createLogger("LocalDocumentStorageService");

/**
 * Metadata de un documento almacenado
 */
export interface StoredDocumentMetadata {
  documentId: string;
  fileName: string;
  mimeType: string;
  size: number;
  storedAt: Date;
  storedPath: string;
  metadata: Record<string, any>;
}

/**
 * Local Document Storage Service (RF-21, RF-22)
 * Almacena documentos PDF generados en el sistema de archivos local
 * para permitir su descarga posterior.
 *
 * En producción se puede migrar a S3/GCS reemplazando este servicio.
 */
@Injectable()
export class LocalDocumentStorageService {
  private readonly storageDir: string;
  private readonly metadataMap: Map<string, StoredDocumentMetadata> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.storageDir = this.configService.get<string>(
      "DOCUMENT_STORAGE_DIR",
      path.join(process.cwd(), "storage", "documents"),
    );

    this.ensureStorageDir();
    this.loadExistingMetadata();

    logger.info("LocalDocumentStorageService initialized", {
      storageDir: this.storageDir,
    });
  }

  private ensureStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
      logger.info("Storage directory created", { path: this.storageDir });
    }
  }

  private loadExistingMetadata(): void {
    const metadataPath = path.join(this.storageDir, "_metadata.json");
    if (fs.existsSync(metadataPath)) {
      try {
        const raw = fs.readFileSync(metadataPath, "utf-8");
        const entries: StoredDocumentMetadata[] = JSON.parse(raw);
        for (const entry of entries) {
          this.metadataMap.set(entry.documentId, entry);
        }
        logger.info("Loaded existing document metadata", {
          count: entries.length,
        });
      } catch (error) {
        logger.warn("Failed to load metadata, starting fresh", error as Error);
      }
    }
  }

  private persistMetadata(): void {
    const metadataPath = path.join(this.storageDir, "_metadata.json");
    const entries = Array.from(this.metadataMap.values());
    fs.writeFileSync(metadataPath, JSON.stringify(entries, null, 2));
  }

  /**
   * Almacenar un documento PDF
   */
  async store(
    documentId: string,
    fileName: string,
    buffer: Buffer,
    metadata: Record<string, any> = {},
  ): Promise<StoredDocumentMetadata> {
    this.ensureStorageDir();

    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = path.join(this.storageDir, `${documentId}_${safeFileName}`);

    fs.writeFileSync(filePath, buffer);

    const storedMetadata: StoredDocumentMetadata = {
      documentId,
      fileName: safeFileName,
      mimeType: "application/pdf",
      size: buffer.length,
      storedAt: new Date(),
      storedPath: filePath,
      metadata,
    };

    this.metadataMap.set(documentId, storedMetadata);
    this.persistMetadata();

    logger.info("Document stored locally", {
      documentId,
      fileName: safeFileName,
      size: buffer.length,
    });

    return storedMetadata;
  }

  /**
   * Recuperar un documento por ID
   */
  async retrieve(
    documentId: string,
  ): Promise<{ buffer: Buffer; metadata: StoredDocumentMetadata }> {
    const metadata = this.metadataMap.get(documentId);

    if (!metadata) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    if (!fs.existsSync(metadata.storedPath)) {
      this.metadataMap.delete(documentId);
      this.persistMetadata();
      throw new NotFoundException(
        `Document file ${documentId} not found on disk`,
      );
    }

    const buffer = fs.readFileSync(metadata.storedPath);

    return { buffer, metadata };
  }

  /**
   * Verificar si un documento existe
   */
  async exists(documentId: string): Promise<boolean> {
    const metadata = this.metadataMap.get(documentId);
    if (!metadata) return false;
    return fs.existsSync(metadata.storedPath);
  }

  /**
   * Eliminar un documento
   */
  async delete(documentId: string): Promise<void> {
    const metadata = this.metadataMap.get(documentId);

    if (metadata && fs.existsSync(metadata.storedPath)) {
      fs.unlinkSync(metadata.storedPath);
    }

    this.metadataMap.delete(documentId);
    this.persistMetadata();

    logger.info("Document deleted", { documentId });
  }

  /**
   * Listar documentos almacenados con filtros opcionales
   */
  async list(filters?: {
    approvalRequestId?: string;
    documentType?: string;
    limit?: number;
  }): Promise<StoredDocumentMetadata[]> {
    let entries = Array.from(this.metadataMap.values());

    if (filters?.approvalRequestId) {
      entries = entries.filter(
        (e) => e.metadata?.approvalRequestId === filters.approvalRequestId,
      );
    }

    if (filters?.documentType) {
      entries = entries.filter(
        (e) => e.metadata?.documentType === filters.documentType,
      );
    }

    entries.sort(
      (a, b) =>
        new Date(b.storedAt).getTime() - new Date(a.storedAt).getTime(),
    );

    if (filters?.limit) {
      entries = entries.slice(0, filters.limit);
    }

    return entries;
  }

  /**
   * Limpiar documentos antiguos (más de N días)
   */
  async cleanOld(retentionDays: number = 90): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    let deleted = 0;

    for (const [id, metadata] of this.metadataMap.entries()) {
      if (new Date(metadata.storedAt) < cutoff) {
        await this.delete(id);
        deleted++;
      }
    }

    logger.info("Old documents cleaned", { deleted, retentionDays });
    return deleted;
  }
}
