import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs/promises";
import * as path from "path";

const logger = createLogger("DocumentStorageService");

/**
 * Estrategia de almacenamiento
 */
export enum StorageStrategy {
  DATABASE = "database",
  LOCAL_FILE = "local_file",
  AWS_S3 = "aws_s3",
  GOOGLE_CLOUD = "google_cloud",
}

/**
 * Resultado de almacenamiento
 */
export interface StorageResult {
  success: boolean;
  storageId: string;
  strategy: StorageStrategy;
  url?: string;
  path?: string;
  size: number;
  error?: string;
}

/**
 * Metadata del documento
 */
export interface DocumentMetadata {
  documentId: string;
  fileName: string;
  mimeType: string;
  size: number;
  userId: string;
  approvalRequestId?: string;
  expiresAt?: Date;
}

/**
 * Document Storage Service
 * Servicio para almacenamiento de documentos con múltiples estrategias
 * Soporta: Base de datos, sistema de archivos local, AWS S3, Google Cloud Storage
 */
@Injectable()
export class DocumentStorageService {
  private strategy: StorageStrategy;
  private localStoragePath: string;

  constructor(private readonly configService: ConfigService) {
    // Determinar estrategia según configuración
    this.strategy = this.determineStrategy();
    this.localStoragePath =
      this.configService.get<string>("DOCUMENT_STORAGE_PATH") ||
      path.join(process.cwd(), "storage", "documents");

    logger.info(`Document storage initialized with strategy: ${this.strategy}`);
  }

  /**
   * Determinar estrategia de almacenamiento
   */
  private determineStrategy(): StorageStrategy {
    // Verificar si hay credenciales de AWS S3
    const awsAccessKey = this.configService.get<string>("AWS_ACCESS_KEY_ID");
    const awsSecretKey = this.configService.get<string>("AWS_SECRET_ACCESS_KEY");
    const s3Bucket = this.configService.get<string>("AWS_S3_BUCKET");

    if (awsAccessKey && awsSecretKey && s3Bucket) {
      return StorageStrategy.AWS_S3;
    }

    // Verificar si hay credenciales de Google Cloud
    const gcpProjectId = this.configService.get<string>("GCP_PROJECT_ID");
    const gcpBucket = this.configService.get<string>("GCP_STORAGE_BUCKET");

    if (gcpProjectId && gcpBucket) {
      return StorageStrategy.GOOGLE_CLOUD;
    }

    // Verificar si se prefiere base de datos
    const useDatabase = this.configService.get<boolean>(
      "USE_DATABASE_STORAGE",
      false
    );

    if (useDatabase) {
      return StorageStrategy.DATABASE;
    }

    // Por defecto: almacenamiento local
    return StorageStrategy.LOCAL_FILE;
  }

  /**
   * Almacenar documento
   */
  async store(
    buffer: Buffer,
    metadata: DocumentMetadata
  ): Promise<StorageResult> {
    try {
      switch (this.strategy) {
        case StorageStrategy.AWS_S3:
          return await this.storeInS3(buffer, metadata);

        case StorageStrategy.GOOGLE_CLOUD:
          return await this.storeInGCS(buffer, metadata);

        case StorageStrategy.DATABASE:
          return await this.storeInDatabase(buffer, metadata);

        case StorageStrategy.LOCAL_FILE:
        default:
          return await this.storeLocally(buffer, metadata);
      }
    } catch (error) {
      logger.error("Error storing document", error as Error, {
        documentId: metadata.documentId,
        strategy: this.strategy,
      });

      throw error;
    }
  }

  /**
   * Recuperar documento
   */
  async retrieve(storageId: string): Promise<Buffer | null> {
    try {
      switch (this.strategy) {
        case StorageStrategy.AWS_S3:
          return await this.retrieveFromS3(storageId);

        case StorageStrategy.GOOGLE_CLOUD:
          return await this.retrieveFromGCS(storageId);

        case StorageStrategy.DATABASE:
          return await this.retrieveFromDatabase(storageId);

        case StorageStrategy.LOCAL_FILE:
        default:
          return await this.retrieveLocally(storageId);
      }
    } catch (error) {
      logger.error("Error retrieving document", error as Error, {
        storageId,
        strategy: this.strategy,
      });

      return null;
    }
  }

  /**
   * Eliminar documento
   */
  async delete(storageId: string): Promise<boolean> {
    try {
      switch (this.strategy) {
        case StorageStrategy.AWS_S3:
          return await this.deleteFromS3(storageId);

        case StorageStrategy.GOOGLE_CLOUD:
          return await this.deleteFromGCS(storageId);

        case StorageStrategy.DATABASE:
          return await this.deleteFromDatabase(storageId);

        case StorageStrategy.LOCAL_FILE:
        default:
          return await this.deleteLocally(storageId);
      }
    } catch (error) {
      logger.error("Error deleting document", error as Error, {
        storageId,
        strategy: this.strategy,
      });

      return false;
    }
  }

  /**
   * Generar URL de descarga
   */
  async generateDownloadUrl(
    storageId: string,
    expiresInMinutes: number = 60
  ): Promise<string | null> {
    try {
      switch (this.strategy) {
        case StorageStrategy.AWS_S3:
          return await this.generateS3SignedUrl(storageId, expiresInMinutes);

        case StorageStrategy.GOOGLE_CLOUD:
          return await this.generateGCSSignedUrl(storageId, expiresInMinutes);

        case StorageStrategy.DATABASE:
        case StorageStrategy.LOCAL_FILE:
        default:
          // Para local y database, retornar URL del endpoint de descarga
          return `/api/documents/${storageId}/download`;
      }
    } catch (error) {
      logger.error("Error generating download URL", error as Error, {
        storageId,
      });

      return null;
    }
  }

  // ==================== ALMACENAMIENTO LOCAL ====================

  private async storeLocally(
    buffer: Buffer,
    metadata: DocumentMetadata
  ): Promise<StorageResult> {
    // Crear directorio si no existe
    await fs.mkdir(this.localStoragePath, { recursive: true });

    const filePath = path.join(this.localStoragePath, metadata.documentId);

    // Guardar archivo
    await fs.writeFile(filePath, buffer);

    // Guardar metadata
    const metadataPath = `${filePath}.meta.json`;
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    logger.info("Document stored locally", {
      documentId: metadata.documentId,
      path: filePath,
      size: buffer.length,
    });

    return {
      success: true,
      storageId: metadata.documentId,
      strategy: StorageStrategy.LOCAL_FILE,
      path: filePath,
      size: buffer.length,
    };
  }

  private async retrieveLocally(storageId: string): Promise<Buffer | null> {
    const filePath = path.join(this.localStoragePath, storageId);

    try {
      const buffer = await fs.readFile(filePath);
      return buffer;
    } catch (error) {
      logger.warn(`Document not found locally: ${storageId}`);
      return null;
    }
  }

  private async deleteLocally(storageId: string): Promise<boolean> {
    const filePath = path.join(this.localStoragePath, storageId);
    const metadataPath = `${filePath}.meta.json`;

    try {
      await fs.unlink(filePath);
      await fs.unlink(metadataPath).catch(() => {
        /* ignore if metadata doesn't exist */
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // ==================== ALMACENAMIENTO EN BASE DE DATOS ====================

  private async storeInDatabase(
    buffer: Buffer,
    metadata: DocumentMetadata
  ): Promise<StorageResult> {
    // TODO: Implementar almacenamiento en MongoDB usando GridFS o campo binario
    logger.warn(
      "Database storage not fully implemented, falling back to local storage"
    );
    return this.storeLocally(buffer, metadata);
  }

  private async retrieveFromDatabase(storageId: string): Promise<Buffer | null> {
    // TODO: Implementar recuperación desde MongoDB
    logger.warn(
      "Database retrieval not fully implemented, falling back to local storage"
    );
    return this.retrieveLocally(storageId);
  }

  private async deleteFromDatabase(storageId: string): Promise<boolean> {
    // TODO: Implementar eliminación desde MongoDB
    logger.warn(
      "Database deletion not fully implemented, falling back to local storage"
    );
    return this.deleteLocally(storageId);
  }

  // ==================== ALMACENAMIENTO EN AWS S3 ====================

  private async storeInS3(
    buffer: Buffer,
    metadata: DocumentMetadata
  ): Promise<StorageResult> {
    // TODO: Implementar con AWS SDK
    // const s3 = new S3Client({ region: this.configService.get('AWS_REGION') });
    // const command = new PutObjectCommand({
    //   Bucket: this.configService.get('AWS_S3_BUCKET'),
    //   Key: metadata.documentId,
    //   Body: buffer,
    //   ContentType: metadata.mimeType,
    //   Metadata: { ... }
    // });
    // await s3.send(command);

    logger.warn("AWS S3 storage not implemented, falling back to local storage");
    return this.storeLocally(buffer, metadata);
  }

  private async retrieveFromS3(storageId: string): Promise<Buffer | null> {
    // TODO: Implementar con AWS SDK
    logger.warn(
      "AWS S3 retrieval not implemented, falling back to local storage"
    );
    return this.retrieveLocally(storageId);
  }

  private async deleteFromS3(storageId: string): Promise<boolean> {
    // TODO: Implementar con AWS SDK
    logger.warn(
      "AWS S3 deletion not implemented, falling back to local storage"
    );
    return this.deleteLocally(storageId);
  }

  private async generateS3SignedUrl(
    storageId: string,
    expiresInMinutes: number
  ): Promise<string | null> {
    // TODO: Implementar con AWS SDK
    // const s3 = new S3Client({ region: this.configService.get('AWS_REGION') });
    // const command = new GetObjectCommand({
    //   Bucket: this.configService.get('AWS_S3_BUCKET'),
    //   Key: storageId
    // });
    // return await getSignedUrl(s3, command, { expiresIn: expiresInMinutes * 60 });

    logger.warn("AWS S3 signed URL not implemented");
    return `/api/documents/${storageId}/download`;
  }

  // ==================== ALMACENAMIENTO EN GOOGLE CLOUD STORAGE ====================

  private async storeInGCS(
    buffer: Buffer,
    metadata: DocumentMetadata
  ): Promise<StorageResult> {
    // TODO: Implementar con Google Cloud Storage SDK
    // const storage = new Storage({ projectId: this.configService.get('GCP_PROJECT_ID') });
    // const bucket = storage.bucket(this.configService.get('GCP_STORAGE_BUCKET'));
    // const file = bucket.file(metadata.documentId);
    // await file.save(buffer, { contentType: metadata.mimeType });

    logger.warn("GCS storage not implemented, falling back to local storage");
    return this.storeLocally(buffer, metadata);
  }

  private async retrieveFromGCS(storageId: string): Promise<Buffer | null> {
    // TODO: Implementar con Google Cloud Storage SDK
    logger.warn("GCS retrieval not implemented, falling back to local storage");
    return this.retrieveLocally(storageId);
  }

  private async deleteFromGCS(storageId: string): Promise<boolean> {
    // TODO: Implementar con Google Cloud Storage SDK
    logger.warn("GCS deletion not implemented, falling back to local storage");
    return this.deleteLocally(storageId);
  }

  private async generateGCSSignedUrl(
    storageId: string,
    expiresInMinutes: number
  ): Promise<string | null> {
    // TODO: Implementar con Google Cloud Storage SDK
    // const storage = new Storage({ projectId: this.configService.get('GCP_PROJECT_ID') });
    // const bucket = storage.bucket(this.configService.get('GCP_STORAGE_BUCKET'));
    // const file = bucket.file(storageId);
    // const [url] = await file.getSignedUrl({
    //   action: 'read',
    //   expires: Date.now() + expiresInMinutes * 60 * 1000
    // });
    // return url;

    logger.warn("GCS signed URL not implemented");
    return `/api/documents/${storageId}/download`;
  }

  /**
   * Obtener estrategia actual
   */
  getStrategy(): StorageStrategy {
    return this.strategy;
  }

  /**
   * Verificar si el almacenamiento está disponible
   */
  async isAvailable(): Promise<boolean> {
    try {
      switch (this.strategy) {
        case StorageStrategy.LOCAL_FILE:
          // Verificar que el directorio existe o se puede crear
          await fs.mkdir(this.localStoragePath, { recursive: true });
          return true;

        case StorageStrategy.DATABASE:
          // TODO: Verificar conexión a base de datos
          return true;

        case StorageStrategy.AWS_S3:
          // TODO: Verificar credenciales y acceso al bucket
          return true;

        case StorageStrategy.GOOGLE_CLOUD:
          // TODO: Verificar credenciales y acceso al bucket
          return true;

        default:
          return false;
      }
    } catch (error) {
      logger.error("Storage availability check failed", error as Error);
      return false;
    }
  }
}
